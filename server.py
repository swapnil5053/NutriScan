import os
import json
import base64
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from dotenv import load_dotenv
from google import genai
from google.genai import types as genai_types

load_dotenv()

app = FastAPI()

FOOD_ANALYSIS_SYSTEM_INSTRUCTION = """Analyze the food in this image.

If additional context is provided by the user, you MUST use that context to refine your analysis (e.g., if they mention "homemade", "extra cheese", or specific ingredients, factor that into your ingredient list and portion sizing).

Follow this reasoning sequence before producing numbers:
1. List every distinct food component you can see.
2. Estimate the portion weight of each item in grams.
   Use the plate as your reference — a standard dinner plate is 27cm (10.5 inches) across.
   If no plate is visible, state your reference object.
3. Identify inferred ingredients not directly visible: cooking oils, dressings, marinades, salt.
   Mark these as is_inferred: true. Estimate them conservatively.
4. Calculate total nutrition by summing each component.
5. Assign a health score from 1 to 10 based on: macronutrient balance, fiber content,
   sodium level, degree of processing, and vegetable-to-protein-to-carb ratio.
   Score 8-10 is reserved for meals that are genuinely balanced across all five factors.
6. Assign a Nutri-Score grade A through E consistent with the European Nutri-Score algorithm.
7. List applicable dietary flags. Only apply flags you are confident about.

If you cannot identify the food with reasonable confidence, return confidence: "Low"
and explain in coaching_tip what additional information would help.

The disclaimer field must always be: "Nutritional values are estimates for informational purposes only and not a substitute for professional dietary advice.\""""

COACH_SYSTEM_INSTRUCTION = """You are a direct, evidence-based, and warm nutrition coach.
Reference specific items from the user's data when helpful.
Never say "Great question" or use hollow affirmations.
Responses should be 3-5 sentences max unless the user asks for a detailed breakdown.
You cannot diagnose or prescribe."""

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "required": [
        "meal_name",
        "confidence",
        "visual_breakdown",
        "nutrition",
        "health_score",
        "nutri_grade",
        "dietary_flags",
        "coaching_tip",
        "healthier_swaps",
        "disclaimer",
    ],
    "properties": {
        "meal_name": {"type": "STRING"},
        "confidence": {"type": "STRING"},
        "cuisine_type": {"type": "STRING"},
        "visual_breakdown": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "item": {"type": "STRING"},
                    "estimated_weight_grams": {"type": "NUMBER"},
                    "is_inferred": {"type": "BOOLEAN"},
                },
                "required": ["item", "estimated_weight_grams", "is_inferred"],
            },
        },
        "nutrition": {
            "type": "OBJECT",
            "properties": {
                "calories": {"type": "NUMBER"},
                "protein_g": {"type": "NUMBER"},
                "carbohydrates_g": {"type": "NUMBER"},
                "fat_g": {"type": "NUMBER"},
                "fiber_g": {"type": "NUMBER"},
                "sugar_g": {"type": "NUMBER"},
                "sodium_mg": {"type": "NUMBER"},
                "saturated_fat_g": {"type": "NUMBER"},
            },
            "required": ["calories", "protein_g", "carbohydrates_g", "fat_g"],
        },
        "health_score": {"type": "NUMBER"},
        "nutri_grade": {"type": "STRING"},
        "dietary_flags": {"type": "ARRAY", "items": {"type": "STRING"}},
        "coaching_tip": {"type": "STRING"},
        "healthier_swaps": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "original": {"type": "STRING"},
                    "swap_with": {"type": "STRING"},
                    "benefit": {"type": "STRING"},
                },
            },
        },
        "disclaimer": {"type": "STRING"},
    },
}

MAX_UPLOAD_BYTES = 10 * 1024 * 1024

_client: genai.Client | None = None


def gemini_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY", ""),
            http_options=genai_types.HttpOptions(headers={"User-Agent": "nutriscan/1.0"}),
        )
    return _client


def is_overloaded(msg: str) -> bool:
    return any(token in msg for token in ("503", "high demand", "UNAVAILABLE"))


@app.post("/api/analyze-v2")
async def analyze_v2(file: UploadFile = File(...), context: str = Form(default="")):
    if not os.getenv("GEMINI_API_KEY"):
        return JSONResponse(status_code=500, content={"error": "GEMINI_API_KEY is not configured."})

    raw = await file.read()

    if len(raw) > MAX_UPLOAD_BYTES:
        return JSONResponse(status_code=413, content={"error": "File too large. Maximum size is 10MB."})

    try:
        parts = []
        if context and context.strip():
            parts.append(genai_types.Part(
                text=f'User provided context for this meal: "{context}". Please thoroughly incorporate this context into your analysis.'
            ))
        parts.append(genai_types.Part(
            inline_data=genai_types.Blob(
                mime_type=file.content_type,
                data=base64.b64encode(raw).decode("utf-8"),
            )
        ))

        response = gemini_client().models.generate_content(
            model="gemini-2.5-flash",
            contents=genai_types.Content(parts=parts),
            config=genai_types.GenerateContentConfig(
                system_instruction=FOOD_ANALYSIS_SYSTEM_INSTRUCTION,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=RESPONSE_SCHEMA,
            ),
        )
        return JSONResponse(content=json.loads(response.text or "{}"))

    except Exception as e:
        msg = str(e)
        if is_overloaded(msg):
            msg = "Gemini model is currently experiencing high demand. Please try again in a moment."
        return JSONResponse(status_code=500, content={"error": msg})


@app.post("/api/coach/chat")
async def coach_chat(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON body"})

    if not os.getenv("GEMINI_API_KEY"):
        return JSONResponse(status_code=500, content={"error": "GEMINI_API_KEY is not configured."})

    message = body.get("message", "")
    meal_history = body.get("mealHistory", [])
    user_goals = body.get("userGoals", {})

    try:
        context_str = (
            f"User's Recent Meals:\n{json.dumps(meal_history, indent=2)}\n\n"
            f"User's Daily Goals:\n{json.dumps(user_goals, indent=2)}"
        ).strip()

        chat = gemini_client().chats.create(
            model="gemini-2.5-flash",
            config=genai_types.GenerateContentConfig(
                system_instruction=COACH_SYSTEM_INSTRUCTION,
                temperature=0.65,
            ),
        )
        response = chat.send_message(
            f"Context data for this session:\n{context_str}\n\nUser Message:\n{message}"
        )
        return JSONResponse(content={"reply": response.text})

    except Exception as e:
        msg = str(e)
        if is_overloaded(msg):
            msg = "Gemini coach is currently experiencing high demand. Please try again in a moment."
        return JSONResponse(status_code=500, content={"error": msg})


dist_path = Path(__file__).parent / "dist"

if dist_path.exists():
    assets_path = dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        candidate = dist_path / full_path
        if candidate.exists() and candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(dist_path / "index.html"))
else:
    @app.get("/")
    async def dev_root():
        return JSONResponse(content={"message": "Build the frontend first with: npm run build"})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 3000)))
