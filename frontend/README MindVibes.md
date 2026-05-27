# MindVibes — Chatbot RAG sobre Bienestar Emocional

**MindVibes** nace de una idea simple pero poderosa: muchas veces sentimos cosas que no sabemos nombrar ni gestionar. La aplicación crea un espacio donde el usuario puede identificar su estado emocional de forma visual e intuitiva y recibir recomendaciones extraídas de documentos propios de bienestar emocional, usando un sistema RAG (Retrieval-Augmented Generation) con ChromaDB y LM Studio.

No pretende sustituir ayuda profesional, sino ofrecer un primer paso de autoconciencia emocional combinando tecnología, diseño y bienestar.

---

## Cómo funciona

1. El usuario accede a la plataforma y visualiza tarjetas con distintos estados emocionales.
2. Selecciona el mood que mejor encaja con cómo se siente.
3. El frontend envía el mood al backend RAG.
4. El backend busca en los documentos de bienestar los fragmentos más relevantes.
5. El LLM genera una respuesta basada únicamente en esos documentos.
6. El usuario recibe recomendaciones prácticas y una frase motivacional.

Además, el usuario puede guardar su historial de estados emocionales, consultar su mood dominante y eliminar su historial cuando lo desee.

---

## Arquitectura

```
React Frontend (MindVibes)
        │
        │  POST /chat
        ▼
    api.py (FastAPI · localhost:8000)
        │
        ├── chatbot.py (RAG)
        │       ├── ChromaDB (fragmentos indexados)
        │       └── LM Studio (LLM local · localhost:1234)
        │
        └── docs/*.txt (documentos de bienestar emocional)
```

---

## Tecnologías

### Frontend
- React + React Router v7
- CSS Modules
- Custom Hooks (`useUserMoods`, `useFetch`)
- LocalStorage
- Vite

### Backend
- Python 3.9+
- FastAPI + Uvicorn
- ChromaDB (base de datos vectorial)
- Sentence Transformers (`all-MiniLM-L6-v2`) para embeddings
- OpenAI SDK (compatible con LM Studio)

### Modelo de lenguaje
- [LM Studio](https://lmstudio.ai/) con **Llama 3.2 3B Instruct Q4_K_M** (2.02 GB)
- Modelo recomendado para Mac con Apple Silicon y 8 GB RAM
- Cualquier modelo compatible con la API de OpenAI puede usarse como alternativa

### Herramientas
- Git + GitHub
- Visual Studio Code
- Despliegue frontend: Vercel / Netlify

---

## Estructura del proyecto

```
lab-web-py-chatbot-rag/
├── backend/
│   ├── docs/
│   │   ├── mindfulness.txt
│   │   ├── ansiedad_y_estres.txt
│   │   ├── gestion_emociones.txt
│   │   ├── habitos_saludables.txt
│   │   ├── motivacion_y_felicidad.txt
│   │   └── autocuidado.txt
│   ├── chroma_db/        ← generado automáticamente (no commitear)
│   ├── indexer.py
│   ├── chatbot.py
│   ├── api.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   │       └── Api.js    ← conecta con el backend RAG
│   └── .env
└── README.md
```

---

## Instalación

### Requisitos previos
- Python 3.9+
- Node.js 18+
- [LM Studio](https://lmstudio.ai/) instalado y con el modelo descargado

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/lab-web-py-chatbot-rag
cd lab-web-py-chatbot-rag
```

### 2. Configura el backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

pip install fastapi uvicorn openai chromadb python-dotenv tiktoken sentence-transformers
pip freeze > requirements.txt

cp .env.example .env
```

Contenido del `backend/.env`:
```
OPENAI_BASE_URL=http://localhost:1234/v1
OPENAI_API_KEY=lm-studio
CHAT_MODEL=llama-3.2-3b-instruct
```

### 3. Configura el frontend

```bash
cd ../frontend
npm install
```

Contenido del `frontend/.env`:
```
VITE_RAG_API_URL=http://localhost:8000
```

---

## Cómo indexar los documentos

Antes de indexar, asegúrate de que LM Studio está abierto con el servidor local activo.

```bash
cd backend
source venv/bin/activate
python indexer.py
```

Verás un resumen como este:

```
──────────────────────────────────────────
  MindVibes RAG — Indexador
──────────────────────────────────────────
  Documentos encontrados: 6
──────────────────────────────────────────
  📄 mindfulness.txt            Chunks: 8   |  Tokens aprox: 1420
  📄 ansiedad_y_estres.txt      Chunks: 9   |  Tokens aprox: 1650
  📄 gestion_emociones.txt      Chunks: 11  |  Tokens aprox: 1980
  📄 habitos_saludables.txt     Chunks: 9   |  Tokens aprox: 1720
  📄 motivacion_y_felicidad.txt Chunks: 8   |  Tokens aprox: 1560
  📄 autocuidado.txt            Chunks: 10  |  Tokens aprox: 1680
──────────────────────────────────────────
  ✅ Indexación completada
  Chunks totales    : 55
  Tokens estimados  : 10010
──────────────────────────────────────────
```

Solo es necesario ejecutar `indexer.py` la primera vez o cuando se modifiquen los documentos.

---

## Arrancar el proyecto

### Orden de arranque (importante)

```
1. Abre LM Studio → activa el servidor local (puerto 1234)
2. cd backend && source venv/bin/activate
3. python indexer.py   ← solo la primera vez
4. uvicorn api:app --reload
5. cd ../frontend && npm run dev
```

### URLs disponibles

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| LM Studio | http://localhost:1234 |

---

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/chat` | Envía una pregunta al chatbot RAG |
| `GET` | `/chat/history/{session_id}` | Historial de una sesión |
| `GET` | `/documentos` | Lista de documentos indexados |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger UI |

### Ejemplo

```json
POST /chat
{
  "pregunta": "Me siento muy triste y sin energía. ¿Qué puedo hacer?"
}
```

```json
{
  "respuesta": "Entiendo que te sientes así...",
  "fuentes": ["gestion_emociones.txt", "habitos_saludables.txt"],
  "session_id": "abc-123",
  "fragmentos_usados": 3,
  "advertencia_privacidad": false
}
```

---

## Medidas de privacidad y seguridad

- **Rate limiting**: máximo 10 peticiones por minuto por IP.
- **Validación de input**: longitud máxima de pregunta 500 caracteres.
- **Detección de PII**: si la pregunta contiene email, teléfono o nombre propio, se activa `advertencia_privacidad: true`.
- **Logging**: se registran IP, session_id y longitud de pregunta, nunca el contenido de los documentos.

---

## Documentos de bienestar (`backend/docs/`)

| Archivo | Contenido |
|---------|-----------|
| `mindfulness.txt` | Técnicas de atención plena y meditación |
| `ansiedad_y_estres.txt` | Gestión de la ansiedad y el estrés |
| `gestion_emociones.txt` | Tristeza, enfado, frustración y apatía |
| `habitos_saludables.txt` | Sueño, ejercicio, alimentación y conexión social |
| `motivacion_y_felicidad.txt` | Motivación, flujo, gratitud y bienestar positivo |
| `autocuidado.txt` | Autocuidado y recuperación emocional |

---

## Uso de IA en el desarrollo

Durante el desarrollo se utilizaron herramientas de inteligencia artificial como soporte:
- Claude (Anthropic) — arquitectura RAG, backend Python, integración frontend
- Gemini (Google) — versión original del frontend (reemplazada por el sistema RAG)

---

## Capturas de prueba

_(Añade aquí tus capturas de Swagger UI tras probar los endpoints)_

---

## Despliegue

- **Frontend (live):** https://mind-vibe-project-react-frontend-kz.vercel.app
- **Autor:** Laura Sang — https://github.com/laurasang13

---

## .gitignore recomendado

```
venv/
.env
chroma_db/
__pycache__/
*.pyc
mindvibes.log
node_modules/
```
