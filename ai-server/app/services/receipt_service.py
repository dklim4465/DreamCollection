from app.schemas.receipt_schema import ReceiptTarget, ReceiptAnalyzeResponse, ReceiptResult
from app.services.ocr_service import OCRService
from app.services.ai_receipt_service import AiReceiptService

MIN_THUMBNAIL_TEXT_LENGTH = 20

class ReceiptService:

    def __init__(self, ocr_service: OCRService, ai_receipt_service: AiReceiptService):
        self.ocr_service = ocr_service
        self.ai_receipt_service = ai_receipt_service

    def analyze(self, medias: list[ReceiptTarget]) -> ReceiptAnalyzeResponse:

        results =[]

        for media in medias:

            thumbnail_text = self.ocr_service.extract_thumbnail_text(media.media_path, media.stored_file_name)

            normalized = "".join(thumbnail_text.split())

            if len(normalized) < MIN_THUMBNAIL_TEXT_LENGTH:
                continue

            text = self.ocr_service.extract_text(media.media_path, media.stored_file_name)

            if not self.ai_receipt_service.is_receipt_candidate(text):
                continue

            ai_result = self.ai_receipt_service.analyze_receipt(text, media.media_path, media.stored_file_name)

            results.append(
                ReceiptResult(
                    mno=media.mno,
                    merchant=ai_result.merchant,
                    paid_at=ai_result.paid_at,
                    total_amount=ai_result.total_amount,
                    currency=ai_result.currency,
                    ocr_text=text,
                    confidence=ai_result.confidence,
                )
            )

        return ReceiptAnalyzeResponse(results=results)