"""Match Lifecycle and State Machine Service with Transactional Integrity."""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional

from app.models.match import Match
from app.models.resource import Resource
from app.models.need import Need
from app.models.enums import MatchStatus, AvailabilityStatus, NeedStatus

# Valid status transitions
VALID_TRANSITIONS = {
    MatchStatus.SUGGESTED: {MatchStatus.INTEREST_EXPRESSED, MatchStatus.REJECTED, MatchStatus.CANCELLED},
    MatchStatus.INTEREST_EXPRESSED: {MatchStatus.ACCEPTED, MatchStatus.REJECTED, MatchStatus.CANCELLED},
    MatchStatus.ACCEPTED: {MatchStatus.COMPLETED, MatchStatus.CANCELLED},
    MatchStatus.REJECTED: set(),
    MatchStatus.COMPLETED: set(),
    MatchStatus.CANCELLED: set(),
}

def transition_match_status(
    db: Session,
    match_id: int,
    new_status: MatchStatus,
    notes: Optional[str] = None,
    allocated_quantity: Optional[float] = None
) -> Match:
    """
    Executes valid match state transitions with atomic transactional guarantees,
    updating resource and need inventory without over-allocation.
    """
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match with ID {match_id} does not exist."
        )

    current_status = match.status
    if current_status == new_status:
        return match

    allowed_targets = VALID_TRANSITIONS.get(current_status, set())
    if new_status not in allowed_targets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid match transition: cannot change from '{current_status.value}' to '{new_status.value}'."
        )

    resource = db.query(Resource).filter(Resource.id == match.resource_id).with_for_update().first()
    need = db.query(Need).filter(Need.id == match.need_id).with_for_update().first()

    qty = allocated_quantity if (allocated_quantity is not None and allocated_quantity > 0) else match.proposed_quantity

    try:
        # Handle ACCEPTED state (reserves inventory)
        if new_status == MatchStatus.ACCEPTED:
            # Over-allocation guard
            if resource.remaining_quantity < qty:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Resource over-allocation: only {resource.remaining_quantity:g} available, but {qty:g} required."
                )
            resource.allocated_quantity = float(resource.allocated_quantity or 0.0) + float(qty)
            match.proposed_quantity = float(qty)
            if resource.remaining_quantity <= 0:
                resource.availability_status = AvailabilityStatus.RESERVED
            need.status = NeedStatus.IN_PROGRESS

        # Handle COMPLETED state (finalizes reuse)
        elif new_status == MatchStatus.COMPLETED:
            if current_status != MatchStatus.ACCEPTED:
                # If completing directly from interest, verify and allocate
                if resource.remaining_quantity < qty:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Resource over-allocation: only {resource.remaining_quantity:g} available."
                    )
                resource.allocated_quantity = float(resource.allocated_quantity or 0.0) + float(qty)

            need.quantity_fulfilled = float(need.quantity_fulfilled or 0.0) + float(qty)
            if need.remaining_requested <= 0:
                need.status = NeedStatus.FULFILLED
            if resource.remaining_quantity <= 0:
                resource.availability_status = AvailabilityStatus.COMPLETED

        # Handle CANCELLED from ACCEPTED (roll back reserved quantity)
        elif new_status == MatchStatus.CANCELLED and current_status == MatchStatus.ACCEPTED:
            resource.allocated_quantity = max(0.0, float(resource.allocated_quantity or 0.0) - float(qty))
            if resource.availability_status == AvailabilityStatus.RESERVED and resource.remaining_quantity > 0:
                resource.availability_status = AvailabilityStatus.AVAILABLE
            if need.status == NeedStatus.IN_PROGRESS and need.quantity_fulfilled == 0:
                need.status = NeedStatus.OPEN

        match.status = new_status
        if notes:
            match.notes = notes

        db.commit()
        db.refresh(match)
        db.refresh(resource)
        db.refresh(need)
        return match

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update match status: {str(exc)}"
        )
