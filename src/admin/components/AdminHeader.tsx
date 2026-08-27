import React from "react";
import { useAuth } from "../context/useAuth";

interface AdminHeaderProps {
  currentTab: string;
  hasUnsavedChanges: boolean;
  pendingDiffsCount: number;
  activeVersion: number;
  onPublishClick: () => void;
  onReviewDiffsClick: () => void;
  onPreviewClick: () => void;
  onToggleSidebar: () => void;
  isPublishing: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  hasUnsavedChanges,
  pendingDiffsCount,
  activeVersion,
  onPublishClick,
  onReviewDiffsClick,
  onPreviewClick,
  onToggleSidebar,
  isPublishing,
}) => {
  const { signOut } = useAuth();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "overview": return "Overview & System Health";
      case "identity": return "Site Identity & Hero";
      case "about": return "About Section";
      case "lab": return "The Lab Modules";
      case "path": return "The Path Milestones";
      case "projects": return "Engineering Archive (Projects)";
      case "tech": return "Tools of the Trade (Tech Stack)";
      case "contact": return "Contact & Social Profiles";
      case "assets": return "Storage & Asset Manager";
      case "releases": return "Release History & Rollback";
      case "audit": return "Security & Audit Log";
      default: return "Dashboard";
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <h2 className="admin-page-title">{getTabTitle(currentTab)}</h2>
      </div>

      <div className="admin-header-right">
        {hasUnsavedChanges ? (
          <button
            type="button"
            className="admin-draft-pill admin-draft-pending"
            style={{ cursor: "pointer", border: "none", background: "none" }}
            onClick={onReviewDiffsClick}
            title="Click to inspect field-level changes"
          >
            ● {pendingDiffsCount} PENDING CHANGES [REVIEW]
          </button>
        ) : (
          <div className="admin-draft-pill admin-draft-synced">
            ✓ RELEASE v{activeVersion} LIVE
          </div>
        )}

        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={onPreviewClick}
          title="Open Sandboxed Draft Preview (Cmd+K)"
        >
          👁️ Preview Draft
        </button>

        <button
          type="button"
          className="admin-btn admin-btn-publish"
          onClick={onPublishClick}
          disabled={isPublishing}
          title="Publish New Release"
        >
          {isPublishing ? "Publishing..." : "⚡ Publish Release"}
        </button>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-btn admin-btn-secondary"
          style={{ textDecoration: "none" }}
          title="View Active Public Site"
        >
          Public Site ↗
        </a>

        <button
          type="button"
          className="admin-btn admin-btn-danger"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
