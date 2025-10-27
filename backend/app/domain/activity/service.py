from sqlalchemy.orm import Session
from sqlalchemy import case, func, or_
from passlib.context import CryptContext
from collections import Counter
from typing import Literal, Optional, List, Tuple
from . import models, schemas

def get_activities_db(db: Session):
    return db.query(models.Activity).all()

def get_activity(db: Session, act: schemas.Activity):
    return db.query(models.Activity).filter(models.Activity.id == act.id).first()

def create_activity_db(db: Session, act: schemas.Activity):
    db_activity = models.Activity(
        **act.model_dump()
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def delete_activity_db(db: Session, act: schemas.Activity):
    try:
        db.delete(get_activity(db, act))
        db.commit()
        return True
    except Exception as e:
        print(e)
        return False