from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Read secret key from .env
SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"
EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    password=password[:72]
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    plain=plain[:72]
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    payload = data.copy()

    payload["exp"] = datetime.utcnow() + timedelta(
        minutes=EXPIRE_MINUTES
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )