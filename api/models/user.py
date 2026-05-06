from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from api.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    hashed_password = Column(String, nullable=False)

    analyses = relationship("Analysis", back_populates="user")