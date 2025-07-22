from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid
import stripe
import os
import warnings

app = FastAPI(title="Performix API", description="Book my wood - Advanced class booking system")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

warnings.filterwarnings("ignore", message=".*bcrypt.*__about__.*")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

admin_user_id = "admin-001"
users_db = {
    admin_user_id: {
        "id": admin_user_id,
        "email": "admin@performix.com",
        "full_name": "Admin User",
        "hashed_password": "",
        "created_at": datetime.utcnow(),
        "role": "admin"
    }
}
memberships_db = {}
classes_db = {}
bookings_db = {}
packages_db = {}

class AppSettings(BaseModel):
    id: str
    key: str
    value: str
    category: str
    description: Optional[str] = None

settings_db = {
    "theme-primary": {
        "id": "theme-primary",
        "key": "theme_primary_color",
        "value": "#000000",
        "category": "theme",
        "description": "Primary theme color"
    },
    "theme-background": {
        "id": "theme-background", 
        "key": "background_image_url",
        "value": "",
        "category": "theme",
        "description": "Background image URL"
    }
}

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
    role: Optional[str] = "user"

class MembershipCreate(BaseModel):
    type: str  # "daily", "weekly", "monthly"
    payment_intent_id: Optional[str] = None

class PaymentIntentCreate(BaseModel):
    membership_type: str

class PaymentIntentResponse(BaseModel):
    client_secret: str
    amount: int
    currency: str

class PackageCreate(BaseModel):
    name: str
    type: str
    price: int
    duration_days: int
    description: str
    features: List[str]
    is_active: bool = True

class Package(BaseModel):
    id: str
    name: str
    type: str
    price: int
    duration_days: int
    description: str
    features: List[str]
    is_active: bool
    created_at: datetime

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

def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def init_sample_data():
    class_types = [
        {"name": "Morning CrossFit", "description": "High-intensity functional fitness workout", "instructor": "Sarah Johnson", "duration": 60, "capacity": 20},
        {"name": "Yoga Flow", "description": "Relaxing vinyasa flow session", "instructor": "Mike Chen", "duration": 75, "capacity": 15},
        {"name": "HIIT Training", "description": "High-intensity interval training", "instructor": "Alex Rodriguez", "duration": 45, "capacity": 25},
        {"name": "Strength Training", "description": "Build muscle and increase power", "instructor": "Emma Wilson", "duration": 90, "capacity": 18},
        {"name": "Cardio Blast", "description": "Heart-pumping cardio workout", "instructor": "David Kim", "duration": 50, "capacity": 22},
        {"name": "Pilates Core", "description": "Core strengthening and flexibility", "instructor": "Lisa Martinez", "duration": 60, "capacity": 12},
        {"name": "Boxing Fitness", "description": "Combat-inspired fitness training", "instructor": "Marcus Thompson", "duration": 55, "capacity": 16}
    ]
    
    time_slots = [6, 8, 10, 12, 14, 16, 18, 20]  # Hours of the day
    
    sample_classes = []
    
    for day in range(7):
        classes_per_day = 2 + (day % 3)  # Varies between 2-4 classes
        
        for i in range(classes_per_day):
            class_type = class_types[(day * classes_per_day + i) % len(class_types)]
            time_slot = time_slots[i % len(time_slots)]
            
            class_datetime = datetime.utcnow() + timedelta(days=day, hours=time_slot)
            
            sample_classes.append({
                "id": str(uuid.uuid4()),
                "name": class_type["name"],
                "description": class_type["description"],
                "instructor": class_type["instructor"],
                "datetime": class_datetime,
                "duration_minutes": class_type["duration"],
                "max_capacity": class_type["capacity"],
                "current_bookings": 0
            })
    
    for class_data in sample_classes:
        classes_db[class_data["id"]] = class_data
    
    sample_packages = [
        {
            "id": "pkg-daily",
            "name": "Daily Pass",
            "type": "daily",
            "price": 1500,
            "duration_days": 1,
            "description": "Perfect for trying us out",
            "features": ["Access to all classes for 1 day", "Full gym facilities", "Locker room access", "Basic support"],
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": "pkg-weekly", 
            "name": "Weekly Warrior",
            "type": "weekly",
            "price": 7500,
            "duration_days": 7,
            "description": "Great for short-term goals",
            "features": ["Access to all classes for 1 week", "Full gym facilities", "Locker room access", "Priority booking", "Nutrition consultation"],
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": "pkg-monthly",
            "name": "Monthly Champion", 
            "type": "monthly",
            "price": 19900,
            "duration_days": 30,
            "description": "Best value for serious athletes",
            "features": ["Access to all classes for 1 month", "Full gym facilities", "Locker room access", "Priority booking", "Personal training session", "Nutrition consultation", "Progress tracking", "Premium support"],
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    for package in sample_packages:
        packages_db[package["id"]] = package

init_sample_data()

users_db[admin_user_id]["hashed_password"] = get_password_hash(os.getenv("ADMIN_PASSWORD", "admin123"))

@app.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    try:
        if user_data.email in [u["email"] for u in users_db.values()]:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if not user_data.email or not user_data.password or not user_data.full_name:
            raise HTTPException(status_code=400, detail="All fields are required")
        
        if len(user_data.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user_data.password)
        
        user = {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
            "role": "user"
        }
        
        users_db[user_id] = user
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during registration")

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    try:
        if not user_data.email or not user_data.password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
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
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during login")

@app.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return User(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        created_at=current_user["created_at"],
        role=current_user.get("role", "user")
    )

@app.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(payment_data: PaymentIntentCreate, current_user: dict = Depends(get_current_user)):
    package = None
    for pkg in packages_db.values():
        if pkg["type"] == payment_data.membership_type and pkg["is_active"]:
            package = pkg
            break
    
    if not package:
        raise HTTPException(status_code=400, detail="Package not found or inactive")
    
    amount = package["price"]
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='usd',
            metadata={
                'user_id': current_user["id"],
                'membership_type': payment_data.membership_type,
                'package_id': package["id"]
            }
        )
        
        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            amount=amount,
            currency='usd'
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment intent creation failed: {str(e)}")

@app.post("/memberships", response_model=Membership)
async def create_membership(membership_data: MembershipCreate, current_user: dict = Depends(get_current_user)):
    if membership_data.payment_intent_id:
        try:
            payment_intent = stripe.PaymentIntent.retrieve(membership_data.payment_intent_id)
            if payment_intent.status != 'succeeded':
                raise HTTPException(status_code=400, detail="Payment not completed")
            
            if payment_intent.metadata.get('membership_type') != membership_data.type:
                raise HTTPException(status_code=400, detail="Payment does not match membership type")
                
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")
    
    for membership in memberships_db.values():
        if membership["user_id"] == current_user["id"] and membership["is_active"]:
            membership["is_active"] = False
    
    membership_id = str(uuid.uuid4())
    start_date = datetime.utcnow()
    
    package = None
    for pkg in packages_db.values():
        if pkg["type"] == membership_data.type and pkg["is_active"]:
            package = pkg
            break
    
    if not package:
        raise HTTPException(status_code=400, detail="Package not found")
    
    end_date = start_date + timedelta(days=package["duration_days"])
    
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

@app.get("/admin/users", response_model=List[User])
async def admin_get_users(admin_user: dict = Depends(get_admin_user)):
    return [User(**{k: v for k, v in user.items() if k != "hashed_password"}) 
            for user in users_db.values()]

@app.post("/admin/users", response_model=User)
async def admin_create_user(user_data: UserCreate, admin_user: dict = Depends(get_admin_user)):
    if user_data.email in [u["email"] for u in users_db.values()]:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "role": "user"
    }
    
    users_db[user_id] = user
    return User(**{k: v for k, v in user.items() if k != "hashed_password"})

@app.put("/admin/users/{user_id}", response_model=User)
async def admin_update_user(user_id: str, user_data: UserCreate, admin_user: dict = Depends(get_admin_user)):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_db[user_id]
    user.update({
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": get_password_hash(user_data.password)
    })
    
    return User(**{k: v for k, v in user.items() if k != "hashed_password"})

@app.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin_user: dict = Depends(get_admin_user)):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    if users_db[user_id].get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    del users_db[user_id]
    return {"message": "User deleted successfully"}

@app.get("/admin/classes", response_model=List[Class])
async def admin_get_classes(admin_user: dict = Depends(get_admin_user)):
    return [Class(**class_data) for class_data in classes_db.values()]

@app.post("/admin/classes", response_model=Class)
async def admin_create_class(class_data: ClassCreate, admin_user: dict = Depends(get_admin_user)):
    class_id = str(uuid.uuid4())
    new_class = {
        "id": class_id,
        "name": class_data.name,
        "description": class_data.description,
        "instructor": class_data.instructor,
        "datetime": class_data.datetime,
        "duration_minutes": class_data.duration_minutes,
        "max_capacity": class_data.max_capacity,
        "current_bookings": 0
    }
    
    classes_db[class_id] = new_class
    return Class(**new_class)

@app.put("/admin/classes/{class_id}", response_model=Class)
async def admin_update_class(class_id: str, class_data: ClassCreate, admin_user: dict = Depends(get_admin_user)):
    if class_id not in classes_db:
        raise HTTPException(status_code=404, detail="Class not found")
    
    classes_db[class_id].update({
        "name": class_data.name,
        "description": class_data.description,
        "instructor": class_data.instructor,
        "datetime": class_data.datetime,
        "duration_minutes": class_data.duration_minutes,
        "max_capacity": class_data.max_capacity
    })
    
    return Class(**classes_db[class_id])

@app.delete("/admin/classes/{class_id}")
async def admin_delete_class(class_id: str, admin_user: dict = Depends(get_admin_user)):
    if class_id not in classes_db:
        raise HTTPException(status_code=404, detail="Class not found")
    
    for booking in list(bookings_db.values()):
        if booking["class_id"] == class_id:
            del bookings_db[booking["id"]]
    
    del classes_db[class_id]
    return {"message": "Class deleted successfully"}

@app.get("/admin/memberships", response_model=List[Membership])
async def admin_get_memberships(admin_user: dict = Depends(get_admin_user)):
    return [Membership(**membership) for membership in memberships_db.values()]

@app.get("/admin/bookings", response_model=List[Booking])
async def admin_get_bookings(admin_user: dict = Depends(get_admin_user)):
    return [Booking(**booking) for booking in bookings_db.values()]

@app.delete("/admin/bookings/{booking_id}")
async def admin_cancel_booking(booking_id: str, admin_user: dict = Depends(get_admin_user)):
    if booking_id not in bookings_db:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = bookings_db[booking_id]
    classes_db[booking["class_id"]]["current_bookings"] -= 1
    del bookings_db[booking_id]
    
    return {"message": "Booking cancelled successfully"}

@app.get("/admin/settings", response_model=List[AppSettings])
async def admin_get_settings(admin_user: dict = Depends(get_admin_user)):
    return [AppSettings(**setting) for setting in settings_db.values()]

@app.put("/admin/settings/{setting_id}", response_model=AppSettings)
async def admin_update_setting(setting_id: str, value: str, admin_user: dict = Depends(get_admin_user)):
    if setting_id not in settings_db:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    settings_db[setting_id]["value"] = value
    return AppSettings(**settings_db[setting_id])

@app.get("/packages", response_model=List[Package])
async def get_packages():
    return [Package(**package) for package in packages_db.values() if package["is_active"]]

@app.get("/admin/packages", response_model=List[Package])
async def admin_get_packages(admin_user: dict = Depends(get_admin_user)):
    return [Package(**package) for package in packages_db.values()]

@app.post("/admin/packages", response_model=Package)
async def admin_create_package(package_data: PackageCreate, admin_user: dict = Depends(get_admin_user)):
    package_id = str(uuid.uuid4())
    new_package = {
        "id": package_id,
        "name": package_data.name,
        "type": package_data.type,
        "price": package_data.price,
        "duration_days": package_data.duration_days,
        "description": package_data.description,
        "features": package_data.features,
        "is_active": package_data.is_active,
        "created_at": datetime.utcnow()
    }
    packages_db[package_id] = new_package
    return Package(**new_package)

@app.put("/admin/packages/{package_id}", response_model=Package)
async def admin_update_package(package_id: str, package_data: PackageCreate, admin_user: dict = Depends(get_admin_user)):
    if package_id not in packages_db:
        raise HTTPException(status_code=404, detail="Package not found")
    
    packages_db[package_id].update({
        "name": package_data.name,
        "type": package_data.type,
        "price": package_data.price,
        "duration_days": package_data.duration_days,
        "description": package_data.description,
        "features": package_data.features,
        "is_active": package_data.is_active
    })
    
    return Package(**packages_db[package_id])

@app.delete("/admin/packages/{package_id}")
async def admin_delete_package(package_id: str, admin_user: dict = Depends(get_admin_user)):
    if package_id not in packages_db:
        raise HTTPException(status_code=404, detail="Package not found")
    
    del packages_db[package_id]
    return {"message": "Package deleted successfully"}

@app.get("/admin/dashboard")
async def admin_get_dashboard(admin_user: dict = Depends(get_admin_user)):
    return {
        "total_users": len(users_db),
        "total_classes": len(classes_db),
        "total_memberships": len(memberships_db),
        "total_bookings": len(bookings_db),
        "active_memberships": len([m for m in memberships_db.values() if m["is_active"]]),
        "recent_bookings": sorted(bookings_db.values(), key=lambda x: x["booking_date"], reverse=True)[:5]
    }

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
