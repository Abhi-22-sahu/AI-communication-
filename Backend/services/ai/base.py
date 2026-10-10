from abc import ABC, abstractmethod


class AIProvider(ABC):

    @abstractmethod
    def generate_response(
        self,
        conversation: list[dict],
        session_type: str,
        scenario: str
    ) -> str:
        pass