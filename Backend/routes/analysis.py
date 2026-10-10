from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from Backend.database.connection import get_db
from Backend.models.analysis import CommunicationAnalysis
from Backend.models.message import PracticeMessage
from Backend.models.session import CommunicationSession
from Backend.models.user import User
from Backend.schemas.analysis import AnalysisResponse
from Backend.services.analysis_service import analyze_message
from Backend.utils.auth import get_current_user


router = APIRouter(
    prefix="/api/messages",
    tags=["Communication Analysis"]
)


@router.post(
    "/{message_id}/analyze",
    response_model=AnalysisResponse,
    status_code=status.HTTP_201_CREATED
)
def analyze_user_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    message = (
        db.query(PracticeMessage)
        .join(
            CommunicationSession,
            PracticeMessage.session_id
            == CommunicationSession.id
        )
        .filter(
            PracticeMessage.id == message_id,
            CommunicationSession.user_id
            == current_user.id
        )
        .first()
    )

    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    existing_analysis = (
        db.query(CommunicationAnalysis)
        .filter(
            CommunicationAnalysis.message_id
            == message.id
        )
        .first()
    )

    if existing_analysis:
        return existing_analysis

    return analyze_message(
        message,
        db
    )