
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please log in first.");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/sessions/progress/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load progress");
        }

        setProgress(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      }
    };

    fetchProgress();
  }, []);

  if (error) {
    return (
      <main className="dashboard-page">
        <h1>Dashboard</h1>
        <p>{error}</p>
        <Link to="/login">Go to Login</Link>
      </main>
    );
  }

  if (!progress) {
    return (
      <main className="dashboard-page">
        <h1>Loading dashboard...</h1>
      </main>
    );
  }

  const stats = [
    { label: "Total Sessions", value: progress.total_sessions },
    { label: "Completed Sessions", value: progress.completed_sessions },
    { label: "Average Score", value: `${progress.average_score ?? 0}/100` },
    { label: "Best Score", value: `${progress.best_score ?? 0}/100` },
    { label: "Latest Score", value: `${progress.latest_score ?? 0}/100` },
  ];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">YOUR LEARNING SPACE</p>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's your communication progress.</p>
        </div>
      </header>

      <section className="dashboard-stats">
        {stats.map((stat) => (
          <article className="dashboard-stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <h2>{stat.value ?? 0}</h2>
          </article>
        ))}
      </section>

      <section className="dashboard-actions">
        <div>
          <h2>Ready to improve?</h2>
          <p>Practice your communication skills and track your progress.</p>
        </div>

        <div className="dashboard-action-links">
          <Link to="/practice" className="dashboard-practice-button">
            Start Practice
          </Link>

          <Link to="/analysis" className="dashboard-analysis-button">
            View Analysis
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
