from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from Backend.database.connection import get_db
from Backend.models.analysis import CommunicationAnalysis
from Backend.models.message import PracticeMessage
from Backend.models.session import CommunicationSession
from Backend.models.user import User
from Backend.schemas.session import SessionCreate, SessionResponse
from Backend.utils.auth import get_current_user

router = APIRouter(
    prefix="/api/sessions",
    tags=["Communication Sessions"]
)
@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_session(
    session_data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_session = CommunicationSession(
        user_id=current_user.id,
        session_type=session_data.session_type,
        scenario=session_data.scenario,
        input_type=session_data.input_type,
        status="active"
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


@router.get(
    "",
    response_model=List[SessionResponse]
)
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(CommunicationSession)
        .filter(
            CommunicationSession.user_id == current_user.id
        )
        .order_by(
            CommunicationSession.started_at.desc()
        )
        .all()
    )

    return sessions


@router.get("/progress/summary")
def get_progress_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(CommunicationSession)
        .filter(
            CommunicationSession.user_id == current_user.id
        )
        .order_by(
            CommunicationSession.started_at.asc()
        )
        .all()
    )

    completed_sessions = [
        session
        for session in sessions
        if session.status == "completed"
        and session.overall_score is not None
    ]

    scores = [
        session.overall_score
        for session in completed_sessions
    ]

    average_score = (
        round(sum(scores) / len(scores), 2)
        if scores
        else 0
    )

    best_score = (
        max(scores)
        if scores
        else 0
    )

    latest_score = (
        scores[-1]
        if scores
        else 0
    )

    return {
        "total_sessions": len(sessions),
        "completed_sessions": len(completed_sessions),
        "average_score": average_score,
        "best_score": best_score,
        "latest_score": latest_score,
        "score_trend": [
            {
                "session_id": session.id,
                "score": session.overall_score,
                "date": session.started_at
            }
            for session in completed_sessions
        ]
    }


@router.get(
    "/{session_id}",
    response_model=SessionResponse
)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = (
        db.query(CommunicationSession)
        .filter(
            CommunicationSession.id == session_id,
            CommunicationSession.user_id == current_user.id
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    return session


@router.patch("/{session_id}/complete")
def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = (
        db.query(CommunicationSession)
        .filter(
            CommunicationSession.id == session_id,
            CommunicationSession.user_id == current_user.id
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    if session.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is already completed"
        )

    analyses = (
        db.query(CommunicationAnalysis)
        .join(
            PracticeMessage,
            CommunicationAnalysis.message_id == PracticeMessage.id
        )
        .filter(
            PracticeMessage.session_id == session.id
        )
        .all()
    )

    if analyses:
        session.overall_score = round(
            sum(
                analysis.overall_score
                for analysis in analyses
            ) / len(analyses),
            2
        )

    session.status = "completed"
    session.ended_at = datetime.utcnow()

    if session.started_at:
        session.duration_seconds = int(
            (
                session.ended_at - session.started_at
            ).total_seconds()
        )

    db.commit()
    db.refresh(session)

    return {
        "message": "Session completed successfully",
        "session": session
    }

@router.get("/{session_id}/analysis")
def get_session_analysis(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = (
        db.query(CommunicationSession)
        .filter(
            CommunicationSession.id == session_id,
            CommunicationSession.user_id == current_user.id
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    results = (
        db.query(
            CommunicationAnalysis,
            PracticeMessage
        )
        .join(
            PracticeMessage,
            CommunicationAnalysis.message_id == PracticeMessage.id
        )
        .filter(
            PracticeMessage.session_id == session.id,
            PracticeMessage.role == "user"
        )
        .order_by(PracticeMessage.created_at.asc())
        .all()
    )

    analyses = []

    for analysis, message in results:
        analyses.append({
            "message_id": message.id,
            "message": message.content,
            "analyzed_at": analysis.analyzed_at,
            "word_count": analysis.word_count,
            "sentence_count": analysis.sentence_count,
            "average_sentence_length": analysis.average_sentence_length,
            "grammar_score": analysis.grammar_score,
            "clarity_score": analysis.clarity_score,
            "vocabulary_score": analysis.vocabulary_score,
            "relevance_score": analysis.relevance_score,
            "overall_score": analysis.overall_score
        })

    return {
        "session_id": session.id,
        "session_type": session.session_type,
        "scenario": session.scenario,
        "status": session.status,
        "overall_score": session.overall_score,
        "analyses": analyses
    }
