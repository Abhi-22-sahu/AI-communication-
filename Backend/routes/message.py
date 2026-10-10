from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Backend.services.ai.conversation import generate_response

from Backend.services.feedback.generator import generate_feedback
from Backend.services.analysis_service import analyze_message
from Backend.database.connection import get_db
from Backend.models.message import PracticeMessage
from Backend.models.session import CommunicationSession
from Backend.models.user import User
from Backend.schemas.message import (
    ChatResponse,
    MessageCreate,
    MessageResponse
)
from Backend.utils.auth import get_current_user


router = APIRouter(
    prefix="/api/sessions",
    tags=["Practice Messages"]
)


@router.post(
    "/{session_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED
)
def create_message(
    session_id: int,
    message_data: MessageCreate,
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

    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add messages to an inactive session"
        )

    new_message = PracticeMessage(
        session_id=session.id,
        role="user",
        content=message_data.content
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message

@router.post(
    "/{session_id}/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED
)
def chat(
    session_id: int,
    message_data: MessageCreate,
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

    if session.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot chat in an inactive session"
        )

    user_message = PracticeMessage(
        session_id=session.id,
        role="user",
        content=message_data.content
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)
   
    analysis = analyze_message(
        message=user_message,
        db=db
    )

    previous_messages = (
        db.query(PracticeMessage)
        .filter(
            PracticeMessage.session_id == session.id,
            PracticeMessage.id < user_message.id
        )
        .order_by(PracticeMessage.created_at.asc())
        .all()
    )

    conversation_context = [
        {
            "role": item.role,
            "content": item.content
        }
        for item in previous_messages
    ]

    feedback = generate_feedback(
        analysis=analysis,
        user_message=user_message.content,
        conversation_context=conversation_context,
        scenario=session.scenario or ""
    )
    
    messages = (
        db.query(PracticeMessage)
        .filter(
            PracticeMessage.session_id == session.id
        )
        .order_by(
            PracticeMessage.created_at.asc()
        )
        .all()
    )

    conversation = [
        {
            "role": message.role,
            "content": message.content
        }
        for message in messages
    ]
    print("SESSION TYPE:", session.session_type)
    print("SCENARIO:", session.scenario)
    print("CONVERSATION SENT TO AI:", conversation)

    ai_response = generate_response(
        conversation=conversation,
        session_type=session.session_type,
        scenario=session.scenario
    )

    assistant_message = PracticeMessage(
        session_id=session.id,
        role="assistant",
        content=ai_response
    )

    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return ChatResponse(
        user_message=user_message,
        assistant_message=assistant_message,
        analysis=analysis,
        feedback=feedback
    )

