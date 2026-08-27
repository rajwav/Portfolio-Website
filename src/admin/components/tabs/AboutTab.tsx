import React, { useState } from "react";
import { SiteConfig } from "../../../types/portfolio";
import { TagInput } from "../common/TagInput";

interface AboutTabProps {
  config: SiteConfig;
  onSave: (updatedConfig: Partial<SiteConfig>) => Promise<void>;
  isSaving: boolean;
}

export const AboutTab: React.FC<AboutTabProps> = ({ config, onSave, isSaving }) => {
  const [formData, setFormData] = useState<{
    about_headline: string;
    about_paragraphs: string[];
    about_tags: string[];
  }>({
    about_headline: config.about_headline || "",
    about_paragraphs: [...(config.about_paragraphs || [])],
    about_tags: [...(config.about_tags || [])],
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleParagraphChange = (index: number, text: string) => {
    const updated = [...formData.about_paragraphs];
    updated[index] = text;
    setFormData((prev) => ({ ...prev, about_paragraphs: updated }));
    setHasChanges(true);
  };

  const addParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      about_paragraphs: [...prev.about_paragraphs, ""],
    }));
    setHasChanges(true);
  };

  const removeParagraph = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      about_paragraphs: prev.about_paragraphs.filter((_, i) => i !== index),
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
            <h3 className="admin-card-title">About Section Editor</h3>
            <p className="admin-card-subtitle">
              Manage personal philosophy, background narrative, and technical category badges.
            </p>
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? "Saving..." : "Save About Content"}
          </button>
        </div>

        <div className="admin-field-group">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label className="admin-field-label">Headline Philosophy Statement</label>
            <span style={{ fontSize: "0.72rem", color: "#8c8c94" }}>{formData.about_headline.length}/150</span>
          </div>
          <input
            type="text"
            className="admin-field-input"
            value={formData.about_headline}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, about_headline: e.target.value }));
              setHasChanges(true);
            }}
            placeholder="I learn by building."
            maxLength={150}
            required
          />
        </div>

        <div className="admin-field-group" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <label className="admin-field-label">Narrative Paragraphs</label>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ padding: "0.3rem 0.75rem", fontSize: "0.78rem" }}
              onClick={addParagraph}
            >
              + Add Paragraph
            </button>
          </div>

          {formData.about_paragraphs.map((p, idx) => (
            <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <textarea
                className="admin-field-textarea"
                style={{ flex: 1, minHeight: "80px" }}
                value={p}
                onChange={(e) => handleParagraphChange(idx, e.target.value)}
                placeholder={`Paragraph ${idx + 1}...`}
                required
              />
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                style={{ alignSelf: "flex-start", padding: "0.4rem 0.6rem" }}
                onClick={() => removeParagraph(idx)}
                title="Delete paragraph"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <TagInput
            label="Technical Focus Tag Pills"
            tags={formData.about_tags}
            onChange={(tags) => {
              setFormData((prev) => ({ ...prev, about_tags: tags }));
              setHasChanges(true);
            }}
            placeholder="e.g. AI & COGNITIVE SYSTEMS"
          />
        </div>
      </div>
    </form>
  );
};
