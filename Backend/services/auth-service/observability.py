import json
import logging
import sys
import time
from collections.abc import Callable

from fastapi import FastAPI, Request, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest


REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ("service", "method", "path", "status_code"),
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ("service", "method", "path"),
)
IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "HTTP requests currently being processed",
    ("service",),
)


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for key, value in record.__dict__.items():
            if key.startswith("_") or key in {
                "args",
                "asctime",
                "created",
                "exc_info",
                "exc_text",
                "filename",
                "funcName",
                "levelname",
                "levelno",
                "lineno",
                "module",
                "msecs",
                "message",
                "msg",
                "name",
                "pathname",
                "process",
                "processName",
                "relativeCreated",
                "stack_info",
                "thread",
                "threadName",
            }:
                continue
            payload[key] = value

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, ensure_ascii=False, default=str)


def configure_logging(service_name: str) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.INFO)

    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        logger = logging.getLogger(logger_name)
        logger.handlers = [handler]
        logger.propagate = False
        logger.setLevel(logging.INFO)

    logging.getLogger(__name__).info(
        "logging_configured",
        extra={"service": service_name, "event": "logging_configured"},
    )


def setup_observability(app: FastAPI, service_name: str) -> None:
    configure_logging(service_name)
    logger = logging.getLogger("app.requests")

    @app.middleware("http")
    async def observability_middleware(
        request: Request,
        call_next: Callable[[Request], Response],
    ) -> Response:
        path = request.scope.get("route").path if request.scope.get("route") else request.url.path
        start = time.perf_counter()
        status_code = 500
        IN_PROGRESS.labels(service=service_name).inc()

        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration = time.perf_counter() - start
            IN_PROGRESS.labels(service=service_name).dec()
            REQUEST_COUNT.labels(
                service=service_name,
                method=request.method,
                path=path,
                status_code=str(status_code),
            ).inc()
            REQUEST_LATENCY.labels(
                service=service_name,
                method=request.method,
                path=path,
            ).observe(duration)
            logger.info(
                "request_completed",
                extra={
                    "service": service_name,
                    "event": "request_completed",
                    "method": request.method,
                    "path": path,
                    "status_code": status_code,
                    "duration_ms": round(duration * 1000, 2),
                    "client_ip": request.client.host if request.client else None,
                },
            )

    @app.get("/metrics", include_in_schema=False)
    def metrics() -> Response:
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
