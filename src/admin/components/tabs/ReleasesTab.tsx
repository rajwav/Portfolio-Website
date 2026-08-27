import React, { useState, useEffect, useCallback } from "react";
import { ReleaseRecord, fetchReleaseHistory, rollbackToRelease } from "../../services/adminService";
import { ConfirmModal } from "../common/ConfirmModal";

interface ReleasesTabProps {
  onRollbackComplete: () => Promise<void>;
}

export const ReleasesTab: React.FC<ReleasesTabProps> = ({
  onRollbackComplete,
}) => {
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ReleaseRecord | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<ReleaseRecord | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const loadReleases = useCallback(async () => {
    setIsLoading(true);
    const history = await fetchReleaseHistory();
    setReleases(history);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadReleases();
  }, [loadReleases]);

  const handleRollback = async () => {
    if (!rollbackTarget) return;
    setIsRollingBack(true);
    const { error } = await rollbackToRelease(rollbackTarget.version);
    if (error) {
      alert(`Rollback failed: ${error.message}`);
    } else {
      setRollbackTarget(null);
      await onRollbackComplete();
      await loadReleases();
    }
    setIsRollingBack(false);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Release History &amp; Atomic Rollback</h3>
            <p className="admin-card-subtitle">
              Inspect immutable published snapshots and atomically restore historical states.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#8c8c94" }}>
            Loading historical releases...
          </div>
        ) : releases.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#8c8c94" }}>
            No release history found.
          </div>
        ) : (
          <div className="admin-item-list">
            {releases.map((rel) => (
              <div
                key={rel.id}
                className="admin-item-card"
                style={{
                  borderColor: rel.is_current ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="admin-item-top">
                  <div className="admin-item-badges">
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: rel.is_current ? "#34d399" : "#ffffff",
                      }}
                    >
                      Release v{rel.version}
                    </span>
                    {rel.is_current && (
                      <span className="admin-draft-pill admin-draft-synced" style={{ padding: "0.15rem 0.5rem" }}>
                        CURRENT LIVE
                      </span>
                    )}
                    {rel.payload?.rolled_back_from_version && (
                      <span style={{ fontSize: "0.72rem", color: "#fbbf24", background: "rgba(245, 158, 11, 0.1)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                        ↺ Promoted from v{rel.payload.rolled_back_from_version}
                      </span>
                    )}
                  </div>

                  <div className="admin-item-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                      onClick={() => setSelectedSnapshot(rel)}
                    >
                      Inspect Snapshot
                    </button>
                    {!rel.is_current && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                        onClick={() => setRollbackTarget(rel)}
                      >
                        Roll Back to v{rel.version}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#8c8c94" }}>
                  <div>
                    Published: {new Date(rel.published_at).toLocaleString()}
                  </div>
                  <div style={{ fontFamily: "monospace" }}>
                    Author: {rel.published_by ? rel.published_by.slice(0, 8) + "..." : "System Init"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSnapshot && (
        <div className="admin-modal-overlay" onClick={() => setSelectedSnapshot(null)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: "750px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <span className="admin-sys-tag">[SNAPSHOT_INSPECTOR]</span>
              <h3>Release v{selectedSnapshot.version} Snapshot Payload</h3>
            </div>
            <pre
              style={{
                flex: 1,
                overflowY: "auto",
                background: "#0b080c",
                padding: "1rem",
                borderRadius: "6px",
                fontSize: "0.78rem",
                color: "#dedee0",
                fontFamily: "monospace",
                margin: "1rem 0",
              }}
            >
              {JSON.stringify(selectedSnapshot.payload, null, 2)}
            </pre>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedSnapshot(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(rollbackTarget)}
        title={`Roll Back to Release v${rollbackTarget?.version}`}
        message={`Are you sure you want to roll back? This will restore all 6 working database tables to the state saved in Release v${rollbackTarget?.version} and publish a new forward release. All release history and audit logs remain preserved.`}
        confirmLabel={`Confirm Rollback to v${rollbackTarget?.version}`}
        isLoading={isRollingBack}
        onConfirm={handleRollback}
        onCancel={() => setRollbackTarget(null)}
      />
    </div>
  );
};
