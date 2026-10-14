from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.db.session import get_db
from app.models.need import Need
from app.models.user import User
from app.models.enums import Category, ResourceType, Urgency, NeedStatus
from app.schemas.need import NeedCreate, NeedUpdate, NeedResponse

router = APIRouter()

@router.get("", response_model=List[NeedResponse], summary="List and filter community needs")
def list_needs(
    q: Optional[str] = Query(None, description="Search keyword in title, description, or location"),
    category: Optional[Category] = Query(None, description="Filter by category"),
    resource_type: Optional[ResourceType] = Query(None, description="Filter by resource type"),
    urgency: Optional[Urgency] = Query(None, description="Filter by urgency"),
    status_filter: Optional[NeedStatus] = Query(None, alias="status", description="Filter by status"),
    location: Optional[str] = Query(None, description="Filter by location or neighborhood"),
    requester_id: Optional[int] = Query(None, description="Filter by requester user ID"),
    db: Session = Depends(get_db),
):
    query = db.query(Need)

    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Need.title.ilike(term),
                Need.description.ilike(term),
                Need.location.ilike(term),
            )
        )

    if category:
        query = query.filter(Need.category == category)
    if resource_type:
        query = query.filter(Need.resource_type == resource_type)
    if urgency:
        query = query.filter(Need.urgency == urgency)
    if status_filter:
        query = query.filter(Need.status == status_filter)
    if location:
        query = query.filter(Need.location.ilike(f"%{location.strip()}%"))
    if requester_id:
        query = query.filter(Need.requester_id == requester_id)

    needs = query.order_by(Need.created_at.desc()).all()
    return needs


@router.post("", response_model=NeedResponse, status_code=status.HTTP_201_CREATED, summary="Post a community need")
def create_need(
    need_in: NeedCreate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == need_in.requester_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Requester user ID {need_in.requester_id} does not exist."
        )

    need = Need(
        requester_id=need_in.requester_id,
        title=need_in.title,
        description=need_in.description,
        category=need_in.category,
        resource_type=need_in.resource_type,
        quantity_requested=need_in.quantity_requested,
        quantity_fulfilled=0.0,
        unit=need_in.unit,
        location=need_in.location,
        urgency=need_in.urgency,
        required_by=need_in.required_by,
        status=NeedStatus.OPEN,
        preferences=need_in.preferences,
    )
    db.add(need)
    db.commit()
    db.refresh(need)
    return need


@router.get("/{need_id}", response_model=NeedResponse, summary="Get need details")
def get_need(
    need_id: int,
    db: Session = Depends(get_db),
):
    need = db.query(Need).filter(Need.id == need_id).first()
    if not need:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Need with ID {need_id} not found."
        )
    return need


@router.put("/{need_id}", response_model=NeedResponse, summary="Update need")
def update_need(
    need_id: int,
    update_data: NeedUpdate,
    db: Session = Depends(get_db),
):
    need = db.query(Need).filter(Need.id == need_id).first()
    if not need:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Need with ID {need_id} not found."
        )

    for field, val in update_data.model_dump(exclude_unset=True).items():
        setattr(need, field, val)

    db.commit()
    db.refresh(need)
    return need


@router.delete("/{need_id}", status_code=status.HTTP_200_OK, summary="Cancel or close need")
def delete_need(
    need_id: int,
    db: Session = Depends(get_db),
):
    need = db.query(Need).filter(Need.id == need_id).first()
    if not need:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Need with ID {need_id} not found."
        )

    need.status = NeedStatus.CANCELLED
    db.commit()
    return {"message": f"Need {need_id} marked as cancelled."}
