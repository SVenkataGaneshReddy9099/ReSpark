from sqlalchemy import Column, Integer, Float, DateTime, Text, Enum as SQLEnum, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import MatchStatus

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    need_id = Column(Integer, ForeignKey("needs.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False)  # Normalized 0.0 - 100.0
    status = Column(SQLEnum(MatchStatus, native_enum=False), nullable=False, default=MatchStatus.SUGGESTED, index=True)
    match_explanation = Column(Text, nullable=False)  # Structured JSON string with breakdown
    proposed_quantity = Column(Float, nullable=False, default=1.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    resource = relationship("Resource", back_populates="matches")
    need = relationship("Need", back_populates="matches")

    # Constraint to prevent duplicate pair matches
    __table_args__ = (
        UniqueConstraint("resource_id", "need_id", name="uq_resource_need"),
    )
