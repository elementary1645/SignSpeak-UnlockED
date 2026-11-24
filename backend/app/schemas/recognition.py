from datetime import UTC, datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, TypeAdapter


class Envelope(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    schema_version: Literal[1] = 1
    timestamp: AwareDatetime = Field(default_factory=lambda: datetime.now(UTC))


class ClientEnvelope(Envelope):
    schema_version: Literal[1] = Field(...)
    timestamp: AwareDatetime = Field(...)


class Hello(ClientEnvelope):
    type: Literal["hello"]


class Ping(ClientEnvelope):
    type: Literal["ping"]
    request_id: UUID


class Ready(Envelope):
    type: Literal["ready"] = "ready"
    recognition: Literal["unavailable"] = "unavailable"


class Pong(Envelope):
    type: Literal["pong"] = "pong"
    request_id: UUID


class ProtocolError(Envelope):
    type: Literal["error"] = "error"
    code: Literal["invalid_message", "unexpected_message", "handshake_timeout"]


client_message = TypeAdapter(Annotated[Hello | Ping, Field(discriminator="type")])
