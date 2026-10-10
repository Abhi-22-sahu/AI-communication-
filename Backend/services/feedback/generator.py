
import json
import logging
import os
import re

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)


def _detect_grammar_corrections(text: str) -> list[str]:
    """Detect a small set of known grammar errors."""

    corrections = []

    article_patterns = [
        (
            r"\ban\s+(computer|university|user|European|one)\b",
            r"a \1",
            "Use 'a' before a consonant sound."
        ),
        (
            r"\ba\s+(apple|orange|hour|honest|umbrella|elephant)\b",
            r"an \1",
            "Use 'an' before a vowel sound."
        ),
    ]

    for pattern, replacement, explanation in article_patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            original = match.group(0)
            corrected = re.sub(
                pattern,
                replacement,
                original,
                count=1,
                flags=re.IGNORECASE
            )
            corrections.append(
                f"Change '{original}' to '{corrected}'. {explanation}"
            )

    return corrections


def _rule_based_feedback(
    analysis,
    user_message: str = ""
) -> dict:
    """Create specific feedback without requiring an AI API."""

    strengths = []
    areas_to_improve = []
    suggestions = []

    corrections = _detect_grammar_corrections(user_message)

    if corrections:
        areas_to_improve.append("Grammar")
        suggestions.extend(corrections)
    elif analysis.grammar_score >= 90:
        strengths.append("Your grammar is strong.")
    else:
        areas_to_improve.append("Grammar")
        suggestions.append(
            "Review grammar, including articles, verb forms, "
            "capitalization, and punctuation."
        )

    if analysis.clarity_score >= 90:
        strengths.append("Your response is clear and easy to follow.")
    else:
        areas_to_improve.append("Clarity")
        suggestions.append(
            "Express your main idea directly and organize your response."
        )

    if analysis.vocabulary_score >= 90:
        strengths.append("Your vocabulary shows good word variety.")
    else:
        areas_to_improve.append("Vocabulary")
        suggestions.append(
            "Choose precise words that express your intended meaning."
        )

    if analysis.relevance_score >= 90:
        strengths.append("Your response addresses the topic directly.")
    else:
        areas_to_improve.append("Relevance")
        suggestions.append(
            "Answer the question more directly and support your main point."
        )

    if analysis.average_sentence_length > 25:
        areas_to_improve.append("Sentence Structure")
        suggestions.append(
            "Consider breaking long sentences into shorter statements."
        )

    if not strengths:
        strengths.append(
            "You communicated your idea. Keep practicing."
        )

    if not areas_to_improve:
        areas_to_improve.append("No major weaknesses detected.")

    if not suggestions:
        suggestions.append(
            "Continue practicing clear, accurate, and natural communication."
        )

    return {
        "strengths": strengths,
        "areas_to_improve": areas_to_improve,
        "suggestions": suggestions
    }


def generate_feedback(
    analysis,
    user_message: str = "",
    conversation_context: list[dict] | None = None,
    scenario: str = ""
) -> dict:
    """Generate personalized feedback, with a reliable local fallback."""

    fallback = _rule_based_feedback(analysis, user_message)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not user_message.strip():
        return fallback

    model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    context = [
        {
            "role": item.get("role", "user"),
            "content": str(item.get("content", ""))[:1000]
        }
        for item in (conversation_context or [])[-6:]
        if isinstance(item, dict) and item.get("content")
    ]

    prompt = f"""
You are a supportive, precise communication coach.

Practice scenario: {scenario or "General communication"}
Previous conversation: {json.dumps(context, ensure_ascii=False)}
Exact user response: {user_message}

Scores:
Grammar: {analysis.grammar_score}
Clarity: {analysis.clarity_score}
Vocabulary: {analysis.vocabulary_score}
Relevance: {analysis.relevance_score}
Overall: {analysis.overall_score}

Local grammar corrections detected:
{json.dumps(_detect_grammar_corrections(user_message))}

Provide concise, response-specific feedback.
- Never praise a weak metric as strong.
- Correct real mistakes and explain the correction.
- Do not invent errors.
- Evaluate whether the answer addresses the preceding question.
- Include strengths, areas_to_improve, and suggestions.
- Preserve the detected grammar corrections in suggestions.
- Return only valid JSON with exactly these keys:
  "strengths", "areas_to_improve", "suggestions".
- Each value must be a non-empty list of strings.
"""

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=400,
                response_mime_type="application/json"
            )
        )

        if not response.text:
            return fallback

        result = json.loads(response.text)
        required_keys = (
            "strengths",
            "areas_to_improve",
            "suggestions"
        )

        for key in required_keys:
            if (
                not isinstance(result.get(key), list)
                or not result[key]
                or not all(
                    isinstance(item, str) and item.strip()
                    for item in result[key]
                )
            ):
                return fallback

        # Ensure the local grammar correction is not lost.
        corrections = _detect_grammar_corrections(user_message)
        if corrections:
            if "Grammar" not in result["areas_to_improve"]:
                result["areas_to_improve"].append("Grammar")

            for correction in corrections:
                if correction not in result["suggestions"]:
                    result["suggestions"].append(correction)

        return {
            key: [item.strip() for item in result[key]]
            for key in required_keys
        }

    except Exception:
        logger.warning(
            "Personalized feedback unavailable; using local feedback."
        )
        return fallback
