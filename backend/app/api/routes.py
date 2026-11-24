from importlib.metadata import version

from fastapi import APIRouter, Request

from app.database.session import database_ready
from app.services.capabilities import CAPABILITIES, Capability

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/status")
def status(request: Request):
    ready = database_ready(request.app.state.engine)
    return {
        "status": "ready" if ready else "degraded",
        "database": "ready" if ready else "unavailable",
        "recognition": "unavailable",
    }


@router.get("/capabilities", response_model=list[Capability])
def capabilities():
    return CAPABILITIES


@router.get("/version")
def versions():
    return {"application_version": version("signspeak"), "api_version": "v1"}
