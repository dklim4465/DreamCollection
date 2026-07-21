from pydantic import BaseModel

class GenerateRequest(BaseModel):
    prompt: str
    system: str | None = None
    task: str | None = None