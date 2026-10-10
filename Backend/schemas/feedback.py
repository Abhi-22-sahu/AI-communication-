from pydantic import BaseModel


class FeedbackResponse(BaseModel):

    strengths: list[str]

    areas_to_improve: list[str]

    suggestions: list[str]