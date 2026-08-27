import React from "react";
import { WorkingState } from "../../services/adminService";
import { PortfolioReleasePayload } from "../../../types/portfolio";
import { AdminTab } from "../AdminSidebar";

interface OverviewTabProps {
  workingState: WorkingState;
  activeRelease: PortfolioReleasePayload;
  hasUnsavedChanges: boolean;
  onPublishClick: () => void;
  onNavigateTab: (tab: AdminTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  workingState,
  activeRelease,
  hasUnsavedChanges,
  onPublishClick,
  onNavigateTab,
}) => {
  const activeProjectsCount = workingState.projects.filter((p) => p.is_enabled).length;
  const activeTechCount = workingState.tech_stack.filter((t) => t.is_enabled).length;
  const activeLabCount = workingState.lab_modules.filter((l) => l.is_enabled).length;
  const activePathCount = workingState.path_milestones.filter((p) => p.is_enabled).length;

  return (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">System Status &amp; Release Control</h3>
            <p className="admin-card-subtitle">
              Monitor active deployment status and synchronize working draft changes.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-publish"
            onClick={onPublishClick}
          >
            ⚡ Publish Working State
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div
            style={{
              background: "rgba(11, 8, 12, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#8c8c94", textTransform: "uppercase" }}>
              Active Public Release
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#10b981", marginTop: "0.25rem" }}>
              Release v{activeRelease.version || 1}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#8c8c94", marginTop: "0.25rem" }}>
              Published: {new Date(activeRelease.published_at).toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: "rgba(11, 8, 12, 0.6)",
              border: `1px solid ${hasUnsavedChanges ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
              borderRadius: "8px",
              padding: "1.25rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#8c8c94", textTransform: "uppercase" }}>
              Working Draft Sync State
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: hasUnsavedChanges ? "#fbbf24" : "#34d399",
                marginTop: "0.25rem",
              }}
            >
              {hasUnsavedChanges ? "● Uncommitted Changes" : "✓ In Sync with Live Site"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#8c8c94", marginTop: "0.25rem" }}>
              {hasUnsavedChanges
                ? "Working table modifications pending publication."
                : "Public visitors see the exact working configuration."}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title" style={{ marginBottom: "1.25rem" }}>
          Portfolio Entities Summary
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div
            style={{
              background: "rgba(11, 8, 12, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "1rem",
              cursor: "pointer",
            }}
            onClick={() => onNavigateTab("projects")}
          >
            <div style={{ fontSize: "0.75rem", color: "#a8a8b2" }}>PROJECTS ARCHIVE</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ffffff", margin: "0.25rem 0" }}>
              {activeProjectsCount} <span style={{ fontSize: "0.85rem", color: "#8c8c94" }}>/ {workingState.projects.length}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9353d3" }}>Manage Projects →</div>
          </div>

          <div
            style={{
              background: "rgba(11, 8, 12, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "1rem",
              cursor: "pointer",
            }}
            onClick={() => onNavigateTab("tech")}
          >
            <div style={{ fontSize: "0.75rem", color: "#a8a8b2" }}>TECH DECALS</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ffffff", margin: "0.25rem 0" }}>
              {activeTechCount} <span style={{ fontSize: "0.85rem", color: "#8c8c94" }}>/ {workingState.tech_stack.length}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9353d3" }}>Manage Tech →</div>
          </div>

          <div
            style={{
              background: "rgba(11, 8, 12, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "1rem",
              cursor: "pointer",
            }}
            onClick={() => onNavigateTab("lab")}
          >
            <div style={{ fontSize: "0.75rem", color: "#a8a8b2" }}>THE LAB MODULES</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ffffff", margin: "0.25rem 0" }}>
              {activeLabCount} <span style={{ fontSize: "0.85rem", color: "#8c8c94" }}>/ {workingState.lab_modules.length}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9353d3" }}>Manage Lab →</div>
          </div>

          <div
            style={{
              background: "rgba(11, 8, 12, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "1rem",
              cursor: "pointer",
            }}
            onClick={() => onNavigateTab("path")}
          >
            <div style={{ fontSize: "0.75rem", color: "#a8a8b2" }}>PATH MILESTONES</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ffffff", margin: "0.25rem 0" }}>
              {activePathCount} <span style={{ fontSize: "0.85rem", color: "#8c8c94" }}>/ {workingState.path_milestones.length}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9353d3" }}>Manage Path →</div>
          </div>
        </div>
      </div>
    </div>
  );
};
