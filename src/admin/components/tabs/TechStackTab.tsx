import React, { useState } from "react";
import { TechStackItem } from "../../../types/portfolio";
import { ToggleSwitch } from "../common/ToggleSwitch";
import { ConfirmModal } from "../common/ConfirmModal";
import { AssetPickerModal } from "../common/AssetPickerModal";

interface TechStackTabProps {
  techStack: TechStackItem[];
  onSaveTechItem: (item: Partial<TechStackItem>) => Promise<void>;
  onDeleteTechItem: (id: string) => Promise<void>;
  isSaving: boolean;
}

export const TechStackTab: React.FC<TechStackTabProps> = ({
  techStack,
  onSaveTechItem,
  onDeleteTechItem,
  isSaving,
}) => {
  const [editingItem, setEditingItem] = useState<Partial<TechStackItem> | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  const startNewItem = () => {
    setEditingItem({
      tech_slug: `tech-${techStack.length + 1}`,
      display_name: "TECHNOLOGY NAME",
      decal_url: "/images/tech/python.svg",
      display_order: techStack.length + 1,
      is_enabled: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    await onSaveTechItem(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Tools of the Trade (Tech Stack)</h3>
            <p className="admin-card-subtitle">
              Manage 3D physics decal spheres, legend pills, and ordering in the core environment.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={startNewItem}
          >
            + Create New Tech Item
          </button>
        </div>

        {editingItem && (
          <form onSubmit={handleSave} className="admin-card" style={{ background: "rgba(11, 8, 12, 0.9)", border: "1px solid #9353d3" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#ffffff" }}>
              {editingItem.id ? "Edit Tech Item" : "New Tech Item"}
            </h4>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="admin-field-label">Display Name (Legend Pill)</label>
                  <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>
                    {(editingItem.display_name || "").length}/40
                  </span>
                </div>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingItem.display_name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, display_name: e.target.value })}
                  placeholder="PYTHON 3.11+"
                  maxLength={40}
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Tech Slug (Unique Key)</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingItem.tech_slug || ""}
                  onChange={(e) => {
                    const formatted = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                    setEditingItem({ ...editingItem, tech_slug: formatted });
                  }}
                  placeholder="python"
                  pattern="^[a-z0-9-]+$"
                  required
                />
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                  <label className="admin-field-label">Decal Texture SVG URL</label>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                    onClick={() => setIsAssetPickerOpen(true)}
                  >
                    📁 Select from /tech
                  </button>
                </div>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingItem.decal_url || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, decal_url: e.target.value })}
                  placeholder="/images/tech/python.svg or Supabase Storage URL"
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Display Order</label>
                <input
                  type="number"
                  className="admin-field-input"
                  value={editingItem.display_order ?? 0}
                  onChange={(e) => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value, 10) || 0 })}
                  min={0}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <ToggleSwitch
                label="Item Active"
                checked={editingItem.is_enabled !== false}
                onChange={(checked) => setEditingItem({ ...editingItem, is_enabled: checked })}
              />

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Tech Item"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="admin-item-list">
          {techStack.map((item) => (
            <div key={item.id} className={`admin-item-card ${!item.is_enabled ? "disabled" : ""}`}>
              <div className="admin-item-top">
                <div className="admin-item-badges">
                  <span className="admin-order-badge">#{item.display_order}</span>
                  <strong style={{ color: "#ffffff", fontSize: "1rem" }}>{item.display_name}</strong>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#8c8c94" }}>({item.tech_slug})</span>
                </div>
                <div className="admin-item-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setEditingItem(item)}
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
              <div style={{ fontSize: "0.78rem", color: "#a8a8b2", fontFamily: "monospace" }}>
                Decal: {item.decal_url}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Tech Item"
        message="Are you sure you want to delete this technology from the working environment?"
        confirmLabel="Delete Item"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteTargetId) {
            await onDeleteTechItem(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        folder="tech"
        title="Select Tech Decal SVG"
        onSelect={(url) => {
          if (editingItem) {
            setEditingItem({ ...editingItem, decal_url: url });
          }
        }}
        onClose={() => setIsAssetPickerOpen(false)}
      />
    </div>
  );
};
