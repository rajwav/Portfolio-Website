import React, { useState } from "react";
import { SiteConfig, SectionVisibility } from "../../../types/portfolio";
import { TagInput } from "../common/TagInput";
import { ToggleSwitch } from "../common/ToggleSwitch";

interface SiteIdentityTabProps {
  config: SiteConfig;
  onSave: (updatedConfig: Partial<SiteConfig>) => Promise<void>;
  isSaving: boolean;
}

export const SiteIdentityTab: React.FC<SiteIdentityTabProps> = ({
  config,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState<SiteConfig>({ ...config });
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleVisibilityToggle = (section: keyof SectionVisibility, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      section_visibility: {
        ...prev.section_visibility,
        [section]: checked,
      },
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setHasChanges(false);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-tab-content">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Identity &amp; Hero Section</h3>
            <p className="admin-card-subtitle">
              Manage personal branding, hero titles, metadata badges, and animated kinetic words.
            </p>
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? "Saving..." : "Save Identity Changes"}
          </button>
        </div>

        <div className="admin-form-grid">
          <div className="admin-field-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="admin-field-label">Display Brand Name</label>
              <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>{formData.display_name.length}/50</span>
            </div>
            <input
              type="text"
              className="admin-field-input"
              value={formData.display_name}
              onChange={(e) => handleChange("display_name", e.target.value)}
              placeholder="Raj"
              maxLength={50}
              required
            />
          </div>

          <div className="admin-field-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="admin-field-label">Full Legal Name</label>
              <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>{formData.full_name.length}/100</span>
            </div>
            <input
              type="text"
              className="admin-field-input"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Pitambar Panda"
              minLength={2}
              maxLength={100}
              required
            />
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-field-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="admin-field-label">Hero Intro Heading</label>
              <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>{formData.hero_intro.length}/50</span>
            </div>
            <input
              type="text"
              className="admin-field-input"
              value={formData.hero_intro}
              onChange={(e) => handleChange("hero_intro", e.target.value)}
              placeholder="HELLO, I'M"
              maxLength={50}
              required
            />
          </div>

          <div className="admin-field-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="admin-field-label">Hero Metadata Chip</label>
              <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>{formData.hero_metadata.length}/120</span>
            </div>
            <input
              type="text"
              className="admin-field-input"
              value={formData.hero_metadata}
              onChange={(e) => handleChange("hero_metadata", e.target.value)}
              placeholder="VSSUT CSE · ODISHA, INDIA · 2026"
              maxLength={120}
              required
            />
          </div>
        </div>

        <div className="admin-field-group">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label className="admin-field-label">Hero Quote / Statement</label>
            <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>{formData.hero_quote.length}/250</span>
          </div>
          <input
            type="text"
            className="admin-field-input"
            value={formData.hero_quote}
            onChange={(e) => handleChange("hero_quote", e.target.value)}
            placeholder="I BUILD TO UNDERSTAND. I ENGINEER TO CREATE."
            maxLength={250}
            required
          />
        </div>

        <TagInput
          label="Hero Kinetic Cycling Words"
          tags={formData.hero_kinetic_words || []}
          onChange={(tags) => handleChange("hero_kinetic_words", tags)}
          maxTags={4}
          placeholder="e.g. INTELLIGENT"
        />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Section Visibility Controls</h3>
            <p className="admin-card-subtitle">
              Toggle visibility for individual sections across the public portfolio.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <ToggleSwitch
            label="Hero & 3D Centerpiece"
            checked={formData.section_visibility.hero !== false}
            onChange={(checked) => handleVisibilityToggle("hero", checked)}
            description="Main landing splash and 3D kinetic centerpiece"
          />
          <ToggleSwitch
            label="About Section"
            checked={formData.section_visibility.about !== false}
            onChange={(checked) => handleVisibilityToggle("about", checked)}
            description="Narrative background and core principles"
          />
          <ToggleSwitch
            label="The Lab (Modules)"
            checked={formData.section_visibility.lab !== false}
            onChange={(checked) => handleVisibilityToggle("lab", checked)}
            description="Interactive Think & Build telemetry cards"
          />
          <ToggleSwitch
            label="The Path (Milestones)"
            checked={formData.section_visibility.path !== false}
            onChange={(checked) => handleVisibilityToggle("path", checked)}
            description="Vertical evolutionary career timeline"
          />
          <ToggleSwitch
            label="Engineering Archive (Projects)"
            checked={formData.section_visibility.work !== false}
            onChange={(checked) => handleVisibilityToggle("work", checked)}
            description="Horizontal pinning project gallery"
          />
          <ToggleSwitch
            label="Tech Stack (Physics Decals)"
            checked={formData.section_visibility.tech !== false}
            onChange={(checked) => handleVisibilityToggle("tech", checked)}
            description="3D interactive decal sphere environment"
          />
          <ToggleSwitch
            label="Contact & Conclusion"
            checked={formData.section_visibility.contact !== false}
            onChange={(checked) => handleVisibilityToggle("contact", checked)}
            description="Footer conclusion, direct email, and profiles"
          />
        </div>
      </div>
    </form>
  );
};
