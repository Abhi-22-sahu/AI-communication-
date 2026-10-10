from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from Backend.schemas.analysis import AnalysisResponse
from Backend.schemas.feedback import FeedbackResponse
class MessageCreate(BaseModel):

    content: str = Field(
        min_length=1,
        max_length=5000
    )


class MessageResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

class ChatResponse(BaseModel):

    user_message: MessageResponse
    assistant_message: MessageResponse
    analysis: AnalysisResponse
    feedback: FeedbackResponse