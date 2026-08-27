import React, { useState, useEffect, useCallback } from "react";
import { AuditLogRecord, fetchAuditLogs } from "../../services/adminService";

export const AuditLogTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>("ALL");

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAuditLogs();
    setLogs(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === "ALL") return true;
    return log.action === filterAction;
  });

  return (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Security &amp; Audit Log</h3>
            <p className="admin-card-subtitle">
              Inspect immutable records of all administrative actions, publishes, and rollbacks.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              className="admin-field-select"
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="ALL">All Actions ({logs.length})</option>
              <option value="PUBLISH">PUBLISH</option>
              <option value="ROLLBACK">ROLLBACK</option>
              <option value="UPDATE">UPDATE</option>
              <option value="INSERT">INSERT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ fontSize: "0.8rem" }}
              onClick={loadLogs}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#8c8c94" }}>
            Loading audit records...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#8c8c94" }}>
            No audit logs found for filter: {filterAction}.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#a8a8b2" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>TIMESTAMP</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>ACTION</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>RESOURCE</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>ADMIN UID</th>
                  <th style={{ padding: "0.75rem 0.5rem" }}>METADATA</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", whiteSpace: "nowrap", color: "#8c8c94" }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px",
                          background:
                            log.action === "PUBLISH"
                              ? "rgba(16, 185, 129, 0.2)"
                              : log.action === "ROLLBACK"
                              ? "rgba(245, 158, 11, 0.2)"
                              : "rgba(147, 83, 211, 0.2)",
                          color:
                            log.action === "PUBLISH"
                              ? "#34d399"
                              : log.action === "ROLLBACK"
                              ? "#fbbf24"
                              : "#c084fc",
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "#dedee0" }}>
                      {log.resource_type} {log.resource_id ? `(${log.resource_id.slice(0, 8)}...)` : ""}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "monospace", color: "#8c8c94" }}>
                      {log.admin_user_id ? log.admin_user_id.slice(0, 8) + "..." : "System"}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#a8a8b2" }}>
                      {log.metadata ? JSON.stringify(log.metadata) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
