import React, { useState } from "react";
import { ProjectItem } from "../../../types/portfolio";
import { TagInput } from "../common/TagInput";
import { ToggleSwitch } from "../common/ToggleSwitch";
import { ConfirmModal } from "../common/ConfirmModal";
import { AssetPickerModal } from "../common/AssetPickerModal";

interface ProjectsTabProps {
  projects: ProjectItem[];
  onSaveProject: (project: Partial<ProjectItem>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  isSaving: boolean;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects,
  onSaveProject,
  onDeleteProject,
  isSaving,
}) => {
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  const startNewProject = () => {
    setEditingProject({
      slug: `project-${projects.length + 1}`,
      name: "New System Project",
      category: "SYSTEMS ARCHITECTURE",
      badge: "ACTIVE EXPERIMENT",
      tagline: "Architecture description and system objectives.",
      systems_specs: [],
      tech_stack_summary: "Python · TypeScript · SQLite",
      github_url: "https://github.com/rajwav",
      live_url: null,
      image_url: "/images/projects/01-raj-os.svg",
      display_order: projects.length + 1,
      is_enabled: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    await onSaveProject(editingProject);
    setEditingProject(null);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Engineering Archive (Projects)</h3>
            <p className="admin-card-subtitle">
              Manage horizontal pinning gallery projects, architectural subsystem specs, badges, and code links.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={startNewProject}
          >
            + Create New Project
          </button>
        </div>

        {editingProject && (
          <form onSubmit={handleSave} className="admin-card" style={{ background: "rgba(11, 8, 12, 0.9)", border: "1px solid #9353d3" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#ffffff" }}>
              {editingProject.id ? "Edit Project" : "New Project"}
            </h4>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="admin-field-label">Project Name</label>
                  <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>
                    {(editingProject.name || "").length}/100
                  </span>
                </div>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingProject.name || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="RAJ Assistant / RAJ OS"
                  maxLength={100}
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">URL Slug (a-z, 0-9, hyphen)</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingProject.slug || ""}
                  onChange={(e) => {
                    const formatted = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                    setEditingProject({ ...editingProject, slug: formatted });
                  }}
                  placeholder="raj-os"
                  pattern="^[a-z0-9-]+$"
                  required
                />
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <label className="admin-field-label">Category</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingProject.category || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                  placeholder="LOCAL-FIRST AI SYSTEM"
                  maxLength={60}
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Badge Tag</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingProject.badge || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, badge: e.target.value })}
                  placeholder="WORKING CORE"
                  maxLength={40}
                  required
                />
              </div>
            </div>

            <div className="admin-field-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="admin-field-label">Tagline / Overview Statement</label>
                <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>
                  {(editingProject.tagline || "").length}/300
                </span>
              </div>
              <textarea
                className="admin-field-textarea"
                style={{ minHeight: "70px" }}
                value={editingProject.tagline || ""}
                onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                placeholder="Personal AI designed around persistent memory..."
                minLength={5}
                maxLength={300}
                required
              />
            </div>

            <TagInput
              label="Architecture & Subsystem Specifications"
              tags={editingProject.systems_specs || []}
              onChange={(systems_specs) => setEditingProject({ ...editingProject, systems_specs })}
              placeholder="e.g. ▸ Memory: SQLite WAL Mode & FTS5"
              prefix="▸"
            />

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="admin-field-label">Tech Stack Summary Text</label>
                  <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>
                    {(editingProject.tech_stack_summary || "").length}/120
                  </span>
                </div>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingProject.tech_stack_summary || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, tech_stack_summary: e.target.value })}
                  placeholder="Python 3.11+ · SQLite · Multi-LLM · macOS"
                  maxLength={120}
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Display Order (Controls 01..06 Numbering)</label>
                <input
                  type="number"
                  className="admin-field-input"
                  value={editingProject.display_order ?? 0}
                  onChange={(e) => setEditingProject({ ...editingProject, display_order: parseInt(e.target.value, 10) || 0 })}
                  min={0}
                  required
                />
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <label className="admin-field-label">GitHub Repository URL</label>
                <input
                  type="url"
                  className="admin-field-input"
                  value={editingProject.github_url || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                  placeholder="https://github.com/rajwav/raj-assistant"
                  pattern="^https?://github\.com/.*"
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Live Demo URL (Optional)</label>
                <input
                  type="url"
                  className="admin-field-input"
                  value={editingProject.live_url || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value || null })}
                  placeholder="https://autonex-aqua-neon.onrender.com/"
                />
              </div>
            </div>

            <div className="admin-field-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <label className="admin-field-label">Project Image / Blueprint SVG URL</label>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                  onClick={() => setIsAssetPickerOpen(true)}
                >
                  📁 Select from Assets
                </button>
              </div>
              <input
                type="text"
                className="admin-field-input"
                value={editingProject.image_url || ""}
                onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                placeholder="/images/projects/01-raj-os.svg or Supabase Storage URL"
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <ToggleSwitch
                label="Project Active"
                checked={editingProject.is_enabled !== false}
                onChange={(checked) => setEditingProject({ ...editingProject, is_enabled: checked })}
              />

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingProject(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Project"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="admin-item-list">
          {projects.map((project, idx) => (
            <div key={project.id} className={`admin-item-card ${!project.is_enabled ? "disabled" : ""}`}>
              <div className="admin-item-top">
                <div className="admin-item-badges">
                  <span className="admin-order-badge">#{String(idx + 1).padStart(2, "0")} (Order: {project.display_order})</span>
                  <strong style={{ color: "#ffffff", fontSize: "1.05rem" }}>{project.name}</strong>
                  <span style={{ fontSize: "0.75rem", background: "rgba(147, 83, 211, 0.15)", color: "#c084fc", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                    {project.badge}
                  </span>
                </div>
                <div className="admin-item-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setEditingProject(project)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setDeleteTargetId(project.id || null)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#a8a8b2" }}>
                {project.tagline}
              </p>
              <div style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#8c8c94" }}>
                STACK: {project.tech_stack_summary}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Project"
        message="Are you sure you want to delete this project from the working database?"
        confirmLabel="Delete Project"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteTargetId) {
            await onDeleteProject(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        folder="projects"
        title="Select Project Blueprint SVG"
        onSelect={(url) => {
          if (editingProject) {
            setEditingProject({ ...editingProject, image_url: url });
          }
        }}
        onClose={() => setIsAssetPickerOpen(false)}
      />
    </div>
  );
};
