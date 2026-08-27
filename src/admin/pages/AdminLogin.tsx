import React, { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/AdminLogin.css";

const AdminLogin = () => {
  const { user, isAdmin, signIn, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/admin";

  // If already authenticated and verified as admin, redirect to target
  if (!authLoading && user && isAdmin) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMessage(error.message || "Failed to authenticate.");
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMessage((err as Error).message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-sys-tag">[SYS_AUTH // PRIVATE CORE]</span>
          <h1>Admin Control System</h1>
          <p>Authenticate with your administrative credentials to manage portfolio state.</p>
        </div>

        {errorMessage && (
          <div className="admin-login-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="theraj.wav@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting ? "AUTHENTICATING..." : "SIGN IN TO DASHBOARD →"}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" className="admin-back-link">
            ← Return to Portfolio
          </a>
          <span className="admin-security-meta">SEC_LVL // 05</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
