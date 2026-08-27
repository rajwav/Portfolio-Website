import { PropsWithChildren } from "react";
import { usePortfolioData } from "../context/usePortfolioData";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  const { data } = usePortfolioData();
  const siteConfig = data.site_config;
  const metaParts = siteConfig.hero_metadata.split("·").map((s) => s.trim());
  const words = siteConfig.hero_kinetic_words || [
    "Intelligent",
    "Autonomous",
    "Systems",
    "Software",
  ];

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>{siteConfig.hero_intro}</h2>
            <h1>
              {siteConfig.display_name}
              <br />
              <span>{siteConfig.full_name}</span>
            </h1>
            <div className="landing-meta-chip">
              {metaParts.map((part, idx) => (
                <span key={idx}>
                  {idx > 0 && " · "}
                  <span>{part}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="landing-info">
            <h3>I build to understand</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">{words[0] || "Intelligent"}</div>
              <div className="landing-h2-2">{words[1] || "Autonomous"}</div>
            </h2>
            <h2>
              <div className="landing-h2-info">{words[2] || "Systems"}</div>
              <div className="landing-h2-info-1">{words[3] || "Software"}</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
