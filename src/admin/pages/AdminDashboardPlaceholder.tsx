import { useAuth } from "../context/useAuth";
import { usePortfolioData } from "../../context/usePortfolioData";
import { useNavigate } from "react-router-dom";

const AdminDashboardPlaceholder = () => {
  const { user, signOut } = useAuth();
  const { data } = usePortfolioData();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b080c",
        color: "#dedee0",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          backgroundColor: "rgba(21, 18, 24, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            paddingBottom: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#9353d3",
                marginBottom: "0.25rem",
                letterSpacing: "0.1em",
              }}
            >
              [SYS_CORE // ADMIN CONTROL SYSTEM]
            </div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", color: "#ffffff" }}>
              Admin Dashboard
            </h1>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#a8a8b2",
                textDecoration: "none",
                fontSize: "0.85rem",
                padding: "0.5rem 0.8rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
              }}
            >
              View Public Site ↗
            </a>
            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div
            style={{
              backgroundColor: "rgba(11, 8, 12, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#8c8c94", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Active Session
            </div>
            <div style={{ fontSize: "1rem", color: "#ffffff", fontWeight: 600, marginTop: "0.35rem" }}>
              {user?.email || "Unknown"}
            </div>
            <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#9353d3", marginTop: "0.25rem" }}>
              UID: {user?.id}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(11, 8, 12, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#8c8c94", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Current Release
            </div>
            <div style={{ fontSize: "1rem", color: "#10b981", fontWeight: 600, marginTop: "0.35rem" }}>
              Release v{data.version || 1} (Active)
            </div>
            <div style={{ fontSize: "0.75rem", color: "#8c8c94", marginTop: "0.25rem" }}>
              Published: {new Date(data.published_at).toLocaleString()}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(11, 8, 12, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#8c8c94", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Authorization Status
            </div>
            <div style={{ fontSize: "1rem", color: "#9353d3", fontWeight: 600, marginTop: "0.35rem" }}>
              is_admin() Verified
            </div>
            <div style={{ fontSize: "0.75rem", color: "#8c8c94", marginTop: "0.25rem" }}>
              Full Management Privileges
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "rgba(147, 83, 211, 0.08)",
            border: "1px dashed rgba(147, 83, 211, 0.3)",
            borderRadius: "8px",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#ffffff", fontSize: "1.1rem" }}>
            Phase 4 Security &amp; Routing Operational
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#a8a8b2", maxWidth: "600px", marginInline: "auto" }}>
            The admin authentication state, route guard, and is_admin() verification are functioning. The full multi-tab editing dashboard, form managers, asset uploader, and atomic release publisher will be constructed in Phase 5.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPlaceholder;
