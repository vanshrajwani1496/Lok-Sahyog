from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
import random

import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

from database import get_db
import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "government_secret_sih_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        password_hash=hashed_password,
        email=user.email,
        city_id=user.city_id,
        zone=user.zone,
        circle=user.circle,
        ward=user.ward
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    user.current_otp = otp
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=5)
    db.commit()
    
    # Try sending via Email, fallback to console print
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if user.email and smtp_email and smtp_password:
        try:
            msg = EmailMessage()
            msg.set_content(f"Your Urban Eye secure login code is: {otp}\n\nThis code will expire in 5 minutes.")
            msg['Subject'] = 'Urban Eye Authentication Code'
            msg['From'] = smtp_email
            msg['To'] = user.email

            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            server.quit()
            print(f"✅ OTP Email dispatched successfully to {user.email}")
            return {"message": "OTP verification code sent to your email.", "demo_otp": otp}
        except Exception as e:
            print(f"⚠️ Failed to send email via SMTP: {e}")
            
    # Fallback if no email configured
    print(f"\n==========================================")
    print(f"🔒 OTP for {user.username} is: {otp}")
    print(f"==========================================\n")
    
    return {"message": "OTP generated.", "demo_otp": otp}

@router.post("/verify-otp", response_model=schemas.Token)
def verify_otp(request: schemas.OTPVerify, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if not user.current_otp or not user.otp_expiry:
        raise HTTPException(status_code=400, detail="No active OTP found. Please login first.")
        
    if datetime.now(timezone.utc) > user.otp_expiry.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="OTP has expired")
        
    if user.current_otp != request.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
        
    # OTP verified! Clear it.
    user.current_otp = None
    user.otp_expiry = None
    db.commit()
    
    access_token = create_access_token(data={
        "sub": user.username, 
        "city_id": user.city_id,
        "role": user.role, 
        "zone": user.zone,
        "circle": user.circle,
        "ward": user.ward
    })
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi import Header
def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user
