from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter(prefix="/ai", tags=["AI Tutor"])

class ChatSessionCreate(BaseModel):
    course_id: str
    mode: Optional[str] = "intermediate"

class ChatMessageRequest(BaseModel):
    message: str

class SourceItem(BaseModel):
    lecture_id: str
    lecture_title: str
    timestamp_seconds: int

class ChatMessageResponse(BaseModel):
    reply: str
    sources: List[SourceItem]
    mode: str

@router.post("/chat/sessions")
def create_chat_session(session_data: ChatSessionCreate):
    return {
        "session_id": str(uuid.uuid4()),
        "course_id": session_data.course_id,
        "mode": session_data.mode,
        "status": "created"
    }

@router.post("/chat/sessions/{session_id}/messages", response_model=ChatMessageResponse)
def send_chat_message(session_id: str, payload: ChatMessageRequest):
    # RAG pipeline placeholder - Grounded response generation
    return ChatMessageResponse(
        reply=f"AI Tutor response for: '{payload.message}'. Grounded on lecture context using RAG.",
        sources=[
            SourceItem(
                lecture_id="00000000-0000-0000-0000-000000000001",
                lecture_title="Course Introduction & Fundamentals",
                timestamp_seconds=120
            )
        ],
        mode="intermediate"
    )
