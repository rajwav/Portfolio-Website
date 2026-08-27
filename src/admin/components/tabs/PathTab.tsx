import React, { useState } from "react";
import { PathMilestoneItem } from "../../../types/portfolio";
import { ToggleSwitch } from "../common/ToggleSwitch";
import { ConfirmModal } from "../common/ConfirmModal";

interface PathTabProps {
  milestones: PathMilestoneItem[];
  onSaveMilestone: (milestone: Partial<PathMilestoneItem>) => Promise<void>;
  onDeleteMilestone: (id: string) => Promise<void>;
  isSaving: boolean;
}

export const PathTab: React.FC<PathTabProps> = ({
  milestones,
  onSaveMilestone,
  onDeleteMilestone,
  isSaving,
}) => {
  const [editingMilestone, setEditingMilestone] = useState<Partial<PathMilestoneItem> | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const startNewMilestone = () => {
    setEditingMilestone({
      year: new Date().getFullYear().toString(),
      title: "NEW MILESTONE",
      organization: "Role / Organization",
      description: "",
      context_chip: "EVOLUTION",
      display_order: milestones.length + 1,
      is_enabled: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;
    await onSaveMilestone(editingMilestone);
    setEditingMilestone(null);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">The Path Milestones</h3>
            <p className="admin-card-subtitle">
              Manage vertical timeline milestones, roles, conceptual foundations, and descriptions.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={startNewMilestone}
          >
            + Create New Milestone
          </button>
        </div>

        {editingMilestone && (
          <form onSubmit={handleSave} className="admin-card" style={{ background: "rgba(11, 8, 12, 0.9)", border: "1px solid #9353d3" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#ffffff" }}>
              {editingMilestone.id ? "Edit Milestone" : "New Milestone"}
            </h4>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <label className="admin-field-label">Milestone Year / Timeframe</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingMilestone.year || ""}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, year: e.target.value })}
                  placeholder="2026"
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Context Chip</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingMilestone.context_chip || ""}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, context_chip: e.target.value })}
                  placeholder="CURRENT FOCUS"
                  required
                />
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <label className="admin-field-label">Milestone Title</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingMilestone.title || ""}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  placeholder="BUILDING & EXPERIMENTING"
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Organization / Context</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingMilestone.organization || ""}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, organization: e.target.value })}
                  placeholder="VSSUT Burla · B.Tech CSE"
                  required
                />
              </div>
            </div>

            <div className="admin-field-group">
              <label className="admin-field-label">Milestone Narrative Description</label>
              <textarea
                className="admin-field-textarea"
                value={editingMilestone.description || ""}
                onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                placeholder="Describe milestone achievements..."
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <ToggleSwitch
                label="Milestone Active"
                checked={editingMilestone.is_enabled !== false}
                onChange={(checked) => setEditingMilestone({ ...editingMilestone, is_enabled: checked })}
              />

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingMilestone(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Milestone"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="admin-item-list">
          {milestones.map((item) => (
            <div key={item.id} className={`admin-item-card ${!item.is_enabled ? "disabled" : ""}`}>
              <div className="admin-item-top">
                <div className="admin-item-badges">
                  <span className="admin-order-badge">{item.year}</span>
                  <strong style={{ color: "#ffffff", fontSize: "1rem" }}>{item.title}</strong>
                  <span style={{ fontSize: "0.75rem", color: "#8c8c94" }}>{item.organization}</span>
                </div>
                <div className="admin-item-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setEditingMilestone(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setDeleteTargetId(item.id || null)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#a8a8b2", lineHeight: 1.4 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Milestone"
        message="Are you sure you want to delete this milestone from the working database?"
        confirmLabel="Delete Milestone"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteTargetId) {
            await onDeleteMilestone(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
