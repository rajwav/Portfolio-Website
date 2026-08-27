import React from "react";
import { useAuth } from "../context/useAuth";

export type AdminTab =
  | "overview"
  | "identity"
  | "about"
  | "lab"
  | "path"
  | "projects"
  | "tech"
  | "contact"
  | "assets"
  | "releases"
  | "audit";

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
  activeVersion: number;
}

const navItems: { id: AdminTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview & Health", icon: "📊" },
  { id: "identity", label: "Site Identity & Hero", icon: "⚡" },
  { id: "about", label: "About Section", icon: "📝" },
  { id: "lab", label: "The Lab Modules", icon: "🧪" },
  { id: "path", label: "The Path Milestones", icon: "🗺️" },
  { id: "projects", label: "Projects Archive", icon: "📁" },
  { id: "tech", label: "Tech Stack & Decals", icon: "⚙️" },
  { id: "contact", label: "Contact & Socials", icon: "💬" },
  { id: "assets", label: "Storage Assets", icon: "📦" },
  { id: "releases", label: "Releases & Rollback", icon: "🚀" },
  { id: "audit", label: "Security & Audit Log", icon: "🛡️" },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  activeVersion,
}) => {
  const { user } = useAuth();

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div className="admin-sidebar-header">
        <span className="admin-sys-tag">[SYS_ADMIN // v{activeVersion}]</span>
        <h1 className="admin-logo-title">Admin Dashboard</h1>
      </div>

      <ul className="admin-nav-list">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`admin-nav-item ${currentTab === item.id ? "active" : ""}`}
              onClick={() => {
                onSelectTab(item.id);
                onClose();
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <div>LOGGED IN AS</div>
          <div className="admin-user-email" title={user?.email || ""}>
            {user?.email || "Admin User"}
          </div>
        </div>
      </div>
    </aside>
  );
};
