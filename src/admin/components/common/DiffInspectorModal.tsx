import React from "react";
import { FieldDiff } from "../../utils/diffEngine";

interface DiffInspectorModalProps {
  isOpen: boolean;
  diffs: FieldDiff[];
  onClose: () => void;
  onProceedToPublish: () => void;
}

export const DiffInspectorModal: React.FC<DiffInspectorModalProps> = ({
  isOpen,
  diffs,
  onClose,
  onProceedToPublish,
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-box"
        style={{ maxWidth: "750px", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <span className="admin-sys-tag">[DIFF_INSPECTOR // DRAFT VS LIVE]</span>
          <h3>Pending Changes Review ({diffs.length} Modifications)</h3>
        </div>

        {diffs.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#34d399" }}>
            ✓ Working draft is 100% in sync with the active live release.
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", margin: "1rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {diffs.map((diff, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(11, 8, 12, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  padding: "0.85rem",
                  fontSize: "0.82rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <strong style={{ color: "#ffffff" }}>
                    {diff.entity} → <span style={{ color: "#9353d3" }}>{diff.field}</span>
                  </strong>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "3px",
                      background:
                        diff.type === "added"
                          ? "rgba(16, 185, 129, 0.2)"
                          : diff.type === "deleted"
                          ? "rgba(239, 68, 68, 0.2)"
                          : "rgba(245, 158, 11, 0.2)",
                      color:
                        diff.type === "added"
                          ? "#34d399"
                          : diff.type === "deleted"
                          ? "#f87171"
                          : "#fbbf24",
                    }}
                  >
                    {diff.type.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontFamily: "monospace", fontSize: "0.76rem" }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "0.4rem 0.6rem", borderRadius: "4px", color: "#fca5a5" }}>
                    <div style={{ fontSize: "0.65rem", color: "#8c8c94", marginBottom: "0.15rem" }}>LIVE RELEASE</div>
                    {typeof diff.before === "object" ? JSON.stringify(diff.before) : String(diff.before)}
                  </div>
                  <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.4rem 0.6rem", borderRadius: "4px", color: "#86efac" }}>
                    <div style={{ fontSize: "0.65rem", color: "#8c8c94", marginBottom: "0.15rem" }}>WORKING DRAFT</div>
                    {typeof diff.after === "object" ? JSON.stringify(diff.after) : String(diff.after)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Close
          </button>
          {diffs.length > 0 && (
            <button
              type="button"
              className="admin-btn admin-btn-publish"
              onClick={() => {
                onClose();
                onProceedToPublish();
              }}
            >
              ⚡ Proceed to Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
