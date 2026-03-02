import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import aesthetics, posts, trends

load_dotenv()

app = FastAPI(
    title="Marketing Dashboard API",
    description="AI-powered marketing analytics and social media post generation.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────
# In production restrict allow_origins to your frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(trends.router, prefix="/trends", tags=["Trends"])
app.include_router(aesthetics.router, prefix="/aesthetics", tags=["Aesthetics"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])


# ── Health checks ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"message": "Marketing Dashboard API", "status": "running"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
