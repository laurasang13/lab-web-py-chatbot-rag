"""
api.py — MindVibes RAG
FastAPI que expone el chatbot RAG con rate limiting,
validación de input, logging y medidas de privacidad.
"""

import os
import glob
import time
import logging
from collections import defaultdict
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from chatbot import chat, get_history

# ── Logging ────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("mindvibes.log", encoding="utf-8"),
    ]
)
logger = logging.getLogger("mindvibes")

# ── App ────────────────────────────────────────────────────────
app = FastAPI(
    title="MindVibes RAG API",
    description="Chatbot con RAG sobre documentos de bienestar emocional.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # En producción, limitar a tu dominio de React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate limiting (en memoria) ────────────────────────────────
# Estructura: {ip: [timestamp, timestamp, ...]}
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX = 10       # peticiones
RATE_LIMIT_WINDOW = 60    # segundos


def check_rate_limit(ip: str):
    """Lanza 429 si la IP supera RATE_LIMIT_MAX peticiones en RATE_LIMIT_WINDOW segundos."""
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW

    # Limpia timestamps antiguos
    _rate_limit_store[ip] = [
        ts for ts in _rate_limit_store[ip] if ts > window_start
    ]

    if len(_rate_limit_store[ip]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail=f"Límite de {RATE_LIMIT_MAX} peticiones por minuto alcanzado. Espera un momento."
        )

    _rate_limit_store[ip].append(now)


# ── Modelos Pydantic ──────────────────────────────────────────

class ChatRequest(BaseModel):
    pregunta: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Pregunta del usuario (máx. 500 caracteres)"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="ID de sesión para mantener el historial. Se genera automáticamente si no se proporciona."
    )

    @field_validator("pregunta")
    @classmethod
    def pregunta_no_vacia(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("La pregunta no puede estar vacía.")
        return stripped


class ChatResponse(BaseModel):
    respuesta: str
    fuentes: list[str]
    session_id: str
    fragmentos_usados: int
    advertencia_privacidad: bool


class HistoryMessage(BaseModel):
    role: str
    content: str


class DocumentInfo(BaseModel):
    nombre: str
    ruta: str
    tamanyo_kb: float


# ── Endpoints ─────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse, summary="Envía una pregunta al chatbot RAG")
async def post_chat(request: Request, body: ChatRequest):
    """
    Envía una pregunta y recibe una respuesta basada en los documentos indexados.

    - **pregunta**: Tu pregunta sobre bienestar emocional (máx. 500 caracteres).
    - **session_id**: Opcional. Si no se proporciona, se genera uno nuevo.
    """
    ip = request.client.host
    check_rate_limit(ip)

    # Logging sin exponer el contenido completo de documentos
    logger.info(
        "POST /chat | ip=%s | session=%s | pregunta_len=%d | tiene_pii=?",
        ip,
        body.session_id or "nueva",
        len(body.pregunta)
    )

    try:
        result = chat(body.pregunta, body.session_id)
    except RuntimeError as e:
        logger.error("Error en chatbot: %s", str(e))
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Error inesperado: %s", str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor.")

    logger.info(
        "Respuesta | session=%s | fuentes=%s | advertencia_pii=%s",
        result["session_id"],
        result["fuentes"],
        result["advertencia_privacidad"]
    )

    return ChatResponse(**result)


@app.get(
    "/chat/history/{session_id}",
    response_model=list[HistoryMessage],
    summary="Obtiene el historial de una sesión"
)
async def get_chat_history(session_id: str, request: Request):
    """
    Devuelve el historial de mensajes de la sesión indicada.
    """
    ip = request.client.host
    check_rate_limit(ip)
    logger.info("GET /chat/history | ip=%s | session=%s", ip, session_id)

    history = get_history(session_id)
    if not history:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró historial para la sesión '{session_id}'."
        )

    return [HistoryMessage(**msg) for msg in history]


@app.get(
    "/documentos",
    response_model=list[DocumentInfo],
    summary="Lista los documentos indexados"
)
async def list_documents(request: Request):
    """
    Devuelve la lista de documentos .txt disponibles en la carpeta docs/.
    """
    ip = request.client.host
    check_rate_limit(ip)
    logger.info("GET /documentos | ip=%s", ip)

    docs_dir = "docs"
    txt_files = glob.glob(os.path.join(docs_dir, "*.txt"))

    if not txt_files:
        return []

    result = []
    for filepath in sorted(txt_files):
        size_kb = round(os.path.getsize(filepath) / 1024, 2)
        result.append(DocumentInfo(
            nombre=os.path.basename(filepath),
            ruta=filepath,
            tamanyo_kb=size_kb
        ))

    return result


@app.get("/health", summary="Health check")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# ── Manejador global de errores ───────────────────────────────

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


# ── Arranque ──────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
