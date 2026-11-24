import json
import logging

logger = logging.getLogger("uvicorn.error")


def log_event(event: str, **fields: str) -> None:
    logger.info(json.dumps({"event": event, **fields}))
