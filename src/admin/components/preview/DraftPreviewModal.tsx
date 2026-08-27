import React, { useState } from "react";
import { WorkingState } from "../../services/adminService";

interface DraftPreviewModalProps {
  isOpen: boolean;
  workingState: WorkingState;
  onClose: () => void;
  onProceedToPublish: () => void;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export const DraftPreviewModal: React.FC<DraftPreviewModalProps> = ({
  isOpen,
  workingState,
  onClose,
  onProceedToPublish,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");

  if (!isOpen) return null;

  const { site_config, projects, tech_stack, lab_modules, path_milestones, social_links } = workingState;
  const activeProjects = projects.filter((p) => p.is_enabled);
  const activeTech = tech_stack.filter((t) => t.is_enabled);
  const activeLab = lab_modules.filter((l) => l.is_enabled);
  const activePath = path_milestones.filter((p) => p.is_enabled);
  const activeSocials = social_links.filter((s) => s.is_enabled);

  const getContainerWidth = () => {
    switch (viewport) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      case "desktop": return "100%";
    }
  };

  return (
    <div className="admin-modal-overlay" style={{ padding: "1rem" }} onClick={onClose}>
      <div
        className="admin-modal-box"
        style={{
          maxWidth: "1350px",
          width: "95vw",
          height: "92vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Control Bar */}
        <div
          style={{
            padding: "0.75rem 1.25rem",
            background: "#151218",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="admin-sys-tag" style={{ margin: 0 }}>
              [SANDBOXED_DRAFT_PREVIEW]
            </span>
            <span style={{ fontSize: "0.85rem", color: "#dedee0", fontWeight: 600 }}>
              Live Uncommitted Draft
            </span>
          </div>

          {/* Viewport Switcher */}
          <div style={{ display: "flex", gap: "0.35rem", background: "rgba(0,0,0,0.5)", padding: "0.25rem", borderRadius: "6px" }}>
            <button
              type="button"
              className={`admin-btn ${viewport === "desktop" ? "admin-btn-primary" : "admin-btn-secondary"}`}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
              onClick={() => setViewport("desktop")}
            >
              🖥️ Desktop
            </button>
            <button
              type="button"
              className={`admin-btn ${viewport === "tablet" ? "admin-btn-primary" : "admin-btn-secondary"}`}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
              onClick={() => setViewport("tablet")}
            >
              📱 Tablet (768px)
            </button>
            <button
              type="button"
              className={`admin-btn ${viewport === "mobile" ? "admin-btn-primary" : "admin-btn-secondary"}`}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
              onClick={() => setViewport("mobile")}
            >
              📲 Mobile (375px)
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="admin-btn admin-btn-publish"
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
              onClick={() => {
                onClose();
                onProceedToPublish();
              }}
            >
              ⚡ Publish This Draft
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Preview Canvas */}
        <div
          style={{
            flex: 1,
            background: "#050406",
            overflowY: "auto",
            display: "flex",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: getContainerWidth(),
              maxWidth: "100%",
              background: "#0b080c",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "2rem",
              color: "#dedee0",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
              transition: "width 0.3s ease",
            }}
          >
            {/* 1. Header / Navbar Preview */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem", marginBottom: "2rem" }}>
              <div style={{ fontWeight: 800, letterSpacing: "0.1em", fontSize: "1.2rem", color: "#ffffff" }}>
                {site_config.display_name}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#8c8c94" }}>
                {site_config.contact_email}
              </div>
            </div>

            {/* 2. Hero Section Preview */}
            {site_config.section_visibility.hero !== false && (
              <div style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.85rem", letterSpacing: "0.15em", color: "#9353d3", textTransform: "uppercase" }}>
                  {site_config.hero_intro}
                </div>
                <h1 style={{ fontSize: "2.4rem", margin: "0.5rem 0", color: "#ffffff", fontWeight: 800 }}>
                  {site_config.display_name} <span style={{ color: "#a8a8b2", fontSize: "1.5rem", fontWeight: 400 }}>/ {site_config.full_name}</span>
                </h1>
                <div style={{ display: "inline-block", background: "rgba(255,255,255,0.05)", padding: "0.3rem 0.75rem", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "monospace", color: "#dedee0" }}>
                  {site_config.hero_metadata}
                </div>
                <div style={{ marginTop: "1.25rem", fontStyle: "italic", fontSize: "1.1rem", color: "#c084fc" }}>
                  "{site_config.hero_quote}"
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  {(site_config.hero_kinetic_words || []).map((word, i) => (
                    <span key={i} style={{ background: "rgba(147,83,211,0.15)", border: "1px solid rgba(147,83,211,0.3)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", color: "#dedee0", fontFamily: "monospace" }}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. About Section Preview */}
            {site_config.section_visibility.about !== false && (
              <div style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#8c8c94", marginBottom: "0.5rem" }}>
                  ABOUT // WHO I AM
                </div>
                <h2 style={{ fontSize: "1.6rem", color: "#ffffff", margin: "0 0 1rem 0" }}>
                  "{site_config.about_headline}"
                </h2>
                {(site_config.about_paragraphs || []).map((para, i) => (
                  <p key={i} style={{ color: "#a8a8b2", lineHeight: 1.6, fontSize: "0.92rem", marginBottom: "0.75rem" }}>
                    {para}
                  </p>
                ))}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  {(site_config.about_tags || []).map((tag, i) => (
                    <span key={i} style={{ background: "rgba(255,255,255,0.06)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", color: "#ffffff" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. The Lab Modules Preview */}
            {site_config.section_visibility.lab !== false && (
              <div style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#8c8c94", marginBottom: "0.5rem" }}>
                  THE LAB // MODULES ({activeLab.length})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                  {activeLab.map((mod) => (
                    <div key={mod.id} style={{ background: "rgba(21,18,24,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "1.25rem" }}>
                      <div style={{ fontSize: "0.72rem", color: "#9353d3", fontFamily: "monospace" }}>{mod.module_status}</div>
                      <h3 style={{ margin: "0.25rem 0", color: "#ffffff", fontSize: "1.1rem" }}>{mod.module_code}</h3>
                      <div style={{ fontSize: "0.8rem", color: "#8c8c94", marginBottom: "0.75rem" }}>{mod.subtitle}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {(mod.toolchain || []).map((t, i) => (
                          <span key={i} style={{ background: "rgba(255,255,255,0.05)", padding: "0.15rem 0.4rem", borderRadius: "3px", fontSize: "0.7rem", color: "#dedee0" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Projects Preview */}
            {site_config.section_visibility.work !== false && (
              <div style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#8c8c94", marginBottom: "0.5rem" }}>
                  ENGINEERING ARCHIVE // PROJECTS ({activeProjects.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {activeProjects.map((proj, idx) => (
                    <div key={proj.id} style={{ background: "rgba(21,18,24,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "1.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#9353d3", fontFamily: "monospace" }}>
                          #{String(idx + 1).padStart(2, "0")} · {proj.category}
                        </span>
                        <span style={{ background: "rgba(147,83,211,0.15)", color: "#c084fc", fontSize: "0.7rem", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                          {proj.badge}
                        </span>
                      </div>
                      <h3 style={{ margin: "0.4rem 0 0.2rem 0", color: "#ffffff", fontSize: "1.15rem" }}>{proj.name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "#a8a8b2", margin: "0 0 0.75rem 0" }}>{proj.tagline}</p>
                      <div style={{ fontSize: "0.75rem", color: "#8c8c94", fontFamily: "monospace" }}>
                        STACK: {proj.tech_stack_summary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Tech Stack Preview */}
            {site_config.section_visibility.tech !== false && (
              <div style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#8c8c94", marginBottom: "0.5rem" }}>
                  TOOLS OF THE TRADE // TECH ({activeTech.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {activeTech.map((tech) => (
                    <span key={tech.id} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.35rem 0.75rem", borderRadius: "9999px", fontSize: "0.78rem", color: "#ffffff", fontWeight: 600 }}>
                      {tech.display_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Path Milestones Preview */}
            {site_config.section_visibility.path !== false && (
              <div style={{ marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#8c8c94", marginBottom: "0.5rem" }}>
                  THE PATH // MILESTONES ({activePath.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {activePath.map((item) => (
                    <div key={item.id} style={{ padding: "0.75rem", borderLeft: "2px solid #9353d3", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.95rem" }}>
                        {item.year} · {item.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#8c8c94" }}>{item.organization}</div>
                      <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.82rem", color: "#a8a8b2" }}>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Contact & Socials Preview */}
            {site_config.section_visibility.contact !== false && (
              <div>
                <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#8c8c94", marginBottom: "0.5rem" }}>
                  CONCLUSION &amp; CONTACT
                </div>
                <h2 style={{ fontSize: "1.4rem", color: "#ffffff", margin: "0 0 0.5rem 0" }}>
                  {site_config.contact_headline}
                </h2>
                <p style={{ color: "#a8a8b2", fontSize: "0.88rem", marginBottom: "1rem" }}>
                  {site_config.contact_subtext}
                </p>
                <div style={{ fontSize: "0.85rem", color: "#34d399", fontWeight: 600, marginBottom: "1rem" }}>
                  ✉ {site_config.contact_email}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {activeSocials.map((soc) => (
                    <span key={soc.id} style={{ background: "rgba(255,255,255,0.05)", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", color: "#dedee0" }}>
                      {soc.label} ({soc.handle})
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#52525a", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                  {site_config.colophon_text}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
