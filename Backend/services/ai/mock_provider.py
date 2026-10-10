
from Backend.services.ai.base import AIProvider


class MockAIProvider(AIProvider):

    def generate_response(
        self,
        conversation: list[dict],
        session_type: str,
        scenario: str
    ) -> str:

        if not conversation:
            return self._opening_message(session_type, scenario)

        user_messages = [
            message.get("content", "").strip()
            for message in conversation
            if message.get("role") == "user"
            and message.get("content", "").strip()
        ]

        if not user_messages:
            return self._opening_message(session_type, scenario)

        user_message = user_messages[-1].lower()
        previous_topics = " ".join(user_messages[:-1]).lower()

        # Detect the current topic before choosing the practice mode.
        if any(word in user_message for word in (
            "cricket", "football", "hobby", "music",
            "movie", "travel", "cooking", "ice cream",
            "food", "playing games"
        )):
            return self._personal_topic_response(user_message)

        if session_type == "interview":
            return self._interview_response(
                user_message, scenario, previous_topics
            )

        if session_type == "speaking":
            return self._speaking_response(user_message, scenario)

        if session_type == "conversation":
            return self._conversation_response(
                user_message, previous_topics
            )

        return self._professional_response(user_message, scenario)

    def _opening_message(self, session_type: str, scenario: str) -> str:
        if session_type == "interview":
            return (
                "Let's begin the interview. Please introduce "
                "yourself and describe your technical background."
            )

        if session_type == "speaking":
            return (
                "Let's begin your speaking practice. "
                "Please explain your selected topic clearly."
            )

        if session_type == "conversation":
            return (
                "Let's begin our conversation. "
                "What have you been interested in lately?"
            )

        return (
            f"Let's practice professional communication for "
            f"{scenario or 'a workplace situation'}. "
            "What would you like to work on?"
        )

    def _personal_topic_response(self, user_message: str) -> str:
        if "cricket" in user_message:
            return (
                "That's great! What position do you usually play "
                "in cricket, and what do you enjoy most about it?"
            )

        if "football" in user_message:
            return (
                "Nice! Do you enjoy playing football or watching it, "
                "and what do you like most about the game?"
            )

        if "ice cream" in user_message or "food" in user_message:
            return (
                "That sounds enjoyable! What is your favourite, "
                "and what makes it special for you?"
            )

        if "music" in user_message:
            return (
                "What kind of music do you enjoy, and when do you "
                "usually listen to it?"
            )

        if "movie" in user_message:
            return (
                "What kind of movies do you enjoy, and which one "
                "would you recommend to someone?"
            )

        if "travel" in user_message:
            return (
                "What place would you most like to visit, and "
                "what attracts you to it?"
            )

        return (
            "Tell me a little more about that. "
            "What do you enjoy most about it?"
        )

    def _interview_response(
        self,
        user_message: str,
        scenario: str,
        previous_topics: str
    ) -> str:

        if any(word in user_message for word in (
            "project", "application", "system", "built", "developed"
        )):
            return (
                "What problem did your project solve, what was your "
                "specific contribution, and what did you learn?"
            )

        if any(word in user_message for word in (
            "skill", "technology", "python", "java",
            "artificial intelligence", "machine learning", " ai "
        )):
            return (
                "Can you describe a project or practical task where "
                "you applied that skill?"
            )

        if any(word in user_message for word in (
            "experience", "internship", "challenge"
        )):
            return (
                "Describe a specific challenge you faced and explain "
                "the steps you took to overcome it."
            )

        if any(word in user_message for word in (
            "student", "study", "college", "computer science"
        )):
            return (
                "Which area of computer science interests you most, "
                "and what have you done to explore it?"
            )

        if any(word in user_message for word in (
            "hello", "hi ", "hey", "my name", "introduce"
        )):
            return (
                "Please introduce yourself, including your education, "
                "strongest skills, and career interests."
            )

        if "?" in user_message:
            return (
                "I can help with that. Could you explain your "
                "question a little further?"
            )

        if any(word in user_message for word in (
            "because", "learned", "learn", "improved", "achieved"
        )):
            return (
                "What was the outcome, and how would you apply "
                "that learning in your future work?"
            )

        if previous_topics and any(
            topic in previous_topics
            for topic in ("project", "python", "machine learning")
        ):
            return (
                "How would you apply what you have learned to "
                "solve a real-world problem?"
            )

        return (
            f"Could you share a specific example related to "
            f"{scenario or 'your experience'} and explain what "
            "you learned from it?"
        )

    def _speaking_response(
        self, user_message: str, scenario: str
    ) -> str:
        if "project" in user_message:
            return (
                "Explain the main objective of your project "
                "and give an example of how it helps users."
            )

        if any(word in user_message for word in (
            "because", "reason", "important"
        )):
            return (
                "Can you support that point with a practical "
                "example and explain why it matters?"
            )

        return (
            "What is the main point you want your audience "
            "to remember? Support it with an example."
        )

    def _conversation_response(
        self, user_message: str, previous_topics: str
    ) -> str:
        if any(word in user_message for word in (
            "project", "application", "built", "developed"
        )):
            return (
                "What inspired that project, and which part "
                "did you find most challenging?"
            )

        if any(word in user_message for word in (
            "student", "college", "study", "learning"
        )):
            return (
                "Which subject are you most interested in, "
                "and what are you learning about it?"
            )

        if previous_topics and user_message in previous_topics:
            return (
                "You mentioned that earlier. What new experience "
                "or detail would you like to add?"
            )

        return (
            "Interesting! Could you tell me a little more "
            "about that?"
        )

    def _professional_response(
        self, user_message: str, scenario: str
    ) -> str:
        if any(word in user_message for word in (
            "meeting", "deadline", "work", "team"
        )):
            return (
                "What next steps would you communicate, and how "
                "would you ensure everyone understands their role?"
            )

        return (
            f"For {scenario or 'this workplace situation'}, "
            "what outcome are you aiming for, and how would "
            "you communicate it professionally?"
        )
