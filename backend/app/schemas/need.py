from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models.enums import Category, ResourceType, Urgency, NeedStatus
from app.schemas.user import UserResponse

class NeedBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5)
    category: Category
    resource_type: ResourceType
    quantity_requested: float = Field(..., gt=0)
    unit: str = Field(default="units", max_length=50)
    location: str = Field(..., min_length=2, max_length=150)
    urgency: Urgency = Urgency.MEDIUM
    required_by: Optional[str] = None
    preferences: Optional[str] = None

class NeedCreate(NeedBase):
    requester_id: int

class NeedUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[Category] = None
    resource_type: Optional[ResourceType] = None
    quantity_requested: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    location: Optional[str] = None
    urgency: Optional[Urgency] = None
    required_by: Optional[str] = None
    status: Optional[NeedStatus] = None
    preferences: Optional[str] = None

class NeedResponse(NeedBase):
    id: int
    requester_id: int
    quantity_fulfilled: float
    remaining_requested: float
    status: NeedStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    requester: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
