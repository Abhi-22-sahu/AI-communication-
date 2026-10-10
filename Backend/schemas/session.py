from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class SessionCreate(BaseModel):

    session_type: Literal[
        "conversation",
        "speaking",
        "interview"
    ]

    scenario: str

    input_type: Literal[
        "text",
        "voice"
    ]


class SessionResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    session_type: str
    scenario: str
    input_type: str
    status: str
    started_at: datetime
    ended_at: datetime | None = None
    duration_seconds: int | None = None
    overall_score: float | None = None