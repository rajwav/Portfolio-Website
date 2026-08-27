import { usePortfolioData } from "../context/usePortfolioData";
import "./styles/About.css";

const About = () => {
  const { data } = usePortfolioData();
  const siteConfig = data.site_config;
  const paragraphs = siteConfig.about_paragraphs || [];
  const tags = siteConfig.about_tags || [];

  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">ABOUT // WHO I AM</h3>
        <h2 className="about-headline">"{siteConfig.about_headline}"</h2>
        {paragraphs[0] && <p className="para">{paragraphs[0]}</p>}
        {paragraphs[1] && <p className="para-sub">{paragraphs[1]}</p>}
        {paragraphs.slice(2).map((p, idx) => (
          <p key={idx} className="para-sub">
            {p}
          </p>
        ))}
        {tags.length > 0 && (
          <div className="about-tags">
            {tags.map((tag, idx) => (
              <span key={idx}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
