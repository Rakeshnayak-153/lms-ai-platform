from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import chat

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Vertexon LMS-AI Tutor & RAG Microservice"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-tutor"}

@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "docs_url": "/docs",
        "health": "/health"
    }
