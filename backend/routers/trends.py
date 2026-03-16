from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os

from prompts import TREND_REPORT_PROMPT, TREND_REPORT_BUSINESS_PROMPT, TREND_REPORT_SYSTEM

router = APIRouter()


def get_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class TrendRequest(BaseModel):
    topic: str
    aesthetics: Optional[Dict[str, Any]] = None


class TrendResponse(BaseModel):
    report: str
    topic: str


@router.post("/analyze", response_model=TrendResponse)
async def analyze_trends(request: TrendRequest):
    """Use OpenAI web search to generate a live trend report for a given topic."""
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")

    try:
        client = get_client()
        model = os.getenv("OPENAI_MODEL", "gpt-4o")

        # Use business-specific prompt if aesthetics are provided
        if request.aesthetics:
            aesthetics = request.aesthetics
            prompt = TREND_REPORT_BUSINESS_PROMPT.format(
                topic=request.topic.strip(),
                brand_name=aesthetics.get("brand_name", "the business"),
                industry=aesthetics.get("industry", "business"),
                brand_voice=aesthetics.get("brand_voice", "professional"),
                target_audience=aesthetics.get("target_audience", "general audience"),
                key_themes=", ".join(aesthetics.get("key_themes", [])),
            )
        else:
            prompt = TREND_REPORT_PROMPT.format(topic=request.topic.strip())

        try:
            response = client.responses.create(
                model=model,
                instructions=TREND_REPORT_SYSTEM,
                tools=[{"type": "web_search_preview"}],
                input=prompt,
            )
            report_text = response.output_text
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate trend report: {str(exc)}",
            )

        if not report_text:
            raise RuntimeError("No trend report was generated.")

        return TrendResponse(report=report_text, topic=request.topic.strip())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate trend report: {str(e)}",
        )
