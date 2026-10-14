from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, func
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    display_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    location = Column(String(150), nullable=False)
    bio = Column(Text, nullable=True)
    is_organization = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resources = relationship("Resource", back_populates="provider", cascade="all, delete-orphan")
    needs = relationship("Need", back_populates="requester", cascade="all, delete-orphan")
