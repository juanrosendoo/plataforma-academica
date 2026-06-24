import logging
import os
import time

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest


logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("gateway-service")

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://127.0.0.1:8001")
ACADEMIC_SERVICE_URL = os.getenv("ACADEMIC_SERVICE_URL", "http://127.0.0.1:8002")
HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}

app = FastAPI(
    title="API Gateway",
    description=(
        "Single entry point for the academic platform. Routing rules are intentionally "
        "defined here and business rules remain inside downstream services."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPSTREAM_REQUEST_COUNT = Counter(
    "upstream_http_requests_total",
    "Total requests forwarded by the gateway to downstream services",
    ("service", "method", "path", "status_code"),
)
UPSTREAM_REQUEST_LATENCY = Histogram(
    "upstream_http_request_duration_seconds",
    "Gateway downstream request duration in seconds",
    ("service", "method", "path"),
)


@app.middleware("http")
async def request_logging(request: Request, call_next):
    started_at = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started_at) * 1000
    logger.info(
        "%s %s -> %s %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "gateway-service",
        "message": "API Gateway running. Use /auth/* and /academic/* for API requests.",
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "gateway-service"}


@app.get("/metrics", include_in_schema=False)
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/responsibilities")
def responsibilities():
    return {
        "service": "gateway-service",
        "responsibilities": [
            "Expose a single API entry point for the frontend",
            "Apply CORS policy for browser clients",
            "Forward authorization headers to downstream services",
            "Keep business rules inside domain services",
            "Emit basic request logs",
            "Expose gateway health checks",
        ],
        "downstream_services": {
            "auth": AUTH_SERVICE_URL,
            "academic": ACADEMIC_SERVICE_URL,
        },
        "routing_status": "active",
        "routes": {
            "/auth/*": "auth-service /auth/*",
            "/academic/*": "academic-service /*",
        },
    }


def forwarded_headers(request: Request) -> dict[str, str]:
    return {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in HOP_BY_HOP_HEADERS
    }


def response_headers(response: httpx.Response) -> dict[str, str]:
    return {
        key: value
        for key, value in response.headers.items()
        if key.lower() not in HOP_BY_HOP_HEADERS
    }


async def proxy_request(
    request: Request,
    target_base_url: str,
    target_path: str,
    downstream_service: str,
) -> Response:
    target_url = httpx.URL(target_base_url.rstrip("/") + target_path)
    if request.url.query:
        target_url = target_url.copy_with(query=request.url.query.encode("utf-8"))

    body = await request.body()
    started_at = time.perf_counter()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            downstream = await client.request(
                request.method,
                target_url,
                content=body,
                headers=forwarded_headers(request),
            )
    except httpx.RequestError as exc:
        elapsed_seconds = time.perf_counter() - started_at
        UPSTREAM_REQUEST_COUNT.labels(
            service=downstream_service,
            method=request.method,
            path=request.url.path,
            status_code="503",
        ).inc()
        UPSTREAM_REQUEST_LATENCY.labels(
            service=downstream_service,
            method=request.method,
            path=request.url.path,
        ).observe(elapsed_seconds)
        logger.warning(
            "%s %s -> unavailable target=%s error=%s",
            request.method,
            request.url.path,
            target_url,
            exc,
        )
        raise HTTPException(status_code=503, detail="Downstream service unavailable") from exc

    elapsed_seconds = time.perf_counter() - started_at
    elapsed_ms = elapsed_seconds * 1000
    UPSTREAM_REQUEST_COUNT.labels(
        service=downstream_service,
        method=request.method,
        path=request.url.path,
        status_code=str(downstream.status_code),
    ).inc()
    UPSTREAM_REQUEST_LATENCY.labels(
        service=downstream_service,
        method=request.method,
        path=request.url.path,
    ).observe(elapsed_seconds)
    logger.info(
        "%s %s -> %s %s %.2fms",
        request.method,
        request.url.path,
        target_url,
        downstream.status_code,
        elapsed_ms,
    )

    return Response(
        content=downstream.content,
        status_code=downstream.status_code,
        headers=response_headers(downstream),
        media_type=downstream.headers.get("content-type"),
    )


@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_auth(path: str, request: Request):
    return await proxy_request(request, AUTH_SERVICE_URL, f"/auth/{path}", "auth-service")


@app.api_route("/academic/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_academic(path: str, request: Request):
    return await proxy_request(request, ACADEMIC_SERVICE_URL, f"/{path}", "academic-service")
