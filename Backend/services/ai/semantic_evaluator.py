
import json
import logging
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

logger = logging.getLogger(__name__)


class SemanticEvaluator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.8-flash"
        )

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        self.client = genai.Client(api_key=api_key)

    def evaluate_relevance(
        self,
        user_message: str,
        conversation_context: list[dict],
        scenario: str,
        fallback_score: float = 70.0
    ) -> float:
        context = [
            {
                "role": item.get("role", "user"),
                "content": str(item.get("content", ""))[:1000]
            }
            for item in conversation_context[-6:]
            if isinstance(item, dict) and item.get("content")
        ]

        prompt = f"""
You are evaluating a person's communication practice response.

Scenario: {scenario or "General communication"}

Previous conversation:
{json.dumps(context, ensure_ascii=False)}

User's response:
{user_message}

Evaluate how relevant the user's response is to the scenario
and the most recent preceding conversational question.

Scoring:
- 0: completely unrelated
- 25: mostly unrelated
- 50: partially relevant
- 75: relevant but incomplete
- 100: directly relevant and adequately addresses the question

Return only valid JSON in this exact format:
{{"relevance_score": 75}}

The score must be a number between 0 and 100.
Judge meaning, not just word overlap.
Do not reward a response merely for repeating words.
"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0,
                    max_output_tokens=100,
                    response_mime_type="application/json"
                )
            )

            if not response.text:
                return self._fallback(fallback_score)

            result = json.loads(response.text)
            score = float(result["relevance_score"])

            if not 0 <= score <= 100:
                return self._fallback(fallback_score)

            return round(score, 2)

        except (ValueError, TypeError, KeyError, json.JSONDecodeError):
            logger.warning("Invalid semantic evaluation response.")
            return self._fallback(fallback_score)

        except Exception:
            logger.exception("Semantic evaluation failed.")
            return self._fallback(fallback_score)

    @staticmethod
    def _fallback(score: float) -> float:
        try:
            score = float(score)
            if 0 <= score <= 100:
                return round(score, 2)
        except (ValueError, TypeError):
            pass

        return 70.0
