from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum as SQLEnum, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import Category, ResourceType, Urgency, NeedStatus

class Need(Base):
    __tablename__ = "needs"

    id = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(Category, native_enum=False), nullable=False, index=True)
    resource_type = Column(SQLEnum(ResourceType, native_enum=False), nullable=False)
    quantity_requested = Column(Float, nullable=False, default=1.0)
    quantity_fulfilled = Column(Float, nullable=False, default=0.0)
    unit = Column(String(50), nullable=False, default="units")
    location = Column(String(150), nullable=False, index=True)
    urgency = Column(SQLEnum(Urgency, native_enum=False), nullable=False, default=Urgency.MEDIUM, index=True)
    required_by = Column(String(100), nullable=True)
    status = Column(SQLEnum(NeedStatus, native_enum=False), nullable=False, default=NeedStatus.OPEN, index=True)
    preferences = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requester = relationship("User", back_populates="needs")
    matches = relationship("Match", back_populates="need", cascade="all, delete-orphan")

    @property
    def remaining_requested(self) -> float:
        return max(0.0, float(self.quantity_requested) - float(self.quantity_fulfilled))
