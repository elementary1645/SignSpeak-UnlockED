from typing import Literal

from pydantic import BaseModel

State = Literal["available", "planned", "unavailable", "degraded"]


class Capability(BaseModel):
    id: str
    state: State


CAPABILITIES = (
    Capability(id="service_api", state="available"),
    Capability(id="recognition_transport", state="available"),
    Capability(id="sign_recognition", state="unavailable"),
    Capability(id="browser_gestures", state="available"),
    Capability(id="vocational_learning", state="available"),
    Capability(id="knowledge_check", state="available"),
    Capability(id="competency_assessment", state="planned"),
    Capability(id="credentials", state="planned"),
    Capability(id="employment", state="planned"),
    Capability(id="speech", state="planned"),
    Capability(id="offline_learning", state="planned"),
)
