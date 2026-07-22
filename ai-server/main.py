from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import trip_generate
from app.routers import receipt_analysis


app = FastAPI(
    title="AI Server"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.get("/health")
def health():
    return {
        "ok": True
    }

app.include_router(
    trip_generate.router,
    prefix="/api/v1",
    tags=["generate"]
)

app.include_router(
    receipt_analysis.router,
    prefix="/api/v1/receipt",
    tags=["receipt"]
)