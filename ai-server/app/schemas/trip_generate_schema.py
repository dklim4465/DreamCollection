from pydantic import BaseModel

class GenerateRequest(BaseModel):
    prompt: str
    system: str | None = None
    task: str | None = None

class TripScheduleItem(BaseModel):
    timeSlot: str
    placeId: int

class TripDayPlan(BaseModel):
    dayNumber: int
    items: list[TripScheduleItem]

class TripGenerateData(BaseModel):
    days: list[TripDayPlan]

class GenerateResponse(BaseModel):
    task: str | None = None
    data: TripGenerateData
