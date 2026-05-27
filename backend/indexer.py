"""
indexer.py — MindVibes RAG
Lee los .txt de docs/, los fragmenta, crea embeddings con OpenAI
y los almacena en ChromaDB.
"""

import os
import glob
import time
import chromadb
from openai import OpenAI
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

# ── Configuración ──────────────────────────────────────────────
DOCS_DIR = "docs"
CHUNK_SIZE = 400       # tokens aproximados por chunk
CHUNK_OVERLAP = 50     # tokens de solapamiento entre chunks
COLLECTION_NAME = "mindvibes_docs"
EMBEDDING_MODEL = "text-embedding-3-small"
COST_PER_1K_TOKENS = 0.00002  # $ por 1K tokens (text-embedding-3-small)

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

chroma_client = chromadb.PersistentClient(path="./chroma_db")


# ── Utilidades ─────────────────────────────────────────────────

def estimate_tokens(text: str) -> int:
    """Estimación rápida: ~4 chars por token (sin tiktoken)."""
    return len(text) // 4


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Divide el texto en chunks por párrafos, respetando el tamaño máximo.
    Añade solapamiento para no perder contexto entre chunks.
    """
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current_chunk = ""
    current_tokens = 0

    for para in paragraphs:
        para_tokens = estimate_tokens(para)

        if current_tokens + para_tokens > chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            # Solapamiento: toma las últimas palabras del chunk anterior
            words = current_chunk.split()
            overlap_words = words[-overlap:] if len(words) > overlap else words
            current_chunk = " ".join(overlap_words) + "\n\n" + para
            current_tokens = estimate_tokens(current_chunk)
        else:
            current_chunk += "\n\n" + para if current_chunk else para
            current_tokens += para_tokens

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks


def get_embedding(text: str) -> list[float]:
    return embedding_model.encode(text).tolist()


# ── Indexación ─────────────────────────────────────────────────

def index_documents():
    # Borra la colección si ya existe para re-indexar limpio
    try:
        chroma_client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = chroma_client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    txt_files = glob.glob(os.path.join(DOCS_DIR, "*.txt"))
    if not txt_files:
        print(f"❌ No se encontraron archivos .txt en '{DOCS_DIR}/'")
        return

    total_docs = len(txt_files)
    total_chunks = 0
    total_tokens = 0
    chunk_id = 0

    print(f"\n{'─'*50}")
    print(f"  MindVibes RAG — Indexador")
    print(f"{'─'*50}")
    print(f"  Documentos encontrados: {total_docs}")
    print(f"{'─'*50}\n")

    for filepath in txt_files:
        filename = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()

        chunks = chunk_text(text)
        file_tokens = estimate_tokens(text)
        total_tokens += file_tokens
        total_chunks += len(chunks)

        print(f"  📄 {filename}")
        print(f"     Chunks: {len(chunks)}  |  Tokens aprox: {file_tokens}")

        # Embeddings e inserción en ChromaDB
        for i, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)

            collection.add(
                ids=[f"chunk_{chunk_id}"],
                embeddings=[embedding],
                documents=[chunk],
                metadatas=[{
                    "source": filename,
                    "chunk_index": i,
                    "chunk_id": chunk_id
                }]
            )
            chunk_id += 1
            time.sleep(0.1)  # evita rate-limit en APIs reales

    coste_estimado = (total_tokens / 1000) * COST_PER_1K_TOKENS

    print(f"\n{'─'*50}")
    print(f"  ✅ Indexación completada")
    print(f"  Documentos procesados : {total_docs}")
    print(f"  Chunks totales        : {total_chunks}")
    print(f"  Tokens estimados      : {total_tokens}")
    print(f"  Coste estimado        : ${coste_estimado:.6f}")
    print(f"{'─'*50}\n")


if __name__ == "__main__":
    index_documents()
