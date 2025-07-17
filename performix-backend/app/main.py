from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid

app = FastAPI(title="Performix API", description="Book my wood - Advanced class booking system")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

users_db = {}
memberships_db = {}
classes_db = {}
bookings_db = {}

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime

class MembershipCreate(BaseModel):
    type: str  # "daily", "weekly", "monthly"

class Membership(BaseModel):
    id: str
    user_id: str
    type: str
    start_date: datetime
    end_date: datetime
    is_active: bool

class ClassCreate(BaseModel):
    name: str
    description: str
    instructor: str
    datetime: datetime
    duration_minutes: int
    max_capacity: int

class Class(BaseModel):
    id: str
    name: str
    description: str
    instructor: str
    datetime: datetime
    duration_minutes: int
    max_capacity: int
    current_bookings: int

class BookingCreate(BaseModel):
    class_id: str

class Booking(BaseModel):
    id: str
    user_id: str
    class_id: str
    booking_date: datetime
    status: str

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_db.get(user_id)
    if user is None:
        raise credentials_exception
    return user

def get_active_membership(user_id: str) -> Optional[Membership]:
    for membership in memberships_db.values():
        if (membership["user_id"] == user_id and 
            membership["is_active"] and 
            membership["end_date"] > datetime.utcnow()):
            return membership
    return None

def init_sample_data():
    sample_classes = [
        {
            "id": str(uuid.uuid4()),
            "name": "Morning CrossFit",
            "description": "High-intensity functional fitness workout",
            "instructor": "Sarah Johnson",
            "datetime": datetime.utcnow() + timedelta(days=1, hours=8),
            "duration_minutes": 60,
            "max_capacity": 20,
            "current_bookings": 0
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Yoga Flow",
            "description": "Relaxing vinyasa flow session",
            "instructor": "Mike Chen",
            "datetime": datetime.utcnow() + timedelta(days=1, hours=18),
            "duration_minutes": 75,
            "max_capacity": 15,
            "current_bookings": 0
        },
        {
            "id": str(uuid.uuid4()),
            "name": "HIIT Training",
            "description": "High-intensity interval training",
            "instructor": "Alex Rodriguez",
            "datetime": datetime.utcnow() + timedelta(days=2, hours=10),
            "duration_minutes": 45,
            "max_capacity": 25,
            "current_bookings": 0
        }
    ]
    
    for class_data in sample_classes:
        classes_db[class_data["id"]] = class_data

init_sample_data()

@app.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    if user_data.email in [u["email"] for u in users_db.values()]:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    users_db[user_id] = user
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = None
    for u in users_db.values():
        if u["email"] == user_data.email:
            user = u
            break
    
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return User(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        created_at=current_user["created_at"]
    )

@app.post("/memberships", response_model=Membership)
async def create_membership(membership_data: MembershipCreate, current_user: dict = Depends(get_current_user)):
    for membership in memberships_db.values():
        if membership["user_id"] == current_user["id"] and membership["is_active"]:
            membership["is_active"] = False
    
    membership_id = str(uuid.uuid4())
    start_date = datetime.utcnow()
    
    if membership_data.type == "daily":
        end_date = start_date + timedelta(days=1)
    elif membership_data.type == "weekly":
        end_date = start_date + timedelta(weeks=1)
    elif membership_data.type == "monthly":
        end_date = start_date + timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Invalid membership type")
    
    membership = {
        "id": membership_id,
        "user_id": current_user["id"],
        "type": membership_data.type,
        "start_date": start_date,
        "end_date": end_date,
        "is_active": True
    }
    
    memberships_db[membership_id] = membership
    
    return Membership(**membership)

@app.get("/memberships/current")
async def get_current_membership(current_user: dict = Depends(get_current_user)):
    membership = get_active_membership(current_user["id"])
    if not membership:
        raise HTTPException(status_code=404, detail="No active membership found")
    return Membership(**membership)

@app.get("/classes", response_model=List[Class])
async def get_classes():
    return [Class(**class_data) for class_data in classes_db.values()]

@app.get("/classes/{class_id}", response_model=Class)
async def get_class(class_id: str):
    if class_id not in classes_db:
        raise HTTPException(status_code=404, detail="Class not found")
    return Class(**classes_db[class_id])

@app.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    membership = get_active_membership(current_user["id"])
    if not membership:
        raise HTTPException(status_code=400, detail="No active membership found")
    
    if booking_data.class_id not in classes_db:
        raise HTTPException(status_code=404, detail="Class not found")
    
    class_info = classes_db[booking_data.class_id]
    
    if class_info["current_bookings"] >= class_info["max_capacity"]:
        raise HTTPException(status_code=400, detail="Class is full")
    
    for booking in bookings_db.values():
        if booking["user_id"] == current_user["id"] and booking["class_id"] == booking_data.class_id:
            raise HTTPException(status_code=400, detail="Already booked this class")
    
    booking_id = str(uuid.uuid4())
    booking = {
        "id": booking_id,
        "user_id": current_user["id"],
        "class_id": booking_data.class_id,
        "booking_date": datetime.utcnow(),
        "status": "confirmed"
    }
    
    bookings_db[booking_id] = booking
    classes_db[booking_data.class_id]["current_bookings"] += 1
    
    return Booking(**booking)

@app.get("/bookings", response_model=List[Booking])
async def get_user_bookings(current_user: dict = Depends(get_current_user)):
    user_bookings = [
        Booking(**booking) for booking in bookings_db.values() 
        if booking["user_id"] == current_user["id"]
    ]
    return user_bookings

@app.delete("/bookings/{booking_id}")
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    if booking_id not in bookings_db:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = bookings_db[booking_id]
    if booking["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    
    classes_db[booking["class_id"]]["current_bookings"] -= 1
    
    del bookings_db[booking_id]
    
    return {"message": "Booking cancelled successfully"}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
