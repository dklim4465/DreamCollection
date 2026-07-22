import os
import base64
import mimetypes
from pathlib import Path

from openai import OpenAI

from app.schemas.receipt_schema import AIReceiptResult, ReceiptCandidate

class AiReceiptService:

    def __init__(self):
        self.backend_root = Path("../backend").resolve()

        self.client = OpenAI()
        self.model = os.environ["OPENAI_MODEL"]

        prompt_dir = Path(__file__).parent.parent / "prompts"

        self.filter_prompt = (prompt_dir / "receipt_filter.txt").read_text(
            encoding="utf-8"
        )

        self.analyze_prompt = (prompt_dir / "receipt_analyze.txt").read_text(
            encoding="utf-8"
        )

    def is_receipt_candidate(self, text: str) -> bool:

        response = self.client.responses.parse(
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
                            "text": f"OCR 결과\n\n{text}",
                        }
                    ],
                },
            ],
            text_format=ReceiptCandidate,
        )

        return response.output_parsed.candidate

    
    def analyze_receipt(self, text: str, media_path: str, stored_file_name: str) -> AIReceiptResult:
        
        image_path = self._resolve_image_path(media_path, stored_file_name)

        image_data = self._encode_image(image_path)
        media_type = self._get_media_type(image_path)

        response = self.client.responses.parse(
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
                            "text": f"OCR 결과\n\n{text}",
                        },
                    ],
                },
            ],
            text_format=AIReceiptResult,
        )

        return response.output_parsed

    
    def _resolve_image_path(self, media_path: str, stored_file_name: str) -> Path:
        media_path = media_path.replace("\\","/")

        return (self.backend_root / media_path / stored_file_name).resolve()
    
    def _encode_image(self, image_path: Path) -> str:
        with open(image_path, "rb") as image:
            return base64.b64encode(image.read()).decode("utf-8")
        
    def _get_media_type(self, image_path: Path) -> str:
        media_type, _ = mimetypes.guess_type(image_path)

        return media_type or "image/jpeg"