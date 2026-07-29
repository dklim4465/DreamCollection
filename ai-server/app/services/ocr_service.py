import os
import logging
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image

os.environ["FLAGS_use_onednn"] = "False"

import numpy as np
import cv2
from paddleocr import PaddleOCR

load_dotenv()

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[3]

class OCRService:

    def __init__(self):
        self.backend_root = Path(
            os.getenv("BACKEND_ROOT", PROJECT_ROOT / "backend")
        ).resolve()
        self.fast_ocr = None
        self.full_ocr = None

    def _get_fast_ocr(self) -> PaddleOCR:
        if self.fast_ocr is None:
            logger.info("Loading fast PaddleOCR model")
            self.fast_ocr = PaddleOCR(
                lang="korean",
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False
            )
        return self.fast_ocr

    def _get_full_ocr(self) -> PaddleOCR:
        if self.full_ocr is None:
            logger.info("Loading full PaddleOCR model")
            self.full_ocr = PaddleOCR(
                lang="korean",
                use_doc_orientation_classify=True,
                use_doc_unwarping=True,
                use_textline_orientation=True,
            )
        return self.full_ocr

    def warmup(self) -> None:
        self.fast_ocr = PaddleOCR(
            lang="korean",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False
        )

        self.full_ocr = PaddleOCR(
            lang="korean",
            use_doc_orientation_classify=True,
            use_doc_unwarping=True,
            use_textline_orientation=True,
        )

    def extract_text(self, media_path: str, stored_file_name: str) -> str:
        image = self._load_original_image(media_path, stored_file_name)
        image = self._preprocess(image)
        
        return self._predict(self._get_fast_ocr(), image)
    
    def extract_thumbnail_text(self, media_path: str, stored_file_name: str) -> str:
        try:
            image = self._load_thumbnail_image(media_path, stored_file_name)
        except FileNotFoundError:
            logger.warning(
                "Receipt thumbnail missing; falling back to original image: %s/%s",
                media_path,
                stored_file_name,
            )
            image = np.array(self._load_original_image(media_path, stored_file_name))

        return self._predict(self._get_fast_ocr(), image)
    
    def _predict(self, ocr: PaddleOCR, image) -> str:
        results = ocr.predict(image)

        texts = []

        for result in results:
            rec_texts = result.get("rec_texts") if isinstance(result, dict) else None
            if rec_texts:
                texts.extend(rec_texts)

        return "\n".join(texts).strip()
    
    def _load_original_image(self, media_path: str, stored_file_name: str):
        path = self._resolve_original_path(media_path, stored_file_name)

        if not path.exists():
            raise FileNotFoundError(f"Image not found: {path}")

        return Image.open(path)
    
    def _load_thumbnail_image(self, media_path: str, stored_file_name: str):
        path = self._resolve_thumbnail_path(media_path, stored_file_name)

        if not path.exists():
            raise FileNotFoundError(f"Image not fount: {path}")
        
        image = Image.open(path)
        
        return np.array(image)
    
    def _resolve_original_path(self, media_path: str, stored_file_name: str) -> Path:
        base_path = self._resolve_media_dir(media_path)

        return (base_path / stored_file_name).resolve()
    
    def _resolve_thumbnail_path(self, media_path: str, stored_file_name: str) -> Path:
        base_path = self._resolve_media_dir(media_path)

        return (base_path / "thumbnail" / stored_file_name).resolve()

    def _resolve_media_dir(self, media_path: str) -> Path:
        normalized = media_path.replace("\\", "/").lstrip("/")
        path = Path(normalized)

        if path.is_absolute():
            return path.resolve()

        if normalized.startswith("backend/"):
            return (PROJECT_ROOT / normalized).resolve()

        return (self.backend_root / normalized).resolve()
    
    def _preprocess(self, image):
        image = np.array(image.convert("RGB"))
        
        # resize
        h, w= image.shape[:2]

        image = cv2.resize(
            image,
            (w * 2, h * 2),
            interpolation = cv2.INTER_CUBIC
        )

        return image
