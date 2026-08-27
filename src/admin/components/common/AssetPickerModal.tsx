import React, { useState, useEffect, useCallback } from "react";
import { StorageAsset, listStorageAssets, uploadAsset } from "../../services/adminService";

interface AssetPickerModalProps {
  isOpen: boolean;
  folder: "resumes" | "projects" | "tech";
  title?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const AssetPickerModal: React.FC<AssetPickerModalProps> = ({
  isOpen,
  folder,
  title = "Select Asset from Storage",
  onSelect,
  onClose,
}) => {
  const [assets, setAssets] = useState<StorageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    const files = await listStorageAssets(folder);
    setAssets(files);
    setIsLoading(false);
  }, [folder]);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, loadAssets]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { url, error } = await uploadAsset(folder, file);
    if (error) {
      alert(`Upload failed: ${error.message}`);
    } else if (url) {
      onSelect(url);
      onClose();
    }
    setIsUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal-box"
        style={{ maxWidth: "720px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="admin-sys-tag">[ASSET_PICKER // /{folder}]</span>
            <h3>{title}</h3>
          </div>
          <label className="admin-btn admin-btn-primary" style={{ cursor: isUploading ? "not-allowed" : "pointer", fontSize: "0.78rem" }}>
            {isUploading ? "Uploading..." : "+ Upload New"}
            <input
              type="file"
              style={{ display: "none" }}
              onChange={handleUpload}
              accept={folder === "resumes" ? ".pdf" : ".svg,.png,.webp,.jpg"}
              disabled={isUploading}
            />
          </label>
        </div>

        {isLoading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "#8c8c94" }}>
            Scanning storage...
          </div>
        ) : assets.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "#8c8c94" }}>
            No assets found in /{folder}. Upload one using the button above.
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", margin: "1rem 0", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
            {assets.map((asset) => (
              <div
                key={asset.name}
                onClick={() => {
                  onSelect(asset.publicUrl);
                  onClose();
                }}
                style={{
                  background: "rgba(11, 8, 12, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#9353d3";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {folder !== "resumes" ? (
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <img
                      src={asset.publicUrl}
                      alt={asset.name}
                      style={{ maxWidth: "45px", maxHeight: "45px", objectFit: "contain" }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
                )}
                <div style={{ fontSize: "0.75rem", color: "#ffffff", wordBreak: "break-all", fontWeight: 500 }}>
                  {asset.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
