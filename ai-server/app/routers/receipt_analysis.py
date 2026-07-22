from fastapi import APIRouter, HTTPException

from app.schemas.receipt_schema import ReceiptAnalyzeRequest
from app.services.ocr_service import OCRService
from app.services.ai_receipt_service import AiReceiptService
from app.services.receipt_service import ReceiptService

router = APIRouter()

ocr_service = OCRService()
ai_receipt_service = AiReceiptService()
receipt_service = ReceiptService(ocr_service, ai_receipt_service)

@router.post("/analyze")
def analyze_receipt(request: ReceiptAnalyzeRequest):

    return receipt_service.analyze(request.medias)
