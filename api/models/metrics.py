from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from api.database import Base


class Metrics(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)

    loc = Column(Integer)
    cyclomatic_complexity = Column(Integer)

    halstead_volume = Column(Float)
    halstead_effort = Column(Float)

    maintainability_index = Column(Float)

    analysis_id = Column(Integer, ForeignKey("analyses.id"))

    analysis = relationship("Analysis", back_populates="metrics")