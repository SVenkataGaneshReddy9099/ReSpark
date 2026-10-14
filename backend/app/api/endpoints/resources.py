from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.db.session import get_db
from app.models.resource import Resource
from app.models.user import User
from app.models.enums import Category, ResourceType, Condition, AvailabilityStatus
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse

router = APIRouter()

@router.get("", response_model=List[ResourceResponse], summary="List and filter resources")
def list_resources(
    q: Optional[str] = Query(None, description="Search keyword in title, description, or location"),
    category: Optional[Category] = Query(None, description="Filter by category"),
    resource_type: Optional[ResourceType] = Query(None, description="Filter by resource type"),
    condition: Optional[Condition] = Query(None, description="Filter by condition"),
    availability: Optional[AvailabilityStatus] = Query(None, description="Filter by availability status"),
    location: Optional[str] = Query(None, description="Filter by location or neighborhood"),
    provider_id: Optional[int] = Query(None, description="Filter by provider user ID"),
    db: Session = Depends(get_db),
):
    query = db.query(Resource)

    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Resource.title.ilike(term),
                Resource.description.ilike(term),
                Resource.location.ilike(term),
            )
        )

    if category:
        query = query.filter(Resource.category == category)
    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    if condition:
        query = query.filter(Resource.condition == condition)
    if availability:
        query = query.filter(Resource.availability_status == availability)
    if location:
        query = query.filter(Resource.location.ilike(f"%{location.strip()}%"))
    if provider_id:
        query = query.filter(Resource.provider_id == provider_id)

    # Order newest first
    resources = query.order_by(Resource.created_at.desc()).all()
    return resources


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED, summary="Create a new resource listing")
def create_resource(
    item_in: ResourceCreate,
    db: Session = Depends(get_db),
):
    # Verify provider user exists
    user = db.query(User).filter(User.id == item_in.provider_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider user ID {item_in.provider_id} does not exist."
        )

    resource = Resource(
        provider_id=item_in.provider_id,
        title=item_in.title,
        description=item_in.description,
        category=item_in.category,
        resource_type=item_in.resource_type,
        quantity=item_in.quantity,
        allocated_quantity=0.0,
        unit=item_in.unit,
        condition=item_in.condition,
        location=item_in.location,
        availability_status=AvailabilityStatus.AVAILABLE,
        instructions=item_in.instructions,
        contact_info=item_in.contact_info,
        estimated_weight_kg=item_in.estimated_weight_kg or 1.0,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.get("/{resource_id}", response_model=ResourceResponse, summary="Get resource details")
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found."
        )
    return resource


@router.put("/{resource_id}", response_model=ResourceResponse, summary="Update resource")
def update_resource(
    resource_id: int,
    update_data: ResourceUpdate,
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found."
        )

    for field, val in update_data.model_dump(exclude_unset=True).items():
        setattr(resource, field, val)

    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/{resource_id}", status_code=status.HTTP_200_OK, summary="Deactivate or remove resource")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {resource_id} not found."
        )

    # If already has active matches, mark inactive instead of deleting
    resource.availability_status = AvailabilityStatus.INACTIVE
    db.commit()
    return {"message": f"Resource {resource_id} successfully deactivated."}
