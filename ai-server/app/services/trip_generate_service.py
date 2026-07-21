import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)

def generate_text(
        prompt: str,
        system: str | None = None
):
    if not GEMINI_API_KEY:
        raise Exception("GEMIN_API_KEY missing")
    
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
        GEMINI_URL, headers={
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
        .get("text","")
    )

    if not text:
        raise Exception("empty response")
    
    return text