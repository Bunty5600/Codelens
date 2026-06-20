from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from api.database import Base

class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    file_name = Column(String)
    cc = Column(Float, default=0)
    mi = Column(Float, default=0)
    loc = Column(Integer, default=0)
    functions = Column(Integer, default=0)
    risk = Column(String, default="Low")

    analysis = relationship("Analysis", back_populates="project_files")