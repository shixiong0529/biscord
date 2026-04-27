from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Message, Report, Server, User
from schemas import ReportCreateRequest, ReportSchema

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _snapshot(db: Session, target_type: str, target_id: int) -> str | None:
    if target_type == "message":
        msg = db.get(Message, target_id)
        return msg.content[:500] if msg and not msg.is_deleted else None
    if target_type == "user":
        u = db.get(User, target_id)
        return f"{u.username} ({u.display_name})" if u else None
    if target_type == "server":
        s = db.get(Server, target_id)
        return s.name if s else None
    return None


@router.post("", response_model=ReportSchema, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.scalar(
        select(Report).where(
            Report.reporter_id == current_user.id,
            Report.target_type == payload.target_type,
            Report.target_id == payload.target_id,
            Report.status == "pending",
        )
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="already reported")

    snapshot = _snapshot(db, payload.target_type, payload.target_id)
    report = Report(
        reporter_id=current_user.id,
        target_type=payload.target_type,
        target_id=payload.target_id,
        content_snapshot=snapshot,
        reason=payload.reason,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
