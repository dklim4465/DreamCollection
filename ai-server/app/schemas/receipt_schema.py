from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

class ReceiptTarget(BaseModel):
    mno: int
    media_path: str
    stored_file_name: str

# 서버가 받을 객체
class ReceiptAnalyzeRequest(BaseModel):
    medias: list[ReceiptTarget]

class ReceiptResult(BaseModel):
    mno: int
    merchant: str | None = None
    paid_at: datetime | None = None
    total_amount: int | None = None
    currency: str | None = None
    ocr_text: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)

# 서버가 반환할 객체
class ReceiptAnalyzeResponse(BaseModel):
    results: list[ReceiptResult]

# AI에게 반환하게 할 객체
class AIReceiptResult(BaseModel):
    merchant: str | None = None
    paid_at: datetime | None = None
    total_amount: int | None = None
    currency: str | None = None
    confidence: float = Field(ge=0, le=1)

class ReceiptCandidate(BaseModel):
    candidate: bool