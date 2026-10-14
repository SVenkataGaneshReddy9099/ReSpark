from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models.enums import Category, ResourceType, Condition, AvailabilityStatus
from app.schemas.user import UserResponse

class ResourceBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5)
    category: Category
    resource_type: ResourceType
    quantity: float = Field(..., gt=0)
    unit: str = Field(default="units", max_length=50)
    condition: Condition = Condition.GOOD
    location: str = Field(..., min_length=2, max_length=150)
    instructions: Optional[str] = None
    contact_info: Optional[str] = None
    estimated_weight_kg: Optional[float] = Field(default=1.0, ge=0)

class ResourceCreate(ResourceBase):
    provider_id: int

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[Category] = None
    resource_type: Optional[ResourceType] = None
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    condition: Optional[Condition] = None
    location: Optional[str] = None
    availability_status: Optional[AvailabilityStatus] = None
    instructions: Optional[str] = None
    contact_info: Optional[str] = None
    estimated_weight_kg: Optional[float] = None

class ResourceResponse(ResourceBase):
    id: int
    provider_id: int
    allocated_quantity: float
    remaining_quantity: float
    availability_status: AvailabilityStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    provider: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
