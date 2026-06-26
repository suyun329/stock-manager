from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.ai_feedback import AIFeedbackResponse
from app.services.ai_feedback_service import get_ai_feedback

router = APIRouter()


@router.get("/ai-feedback/{ticker}", response_model=AIFeedbackResponse)
def ai_feedback(
    ticker: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_ai_feedback(db, ticker.upper(), user_id=current_user.id)
