from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import text
from starlette.websockets import WebSocketDisconnect

from app.core.config import Settings
from app.main import create_app

ORIGIN = "https://example.test"
TIMESTAMP = "2026-01-01T00:00:00Z"
REQUEST_ID = "00000000-0000-4000-8000-000000000001"


def message(kind, **fields):
    return {"type": kind, "schema_version": 1, "timestamp": TIMESTAMP, **fields}


@pytest.fixture
def client(tmp_path):
    path = tmp_path / "phase1.sqlite"
    app = create_app(
        Settings(
            environment="test", database_url=f"sqlite:///{path}", cors_origins=[ORIGIN]
        )
    )
    with TestClient(app) as http:
        assert path.is_file()
        yield http


def test_startup_and_database(client):
    with client.app.state.engine.connect() as connection:
        assert connection.scalar(text("PRAGMA foreign_keys")) == 1
    assert client.get("/api/v1/health").json() == {"status": "ok"}
    assert client.get("/api/v1/status").json() == {
        "status": "ready",
        "database": "ready",
        "recognition": "unavailable",
    }


def test_degraded_status(client, monkeypatch):
    monkeypatch.setattr("app.api.routes.database_ready", lambda _engine: False)
    assert client.get("/api/v1/status").json() == {
        "status": "degraded",
        "database": "unavailable",
        "recognition": "unavailable",
    }


def test_startup_rejects_unreachable_database(tmp_path):
    app = create_app(Settings(database_url=f"sqlite:///{tmp_path / 'missing' / 'db'}"))
    with pytest.raises(RuntimeError, match="initialize SQLite"), TestClient(app):
        pytest.fail("Application should fail to start")


def test_capabilities_and_version(client):
    states = {
        item["id"]: item["state"] for item in client.get("/api/v1/capabilities").json()
    }
    assert states["recognition_transport"] == "available"
    assert states["sign_recognition"] == "unavailable"
    for feature in ("browser_gestures", "vocational_learning", "knowledge_check"):
        assert states[feature] == "available"
    for feature in (
        "credentials",
        "employment",
        "competency_assessment",
    ):
        assert states[feature] == "planned"
    assert client.get("/api/v1/version").json() == {
        "application_version": "0.1.0",
        "api_version": "v1",
    }


def test_environment_configuration(monkeypatch):
    monkeypatch.setenv("SIGNSPEAK_ENVIRONMENT", "production")
    monkeypatch.setenv("SIGNSPEAK_CORS_ORIGINS", '["https://example.test"]')
    settings = Settings(_env_file=None)
    assert settings.cors_origins == [ORIGIN]
    assert create_app(settings).docs_url is None
    with pytest.raises(ValidationError):
        Settings(cors_origins=["*"])
    with pytest.raises(ValidationError):
        Settings(cors_origins=["http://example.test"])


def test_cors_and_safe_errors(client):
    response = client.get("/api/v1/health", headers={"Origin": ORIGIN})
    assert response.headers["access-control-allow-origin"] == ORIGIN
    response = client.get("/api/v1/health", headers={"Origin": "https://other.test"})
    assert "access-control-allow-origin" not in response.headers
    response = client.get("/missing")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "http_404"
    assert client.post("/api/v1/health").headers["allow"] == "GET"


def test_unexpected_error_is_sanitized(monkeypatch, tmp_path):
    def fail(_engine):
        raise RuntimeError("private implementation detail")

    monkeypatch.setattr("app.api.routes.database_ready", fail)
    app = create_app(Settings(database_url=f"sqlite:///{tmp_path / 'test.sqlite'}"))
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/v1/status")
        assert response.status_code == 500
        assert response.json() == {
            "error": {
                "code": "internal_error",
                "message": "An internal error occurred.",
            }
        }


def test_recognition_handshake_and_heartbeat(client):
    with client.websocket_connect(
        "/ws/v1/recognition", headers={"Origin": ORIGIN}
    ) as socket:
        socket.send_json(message("hello"))
        ready = socket.receive_json()
        assert ready["type"] == "ready"
        assert ready["schema_version"] == 1
        assert ready["recognition"] == "unavailable"
        assert datetime.fromisoformat(ready["timestamp"]).tzinfo == UTC
        socket.send_json(message("ping", request_id=REQUEST_ID))
        pong = socket.receive_json()
        assert pong["type"] == "pong"
        assert pong["request_id"] == REQUEST_ID


@pytest.mark.parametrize(
    "payload,code",
    [
        ({"type": "hello"}, "invalid_message"),
        (
            {"type": "hello", "schema_version": 2, "timestamp": TIMESTAMP},
            "invalid_message",
        ),
        (message("ping", request_id=REQUEST_ID), "unexpected_message"),
    ],
)
def test_invalid_handshake(client, payload, code):
    with client.websocket_connect("/ws/v1/recognition") as socket:
        socket.send_json(payload)
        assert socket.receive_json()["code"] == code
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008


def test_recovers_after_invalid_active_message(client):
    with client.websocket_connect("/ws/v1/recognition") as socket:
        socket.send_json(message("hello"))
        socket.receive_json()
        socket.send_bytes(b"frame")
        assert socket.receive_json()["code"] == "invalid_message"
        socket.send_text("not json")
        assert socket.receive_json()["code"] == "invalid_message"
        socket.send_json(message("hello"))
        assert socket.receive_json()["code"] == "unexpected_message"
        socket.send_json(message("ping", request_id=REQUEST_ID))
        assert socket.receive_json()["type"] == "pong"


def test_websocket_origin_and_size(client):
    with (
        pytest.raises(WebSocketDisconnect),
        client.websocket_connect(
            "/ws/v1/recognition", headers={"Origin": "https://other.test"}
        ),
    ):
        pytest.fail("Cross-origin connection should be denied")
    with client.websocket_connect("/ws/v1/recognition") as socket:
        socket.send_text("x" * 4097)
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1009


def test_websocket_handshake_timeout(client, monkeypatch):
    monkeypatch.setattr("app.api.recognition.HANDSHAKE_TIMEOUT", 0)
    with client.websocket_connect("/ws/v1/recognition") as socket:
        assert socket.receive_json()["code"] == "handshake_timeout"
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()
        assert closed.value.code == 1008
