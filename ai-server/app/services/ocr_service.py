from pathlib import Path
from PIL import Image

import os

os.environ["FLAGS_use_onednn"] = "False"

from paddleocr import PaddleOCR
import numpy as np
import cv2

class OCRService:

    def __init__(self):
        self.backend_root = Path("../backend").resolve()

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
        
        return self._predict(self.full_ocr, image)
    
    def extract_thumbnail_text(self, media_path: str, stored_file_name: str) -> str:
        image = self._load_thumbnail_image(media_path, stored_file_name)

        return self._predict(self.fast_ocr, image)
    
    def _predict(self, ocr: PaddleOCR, image) -> str:
        results = ocr.predict(image)

        texts = []

        for result in results:
            texts.extend(result["rec_texts"])

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
        media_path = media_path.replace("\\","/")

        return (self.backend_root / media_path / stored_file_name).resolve()
    
    def _resolve_thumbnail_path(self, media_path: str, stored_file_name: str) -> Path:
        media_path = media_path.replace("\\", "/")

        return (self.backend_root / media_path / "thumbnail" / stored_file_name).resolve()
    
    def _preprocess(self, image):
        image = np.array(image)
        
        # resize
        h, w= image.shape[:2]

        image = cv2.resize(
            image,
            (w * 2, h * 2),
            interpolation = cv2.INTER_CUBIC
        )

        return image
