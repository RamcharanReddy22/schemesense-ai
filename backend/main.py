import os
from pathlib import Path

# Auto-load backend/.env so GROQ_API_KEY is available before anything else
from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from rag_engine import RAGEngine, ingest_file, uploaded_docs

app = FastAPI(title="SchemeSense AI RAG Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_engine = RAGEngine()


# ─── Models ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str
    lang: Optional[str] = "en"
    use_uploaded_docs: Optional[bool] = False

class ChatResponse(BaseModel):
    response: str
    matches: List[str]
    source: Optional[str] = "schemes_db"

class GroqKeyRequest(BaseModel):
    api_key: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {
        "status": "online",
        "schemes_loaded": len(rag_engine.schemes),
        "uploaded_docs": len(uploaded_docs),
        "groq_enabled": bool(rag_engine.groq_api_key),
        "message": "SchemeSense AI RAG Backend v2.0"
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        result = rag_engine.generate_response(
            request.query,
            request.lang,
            use_uploaded_docs=request.use_uploaded_docs
        )
        return ChatResponse(
            response=result["response"],
            matches=result.get("matches", []),
            source=result.get("source", "schemes_db")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a PDF, DOCX, or TXT file to add to the RAG knowledge base.
    The file is parsed, chunked, and indexed for semantic search.
    """
    MAX_SIZE_MB = 10
    allowed_types = {"pdf", "docx", "doc", "txt", "text"}

    filename = file.filename or "unknown"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Allowed: PDF, DOCX, TXT"
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {MAX_SIZE_MB}MB"
        )

    result = ingest_file(filename, file_bytes)

    if not result["ok"]:
        raise HTTPException(status_code=422, detail=result["error"])

    return {
        "ok": True,
        "filename": filename,
        "chunks_created": result["chunks"],
        "characters_extracted": result["chars"],
        "total_docs_in_store": len(uploaded_docs),
        "message": f"✅ '{filename}' ingested successfully. {result['chunks']} chunks indexed."
    }


@app.get("/api/documents")
def list_documents():
    """List all uploaded documents currently in the RAG store."""
    return {
        "documents": [
            {
                "filename": d["filename"],
                "chunks": len(d["chunks"]),
                "preview": d["full_text"][:200] + "..." if len(d["full_text"]) > 200 else d["full_text"]
            }
            for d in uploaded_docs
        ],
        "total": len(uploaded_docs)
    }


@app.delete("/api/documents")
def clear_documents():
    """Clear all uploaded documents from the RAG store."""
    uploaded_docs.clear()
    from rag_engine import doc_chunk_map
    doc_chunk_map.clear()
    return {"ok": True, "message": "All uploaded documents cleared."}


@app.post("/api/set-groq-key")
def set_groq_key(request: GroqKeyRequest):
    """Set the Groq API key at runtime (stored in memory, not on disk)."""
    if not request.api_key.strip():
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    rag_engine.groq_api_key = request.api_key.strip()
    return {"ok": True, "message": "Groq API key set successfully. LLM generation enabled."}


@app.get("/api/schemes")
def get_schemes():
    return rag_engine.schemes


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        reload_dirs=["backend"]   # Only watch backend/ — not src/ or node_modules/
    )
