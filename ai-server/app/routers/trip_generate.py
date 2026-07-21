from fastapi import APIRouter, HTTPException

from app.schemas.trip_generate_schema import GenerateRequest
from app.services.trip_generate_service import generate_text

router = APIRouter()

@router.post("/generate")
def generate(req: GenerateRequest):

    try:
        text = generate_text(
            prompt=req.prompt,
            system=req.system
        )

        return {
            "text": text,
            "task": req.task
        }
    
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))