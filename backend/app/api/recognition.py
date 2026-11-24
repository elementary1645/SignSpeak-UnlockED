import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.core.logging import log_event
from app.schemas.recognition import (
    Hello,
    Ping,
    Pong,
    ProtocolError,
    Ready,
    client_message,
)

router = APIRouter()
MAX_MESSAGE_BYTES = 4096
HANDSHAKE_TIMEOUT = 5
IDLE_TIMEOUT = 45


def allowed_origin(socket: WebSocket) -> bool:
    origin = socket.headers.get("origin")
    if origin is None or origin in socket.app.state.settings.cors_origins:
        return True
    scheme = "https" if socket.url.scheme == "wss" else "http"
    host = socket.headers.get("host")
    return host is not None and origin == f"{scheme}://{host}"


@router.websocket("/ws/v1/recognition")
async def recognition(socket: WebSocket):
    if not allowed_origin(socket):
        await socket.close(code=1008)
        return
    await socket.accept()
    log_event("recognition_connected")
    handshaken = False
    try:
        while True:
            try:
                event = await asyncio.wait_for(
                    socket.receive(),
                    timeout=IDLE_TIMEOUT if handshaken else HANDSHAKE_TIMEOUT,
                )
            except TimeoutError:
                if not handshaken:
                    await socket.send_json(
                        ProtocolError(code="handshake_timeout").model_dump(mode="json")
                    )
                await socket.close(code=1008)
                return
            if event["type"] == "websocket.disconnect":
                return
            payload = event.get("text")
            size = (
                len(payload.encode())
                if payload is not None
                else len(event.get("bytes") or b"")
            )
            if size > MAX_MESSAGE_BYTES:
                await socket.close(code=1009)
                return
            try:
                message = (
                    client_message.validate_json(payload)
                    if payload is not None
                    else None
                )
            except ValidationError:
                message = None
            if message is None:
                response = ProtocolError(code="invalid_message")
            elif isinstance(message, Hello) and not handshaken:
                handshaken = True
                response = Ready()
            elif isinstance(message, Ping) and handshaken:
                response = Pong(request_id=message.request_id)
            else:
                response = ProtocolError(code="unexpected_message")
            await socket.send_json(response.model_dump(mode="json"))
            if not handshaken:
                await socket.close(code=1008)
                return
    except WebSocketDisconnect:
        pass
    finally:
        log_event("recognition_disconnected")
