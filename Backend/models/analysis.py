from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from Backend.database.connection import Base


class CommunicationAnalysis(Base):
    __tablename__ = "communication_analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    message_id: Mapped[int] = mapped_column(
        ForeignKey("practice_messages.id"),
        unique=True,
        nullable=False,
        index=True
    )

    word_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    sentence_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    average_sentence_length: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    vocabulary_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    clarity_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    grammar_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    relevance_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    overall_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    analyzed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )