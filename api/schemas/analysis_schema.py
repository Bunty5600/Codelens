from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    code: str
    filename:  Optional[str] = None
class SignupRequest(BaseModel):
    name :str
    email:str
    password:str=Field(max_length=72)
class LoginRequest(BaseModel):
    email:str
    password:str=Field(max_length=72)
class AuthResponse(BaseModel):
    token:str
    name:str
    email:str
