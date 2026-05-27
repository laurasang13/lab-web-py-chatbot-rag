# Lab — Chatbot RAG sobre documentos propios
## MindVibes RAG Backend

Chatbot con RAG (Retrieval-Augmented Generation) construido sobre el proyecto MindVibes. El usuario selecciona un estado emocional y el sistema responde con recomendaciones extraídas de documentos propios de bienestar emocional.

---

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn openai chromadb python-dotenv tiktoken sentence-transformers
pip freeze > requirements.txt
```

Variables de entorno en `backend/.env`:
```
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_API_KEY=lm-studio
CHAT_MODEL=llama-3.2-3b-instruct
```

---

## Modelo LLM

Se usa [LM Studio](https://lmstudio.ai/) con el modelo **Llama 3.2 3B Instruct Q4_K_M** (2.02 GB), recomendado para Apple Silicon con 8 GB RAM. Cualquier modelo compatible con la API de OpenAI puede usarse como alternativa — basta con cambiar `CHAT_MODEL` en el `.env`.

Los embeddings se generan con `sentence-transformers` (`all-MiniLM-L6-v2`) de forma local, sin depender de LM Studio.

---

## Cómo indexar los documentos

Con LM Studio corriendo y el servidor local activo:

```bash
python indexer.py
```

```
──────────────────────────────────────────
  MindVibes RAG — Indexador
──────────────────────────────────────────
  Documentos encontrados: 6
──────────────────────────────────────────
  📄 mindfulness.txt            Chunks: 8
  📄 ansiedad_y_estres.txt      Chunks: 9
  📄 gestion_emociones.txt      Chunks: 11
  📄 habitos_saludables.txt     Chunks: 9
  📄 motivacion_y_felicidad.txt Chunks: 8
  📄 autocuidado.txt            Chunks: 10
──────────────────────────────────────────
  ✅ Indexación completada
  Chunks totales   : 55
  Tokens estimados : 10010
──────────────────────────────────────────
```

Solo es necesario ejecutarlo la primera vez o al modificar los documentos.

---

## Arrancar el servidor

```bash
uvicorn api:app --reload
```

API disponible en `http://localhost:8000/docs` (Swagger UI).

---

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/chat` | Pregunta al chatbot RAG |
| `GET` | `/chat/history/{session_id}` | Historial de sesión |
| `GET` | `/documentos` | Documentos indexados |

---

## Medidas de privacidad y seguridad

- Rate limiting: máximo 10 peticiones por minuto por IP.
- Validación de input: longitud máxima de pregunta 500 caracteres.
- Detección de PII: si la pregunta contiene email, teléfono o nombre, se activa `advertencia_privacidad: true`.
- Logging: se registran IP, session_id y longitud de pregunta, nunca el contenido de los documentos.

---

## Dataset — `backend/docs/`

| Archivo | Contenido |
|---------|-----------|
| `mindfulness.txt` | Técnicas de atención plena y meditación |
| `ansiedad_y_estres.txt` | Gestión de la ansiedad y el estrés |
| `gestion_emociones.txt` | Tristeza, enfado, frustración y apatía |
| `habitos_saludables.txt` | Sueño, ejercicio, alimentación y conexión social |
| `motivacion_y_felicidad.txt` | Motivación, flujo, gratitud y bienestar positivo |
| `autocuidado.txt` | Autocuidado y recuperación emocional |

---

## Capturas de prueba

_(Añade aquí tus capturas de Swagger UI)_
