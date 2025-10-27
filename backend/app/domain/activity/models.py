from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, event, Text, DateTime
from sqlalchemy.orm import relationship, Session
from sqlalchemy.sql import func
from app.config import IP_ADDRESS
from ..model_base import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, unique=True)
    title = Column(String)
    notes = Column(String)
    date = Column(DateTime, nullable=True)
    done = Column(Boolean)


# [
#   {
#     "id": "579bd916-80ba-4744-aa60-44fe23356f40",
#     "title": "Test",
#     "notes": "111",
#     "date": "2025-10-23",
#     "done": false
#   },
#   {
#     "id": "fe58584a-5782-4fc8-9f8e-61133e42b0ab",
#     "title": "Test 3",
#     "notes": "",
#     "done": true
#   },
#   {
#     "id": "cbeefd4d-7ed9-4333-8433-10b2b99d4b6f",
#     "title": "Test 6",
#     "notes": "testowanie monograficzne",
#     "date": "2025-10-23",
#     "done": false
#   }
# ]