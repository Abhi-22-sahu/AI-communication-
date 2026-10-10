import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mic,
  Brain,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(
            data.detail.map((error) => error.msg).join(", ")
          );
        }

        throw new Error(
          data.detail || "Login failed"
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      navigate("/dashboard");

    } catch (err) {
      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT SIDE */}
      <div className="register-showcase">

        <Link to="/" className="auth-brand">
          <div className="brand-icon">
            <Sparkles size={18} />
          </div>

          <span>
            Speak<span>AI</span>
          </span>
        </Link>

        <div className="showcase-content">

          <div className="showcase-badge">
            <Sparkles size={15} />
            AI-Powered Communication Coach
          </div>

          <h1>
            Welcome
            <br />
            <span>back to your</span>
            <br />
            growth.
          </h1>

          <p>
            Continue practicing, receive intelligent feedback,
            and track your communication improvement.
          </p>

          <div className="benefit-list">

            <div className="benefit-item">
              <div className="benefit-icon">
                <Mic size={19} />
              </div>

              <div>
                <strong>Practice with your voice</strong>
                <span>Improve fluency, pace and clarity.</span>
              </div>

              <CheckCircle2 size={17} />
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <Brain size={19} />
              </div>

              <div>
                <strong>Get AI-powered feedback</strong>
                <span>Understand your strengths and mistakes.</span>
              </div>

              <CheckCircle2 size={17} />
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <TrendingUp size={19} />
              </div>

              <div>
                <strong>Track your progress</strong>
                <span>See your communication improve over time.</span>
              </div>

              <CheckCircle2 size={17} />
            </div>

          </div>
        </div>

        <div className="showcase-bottom">
          <ShieldCheck size={17} />
          <span>Your data stays private and secure.</span>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="register-form-area">

        <div className="register-card">

          <div className="register-mobile-brand">
            <div className="brand-icon">
              <Sparkles size={18} />
            </div>

            <span>
              Speak<span>AI</span>
            </span>
          </div>

          <div className="register-heading">
            <h2>Welcome back</h2>

            <p>
              Log in to continue your communication journey.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="login-divider">
            <span>Don't have an account?</span>
          </div>

          <Link
            to="/register"
            className="login-outline-btn"
          >
            Create a SpeakAI Account
          </Link>

          <div className="register-trust">
            <CheckCircle2 size={15} />
            Secure authentication · Your data stays private
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;