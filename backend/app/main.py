import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routes import auth, dashboard, records, documents, ocr, validation, admin, health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend-main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database schema and checking seed data...")
    try:
        init_db()
    except Exception as e:
        logger.error(f"Error initializing DB during startup: {e}")
    yield
    logger.info("Shutting down backend services...")

app = FastAPI(
    title="Intelligent Land Record Digitization and Validation API",
    description=(
        "Production-grade RESTful API for Land Records Digitization, OCR Processing, "
        "Intelligent Cadastral Validation, and Administrative Auditing. "
        "Supports Docker, Kubernetes, Jenkins CI/CD, and AWS deployment."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration allowing local dev and container networks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for static document viewing
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(records.router)
app.include_router(documents.router)
app.include_router(ocr.router)
app.include_router(validation.router)
app.include_router(admin.router)
app.include_router(health.router)

@app.get("/")
def root():
    return {
        "system": "Intelligent Land Record Digitization and Validation System",
        "role": "Backend Core API",
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
