"""
Authentication API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    verify_token,
    verify_password,
    get_password_hash,
    validate_password_strength
)
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    Token,
    PasswordReset,
    PasswordResetConfirm,
    UserUsageResponse,
    SubscriptionUpgrade
)

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    """
    token = credentials.credentials
    user_id = verify_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


@router.post("/register", response_model=Token)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password strength
    is_valid, error_message = validate_password_strength(user_create.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Create new user
    hashed_password = get_password_hash(user_create.password)
    db_user = User(
        email=user_create.email,
        name=user_create.name,
        niche=user_create.niche,
        hashed_password=hashed_password,
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"New user registered: {user_create.email}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to register user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Create access token
    access_token = create_access_token(subject=db_user.id)
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(db_user)
    )


@router.post("/login", response_model=Token)
async def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """
    User login with email and password.
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_login.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Update last login
    try:
        user.last_login = datetime.utcnow()
        db.commit()
    except Exception as e:
        logger.warning(f"Failed to update last login for user {user.id}: {e}")
    
    # Create access token
    access_token = create_access_token(subject=user.id)
    
    logger.info(f"User logged in: {user.email}")
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile.
    """
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile.
    """
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "niche" and value is not None:
            # Handle niche as string - if it's an enum, use its value
            niche_value = value.value if hasattr(value, 'value') else value
            setattr(current_user, field, niche_value)
        else:
            setattr(current_user, field, value)
    
    try:
        db.commit()
        db.refresh(current_user)
        logger.info(f"User profile updated: {current_user.email}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    User logout (client should remove token).
    """
    logger.info(f"User logged out: {current_user.email}")
    return {"message": "Successfully logged out"}


@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """
    Refresh access token.
    """
    access_token = create_access_token(subject=current_user.id)
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(current_user)
    )


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile (PUT endpoint for frontend compatibility).
    """
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "niche" and value is not None:
            # Handle niche as string - if it's an enum, use its value
            niche_value = value.value if hasattr(value, 'value') else value
            setattr(current_user, field, niche_value)
        else:
            setattr(current_user, field, value)
    
    try:
        db.commit()
        db.refresh(current_user)
        logger.info(f"User profile updated: {current_user.email}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return UserResponse.model_validate(current_user)


@router.post("/change-password")
async def change_password(
    password_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password.
    """
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password and new password are required"
        )
    
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password strength
    is_valid, error_message = validate_password_strength(new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Update password
    try:
        current_user.hashed_password = get_password_hash(new_password)
        db.commit()
        logger.info(f"Password changed for user: {current_user.email}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to change password for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )
    
    return {"message": "Password changed successfully"}


@router.get("/usage", response_model=UserUsageResponse)
async def get_user_usage(current_user: User = Depends(get_current_user)):
    """
    Get current user's usage statistics and limits.
    """
    return UserUsageResponse(
        captions_used_this_month=current_user.captions_used_this_month,
        caption_limit=current_user.caption_limit,
        videos_processed_this_month=current_user.videos_processed_this_month,
        video_limit=current_user.video_limit,
        subscription_plan=current_user.subscription_plan,
        subscription_ends_at=current_user.subscription_ends_at,
        can_use_captions=current_user.can_use_captions(),
        can_process_videos=current_user.can_process_videos()
    )


@router.post("/upgrade-subscription")
async def upgrade_subscription(
    upgrade_request: SubscriptionUpgrade,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upgrade user subscription plan.
    Note: In production, integrate with Stripe or other payment processor.
    """
    try:
        # For demo purposes, we'll just update the plan
        # In production, you would:
        # 1. Validate payment method
        # 2. Create subscription in Stripe
        # 3. Handle webhooks for subscription events
        
        current_user.subscription_plan = upgrade_request.plan.value
        
        # Set subscription end date (demo: 1 month from now)
        from datetime import datetime, timedelta
        current_user.subscription_ends_at = datetime.utcnow() + timedelta(days=30)
        
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"User {current_user.id} upgraded to {upgrade_request.plan.value}")
        
        return {
            "message": f"Successfully upgraded to {upgrade_request.plan.value} plan!",
            "subscription_plan": current_user.subscription_plan,
            "subscription_ends_at": current_user.subscription_ends_at
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to upgrade subscription for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade subscription"
        )


@router.post("/reset-usage")
async def reset_monthly_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset monthly usage counters (for admin or billing cycle reset).
    """
    try:
        current_user.captions_used_this_month = 0
        current_user.videos_processed_this_month = 0
        current_user.usage_reset_date = datetime.utcnow()
        
        db.commit()
        logger.info(f"Usage reset for user {current_user.id}")
        
        return {"message": "Monthly usage reset successfully"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to reset usage for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset usage"
        )


    return {"message": "Password changed successfully"} 