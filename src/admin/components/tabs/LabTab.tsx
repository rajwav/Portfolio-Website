import React, { useState } from "react";
import { LabModuleItem } from "../../../types/portfolio";
import { TagInput } from "../common/TagInput";
import { ToggleSwitch } from "../common/ToggleSwitch";
import { ConfirmModal } from "../common/ConfirmModal";

interface LabTabProps {
  modules: LabModuleItem[];
  onSaveModule: (module: Partial<LabModuleItem>) => Promise<void>;
  onDeleteModule: (id: string) => Promise<void>;
  isSaving: boolean;
}

export const LabTab: React.FC<LabTabProps> = ({
  modules,
  onSaveModule,
  onDeleteModule,
  isSaving,
}) => {
  const [editingModule, setEditingModule] = useState<Partial<LabModuleItem> | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const startNewModule = () => {
    setEditingModule({
      module_code: `0${modules.length + 1} // EXPERIMENT`,
      module_status: `[SYS_MOD // 0${modules.length + 1} · ACTIVE]`,
      subtitle: "DOMAIN · METHOD · ARCHITECTURE",
      specs: [],
      toolchain: [],
      display_order: modules.length + 1,
      is_enabled: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    await onSaveModule(editingModule);
    setEditingModule(null);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">The Lab Modules</h3>
            <p className="admin-card-subtitle">
              Manage interactive system telemetry modules, technical specifications, and toolchains.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={startNewModule}
          >
            + Create New Lab Module
          </button>
        </div>

        {editingModule && (
          <form onSubmit={handleSave} className="admin-card" style={{ background: "rgba(11, 8, 12, 0.9)", border: "1px solid #9353d3" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#ffffff" }}>
              {editingModule.id ? "Edit Lab Module" : "New Lab Module"}
            </h4>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <label className="admin-field-label">Module Code</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingModule.module_code || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, module_code: e.target.value })}
                  placeholder="01 // THINK"
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Status Tag</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingModule.module_status || ""}
                  onChange={(e) => setEditingModule({ ...editingModule, module_status: e.target.value })}
                  placeholder="[SYS_MOD // 01 · ACTIVE]"
                  required
                />
              </div>
            </div>

            <div className="admin-field-group">
              <label className="admin-field-label">Subtitle / Sub-Header</label>
              <input
                type="text"
                className="admin-field-input"
                value={editingModule.subtitle || ""}
                onChange={(e) => setEditingModule({ ...editingModule, subtitle: e.target.value })}
                placeholder="AI · REASONING · TELEMETRY"
                required
              />
            </div>

            <TagInput
              label="Core Specifications"
              tags={editingModule.specs || []}
              onChange={(specs) => setEditingModule({ ...editingModule, specs })}
              placeholder="e.g. Local-First AI & Neural Models"
            />

            <TagInput
              label="Skillset & Toolchain"
              tags={editingModule.toolchain || []}
              onChange={(toolchain) => setEditingModule({ ...editingModule, toolchain })}
              placeholder="e.g. Python, FastAPI"
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <ToggleSwitch
                label="Module Active"
                checked={editingModule.is_enabled !== false}
                onChange={(checked) => setEditingModule({ ...editingModule, is_enabled: checked })}
              />

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingModule(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Module"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="admin-item-list">
          {modules.map((item) => (
            <div key={item.id} className={`admin-item-card ${!item.is_enabled ? "disabled" : ""}`}>
              <div className="admin-item-top">
                <div className="admin-item-badges">
                  <span className="admin-order-badge">#{item.display_order}</span>
                  <strong style={{ color: "#ffffff", fontSize: "1rem" }}>{item.module_code}</strong>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#9353d3" }}>{item.module_status}</span>
                </div>
                <div className="admin-item-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setEditingModule(item)}
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
              <div style={{ fontSize: "0.85rem", color: "#a8a8b2" }}>
                <strong>{item.subtitle}</strong>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {(item.toolchain || []).map((t, idx) => (
                  <span key={idx} className="admin-tag-pill" style={{ fontSize: "0.72rem" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Lab Module"
        message="Are you sure you want to delete this lab module from the working database? This action will take effect immediately in the working draft."
        confirmLabel="Delete Module"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteTargetId) {
            await onDeleteModule(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
