
import re


FILLER_WORDS = {
    "um", "uh", "erm", "basically", "literally"
}


def analyze_text(
    text: str,
    scenario: str = "",
    context: list[dict] | None = None
) -> dict:
    """Analyze written communication using basic NLP heuristics."""

    original_text = text.strip()

    if not original_text:
        raise ValueError("Text cannot be empty")

    words = re.findall(r"\b[\w']+\b", original_text.lower())

    if not words:
        raise ValueError("No words found in text")

    word_count = len(words)
    unique_words = set(words)

    sentences = [
        part.strip()
        for part in re.split(r"[.!?]+", original_text)
        if part.strip()
    ]

    sentence_count = max(1, len(sentences))
    average_sentence_length = word_count / sentence_count

   
    # Vocabulary scoring: balance word variety and response length.
    lexical_diversity = len(unique_words) / word_count

    if word_count <= 3:
        vocabulary_score = 55 + lexical_diversity * 20
    elif word_count <= 7:
        vocabulary_score = 60 + lexical_diversity * 25
    elif word_count <= 15:
        vocabulary_score = 65 + lexical_diversity * 25
    else:
        vocabulary_score = 70 + lexical_diversity * 20

    vocabulary_score = round(
        max(0, min(100, vocabulary_score)), 2
    )

   
    # Clarity scoring: reward readable sentences and penalize disfluency.
    clarity_score = 90.0

    if average_sentence_length > 25:
        clarity_score -= min(
            25, (average_sentence_length - 25) * 1.5
        )
    elif average_sentence_length > 18:
        clarity_score -= (average_sentence_length - 18) * 1.0

    if re.search(r"[.!?]{2,}", original_text):
        clarity_score -= 8

    filler_count = sum(words.count(word) for word in FILLER_WORDS)
    clarity_score -= min(20, filler_count * 5)

    if word_count >= 8 and sentence_count == 1:
        clarity_score -= 3

    clarity_score = round(
        max(0, min(100, clarity_score)), 2
    )

    # Grammar heuristics
    grammar_score = 100.0
    lower_text = original_text.lower()
    grammar_issues = []

    # Capitalization
    if original_text[0].islower():
        grammar_score -= 5
        grammar_issues.append("capitalization")

    # Final punctuation
    if original_text[-1] not in ".!?":
        grammar_score -= 3
        grammar_issues.append("punctuation")

    if re.search(r"\s{2,}", original_text):
        grammar_score -= 5
        grammar_issues.append("extra spaces")

    if re.search(r"[!?.,]{2,}", original_text):
        grammar_score -= 5
        grammar_issues.append("repeated punctuation")

    # Subject-verb agreement
    if re.search(
        r"\b(i is|he are|she are|they is|we is|"
        r"you is|i are|he am|she am|they am)\b",
        lower_text
    ):
        grammar_score -= 15
        grammar_issues.append("subject-verb agreement")

    # Common article errors:
    # "an computer" -> "a computer"
    # "a apple" -> "an apple"
    if re.search(
        r"\ban\s+(computer|university|user|"
        r"European|one)\b",
        lower_text
    ):
        grammar_score -= 12
        grammar_issues.append("article usage")

    if re.search(
        r"\ba\s+(apple|orange|hour|honest|"
        r"umbrella|elephant)\b",
        lower_text
    ):
        grammar_score -= 12
        grammar_issues.append("article usage")

    # Common missing third-person singular verb endings.
    if re.search(
        r"\b(he|she|it)\s+(go|do|have|"
        r"like|want|need|play|work)\b",
        lower_text
    ):
        grammar_score -= 10
        grammar_issues.append("verb form")

    grammar_score = max(0, min(100, grammar_score))

    # Context-aware lexical relevance estimate.
    context_words = set(
        re.findall(
            r"\b[\w']+\b",
            " ".join(
                str(item.get("content", ""))
                for item in (context or [])
                if isinstance(item, dict)
            ).lower()
        )
    )

    scenario_words = set(
        re.findall(r"\b[\w']+\b", scenario.lower())
    )

    
    # Relevance scoring: compare the response with the latest coach question.
    
    # Relevance scoring: evaluate the latest coach question.
    stop_words = {
        "i", "you", "he", "she", "it", "we", "they", "a", "an", "the",
        "is", "am", "are", "was", "were", "to", "of", "in", "on", "for",
        "and", "or", "but", "my", "your", "me", "this", "that", "what",
        "how", "do", "does", "did", "can", "could", "would", "should",
        "which", "who", "when", "where", "why", "most", "about", "please",
        "tell", "describe", "explain", "have", "has", "had", "interests",
        "interested"
    }

    def meaningful_words(value: str) -> set[str]:
        return (
            set(re.findall(r"\b[\w']+\b", value.lower()))
            - stop_words
        )

    latest_question = ""

    for item in context or []:
        if not isinstance(item, dict):
            continue

        if str(item.get("role", "")).lower() in {
            "assistant", "model", "question"
        }:
            latest_question = str(item.get("content", ""))

    response_words = meaningful_words(original_text)
    question_words = meaningful_words(latest_question)
    question_lower = latest_question.lower()
    response_lower = original_text.lower()

    # Recognize valid computer-science specializations.
    cs_areas = [
        ("artificial intelligence", "artificial intelligence"),
        ("machine learning", "machine learning"),
        ("data science", "data science"),
        ("cybersecurity", "cybersecurity"),
        ("software engineering", "software engineering"),
        ("web development", "web development"),
        ("computer vision", "computer vision"),
        ("natural language processing", "natural language processing"),
        ("cloud computing", "cloud computing"),
        ("operating systems", "operating systems"),
        ("database", "database"),
        ("networking", "networking"),
        ("robotics", "robotics"),
        ("programming", "programming"),
    ]

    asks_for_cs_area = (
        any(term in question_lower for term in (
            "computer science", "computing"
        ))
        and any(term in question_lower for term in (
            "area", "field", "branch", "specialization",
            "specialisation", "domain"
        ))
    )

    mentioned_area = any(
        phrase in response_lower
        or (phrase == "artificial intelligence"
            and re.search(r"\bai\b", response_lower))
        or (phrase == "machine learning"
            and re.search(r"\bml\b", response_lower))
        for phrase, _ in cs_areas
    )

    if asks_for_cs_area and mentioned_area:
        # The response names a valid specialization.
        relevance_score = 90.0

    
    elif asks_for_cs_area and (
        "computer" in response_words
        or "computers" in response_words
        or "programming" in response_words
        or "software" in response_words
        or "coding" in response_words
        or "technology" in response_words
    ):
        # Related to computer science, but no clear specialization.
        relevance_score = 60.0


    elif question_words and response_words:
        overlap = response_words & question_words
        coverage = len(overlap) / len(question_words)

        if overlap:
            relevance_score = 40 + min(45, coverage * 100)
        else:
            relevance_score = 35.0

    elif not latest_question:
        relevance_score = 70.0

    else:
        relevance_score = 35.0

    relevance_score = round(
        max(0, min(100, relevance_score)), 2
    )


   
    # Overall score with an additional penalty for low relevance.
    overall_score = (
        vocabulary_score
        + clarity_score
        + grammar_score
        + relevance_score
    ) / 4

    if relevance_score < 40:
        overall_score -= 10
    elif relevance_score < 60:
        overall_score -= 5

    overall_score = round(
        max(0, min(100, overall_score)), 2
    )


    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "average_sentence_length": round(
            average_sentence_length, 2
        ),
        "vocabulary_score": round(vocabulary_score, 2),
        "clarity_score": round(clarity_score, 2),
        "grammar_score": round(grammar_score, 2),
        "relevance_score": relevance_score,
        "overall_score": overall_score
    }
