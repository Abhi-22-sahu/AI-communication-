
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  Target,
  BookOpen,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

function Analysis() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");
      setDetail(null);

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please log in to view your analysis.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        if (sessionId) {
          const response = await fetch(
            `${API}/api/sessions/${sessionId}/analysis`,
            { headers }
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail || "Unable to load session analysis.");
          }

          if (!cancelled) setDetail(data);
        } else {
          const [summaryResponse, sessionsResponse] = await Promise.all([
            fetch(`${API}/api/sessions/progress/summary`, { headers }),
            fetch(`${API}/api/sessions`, { headers }),
          ]);

          if (!summaryResponse.ok || !sessionsResponse.ok) {
            throw new Error("Unable to load your analysis.");
          }

          const summaryData = await summaryResponse.json();
          const sessionsData = await sessionsResponse.json();

          if (!cancelled) {
            setSummary(summaryData);
            setSessions(
              Array.isArray(sessionsData)
                ? sessionsData
                : sessionsData.sessions || []
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return <main className="analysis-page">Loading analysis...</main>;
  }

  if (error) {
    return (
      <main className="analysis-page">
        <p>{error}</p>
        <Link to="/analysis">Back to Analysis</Link>
        {" · "}
        <Link to="/login">Login</Link>
      </main>
    );
  }

  const scoreFields = [
    { label: "Overall", key: "overall_score" },
    { label: "Grammar", key: "grammar_score" },
    { label: "Clarity", key: "clarity_score" },
    { label: "Vocabulary", key: "vocabulary_score" },
    { label: "Relevance", key: "relevance_score" },
  ];

  if (sessionId && detail) {
    const analyses = detail.analyses || [];

    return (
      <main className="analysis-page">
        <header className="analysis-header">
          <Link to="/analysis" className="analysis-back">
            <ArrowLeft size={18} /> All Analysis
          </Link>
          <h1>Session Analysis</h1>
          <p>
            {detail.scenario || detail.session_type} · Session #
            {detail.session_id}
          </p>
        </header>

        <section className="analysis-detail-summary">
          <div>
            <span>Session Score</span>
            <h2>
              {detail.overall_score == null
                ? "—"
                : `${Math.round(Number(detail.overall_score))}%`}
            </h2>
          </div>
          <div>
            <span>Status</span>
            <h2 className="analysis-status-value">
              {detail.status || "Unknown"}
            </h2>
          </div>
          <div>
            <span>Messages Analyzed</span>
            <h2>{analyses.length}</h2>
          </div>
        </section>

        <section className="analysis-section">
          <h2>Message-by-Message Results</h2>

          {analyses.length > 0 ? (
            <div className="analysis-detail-list">
              {analyses.map((item, index) => (
                <article
                  className="analysis-detail-card"
                  key={item.message_id ?? index}
                >
                  <div className="analysis-detail-card-header">
                    <h3>Response {index + 1}</h3>
                    <span>
                      {item.analyzed_at
                        ? new Date(item.analyzed_at).toLocaleString()
                        : "Time unavailable"}
                    </span>
                  </div>

                  <p className="analysis-original-message">{item.message}</p>

                  <div className="analysis-message-stats">
                    <span>Words: {item.word_count}</span>
                    <span>Sentences: {item.sentence_count}</span>
                    <span>
                      Average sentence length:{" "}
                      {Number(item.average_sentence_length || 0).toFixed(1)}
                    </span>
                  </div>

                  <div className="analysis-detail-scores">
                    {scoreFields.map(({ label, key }) => {
                      const value = item[key];
                      const score = Math.max(
                        0,
                        Math.min(100, Number(value) || 0)
                      );

                      return (
                        <div className="analysis-detail-score" key={key}>
                          <div className="analysis-detail-score-label">
                            <span>{label}</span>
                            <strong>
                              {value == null
                                ? "—"
                                : `${Math.round(score)}%`}
                            </strong>
                          </div>
                          <div className="analysis-score-track">
                            <div
                              className="analysis-score-fill"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="analysis-empty">
              No message analysis is available for this session.
            </p>
          )}
        </section>

        <Link to="/practice" className="analysis-practice-link">
          <RefreshCw size={18} /> Start a new practice session
        </Link>
      </main>
    );
  }

  const metrics = [
    { label: "Overall Score", value: summary?.average_score, icon: TrendingUp },
    { label: "Best Score", value: summary?.best_score, icon: Target },
    { label: "Latest Score", value: summary?.latest_score, icon: MessageSquare },
    {
      label: "Completed Sessions",
      value: summary?.completed_sessions,
      icon: BookOpen,
    },
  ];

  const scoreTrend = summary?.score_trend || [];

  return (
    <main className="analysis-page">
      <header className="analysis-header">
        <Link to="/dashboard" className="analysis-back">
          <ArrowLeft size={18} /> Dashboard
        </Link>
        <h1>Communication Analysis</h1>
        <p>Track your practice and monitor your progress.</p>
      </header>

      <section className="analysis-stats">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article className="analysis-stat-card" key={label}>
            <Icon size={22} />
            <p>{label}</p>
            <h2>
              {value == null
                ? "—"
                : label === "Completed Sessions"
                  ? value
                  : `${Math.round(Number(value))}%`}
            </h2>
          </article>
        ))}
      </section>

      <section className="analysis-section">
        <h2>Score History</h2>

        {scoreTrend.length > 0 ? (
          <div className="analysis-history">
            {scoreTrend.map((item, index) => (
              <article
                className="analysis-history-item"
                key={item.session_id ?? index}
              >
                <div>
                  <strong>Practice Session {index + 1}</strong>
                  <p>
                    {item.date
                      ? new Date(item.date).toLocaleDateString()
                      : "Date unavailable"}
                  </p>
                </div>
                <div className="analysis-score">
                  <span>{item.score}%</span>
                  <div className="analysis-score-track">
                    <div
                      className="analysis-score-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, Number(item.score) || 0)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="analysis-empty">No scores recorded yet.</p>
        )}
      </section>

      <section className="analysis-section">
        <h2>Practice Sessions</h2>

        {sessions.length > 0 ? (
          <div className="analysis-session-list">
            {sessions.map((session, index) => (
              <article
                className="analysis-session-item"
                key={session.id ?? index}
              >
                <div>
                  <strong>
                    {session.scenario ||
                      session.session_type ||
                      `Session ${index + 1}`}
                  </strong>
                  <p>{session.session_type || "Practice"}</p>
                </div>

                <div className="analysis-session-actions">
                  <span className="analysis-session-status">
                    {session.status || "Unknown"}
                  </span>
                  <Link
                    to={`/analysis?session=${session.id}`}
                    className="analysis-view-button"
                  >
                    View Analysis
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="analysis-empty">No practice sessions found.</p>
        )}
      </section>

      <Link to="/practice" className="analysis-practice-link">
        <RefreshCw size={18} /> Start a new practice session
      </Link>
    </main>
  );
}

export default Analysis;
