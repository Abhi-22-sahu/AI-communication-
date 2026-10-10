
from sqlalchemy.orm import Session

from Backend.models.analysis import CommunicationAnalysis
from Backend.models.message import PracticeMessage
from Backend.models.session import CommunicationSession
from Backend.services.nlp.analyzer import analyze_text


def analyze_message(
    message: PracticeMessage,
    db: Session
) -> CommunicationAnalysis:
    session = (
        db.query(CommunicationSession)
        .filter(
            CommunicationSession.id == message.session_id
        )
        .first()
    )

    previous_messages = (
        db.query(PracticeMessage)
        .filter(
            PracticeMessage.session_id == message.session_id,
            PracticeMessage.id < message.id
        )
        .order_by(PracticeMessage.id.asc())
        .all()
    )

    conversation_context = [
        {
            "role": previous.role,
            "content": previous.content
        }
        for previous in previous_messages
    ]

    # Use the latest assistant message as the question being answered.
    latest_question = next(
        (
            item["content"]
            for item in reversed(conversation_context)
            if item["role"] in ("assistant", "model")
        ),
        ""
    )

    scenario = session.scenario if session else ""

    # Include the explicit question in context for relevance analysis.
    scoring_context = conversation_context.copy()

    if latest_question:
        scoring_context.append({
            "role": "question",
            "content": latest_question
        })

    scores = analyze_text(
        message.content,
        scenario=scenario,
        context=scoring_context
    )

    overall_score = round(
        (
            scores["vocabulary_score"]
            + scores["clarity_score"]
            + scores["grammar_score"]
            + scores["relevance_score"]
        ) / 4,
        2
    )

    analysis = CommunicationAnalysis(
        message_id=message.id,
        word_count=scores["word_count"],
        sentence_count=scores["sentence_count"],
        average_sentence_length=scores[
            "average_sentence_length"
        ],
        vocabulary_score=scores["vocabulary_score"],
        clarity_score=scores["clarity_score"],
        grammar_score=scores["grammar_score"],
        relevance_score=scores["relevance_score"],
        overall_score=overall_score
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis
