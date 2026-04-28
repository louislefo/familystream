import os
import time
import httpx
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE = "https://api.themoviedb.org/3"

app = FastAPI(title="FamilyStream API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Simple in-memory cache ─────────────────────────────────────────────────────
_cache: dict[str, tuple[float, any]] = {}
CACHE_TTL = 300  # 5 minutes

def cache_get(key: str):
    if key in _cache:
        ts, val = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return val
    return None

def cache_set(key: str, val):
    _cache[key] = (time.time(), val)

# ── In-memory storage (pas de DB pour l'instant) ─────────────────────────────
favorites: dict[str, dict] = {}
history: list[dict] = []

# ── TMDB helper ───────────────────────────────────────────────────────────────
async def tmdb(path: str, params: dict = None):
    cached = cache_get(path)
    if cached:
        return cached
    p = {"api_key": TMDB_API_KEY, "language": "en-US", **(params or {})}
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{TMDB_BASE}{path}", params=p)
        r.raise_for_status()
        data = r.json()
        cache_set(path, data)
        return data

# ═══════════════════════════════════════════════════════════════════════════════
# MOVIES
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/movies/trending")
async def movies_trending():
    return await tmdb("/trending/movie/week")

@app.get("/api/movies/popular")
async def movies_popular(page: int = 1):
    return await tmdb("/movie/popular", {"page": page})

@app.get("/api/movies/top-rated")
async def movies_top_rated(page: int = 1):
    return await tmdb("/movie/top_rated", {"page": page})

@app.get("/api/movies/now-playing")
async def movies_now_playing(page: int = 1):
    return await tmdb("/movie/now_playing", {"page": page})

@app.get("/api/movies/search")
async def movies_search(q: str = Query(...), page: int = 1):
    return await tmdb("/search/movie", {"query": q, "page": page})

@app.get("/api/movies/{movie_id}")
async def movie_detail(movie_id: int):
    return await tmdb(f"/movie/{movie_id}", {
        "append_to_response": "external_ids,credits,videos,similar"
    })

# ═══════════════════════════════════════════════════════════════════════════════
# SERIES
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/series/trending")
async def series_trending():
    return await tmdb("/trending/tv/week")

@app.get("/api/series/popular")
async def series_popular(page: int = 1):
    return await tmdb("/tv/popular", {"page": page})

@app.get("/api/series/top-rated")
async def series_top_rated(page: int = 1):
    return await tmdb("/tv/top_rated", {"page": page})

@app.get("/api/series/search")
async def series_search(q: str = Query(...), page: int = 1):
    return await tmdb("/search/tv", {"query": q, "page": page})

@app.get("/api/series/{series_id}")
async def series_detail(series_id: int):
    return await tmdb(f"/tv/{series_id}", {
        "append_to_response": "external_ids,credits,videos,similar"
    })

@app.get("/api/series/{series_id}/season/{season_number}")
async def series_season(series_id: int, season_number: int):
    return await tmdb(f"/tv/{series_id}/season/{season_number}")

# ═══════════════════════════════════════════════════════════════════════════════
# SEARCH MULTI
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/search")
async def search_multi(q: str = Query(...), page: int = 1):
    return await tmdb("/search/multi", {"query": q, "page": page})

# ═══════════════════════════════════════════════════════════════════════════════
# FAVORITES (in-memory)
# ═══════════════════════════════════════════════════════════════════════════════

class FavoriteIn(BaseModel):
    id: int
    title: Optional[str] = None
    name: Optional[str] = None
    poster_path: Optional[str] = None
    media_type: Optional[str] = "movie"
    vote_average: Optional[float] = None
    release_date: Optional[str] = None
    first_air_date: Optional[str] = None

@app.get("/api/favorites")
async def get_favorites():
    return list(favorites.values())

@app.post("/api/favorites")
async def add_favorite(item: FavoriteIn):
    favorites[str(item.id)] = item.model_dump()
    return {"ok": True}

@app.delete("/api/favorites/{item_id}")
async def remove_favorite(item_id: int):
    favorites.pop(str(item_id), None)
    return {"ok": True}

# ═══════════════════════════════════════════════════════════════════════════════
# HISTORY (in-memory)
# ═══════════════════════════════════════════════════════════════════════════════

class HistoryIn(BaseModel):
    id: int
    title: Optional[str] = None
    poster: Optional[str] = None
    media_type: Optional[str] = "movie"
    progress: Optional[float] = 0
    duration: Optional[float] = None

@app.get("/api/history")
async def get_history():
    return history[:50]

@app.post("/api/history")
async def add_history(item: HistoryIn):
    global history
    history = [h for h in history if h["id"] != item.id]
    history.insert(0, {**item.model_dump(), "watchedAt": time.time()})
    return {"ok": True}

@app.patch("/api/history/{item_id}/progress")
async def update_progress(item_id: int, progress: float, duration: Optional[float] = None):
    for h in history:
        if h["id"] == item_id:
            h["progress"] = progress
            if duration:
                h["duration"] = duration
            break
    return {"ok": True}

# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/health")
async def health():
    return {"status": "ok", "tmdb_key_set": bool(TMDB_API_KEY)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
