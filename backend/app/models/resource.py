from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum as SQLEnum, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import Category, ResourceType, Condition, AvailabilityStatus

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(Category, native_enum=False), nullable=False, index=True)
    resource_type = Column(SQLEnum(ResourceType, native_enum=False), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    allocated_quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String(50), nullable=False, default="units")
    condition = Column(SQLEnum(Condition, native_enum=False), nullable=False, default=Condition.GOOD)
    location = Column(String(150), nullable=False, index=True)
    availability_status = Column(SQLEnum(AvailabilityStatus, native_enum=False), nullable=False, default=AvailabilityStatus.AVAILABLE, index=True)
    instructions = Column(Text, nullable=True)
    contact_info = Column(String(150), nullable=True)
    estimated_weight_kg = Column(Float, nullable=True, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    provider = relationship("User", back_populates="resources")
    matches = relationship("Match", back_populates="resource", cascade="all, delete-orphan")

    @property
    def remaining_quantity(self) -> float:
        return max(0.0, float(self.quantity) - float(self.allocated_quantity))
