import logging
import re

from app.schemas.receipt_schema import (
    AIReceiptResult,
    ReceiptAnalyzeResponse,
    ReceiptResult,
    ReceiptTarget,
)
from app.services.ai_receipt_service import AiReceiptService
from app.services.ocr_service import OCRService

MIN_THUMBNAIL_TEXT_LENGTH = 20
MIN_OCR_TEXT_LENGTH = 8

AMOUNT_PATTERN = re.compile(r"(?<!\d)(\d{1,3}(?:,\d{3})+|\d{4,8})(?!\d)")
BROKEN_KRW_AMOUNT_PATTERN = re.compile(r"[wW]\s*(\d{1,3})[.,](\d{2,3})")
RECEIPT_HINT_PATTERN = re.compile(
    r"(total|amount|paid|payment|card|cash|receipt|order|subtotal|tax|"
    r"krw|usd|jpy|eur|won|cashier|approval|sale|balance|"
    r"합계|총액|결제|카드|현금|영수증|승인|매출|금액|원)"
)

logger = logging.getLogger(__name__)


class ReceiptService:

    def __init__(self, ocr_service: OCRService, ai_receipt_service: AiReceiptService):
        self.ocr_service = ocr_service
        self.ai_receipt_service = ai_receipt_service

    def analyze(self, medias: list[ReceiptTarget]) -> ReceiptAnalyzeResponse:
        results = []

        for media in medias:
            try:
                text = self._extract_receipt_text(media)
                normalized = "".join(text.split())

                if len(normalized) < MIN_OCR_TEXT_LENGTH:
                    logger.info(
                        "Receipt OCR skipped: text too short mno=%s length=%s",
                        media.mno,
                        len(normalized),
                    )
                    continue

                if not self._is_receipt_candidate(text):
                    logger.info("Receipt OCR skipped: not a receipt mno=%s", media.mno)
                    continue

                ai_result = self._analyze_or_fallback(media, text)
                if ai_result is None:
                    logger.info("Receipt OCR skipped: no analyzable amount mno=%s", media.mno)
                    continue

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
            except Exception:
                logger.exception(
                    "Receipt OCR failed for mno=%s path=%s file=%s",
                    media.mno,
                    media.media_path,
                    media.stored_file_name,
                )

        return ReceiptAnalyzeResponse(results=results)

    def _extract_receipt_text(self, media: ReceiptTarget) -> str:
        thumbnail_text = ""

        try:
            thumbnail_text = self.ocr_service.extract_thumbnail_text(
                media.media_path,
                media.stored_file_name,
            )
        except Exception:
            logger.warning(
                "Receipt thumbnail OCR failed; trying original image mno=%s",
                media.mno,
                exc_info=True,
            )

        normalized_thumbnail = "".join(thumbnail_text.split())
        if len(normalized_thumbnail) >= MIN_THUMBNAIL_TEXT_LENGTH:
            try:
                full_text = self.ocr_service.extract_text(
                    media.media_path,
                    media.stored_file_name,
                )
                if full_text.strip():
                    return full_text
            except Exception:
                logger.warning(
                    "Receipt full OCR failed; using thumbnail text mno=%s",
                    media.mno,
                    exc_info=True,
                )
                return thumbnail_text

        try:
            return self.ocr_service.extract_text(
                media.media_path,
                media.stored_file_name,
            )
        except Exception:
            if thumbnail_text.strip():
                return thumbnail_text
            raise

    def _is_receipt_candidate(self, text: str) -> bool:
        return self._looks_like_receipt(text)

    def _analyze_or_fallback(
        self,
        media: ReceiptTarget,
        text: str,
    ) -> AIReceiptResult | None:
        fallback_result = self._build_fallback_result(text)
        if fallback_result is not None:
            return fallback_result

        return None

    def _looks_like_receipt(self, text: str) -> bool:
        normalized = text.lower()
        return bool(RECEIPT_HINT_PATTERN.search(normalized) or self._extract_amount(text))

    def _build_fallback_result(self, text: str) -> AIReceiptResult | None:
        amount = self._extract_amount(text)
        if amount is None:
            return None

        return AIReceiptResult(
            merchant=None,
            paid_at=None,
            total_amount=amount,
            currency=self._guess_currency(text),
            confidence=0.35,
        )

    def _extract_amount(self, text: str) -> int | None:
        broken_krw_amounts = []
        for match in BROKEN_KRW_AMOUNT_PATTERN.finditer(text):
            major = int(match.group(1))
            minor = match.group(2)
            value = int(f"{major}{minor.ljust(3, '0')}")
            if 100 <= value <= 99_999_999:
                broken_krw_amounts.append(value)

        if broken_krw_amounts:
            return max(broken_krw_amounts)

        amounts = []
        comma_amounts = []

        for match in AMOUNT_PATTERN.finditer(text):
            raw_value = match.group(1)
            value = int(raw_value.replace(",", ""))

            if "," not in raw_value and value >= 1_000_000:
                continue

            if 100 <= value <= 99_999_999:
                amounts.append(value)
                if "," in raw_value:
                    comma_amounts.append(value)

        if comma_amounts:
            return max(comma_amounts)

        if not amounts:
            return None

        return max(amounts)

    def _guess_currency(self, text: str) -> str | None:
        lowered = text.lower()

        if "jpy" in lowered or "yen" in lowered:
            return "JPY"
        if "usd" in lowered or "$" in text:
            return "USD"
        if "eur" in lowered:
            return "EUR"
        if "krw" in lowered or "won" in lowered or "원" in text:
            return "KRW"

        return None
