import React, { useState, useEffect, useCallback } from "react";
import { StorageAsset, listStorageAssets, uploadAsset, deleteAsset } from "../../services/adminService";
import { ConfirmModal } from "../common/ConfirmModal";

interface AssetsTabProps {
  currentResumeUrl: string;
  onUpdateResumeUrl: (url: string) => Promise<void>;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({
  currentResumeUrl,
  onUpdateResumeUrl,
}) => {
  const [activeFolder, setActiveFolder] = useState<"resumes" | "projects" | "tech">("resumes");
  const [assets, setAssets] = useState<StorageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StorageAsset | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    const files = await listStorageAssets(activeFolder);
    setAssets(files);
    setIsLoading(false);
  }, [activeFolder]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (activeFolder === "resumes" && file.type !== "application/pdf") {
      alert("Resume uploads must be PDF documents (.pdf).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds maximum limit of 5MB.");
      return;
    }

    setIsUploading(true);
    const { url, error } = await uploadAsset(activeFolder, file);
    if (error) {
      alert(`Upload failed: ${error.message}`);
    } else if (url && activeFolder === "resumes") {
      await onUpdateResumeUrl(url);
    }
    setIsUploading(false);
    loadAssets();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Storage &amp; Asset Manager</h3>
            <p className="admin-card-subtitle">
              Manage uploaded assets across Supabase storage bucket (public-assets).
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <label className="admin-btn admin-btn-primary" style={{ cursor: isUploading ? "not-allowed" : "pointer" }}>
              {isUploading ? "Uploading..." : `+ Upload to /${activeFolder}`}
              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                accept={activeFolder === "resumes" ? ".pdf" : ".svg,.png,.webp,.jpg"}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {activeFolder === "resumes" && (
          <div
            style={{
              background: "rgba(147, 83, 211, 0.1)",
              border: "1px solid rgba(147, 83, 211, 0.3)",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "#c084fc", fontWeight: 600 }}>
                ACTIVE PORTFOLIO RESUME URL
              </div>
              <div style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "#ffffff", marginTop: "0.25rem" }}>
                {currentResumeUrl}
              </div>
            </div>
            <a
              href={currentResumeUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn-secondary"
              style={{ fontSize: "0.78rem" }}
            >
              View Active PDF ↗
            </a>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "0.75rem" }}>
          {(["resumes", "projects", "tech"] as const).map((folder) => (
            <button
              key={folder}
              type="button"
              className={`admin-btn ${activeFolder === folder ? "admin-btn-primary" : "admin-btn-secondary"}`}
              onClick={() => setActiveFolder(folder)}
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
            >
              /{folder} ({activeFolder === folder ? assets.length : "..."})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#8c8c94" }}>
            Scanning storage bucket...
          </div>
        ) : assets.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "#8c8c94", background: "rgba(11, 8, 12, 0.4)", borderRadius: "8px" }}>
            No assets found in /{activeFolder}. Upload your first file using the button above.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {assets.map((asset) => (
              <div
                key={asset.name}
                style={{
                  background: "rgba(11, 8, 12, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff", wordBreak: "break-all" }}>
                    {asset.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#8c8c94", marginTop: "0.2rem" }}>
                    {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem" }}
                    onClick={() => copyToClipboard(asset.publicUrl)}
                  >
                    {copiedUrl === asset.publicUrl ? "✓ Copied!" : "Copy URL"}
                  </button>

                  {activeFolder === "resumes" && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem" }}
                      onClick={() => onUpdateResumeUrl(asset.publicUrl)}
                      disabled={currentResumeUrl === asset.publicUrl}
                    >
                      {currentResumeUrl === asset.publicUrl ? "Active" : "Set Active"}
                    </button>
                  )}

                  <a
                    href={asset.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-secondary"
                    style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem", textDecoration: "none" }}
                  >
                    Open ↗
                  </a>

                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem" }}
                    onClick={() => setDeleteTarget(asset)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Storage Asset"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}" from /${activeFolder}? Any components relying on this URL will need to be updated.`}
        confirmLabel="Delete Asset"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteAsset(deleteTarget.folder, deleteTarget.name);
            setDeleteTarget(null);
            loadAssets();
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
