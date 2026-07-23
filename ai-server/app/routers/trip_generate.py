from fastapi import APIRouter, HTTPException

from app.schemas.trip_generate_schema import GenerateRequest, GenerateResponse
from app.services.trip_generate_service import TripGenerateService

router = APIRouter()
trip_generate_service = TripGenerateService()

# Hybrid trip AI: placeIds only from prompt pools; slots Morning/Lunch/Afternoon/Dinner
DEFAULT_TRIP_SYSTEM = (
    "Use only placeIds from the provided mealPlaces and activityPlaces. "
    "Output JSON with timeSlot and placeId only. "
    "Allowed timeSlots: Morning, Lunch, Afternoon, Dinner. No Cafe slot."
)

@router.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):

    try:
        system = req.system or DEFAULT_TRIP_SYSTEM
        data = trip_generate_service.generate(
            prompt=req.prompt,
            system=system
        )

        return GenerateResponse(
            task=req.task,
            data=data,
        )
    
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
