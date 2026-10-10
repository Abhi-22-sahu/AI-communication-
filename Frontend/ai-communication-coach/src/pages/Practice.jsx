import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  Mic,
  BriefcaseBusiness,
  Users,
  ArrowRight,
  Send,
  CheckCircle2,
  Target,
  BookOpen,
  Lightbulb,
} from "lucide-react";

function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session");

  const [sessionType, setSessionType] = useState("conversation");
  const [scenario, setScenario] = useState("Daily Conversation");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  const [error, setError] = useState("");
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [latestFeedback, setLatestFeedback] = useState(null);

  const practiceModes = [
    {
      id: "conversation",
      title: "Conversation Practice",
      description: "Practice natural everyday conversations.",
      icon: MessageSquare,
    },
    {
      id: "speaking",
      title: "Speaking Practice",
      description: "Improve clarity, fluency and confidence.",
      icon: Mic,
    },
    {
      id: "interview",
      title: "Interview Coach",
      description: "Prepare for technical and HR interviews.",
      icon: BriefcaseBusiness,
    },
    {
      id: "professional",
      title: "Professional Communication",
      description: "Build stronger workplace communication.",
      icon: Users,
    },
  ];

  const scenarios = {
    conversation: [
      "Daily Conversation",
      "Self Introduction",
      "Meeting a New Person",
    ],
    speaking: [
      "Self Introduction",
      "Public Speaking",
      "Explain a Topic",
    ],
    interview: [
      "Job Interview",
      "Technical Interview",
      "HR Interview",
    ],
    professional: [
      "Professional Meeting",
      "Client Communication",
      "Team Discussion",
    ],
  };

  const selectedMode = practiceModes.find(
    (mode) => mode.id === sessionType
  );

  /*
   * Start a new session
   */
  const startSession = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setStarting(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_type: sessionType,
            scenario: scenario,
            input_type: "text",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.detail)
            ? data.detail.map((item) => item.msg).join(", ")
            : data.detail || "Failed to create session"
        );
      }

      navigate(`/practice?session=${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  /*
   * Send message to AI coach
   */
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !sessionId || loading) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    const userMessage = message.trim();

    setMessage("");
    setError("");
    setLoading(true);

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/sessions/${sessionId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: userMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.detail)
            ? data.detail.map((item) => item.msg).join(", ")
            : data.detail || "Failed to send message"
        );
      }

      setMessages((previous) => [
  ...previous,
  {
    role: "assistant",
    content:
      typeof data.assistant_message === "string"
        ? data.assistant_message
        : data.assistant_message.content,
  },
]);

      setLatestAnalysis(data.analysis);
      setLatestFeedback(data.feedback);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Complete current session
   */
  const completeSession = async () => {
    if (!sessionId || ending) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setEnding(true);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/sessions/${sessionId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to complete session");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnding(false);
    }
  };

  /*
   * SESSION SETUP SCREEN
   */
  if (!sessionId) {
    return (
      <div className="practice-page">

        <aside className="practice-sidebar">

          <div className="practice-brand">
            <div className="brand-icon">
              <Sparkles size={18} />
            </div>

            <span>
              Speak<span>AI</span>
            </span>
          </div>

          <nav className="practice-nav">
            <Link
              to="/dashboard"
              className="practice-nav-item"
            >
              Dashboard
            </Link>

            <Link
              to="/practice"
              className="practice-nav-item active"
            >
              Practice
            </Link>

            <Link
              to="/analysis"
              className="practice-nav-item"
            >
              Analysis
            </Link>
          </nav>

        </aside>

        <main className="practice-main">

          <div className="practice-header">
            <p className="practice-eyebrow">
              AI COMMUNICATION COACH
            </p>

            <h1>Let's practice.</h1>

            <p>
              Choose a practice mode and scenario to begin
              improving your communication skills.
            </p>
          </div>

          <section className="practice-section">

            <div className="section-heading">
              <h2>Choose your practice mode</h2>
              <span>1</span>
            </div>

            <div className="practice-mode-grid">

              {practiceModes.map((mode) => {
                const Icon = mode.icon;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    className={`practice-mode-card ${
                      sessionType === mode.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSessionType(mode.id);
                      setScenario(scenarios[mode.id][0]);
                    }}
                  >
                    <div className="practice-mode-icon">
                      <Icon size={21} />
                    </div>

                    <div className="practice-mode-content">
                      <h3>{mode.title}</h3>
                      <p>{mode.description}</p>
                    </div>

                    {sessionType === mode.id && (
                      <div className="practice-selected">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}

            </div>
          </section>

          <section className="practice-section">

            <div className="section-heading">
              <h2>Choose a scenario</h2>
              <span>2</span>
            </div>

            <div className="scenario-grid">

              {scenarios[sessionType].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`scenario-card ${
                    scenario === item ? "selected" : ""
                  }`}
                  onClick={() => setScenario(item)}
                >
                  <span>{item}</span>

                  {scenario === item && (
                    <span className="scenario-check">
                      ✓
                    </span>
                  )}
                </button>
              ))}

            </div>
          </section>

          <section className="practice-start-card">

            <div className="practice-start-info">

              <div className="practice-start-icon">
                {selectedMode &&
                  (() => {
                    const Icon = selectedMode.icon;
                    return <Icon size={22} />;
                  })()}
              </div>

              <div>
                <span>READY TO PRACTICE</span>

                <h3>{selectedMode?.title}</h3>

                <p>{scenario}</p>
              </div>

            </div>

            <button
              className="practice-start-button"
              onClick={startSession}
              disabled={starting}
            >
              {starting ? "Starting..." : "Start Session"}

              {!starting && <ArrowRight size={18} />}
            </button>

          </section>

          {error && (
            <div className="practice-error">
              {error}
            </div>
          )}

        </main>
      </div>
    );
  }

  /*
   * ACTIVE AI CHAT SCREEN
   */
  return (
    <div className="practice-page">

      <aside className="practice-sidebar">

        <div className="practice-brand">
          <div className="brand-icon">
            <Sparkles size={18} />
          </div>

          <span>
            Speak<span>AI</span>
          </span>
        </div>

        <nav className="practice-nav">

          <Link
            to="/dashboard"
            className="practice-nav-item"
          >
            Dashboard
          </Link>

          <Link
            to="/practice"
            className="practice-nav-item active"
          >
            Practice
          </Link>

          <Link
            to="/analysis"
            className="practice-nav-item"
          >
            Analysis
          </Link>

        </nav>

      </aside>


      <main className="practice-chat-main">

        {/* CHAT HEADER */}

        <div className="practice-chat-header">

          <div>

            <p className="practice-eyebrow">
              ACTIVE PRACTICE SESSION
            </p>

            <h1>{scenario}</h1>

            <p>
              {selectedMode?.title || "Communication Practice"}
            </p>

          </div>

          <button
            className="end-session-button"
            onClick={completeSession}
            disabled={ending}
          >
            <CheckCircle2 size={17} />

            {ending ? "Ending..." : "End Session"}
          </button>

        </div>


        {/* CHAT + ANALYSIS */}

        <div className="practice-chat-layout">

          {/* CHAT */}

          <section className="chat-panel">

            <div className="chat-panel-header">

              <div className="ai-avatar">
                <Sparkles size={18} />
              </div>

              <div>
                <strong>SpeakAI Coach</strong>
                <span>AI Communication Coach</span>
              </div>

              <div className="ai-online">
                <span></span>
                Online
              </div>

            </div>


            <div className="chat-messages">

              {messages.length === 0 && (
                <div className="chat-welcome">

                  <div className="chat-welcome-icon">
                    <Sparkles size={25} />
                  </div>

                  <h2>Let's get started.</h2>

                  <p>
                    Introduce yourself or respond to the
                    scenario. I'll guide the conversation
                    and analyze your communication.
                  </p>

                </div>
              )}

              {messages.map((item, index) => (

                <div
                  key={index}
                  className={`chat-message ${
                    item.role === "user"
                      ? "user-message"
                      : "ai-message"
                  }`}
                >

                  <div className="message-avatar">

                    {item.role === "user" ? (
                      "You"
                    ) : (
                      <Sparkles size={15} />
                    )}

                  </div>

                  <div className="message-bubble">
                  {typeof item.content === "string"
                  ? item.content
                  : item.content?.content || "Unable to display message."}
                  </div>

                </div>

              ))}

              {loading && (
                <div className="chat-message ai-message">

                  <div className="message-avatar">
                    <Sparkles size={15} />
                  </div>

                  <div className="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                </div>
              )}

            </div>


            {/* MESSAGE INPUT */}

            <form
              className="chat-input-area"
              onSubmit={sendMessage}
            >

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your response..."
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading || !message.trim()}
              >
                <Send size={18} />
              </button>

            </form>

          </section>


          {/* ANALYSIS */}

          <aside className="live-analysis-panel">

            <div className="live-analysis-header">

              <div>
                <span>LIVE ANALYSIS</span>
                <h2>Your Performance</h2>
              </div>

              <Target size={20} />

            </div>


            {latestAnalysis ? (
              <>

                <div className="overall-score">

                  <span>OVERALL SCORE</span>

                  <strong>
                    {latestAnalysis.overall_score}
                  </strong>

                  <small>/100</small>

                </div>


                <div className="analysis-metrics">

                  <div>
                    <span>Grammar</span>
                    <strong>
                      {latestAnalysis.grammar_score}
                    </strong>
                  </div>

                  <div>
                    <span>Clarity</span>
                    <strong>
                      {latestAnalysis.clarity_score}
                    </strong>
                  </div>

                  <div>
                    <span>Vocabulary</span>
                    <strong>
                      {latestAnalysis.vocabulary_score}
                    </strong>
                  </div>

                  <div>
                    <span>Relevance</span>
                    <strong>
                      {latestAnalysis.relevance_score}
                    </strong>
                  </div>

                </div>


                {latestFeedback && (
                  <div className="feedback-section">

                    <div className="feedback-title">
                      <Lightbulb size={16} />
                      Feedback
                    </div>

                    {latestFeedback.strengths?.length > 0 && (
                      <div className="feedback-group">

                        <span>Strengths</span>

                        {latestFeedback.strengths.map(
                          (item, index) => (
                            <p key={index}>
                              ✓ {item}
                            </p>
                          )
                        )}

                      </div>
                    )}


                    {latestFeedback.areas_to_improve?.length > 0 && (
                      <div className="feedback-group">

                        <span>Improve</span>

                        {latestFeedback.areas_to_improve.map(
                          (item, index) => (
                            <p key={index}>
                              • {item}
                            </p>
                          )
                        )}

                      </div>
                    )}


                    {latestFeedback.suggestions?.length > 0 && (
                      <div className="feedback-group">

                        <span>Suggestion</span>

                        {latestFeedback.suggestions.map(
                          (item, index) => (
                            <p key={index}>
                              {item}
                            </p>
                          )
                        )}

                      </div>
                    )}

                  </div>
                )}

              </>
            ) : (
              <div className="analysis-empty">

                <div>
                  <BookOpen size={22} />
                </div>

                <h3>Your analysis will appear here</h3>

                <p>
                  Send your first response and the AI
                  coach will analyze your communication.
                </p>

              </div>
            )}

          </aside>

        </div>


        {error && (
          <div className="practice-error">
            {error}
          </div>
        )}

      </main>

    </div>
  );
}

export default Practice;