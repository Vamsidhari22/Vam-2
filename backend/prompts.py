"""
All OpenAI prompts for the Marketing Dashboard API.
"""

# ──────────────────────────────────────────────────────────────
# TREND REPORT
# ──────────────────────────────────────────────────────────────

TREND_REPORT_SYSTEM = (
    "You are an expert social media strategist and trend analyst with deep knowledge "
    "of platform culture, creator behavior, audience engagement patterns, and brand "
    "content strategy. You produce concise, current, actionable reports focused only "
    "on social media trends that businesses can turn into posts."
)

TREND_REPORT_PROMPT = """Search the internet for the latest social media trends related to: {topic}

Create a social-media-focused trend report for a business in this topic or industry.
Focus specifically on trends happening on social platforms such as Instagram, TikTok,
X, YouTube, LinkedIn, Pinterest, Reddit, or platform-native creator ecosystems.
Do not include general business, economic, or cultural trends unless they are clearly
showing up as social media content trends.

## Executive Summary
Brief overview of the current social media trend landscape (2-3 sentences).

## Top 5 Social Media Trends
For each trend provide:
- Trend name and brief description
- Primary platforms where it is showing up
- Why it's gaining traction on social media right now
- Any notable signals, examples, or statistics if available
- 2-3 post ideas a business could create based on this trend

## Key Insights
- 3-5 important observations about current social content behaviour
- Audience engagement or creator behaviour patterns
- Platform-specific differences where relevant

## Target Audience Analysis
- Who is driving these trends
- Demographics and psychographics
- Platform preferences

## Opportunities for Businesses
- 3-5 actionable opportunities
- How businesses can leverage these trends in social content

## Recommendations
- Immediate actions (this week / month) for social media teams
- Medium-term strategy (3-6 months)
- Long-term considerations

Formatting requirements:
- Return the answer in clean markdown
- Use clear headings and bullet points
- Under each trend, include a subheading called "Post Ideas"
- Make the post ideas specific, practical, and easy to execute for a business

Keep the tone professional but engaging. Base your answer on current information from your web search."""

TREND_REPORT_BUSINESS_PROMPT = """Search the internet for the latest social media trends related to: {topic}

Create a social-media-focused trend report for {brand_name}, a business in the {industry} industry.

## Business Context
- Brand Name: {brand_name}
- Industry: {industry}
- Brand Voice: {brand_voice}
- Target Audience: {target_audience}
- Key Themes: {key_themes}

For EACH trend you identify, provide 2-3 specific POST IDEAS that this business ({brand_name}) can actually create and post. The post ideas must:
- Be directly relevant to this specific business and its target audience
- Align with the brand's voice and tone
- Leverage the brand's key themes and industry
- Be practical and easy for the business to execute

Focus specifically on trends happening on social platforms such as Instagram, TikTok, X, YouTube, LinkedIn, Pinterest, Reddit, or platform-native creator ecosystems.
Do not include general business, economic, or cultural trends unless they are clearly showing up as social media content trends.

## Executive Summary
Brief overview of the current social media trend landscape for the {industry} industry (2-3 sentences).

## Top 5 Social Media Trends for {brand_name}
For each trend provide:
- Trend name and brief description
- Primary platforms where it is showing up
- Why it's gaining traction on social media right now
- Any notable signals, examples, or statistics if available
- 2-3 post ideas specific to {brand_name} that connect to this trend (must reference brand voice, audience, industry context)

## Key Insights
- 3-5 important observations about current social content behaviour that apply to the {industry} space
- Audience engagement or creator behaviour patterns relevant to {brand_name}'s target audience
- Platform-specific differences where relevant

## Opportunities for {brand_name}
- 3-5 actionable opportunities specific to this business
- How {brand_name} can leverage these trends in social content given their brand positioning

## Recommendations
- Immediate actions (this week / month) for {brand_name}'s social media team
- Medium-term strategy (3-6 months) tailored to {brand_name}'s business model
- Long-term considerations for the {industry} space

Formatting requirements:
- Return the answer in clean markdown
- Use clear headings and bullet points
- Make the post ideas specific, practical, and tied to {brand_name}'s brand voice and industry
- Ensure post ideas are NOT generic but account for the business context

Keep the tone professional but engaging. Base your answer on current information from your web search."""


# ──────────────────────────────────────────────────────────────
# AESTHETICS ANALYSIS
# ──────────────────────────────────────────────────────────────

AESTHETICS_ANALYSIS_PROMPT = """Analyse the following website content and identify the brand's complete aesthetic profile. Be specific and detailed.

Website URL: {url}
Page Title: {title}
Meta Description: {meta_description}
Website Content / Text: {content}

Return ONLY a valid JSON object — no markdown fences, no extra text — with exactly these keys:

{{
  "brand_name": "extracted or inferred brand name",
  "industry": "specific industry / niche",
  "color_palette": {{
    "primary": "primary brand colour (hex or descriptive)",
    "secondary": "secondary colour",
    "accent": "accent colour",
    "background": "background colour",
    "mood_description": "describe the colour palette mood"
  }},
  "visual_style": "detailed description of visual style (modern, minimalist, luxury, playful, etc.)",
  "brand_mood": "emotional tone and feeling (sophisticated, friendly, energetic, calming, etc.)",
  "brand_voice": "communication style (professional, casual, inspiring, authoritative, etc.)",
  "target_audience": "specific description of target demographic",
  "key_themes": ["theme1", "theme2", "theme3"],
  "search_keywords": [
    "specific image-search query 1",
    "specific image-search query 2",
    "specific image-search query 3",
    "specific image-search query 4",
    "specific image-search query 5"
  ],
  "aesthetic_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}}

For search_keywords generate highly specific, image-search-optimised phrases that will surface photos matching this brand's aesthetic — consider lighting, composition, colour grading, and subject matter."""


# ──────────────────────────────────────────────────────────────
# INSTAGRAM POST GENERATION
# ──────────────────────────────────────────────────────────────

SOCIAL_MEDIA_POST_PROMPT = """You are a creative social media strategist who specialises in brand-aligned Instagram content.

Create an engaging Instagram post for a business with the following brand profile:

Brand Name: {brand_name}
Industry: {industry}
Visual Style: {visual_style}
Brand Mood: {brand_mood}
Brand Voice: {brand_voice}
Target Audience: {target_audience}
Key Themes: {key_themes}

Selected Images:
{image_descriptions}

Guidelines:
1. Authentically represent the brand's voice and aesthetic.
2. Engage the specific target audience.
3. Drive meaningful action.
4. Use storytelling, emojis, and line breaks for Instagram readability.

Return ONLY a valid JSON object — no markdown fences, no extra text:

{{
  "caption": "Engaging Instagram caption with storytelling, emojis, and natural line breaks (150-300 characters).",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"],
  "cta": "Clear call-to-action (e.g. 'Book now', 'Link in bio', 'Tag a friend')",
  "story_idea": "Brief idea for an Instagram Story to accompany this post"
}}"""


# ──────────────────────────────────────────────────────────────
# DALL-E 3 INSTAGRAM IMAGE PROMPT BUILDER
# ──────────────────────────────────────────────────────────────

INSTAGRAM_IMAGE_PROMPT = """You are an expert at writing DALL-E 3 image generation prompts for Instagram marketing.

Create a detailed, optimised DALL-E 3 prompt for an Instagram post image for the following brand:

Brand Name: {brand_name}
Industry: {industry}
Visual Style: {visual_style}
Brand Mood: {brand_mood}
Colour Palette: {color_palette}
Target Audience: {target_audience}
Key Themes: {key_themes}

Inspiration from selected images:
{image_descriptions}

Requirements for the prompt:
- Describe a photorealistic, high-quality image perfectly suited for a square Instagram post
- Incorporate the brand's exact colour palette and visual aesthetic
- Evoke the brand's mood and appeal strongly to the target audience
- Specify lighting style, composition, depth of field, and atmosphere
- DO NOT include any text, words, logos, or watermarks in the image
- Make it visually striking and scroll-stopping

Return ONLY the DALL-E prompt text — nothing else, no preamble, no explanation."""
