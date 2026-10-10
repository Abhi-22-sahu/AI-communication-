import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <Sparkles size={18} />
        </div>

        <span>
          Speak<span>AI</span>
        </span>
      </Link>

      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <a href="#about">About</a>
      </div>

      <div className="nav-actions">
        <Link to="/login" className="login-link">
          Log in
        </Link>

        <Link to="/dashboard" className="primary-btn small">
          Get Started
          <ArrowRight size={15} />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;