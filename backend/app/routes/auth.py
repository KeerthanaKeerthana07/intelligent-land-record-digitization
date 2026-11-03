from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import sql_models, schemas
from app.services.auth_service import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_req: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(sql_models.User).filter(sql_models.User.email == login_req.email).first()
    
    if not user or not verify_password(login_req.password, user.hashed_password):
        # Log failed attempt
        log = sql_models.ActivityLog(
            user_email=login_req.email,
            action="LOGIN_FAILED",
            details="Invalid email or password combination",
            ip_address=request.client.host if request.client else "127.0.0.1"
        )
        db.add(log)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. For demo access use admin@landrecords.gov.in / admin123 or officer@landrecords.gov.in / officer123"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or inactive."
        )

    # Log successful login
    log = sql_models.ActivityLog(
        user_email=user.email,
        action="LOGIN_SUCCESS",
        details=f"User {user.full_name} logged in successfully with role '{user.role}'",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(log)
    db.commit()

    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "department": user.department
        }
    }

@router.get("/me")
def get_profile(current_user: sql_models.User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "department": current_user.department
    }
