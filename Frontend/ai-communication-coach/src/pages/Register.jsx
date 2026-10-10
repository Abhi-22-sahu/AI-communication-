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

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    goal: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const name = `${form.firstName} ${form.lastName}`.trim();

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          throw new Error(
            data.detail
              .map((error) => error.msg)
              .join(", ")
          );
        }

        throw new Error(
          data.detail || "Registration failed"
        );
      }

      navigate("/login");

    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to the server."
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
            Your voice.
            <br />
            <span>Your confidence.</span>
            <br />
            Your growth.
          </h1>

          <p>
            Practice real conversations, get intelligent feedback,
            and build communication skills that make a difference.
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
            <h2>Create your account</h2>

            <p>
              Start your communication improvement journey today.
            </p>
          </div>

          <form onSubmit={handleRegister}>

            <div className="form-row">

              <div className="form-group">
                <label>First Name</label>

                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Agrim"
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>

                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Jain"
                  required
                />
              </div>

            </div>

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
                placeholder="Create a strong password"
                minLength={8}
                required
              />

              <div className="password-hint">
                Use at least 8 characters
              </div>
            </div>

            <div className="form-group">
              <label>What do you want to improve?</label>

              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select your primary goal
                </option>

                <option>English Fluency</option>
                <option>Interview Preparation</option>
                <option>Professional Communication</option>
                <option>Public Speaking</option>
                <option>Confidence & Clarity</option>
              </select>
            </div>

            <label className="terms-check">
              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the{" "}
                <a href="#terms">Terms of Service</a>{" "}
                and{" "}
                <a href="#privacy">Privacy Policy</a>.
              </span>
            </label>

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
              {loading
                ? "Creating Account..."
                : "Create Free Account"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="login-divider">
            <span>Already have an account?</span>
          </div>

          <Link
            to="/login"
            className="login-outline-btn"
          >
            Log in to SpeakAI
          </Link>

          <div className="register-trust">
            <CheckCircle2 size={15} />
            Free to get started · No credit card required
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;