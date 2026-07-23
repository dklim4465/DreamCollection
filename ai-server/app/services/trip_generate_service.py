import os
import re
import json

import requests
from dotenv import load_dotenv

from app.schemas.trip_generate_schema import TripGenerateData

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)

JSON_BLOCK_PATTERN = re.compile(
    r"```(?:json)?\s*([\s\S]*?)```",
    re.IGNORECASE,
)


class TripGenerateService:

    def generate(self, prompt: str, system: str | None = None) -> TripGenerateData:
        raw_text = self._request_gemini(prompt, system)
        return self._parse_trip_data(raw_text)

    def _request_gemini(self, prompt: str, system: str | None = None) -> str:
        if not GEMINI_API_KEY:
            raise Exception("GEMINI_API_KEY missing")

        body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "maxOutputTokens": 8192
            }
        }

        if system:
            body["systemInstruction"] = {
                "parts": [
                    {
                        "text": system
                    }
                ]
            }

        res = requests.post(
            GEMINI_URL,
            headers={
                "x-goog-api-key": GEMINI_API_KEY,
                "Content-Type": "application/json",
            },
            json=body,
            timeout=30,
        )

        res.raise_for_status()
        payload = res.json()

        text = (
            payload
            .get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        if not text.strip():
            raise Exception("empty response")

        return text

    def _parse_trip_data(self, raw_text: str) -> TripGenerateData:
        json_text = self._extract_json(raw_text)
        payload = json.loads(json_text)
        data = TripGenerateData.model_validate(payload)

        if not data.days:
            raise Exception("trip days are empty")

        return data

    def _extract_json(self, raw_text: str) -> str:
        trimmed = raw_text.strip()
        match = JSON_BLOCK_PATTERN.search(trimmed)
        if match:
            return match.group(1).strip()

        start = trimmed.find("{")
        end = trimmed.rfind("}")
        if start >= 0 and end > start:
            return trimmed[start:end + 1]

        return trimmed
