import json
import os
from typing import Any, Dict, List

import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel

from prompts import AESTHETICS_ANALYSIS_PROMPT

router = APIRouter()


def get_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ──────────────────────────────────────────────────────────────
# Pydantic models
# ──────────────────────────────────────────────────────────────

class AestheticsRequest(BaseModel):
    url: str


class ImageSearchRequest(BaseModel):
    keywords: List[str]
    aesthetics: Dict[str, Any]


class ImageResult(BaseModel):
    id: str
    url: str
    thumb: str
    description: str
    photographer: str
    photographer_url: str
    download_url: str


class AestheticsResponse(BaseModel):
    aesthetics: Dict[str, Any]
    images: List[ImageResult]


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def scrape_website(url: str) -> dict:
    """Fetch and parse a website, returning structured text content."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
    except requests.exceptions.RequestException as exc:
        raise HTTPException(status_code=400, detail=f"Failed to fetch website: {exc}")

    soup = BeautifulSoup(resp.content, "lxml")

    # Title
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else ""

    # Meta description
    meta = soup.find("meta", attrs={"name": "description"}) or soup.find(
        "meta", attrs={"property": "og:description"}
    )
    meta_description = meta.get("content", "") if meta else ""

    # Strip non-content tags
    for tag in soup(["script", "style", "nav", "footer", "iframe", "noscript"]):
        tag.decompose()

    # Headings
    headings = [
        h.get_text(strip=True)
        for h in soup.find_all(["h1", "h2", "h3"], limit=10)
        if h.get_text(strip=True)
    ]

    # Paragraphs
    paragraphs = [
        p.get_text(strip=True)
        for p in soup.find_all("p", limit=20)
        if len(p.get_text(strip=True)) > 30
    ]

    # Image alt texts
    img_alts = [
        img.get("alt", "")
        for img in soup.find_all("img", limit=20)
        if len(img.get("alt", "")) > 5
    ]

    content = (
        f"Headings: {' | '.join(headings[:8])}\n"
        f"Main Content: {' '.join(paragraphs[:10])}\n"
        f"Image Descriptions: {' | '.join(img_alts[:10])}"
    ).strip()

    return {
        "title": title,
        "meta_description": meta_description,
        "content": content[:3500],
    }


def search_unsplash_images(keywords: List[str], target: int = 9) -> List[dict]:
    """Search Unsplash for images matching each keyword, returning up to `target` unique results."""
    access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not access_key:
        raise HTTPException(
            status_code=500, detail="Unsplash API key (UNSPLASH_ACCESS_KEY) not configured."
        )

    images: List[dict] = []
    seen_ids: set = set()
    per_kw = max(2, target // max(len(keywords), 1) + 1)

    for keyword in keywords[:5]:
        if len(images) >= target:
            break
        try:
            resp = requests.get(
                "https://api.unsplash.com/search/photos",
                params={
                    "query": keyword,
                    "per_page": per_kw,
                    "orientation": "landscape",
                    "content_filter": "high",
                },
                headers={"Authorization": f"Client-ID {access_key}"},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

            for photo in data.get("results", []):
                if photo["id"] not in seen_ids:
                    seen_ids.add(photo["id"])
                    images.append(
                        {
                            "id": photo["id"],
                            "url": photo["urls"]["regular"],
                            "thumb": photo["urls"]["small"],
                            "description": (
                                photo.get("description")
                                or photo.get("alt_description")
                                or keyword
                            ),
                            "photographer": photo["user"]["name"],
                            "photographer_url": photo["user"]["links"]["html"],
                            "download_url": photo["links"]["html"],
                        }
                    )
        except Exception:
            continue  # Skip failed keyword searches

    return images[:target]


# ──────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AestheticsResponse)
async def analyze_aesthetics(request: AestheticsRequest):
    """Scrape a website, analyse its brand aesthetics, and return matching images."""
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    # 1. Scrape
    website_data = scrape_website(url)

    # 2. Analyse aesthetics
    try:
        client = get_client()
        model = os.getenv("OPENAI_MODEL", "gpt-4o")
        prompt = AESTHETICS_ANALYSIS_PROMPT.format(
            url=url,
            title=website_data["title"],
            meta_description=website_data["meta_description"],
            content=website_data["content"],
        )

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a brand aesthetics expert. Always respond with valid JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )

        aesthetics: dict = json.loads(response.choices[0].message.content)

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to parse aesthetics response: {exc}"
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Aesthetics analysis failed: {exc}")

    # 3. Image search
    keywords: List[str] = aesthetics.get("search_keywords") or aesthetics.get(
        "aesthetic_tags", ["professional business photography"]
    )
    images = search_unsplash_images(keywords)

    return AestheticsResponse(
        aesthetics=aesthetics,
        images=[ImageResult(**img) for img in images],
    )


@router.post("/images")
async def refresh_images(request: ImageSearchRequest):
    """Search for a fresh batch of images using the provided keywords."""
    try:
        images = search_unsplash_images(request.keywords)
        return {"images": [ImageResult(**img) for img in images]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image search failed: {exc}")
