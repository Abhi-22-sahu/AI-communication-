import { Link } from "react-router-dom";
import {
  ArrowRight,
  Mic,
  Brain,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Play,
} from "lucide-react";
import Navbar from "../components/Navbar";

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            AI-Powered Communication Coach
          </div>

          <h1>
            Speak Better.
            <br />
            <span>Communicate Smarter.</span>
          </h1>

          <p>
            Improve your speaking skills with AI-powered voice analysis,
            personalized feedback, and intelligent practice sessions.
          </p>

          <div className="hero-buttons">
            <Link to="/practice" className="primary-btn">
              Start Practicing
              <ArrowRight size={18} />
            </Link>

            <Link to="/dashboard" className="secondary-btn">
              <Play size={17} />
              Explore Dashboard
            </Link>
          </div>

          <div className="hero-trust">
            <CheckCircle2 size={16} />
            <span>Practice smarter. Improve faster.</span>
          </div>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="hero-preview">
          <div className="preview-header">
            <div>
              <span className="preview-label">COMMUNICATION HEALTH</span>
              <h3>Great progress, Agrim 👋</h3>
            </div>

            <div className="live-dot">
              <span></span>
              AI Active
            </div>
          </div>

          <div className="score-section">
            <div className="score-circle">
              <strong>82</strong>
              <span>/100</span>
            </div>

            <div className="score-info">
              <h4>Excellent Progress</h4>
              <p>
                Your communication skills improved by{" "}
                <b>12%</b> this month.
              </p>
            </div>
          </div>

          <div className="preview-stats">
            <div>
              <span>Fluency</span>
              <strong>89%</strong>
              <small>↑ 8%</small>
            </div>

            <div>
              <span>Clarity</span>
              <strong>81%</strong>
              <small>↑ 6%</small>
            </div>

            <div>
              <span>Vocabulary</span>
              <strong>76%</strong>
              <small>↑ 11%</small>
            </div>
          </div>

          <div className="mini-chart">
            <div className="chart-title">
              <span>Performance</span>
              <span>Last 7 sessions</span>
            </div>

            <div className="chart-bars">
              <i style={{ height: "38%" }}></i>
              <i style={{ height: "52%" }}></i>
              <i style={{ height: "45%" }}></i>
              <i style={{ height: "67%" }}></i>
              <i style={{ height: "60%" }}></i>
              <i style={{ height: "78%" }}></i>
              <i style={{ height: "90%" }}></i>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="workflow" id="how-it-works">
        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>Speak → Analyze → Improve</h2>
          <p>
            Your personal AI communication coach helps you improve every
            time you practice.
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="step-number">01</div>

            <div className="workflow-icon">
              <Mic size={24} />
            </div>

            <h3>Speak</h3>

            <p>
              Record your answer and practice real-world communication
              scenarios.
            </p>
          </div>

          <div className="workflow-card active-card">
            <div className="step-number">02</div>

            <div className="workflow-icon">
              <Brain size={24} />
            </div>

            <h3>Analyze</h3>

            <p>
              AI analyzes your speech, transcript, fluency, grammar,
              clarity and filler words.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number">03</div>

            <div className="workflow-icon">
              <BarChart3 size={24} />
            </div>

            <h3>Improve</h3>

            <p>
              Get personalized feedback and track your communication
              improvement over time.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-heading">
          <span>POWERFUL FEATURES</span>
          <h2>Everything you need to speak with confidence</h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Mic size={22} />
            </div>

            <h3>Voice Analysis</h3>

            <p>
              Track speaking pace, WPM, pauses, filler words and speech
              clarity.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Brain size={22} />
            </div>

            <h3>AI Feedback</h3>

            <p>
              Receive personalized suggestions to improve grammar,
              vocabulary and communication.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <BarChart3 size={22} />
            </div>

            <h3>Progress Tracking</h3>

            <p>
              Monitor your scores, streaks, goals and improvement across
              every practice session.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div>
          <Sparkles size={26} />

          <h2>Ready to improve your communication?</h2>

          <p>
            Start your first AI-powered practice session today.
          </p>

          <Link to="/practice" className="primary-btn">
            Start Practicing
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={16} />
          </div>

          <span>
            Speak<span>AI</span>
          </span>
        </div>

        <p>AI-powered communication coaching for everyone.</p>

        <span>© 2026 SpeakAI</span>
      </footer>
    </div>
  );
}

export default Landing;