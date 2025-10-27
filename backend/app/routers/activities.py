from typing import Annotated, List
from fastapi import APIRouter, Depends, Request, Response, status, Body, Path, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import CreateExampleResponse, CreateRefreshResponses, DBSessionProvider, Example, ValidateCredentials, Tokens, EncodedTokens, retrieve_refresh_token, create_token, RefreshToken, DefaultResponseModel, Responses, CreateInternalErrorResponse, CreateAuthResponses
from app.config import ACCESS_TOKEN_EXPIRE_TIME, ENCRYPTION_ALGORITHM, REFRESH_TOKEN_EXPIRE_TIME, SECRET_KEY
from app.domain.activity.service import get_activities_db, delete_activity_db, create_activity_db, get_activity
from app.domain.activity.schemas import Activity, ActivityBase
import datetime
from pydantic import BaseModel
from uuid import uuid4

router = APIRouter(
    prefix="/v1",
    tags=["Activities"],
    responses=Responses(
        CreateInternalErrorResponse()
    ),
)

@router.get("/activities")
async def get_activities(
    db: Annotated[Session, Depends(DBSessionProvider)]
) -> List[Activity]:
    return get_activities_db(db)

@router.post("/activity")
async def create_activity(
    body: Annotated[ActivityBase, Body()],
    db: Annotated[Session, Depends(DBSessionProvider)]
) -> DefaultResponseModel:

    create_activity_db(db, Activity(
        id=str(uuid4()),
        title=body.title,
        date=body.date,
        done=body.done if body.done else False,
        notes=body.notes if body.notes else ""
    ))

    return DefaultResponseModel(message="Created")

class PatchBody(BaseModel):
    done: bool

@router.patch("/activity/{id}")
async def patch_activity(
    id: Annotated[str, Path()],
    body: Annotated[PatchBody, Body()],
    db: Annotated[Session, Depends(DBSessionProvider)]
) -> DefaultResponseModel:
    
    activity = get_activity(db, Activity(
        id=id,
        notes="",
        done=False,
        title=""
    ))

    if activity is None:
        raise HTTPException(status_code=404)
    
    activity.done = body.done
    db.commit()

    return DefaultResponseModel(message="Patched")

@router.delete("/activity/{id}")
async def delete_activity(
    id: Annotated[str, Path()],
    db: Annotated[Session, Depends(DBSessionProvider)]
) -> DefaultResponseModel:
    
    delete_activity_db(db, Activity(
        id=id,
        notes="",
        done=False,
        title=""
    ))

    return DefaultResponseModel(message="Patched")