from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AnalysisResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    message_id: int
    word_count: int
    sentence_count: int
    average_sentence_length: float
    vocabulary_score: float
    clarity_score: float
    grammar_score: float
    relevance_score: float
    overall_score: float
    analyzed_at: datetime