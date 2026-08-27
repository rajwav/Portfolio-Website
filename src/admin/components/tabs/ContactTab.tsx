import React, { useState } from "react";
import { SiteConfig, SocialLinkItem } from "../../../types/portfolio";
import { ToggleSwitch } from "../common/ToggleSwitch";
import { ConfirmModal } from "../common/ConfirmModal";

interface ContactTabProps {
  config: SiteConfig;
  socialLinks: SocialLinkItem[];
  onSaveConfig: (updatedConfig: Partial<SiteConfig>) => Promise<void>;
  onSaveSocial: (link: Partial<SocialLinkItem>) => Promise<void>;
  onDeleteSocial: (id: string) => Promise<void>;
  isSaving: boolean;
}

export const ContactTab: React.FC<ContactTabProps> = ({
  config,
  socialLinks,
  onSaveConfig,
  onSaveSocial,
  onDeleteSocial,
  isSaving,
}) => {
  const [contactData, setContactData] = useState({
    contact_headline: config.contact_headline || "",
    contact_subtext: config.contact_subtext || "",
    contact_email: config.contact_email || "",
    location_text: config.location_text || "",
    colophon_text: config.colophon_text || "",
  });
  const [hasConfigChanges, setHasConfigChanges] = useState(false);

  const [editingSocial, setEditingSocial] = useState<Partial<SocialLinkItem> | null>(null);
  const [deleteSocialId, setDeleteSocialId] = useState<string | null>(null);

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveConfig(contactData);
    setHasConfigChanges(false);
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocial) return;
    await onSaveSocial(editingSocial);
    setEditingSocial(null);
  };

  const startNewSocial = () => {
    setEditingSocial({
      platform_slug: "github",
      label: "PLATFORM NAME",
      handle: "@handle",
      action_text: "CONNECT ↗",
      url: "https://",
      display_order: socialLinks.length + 1,
      is_enabled: true,
    });
  };

  return (
    <div className="admin-tab-content">
      <form onSubmit={handleConfigSubmit} className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Contact &amp; Colophon Configuration</h3>
            <p className="admin-card-subtitle">
              Manage conclusion headlines, primary email address, location, and copyright colophon.
            </p>
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={isSaving || !hasConfigChanges}
          >
            {isSaving ? "Saving..." : "Save Contact Info"}
          </button>
        </div>

        <div className="admin-form-grid">
          <div className="admin-field-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="admin-field-label">Contact Headline Statement</label>
              <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>{contactData.contact_headline.length}/150</span>
            </div>
            <input
              type="text"
              className="admin-field-input"
              value={contactData.contact_headline}
              onChange={(e) => {
                setContactData({ ...contactData, contact_headline: e.target.value });
                setHasConfigChanges(true);
              }}
              placeholder="LET'S BUILD SOMETHING INTERESTING."
              maxLength={150}
              required
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-field-label">Primary Contact Email</label>
            <input
              type="email"
              className="admin-field-input"
              value={contactData.contact_email}
              onChange={(e) => {
                setContactData({ ...contactData, contact_email: e.target.value });
                setHasConfigChanges(true);
              }}
              placeholder="theraj.wav@gmail.com"
              required
            />
          </div>
        </div>

        <div className="admin-field-group">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label className="admin-field-label">Contact Sub-Statement</label>
            <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>{contactData.contact_subtext.length}/300</span>
          </div>
          <textarea
            className="admin-field-textarea"
            style={{ minHeight: "70px" }}
            value={contactData.contact_subtext}
            onChange={(e) => {
              setContactData({ ...contactData, contact_subtext: e.target.value });
              setHasConfigChanges(true);
            }}
            placeholder="I'm always interested in ideas worth exploring..."
            maxLength={300}
            required
          />
        </div>

        <div className="admin-form-grid">
          <div className="admin-field-group">
            <label className="admin-field-label">Location Text</label>
            <input
              type="text"
              className="admin-field-input"
              value={contactData.location_text}
              onChange={(e) => {
                setContactData({ ...contactData, location_text: e.target.value });
                setHasConfigChanges(true);
              }}
              placeholder="VSSUT BURLA · ODISHA, INDIA"
              maxLength={100}
              required
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-field-label">Colophon Copyright Text</label>
            <input
              type="text"
              className="admin-field-input"
              value={contactData.colophon_text}
              onChange={(e) => {
                setContactData({ ...contactData, colophon_text: e.target.value });
                setHasConfigChanges(true);
              }}
              placeholder="PITAMBAR PANDA / RAJ · © 2026 · INNOSPHERE"
              maxLength={150}
              required
            />
          </div>
        </div>
      </form>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Public Social Profiles</h3>
            <p className="admin-card-subtitle">
              Manage floating icons, tooltip handles, and footer contact cards.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={startNewSocial}
          >
            + Add Social Profile
          </button>
        </div>

        {editingSocial && (
          <form onSubmit={handleSocialSubmit} className="admin-card" style={{ background: "rgba(11, 8, 12, 0.9)", border: "1px solid #9353d3" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#ffffff" }}>
              {editingSocial.id ? "Edit Social Profile" : "New Social Profile"}
            </h4>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <label className="admin-field-label">Platform Slug (github, linkedin, youtube, instagram)</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingSocial.platform_slug || ""}
                  onChange={(e) => {
                    const formatted = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                    setEditingSocial({ ...editingSocial, platform_slug: formatted });
                  }}
                  placeholder="github"
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Label (Uppercase Display)</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingSocial.label || ""}
                  onChange={(e) => setEditingSocial({ ...editingSocial, label: e.target.value })}
                  placeholder="GITHUB"
                  maxLength={40}
                  required
                />
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <label className="admin-field-label">Profile Handle</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingSocial.handle || ""}
                  onChange={(e) => setEditingSocial({ ...editingSocial, handle: e.target.value })}
                  placeholder="@rajwav"
                  maxLength={60}
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Hover Action Text</label>
                <input
                  type="text"
                  className="admin-field-input"
                  value={editingSocial.action_text || ""}
                  onChange={(e) => setEditingSocial({ ...editingSocial, action_text: e.target.value })}
                  placeholder="VIEW PROFILE ↗"
                  maxLength={40}
                  required
                />
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-field-group">
                <label className="admin-field-label">Destination URL</label>
                <input
                  type="url"
                  className="admin-field-input"
                  value={editingSocial.url || ""}
                  onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                  placeholder="https://github.com/rajwav"
                  required
                />
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">Display Order</label>
                <input
                  type="number"
                  className="admin-field-input"
                  value={editingSocial.display_order ?? 0}
                  onChange={(e) => setEditingSocial({ ...editingSocial, display_order: parseInt(e.target.value, 10) || 0 })}
                  min={0}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <ToggleSwitch
                label="Profile Active"
                checked={editingSocial.is_enabled !== false}
                onChange={(checked) => setEditingSocial({ ...editingSocial, is_enabled: checked })}
              />

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setEditingSocial(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="admin-item-list">
          {socialLinks.map((social) => (
            <div key={social.id} className={`admin-item-card ${!social.is_enabled ? "disabled" : ""}`}>
              <div className="admin-item-top">
                <div className="admin-item-badges">
                  <span className="admin-order-badge">#{social.display_order}</span>
                  <strong style={{ color: "#ffffff", fontSize: "1rem" }}>{social.label}</strong>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#9353d3" }}>{social.handle}</span>
                </div>
                <div className="admin-item-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setEditingSocial(social)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                    onClick={() => setDeleteSocialId(social.id || null)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#a8a8b2", fontFamily: "monospace" }}>
                {social.url}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteSocialId)}
        title="Delete Social Profile"
        message="Are you sure you want to delete this profile from the working database?"
        confirmLabel="Delete Profile"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteSocialId) {
            await onDeleteSocial(deleteSocialId);
            setDeleteSocialId(null);
          }
        }}
        onCancel={() => setDeleteSocialId(null)}
      />
    </div>
  );
};
