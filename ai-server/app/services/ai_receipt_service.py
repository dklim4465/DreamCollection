import base64
import logging
import mimetypes
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

from app.schemas.receipt_schema import AIReceiptResult, ReceiptCandidate

load_dotenv()

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class AiReceiptService:

    def __init__(self):
        self.backend_root = Path(
            os.getenv("BACKEND_ROOT", PROJECT_ROOT / "backend")
        ).resolve()
        self.client = None
        self.model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip()

        prompt_dir = Path(__file__).parent.parent / "prompts"

        self.filter_prompt = (prompt_dir / "receipt_filter.txt").read_text(
            encoding="utf-8"
        )

        self.analyze_prompt = (prompt_dir / "receipt_analyze.txt").read_text(
            encoding="utf-8"
        )

    def is_receipt_candidate(self, text: str) -> bool:
        response = self._get_client().responses.parse(
            model=self.model,
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": self.filter_prompt,
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": f"OCR result\n\n{text}",
                        }
                    ],
                },
            ],
            text_format=ReceiptCandidate,
        )

        return response.output_parsed.candidate

    def analyze_receipt(
        self,
        text: str,
        media_path: str,
        stored_file_name: str,
    ) -> AIReceiptResult:
        image_path = self._resolve_image_path(media_path, stored_file_name)

        image_data = self._encode_image(image_path)
        media_type = self._get_media_type(image_path)

        response = self._get_client().responses.parse(
            model=self.model,
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": self.analyze_prompt,
                        }
                    ],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_image",
                            "image_url": f"data:{media_type};base64,{image_data}",
                        },
                        {
                            "type": "input_text",
                            "text": f"OCR result\n\n{text}",
                        },
                    ],
                },
            ],
            text_format=AIReceiptResult,
        )

        return response.output_parsed

    def _get_client(self) -> OpenAI:
        if self.client is None:
            if not os.getenv("OPENAI_API_KEY"):
                raise RuntimeError("OPENAI_API_KEY missing")
            logger.info("Creating OpenAI client for receipt analysis")
            self.client = OpenAI()

        return self.client

    def _resolve_image_path(self, media_path: str, stored_file_name: str) -> Path:
        return (self._resolve_media_dir(media_path) / stored_file_name).resolve()

    def _resolve_media_dir(self, media_path: str) -> Path:
        normalized = media_path.replace("\\", "/").lstrip("/")
        path = Path(normalized)

        if path.is_absolute():
            return path.resolve()

        if normalized.startswith("backend/"):
            return (PROJECT_ROOT / normalized).resolve()

        return (self.backend_root / normalized).resolve()

    def _encode_image(self, image_path: Path) -> str:
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        with open(image_path, "rb") as image:
            return base64.b64encode(image.read()).decode("utf-8")

    def _get_media_type(self, image_path: Path) -> str:
        media_type, _ = mimetypes.guess_type(image_path)

        return media_type or "image/jpeg"
