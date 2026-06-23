from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base
from sqlalchemy import Float

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    language = Column(String)
    project_name = Column(String,nullable=True)
    risk_level = Column(String, nullable=True)
    repo_url = Column(String, nullable=True)
    source = Column(String, nullable=True, default='upload')
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="analyses")
    metrics = relationship("Metrics", back_populates="analysis", uselist=False)
    project_files = relationship("ProjectFile",back_populates="analysis")