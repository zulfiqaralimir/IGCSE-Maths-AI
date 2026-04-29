from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import admin, chat

app = FastAPI(
    title="IGCSE Math Tutor API",
    description="RAG-powered IGCSE Math tutoring backend — Sets module",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
