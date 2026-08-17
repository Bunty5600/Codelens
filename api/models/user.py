from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from api.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, nullable=True)
    name = Column(String)
    hashed_password = Column(String, nullable=True)

    analyses = relationship("Analysis", back_populates="user")