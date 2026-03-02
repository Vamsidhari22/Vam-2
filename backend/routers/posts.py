import json
import os
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel

from prompts import INSTAGRAM_IMAGE_PROMPT, SOCIAL_MEDIA_POST_PROMPT

router = APIRouter()


def get_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ──────────────────────────────────────────────────────────────
# Pydantic models
# ──────────────────────────────────────────────────────────────

class SelectedImage(BaseModel):
    id: str
    url: str
    description: str


class PostRequest(BaseModel):
    aesthetics: Dict[str, Any]
    selected_images: List[SelectedImage]


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def _build_image_prompt(client: OpenAI, model: str, aesthetics: dict, image_descriptions: str) -> str:
    """Ask GPT to write an optimised DALL-E 3 prompt tailored to this brand."""
    cp = aesthetics.get("color_palette", {})
    color_palette_str = (
        f"primary {cp.get('primary','')}, secondary {cp.get('secondary','')}, "
        f"accent {cp.get('accent','')}, mood: {cp.get('mood_description','')}"
    )

    prompt = INSTAGRAM_IMAGE_PROMPT.format(
        brand_name=aesthetics.get("brand_name", "the brand"),
        industry=aesthetics.get("industry", "business"),
        visual_style=aesthetics.get("visual_style", "professional"),
        brand_mood=aesthetics.get("brand_mood", "engaging"),
        color_palette=color_palette_str,
        target_audience=aesthetics.get("target_audience", "general audience"),
        key_themes=", ".join(aesthetics.get("key_themes", [])),
        image_descriptions=image_descriptions,
    )

    resp = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You write highly detailed DALL-E 3 image generation prompts. "
                    "Return only the prompt text — no extra commentary."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )
    return resp.choices[0].message.content.strip()


# ──────────────────────────────────────────────────────────────
# Route
# ──────────────────────────────────────────────────────────────

@router.post("/generate")
async def generate_posts(request: PostRequest):
    """Generate an Instagram caption and a matching DALL-E 3 image for the brand."""
    if not request.selected_images:
        raise HTTPException(
            status_code=400, detail="At least one image must be selected."
        )

    aesthetics = request.aesthetics
    image_descriptions = "\n".join(
        f"- Image {i + 1}: {img.description}"
        for i, img in enumerate(request.selected_images)
    )
    key_themes_str = ", ".join(
        aesthetics.get("key_themes", [])
        if isinstance(aesthetics.get("key_themes"), list)
        else []
    )

    try:
        client = get_client()
        model = os.getenv("OPENAI_MODEL", "gpt-4o")

        # ── Step 1: Generate Instagram caption JSON ──────────────
        caption_prompt = SOCIAL_MEDIA_POST_PROMPT.format(
            brand_name=aesthetics.get("brand_name", "the brand"),
            industry=aesthetics.get("industry", "business"),
            visual_style=aesthetics.get("visual_style", "professional"),
            brand_mood=aesthetics.get("brand_mood", "engaging"),
            brand_voice=aesthetics.get("brand_voice", "friendly"),
            target_audience=aesthetics.get("target_audience", "general audience"),
            key_themes=key_themes_str,
            image_descriptions=image_descriptions,
        )

        caption_resp = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a creative Instagram content strategist. "
                        "Always respond with valid JSON only."
                    ),
                },
                {"role": "user", "content": caption_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.85,
        )
        instagram_post: dict = json.loads(caption_resp.choices[0].message.content)

        # ── Step 2: Build an optimised DALL-E prompt ─────────────
        dalle_prompt = _build_image_prompt(client, model, aesthetics, image_descriptions)

        # ── Step 3: Generate the image ────────────────────────────
        image_model = os.getenv("IMAGE_MODEL", "dall-e-3")
        image_resp = client.images.generate(
            model=image_model,
            prompt=dalle_prompt,
            size="1024x1024",
            quality="hd",
            n=1,
        )
        image_url = image_resp.data[0].url
        revised_prompt = image_resp.data[0].revised_prompt or dalle_prompt

        return {
            "status": "success",
            "instagram": instagram_post,
            "generated_image": {
                "url": image_url,
                "prompt_used": revised_prompt,
            },
        }

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to parse caption response: {exc}"
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Post generation failed: {exc}")
