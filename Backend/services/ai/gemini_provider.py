import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from Backend.services.ai.base import AIProvider
from Backend.services.ai.role_config import get_role_instruction

load_dotenv()


class GeminiProvider(AIProvider):

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        self.model = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.8-flash"
        )

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured"
            )

        self.client = genai.Client(
            api_key=api_key
        )

    def generate_response(
        self,
        conversation: list[dict],
        session_type: str,
        scenario: str
    ) -> str:

        system_instruction = get_role_instruction(
            session_type,
            scenario
        )

        contents = []

        for message in conversation:

            role = message.get("role")
            content = message.get("content", "")

            if not content:
                continue

            gemini_role = (
                "model"
                if role in ["assistant", "model"]
                else "user"
            )

            contents.append(
                types.Content(
                    role=gemini_role,
                    parts=[
                        types.Part(text=content)
                    ]
                )
            )

        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                max_output_tokens=300
            )
        )

        if not response.text:
            raise RuntimeError(
                "Gemini returned an empty response"
            )

        return response.text.strip()