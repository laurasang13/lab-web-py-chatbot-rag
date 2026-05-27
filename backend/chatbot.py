"""
chatbot.py — MindVibes RAG
Implementa el flujo RAG: recupera fragmentos relevantes de ChromaDB,
construye el prompt con contexto y genera respuesta vía LLM.
Mantiene historial de conversación por session_id.
"""

import os
import re
import uuid
import chromadb
from openai import OpenAI
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

load_dotenv()

# ── Configuración ──────────────────────────────────────────────
COLLECTION_NAME = "mindvibes_docs"
CHAT_MODEL = os.getenv("CHAT_MODEL", "local-model")   # nombre del modelo en LM Studio
TOP_K_FRAGMENTS = 3
MAX_HISTORY_TURNS = 6   # pares usuario/asistente a conservar

OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "http://localhost:1234/v1")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "lm-studio")


client = OpenAI(base_url=OPENAI_BASE_URL, api_key=OPENAI_API_KEY)
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Historial en memoria: {session_id: [{"role": ..., "content": ...}]}
_sessions: dict[str, list[dict]] = {}

SYSTEM_PROMPT = """Eres MindVibes Assistant, un asistente especializado en bienestar emocional y salud mental.

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con la información del CONTEXTO proporcionado.
2. Si el contexto no contiene información relevante para la pregunta, responde exactamente: "No tengo información suficiente sobre eso en mis documentos."
3. NO inventes datos, técnicas, cifras ni estudios que no estén en el contexto.
4. NO des consejos médicos ni diagnósticos. Si la situación parece grave, sugiere buscar ayuda profesional.
5. Sé empático, cálido y directo. El usuario está compartiendo su estado emocional.
6. Basa tus recomendaciones exclusivamente en el contexto. Cita de forma natural de dónde viene la información.
7. Responde siempre en el mismo idioma que el usuario.
8. Si el contexto contiene recomendaciones para el estado emocional mencionado, inclúyelas de forma estructurada y práctica.

Formato de respuesta ideal:
- Una frase empática corta que reconozca el estado emocional del usuario.
- 2-3 recomendaciones concretas basadas en el contexto.
- Una frase positiva y alentadora al final.
"""


# ── Privacidad ────────────────────────────────────────────────

PII_PATTERNS = [
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # email
    r'\b\d{8,9}[A-Za-z]?\b',   # DNI/NIE español
    r'\b\d{9}\b',               # teléfono 9 dígitos
    r'\bmi nombre es\s+\w+\b',  # "mi nombre es X"
    r'\bme llamo\s+\w+\b',      # "me llamo X"
    r'\bsoy\s+[A-Z][a-z]+\b',   # "soy Nombre"
]

def contains_pii(text: str) -> bool:
    """Detecta si el texto contiene información personal identificable."""
    for pattern in PII_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


# ── Embeddings y recuperación ─────────────────────────────────

def get_embedding(text: str) -> list[float]:
    return embedding_model.encode(text).tolist()


def retrieve_fragments(query: str, top_k: int = TOP_K_FRAGMENTS) -> list[dict]:
    """Recupera los top_k fragmentos más relevantes de ChromaDB."""
    try:
        collection = chroma_client.get_collection(COLLECTION_NAME)
    except Exception:
        raise RuntimeError(
            "La colección no existe. Ejecuta primero: python indexer.py"
        )

    query_embedding = get_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    fragments = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        fragments.append({
            "content": doc,
            "source": meta["source"],
            "chunk_index": meta["chunk_index"],
            "relevance_score": round(1 - dist, 4)   # cosine similarity
        })

    return fragments


# ── Construcción del prompt ───────────────────────────────────

def build_context_prompt(pregunta: str, fragments: list[dict]) -> str:
    context_parts = []
    for i, frag in enumerate(fragments, 1):
        context_parts.append(
            f"[Fragmento {i} — Fuente: {frag['source']}]\n{frag['content']}"
        )

    context = "\n\n---\n\n".join(context_parts)

    return (
        f"CONTEXTO (usa SOLO esta información para responder):\n\n"
        f"{context}\n\n"
        f"---\n\n"
        f"PREGUNTA DEL USUARIO: {pregunta}"
    )


# ── Historial de sesión ───────────────────────────────────────

def get_session(session_id: str) -> list[dict]:
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]


def add_to_history(session_id: str, role: str, content: str):
    history = get_session(session_id)
    history.append({"role": role, "content": content})
    # Limita el historial para no exceder el contexto del LLM
    if len(history) > MAX_HISTORY_TURNS * 2:
        _sessions[session_id] = history[-(MAX_HISTORY_TURNS * 2):]


# ── Función principal ─────────────────────────────────────────

def chat(pregunta: str, session_id: str = None) -> dict:
    if not session_id:
        session_id = str(uuid.uuid4())

    advertencia_privacidad = contains_pii(pregunta)
    fragments = retrieve_fragments(pregunta, top_k=TOP_K_FRAGMENTS)
    fuentes = list({f["source"] for f in fragments})
    user_message_with_context = build_context_prompt(pregunta, fragments)
    history = get_session(session_id)
    messages = (
        [{"role": "system", "content": SYSTEM_PROMPT}]
        + history
        + [{"role": "user", "content": user_message_with_context}]
    )

    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=0.5,
        max_tokens=600,
    )

    respuesta = response.choices[0].message.content.strip()
    add_to_history(session_id, "user", pregunta)
    add_to_history(session_id, "assistant", respuesta)

    return {
        "respuesta": respuesta,
        "fuentes": fuentes,
        "session_id": session_id,
        "fragmentos_usados": len(fragments),
        "advertencia_privacidad": advertencia_privacidad,
    }


def get_history(session_id: str) -> list[dict]:
    """Devuelve el historial completo de una sesión."""
    return get_session(session_id)


# ── CLI de prueba ─────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🧠 MindVibes Chatbot RAG — modo consola")
    print("Escribe 'salir' para terminar.\n")
    session = str(uuid.uuid4())

    while True:
        pregunta = input("Tú: ").strip()
        if pregunta.lower() in ("salir", "exit", "quit"):
            break
        if not pregunta:
            continue

        resultado = chat(pregunta, session)

        if resultado["advertencia_privacidad"]:
            print("\n⚠️  Tu mensaje parece contener información personal.")
            print("   Recuerda que no es necesario compartir datos privados.\n")

        print(f"\nMindVibes: {resultado['respuesta']}")
        print(f"\n📚 Fuentes: {', '.join(resultado['fuentes'])}")
        print(f"🔍 Fragmentos usados: {resultado['fragmentos_usados']}\n")
