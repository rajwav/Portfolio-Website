import { MdArrowOutward } from "react-icons/md";
import { FaGithub, FaLinkedinIn, FaYoutube, FaInstagram } from "react-icons/fa6";
import { usePortfolioData } from "../context/usePortfolioData";
import "./styles/Contact.css";

const getSocialIcon = (slug: string) => {
  switch (slug.toLowerCase()) {
    case "github":
      return <FaGithub />;
    case "linkedin":
      return <FaLinkedinIn />;
    case "youtube":
      return <FaYoutube />;
    case "instagram":
      return <FaInstagram />;
    default:
      return <MdArrowOutward />;
  }
};

const Contact = () => {
  const { data } = usePortfolioData();
  const siteConfig = data.site_config;
  const socialLinks = (data.social_links || [])
    .filter((s) => s.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <div className="contact-header-block">
          <span className="contact-label">// SEC_07 · NOTEBOOK CONCLUSION</span>
          <h2 className="contact-headline">
            {siteConfig.contact_headline.includes("SOMETHING") ? (
              <>
                {siteConfig.contact_headline.split("SOMETHING")[0]}
                <br />
                <span>SOMETHING{siteConfig.contact_headline.split("SOMETHING")[1]}</span>
              </>
            ) : (
              siteConfig.contact_headline
            )}
          </h2>
          <p className="contact-sub-statement">{siteConfig.contact_subtext}</p>
          <div className="contact-cta-wrapper">
            <a
              href={`mailto:${siteConfig.contact_email}`}
              className="contact-main-email"
              data-cursor="disable"
            >
              <span className="contact-cta-sub">LET'S TALK</span>
              <span className="contact-email-text">{siteConfig.contact_email}</span>
              <MdArrowOutward className="contact-email-arrow" />
            </a>
          </div>
        </div>

        <div className="contact-grid">
          <div className="contact-col">
            <h4>LOCATION &amp; CONTEXT</h4>
            <p className="contact-meta-text">
              {siteConfig.location_text}
              <br />
              Computer Science Engineering
            </p>
          </div>

          <div className="contact-col">
            <h4>PUBLIC PROFILES</h4>
            <div className="contact-social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.id || social.platform_slug}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="disable"
                  className="contact-social-item"
                >
                  {getSocialIcon(social.platform_slug)} {social.label}{" "}
                  <MdArrowOutward />
                </a>
              ))}
            </div>
          </div>

          <div className="contact-col contact-col-credit">
            <h4>COLOPHON</h4>
            <p className="contact-credit-title">
              Designed &amp; Engineered by{" "}
              <span>{siteConfig.display_name} ({siteConfig.full_name})</span>
            </p>
            <p className="contact-meta-text">{siteConfig.colophon_text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
