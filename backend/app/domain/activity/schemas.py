from pydantic import BaseModel
from datetime import datetime

class ActivityBase(BaseModel):
    title: str
    notes: str
    date: datetime | None = None
    done: bool

class Activity(ActivityBase):
    id: str
    