from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict

class ReceiptTarget(BaseModel):
    mno: int
    media_path: str = Field(alias="mediaPath")
    stored_file_name: str = Field(alias="storedFileName")

    class Config:
        populate_by_name: True

# 서버가 받을 객체
class ReceiptAnalyzeRequest(BaseModel):
    medias: list[ReceiptTarget]

class ReceiptResult(BaseModel):
    mno: int
    merchant: str | None = None
    paid_at: str | None = Field(default=None, alias="paidAt")
    total_amount: int | None = Field(default=None, alias="totalAmount")
    currency: str | None = None
    ocr_text: str | None = Field(default=None, alias="ocrText")
    confidence: float | None = Field(default=None, ge=0, le=1)

    model_config = ConfigDict(
        populate_by_name=True
    )

# 서버가 반환할 객체
class ReceiptAnalyzeResponse(BaseModel):
    results: list[ReceiptResult]

# AI에게 반환하게 할 객체
class AIReceiptResult(BaseModel):
    merchant: str | None = None
    paid_at: str | None = None
    total_amount: int | None = None
    currency: str | None = None
    confidence: float = Field(ge=0, le=1)

class ReceiptCandidate(BaseModel):
    candidate: bool