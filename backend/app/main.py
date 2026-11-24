from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from app.api import recognition, routes
from app.core.config import Settings
from app.core.logging import log_event
from app.database.session import create_database, database_ready


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        engine = create_database(settings.database_url)
        try:
            if not database_ready(engine):
                raise RuntimeError("Unable to initialize SQLite")
            app.state.engine = engine
            log_event("startup", environment=settings.environment)
            yield
        finally:
            engine.dispose()
            log_event("shutdown")

    development = settings.environment != "production"
    app = FastAPI(
        title="SignSpeak",
        lifespan=lifespan,
        docs_url="/docs" if development else None,
        redoc_url=None,
        openapi_url="/openapi.json" if development else None,
    )
    app.state.settings = settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET"],
        allow_headers=["Accept"],
    )
    app.include_router(routes.router)
    app.include_router(recognition.router)

    @app.exception_handler(HTTPException)
    async def http_error(_request: Request, exc: HTTPException):
        messages = {404: "Resource not found.", 405: "Method not allowed."}
        return JSONResponse(
            {
                "error": {
                    "code": f"http_{exc.status_code}",
                    "message": messages.get(exc.status_code, "Request failed."),
                }
            },
            status_code=exc.status_code,
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(_request: Request, _exc: RequestValidationError):
        return JSONResponse(
            {
                "error": {
                    "code": "invalid_request",
                    "message": "Request validation failed.",
                }
            },
            status_code=422,
        )

    @app.exception_handler(Exception)
    async def unexpected_error(_request: Request, exc: Exception):
        log_event("unhandled_error", exception=type(exc).__name__)
        return JSONResponse(
            {
                "error": {
                    "code": "internal_error",
                    "message": "An internal error occurred.",
                }
            },
            status_code=500,
        )

    return app
