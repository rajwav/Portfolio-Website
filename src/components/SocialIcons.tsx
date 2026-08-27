import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";
import { MdArrowOutward } from "react-icons/md";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { usePortfolioData } from "../context/usePortfolioData";

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

const SocialIcons = () => {
  const { data } = usePortfolioData();
  const siteConfig = data.site_config;
  const socialLinks = (data.social_links || [])
    .filter((s) => s.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);

  useEffect(() => {
    const social = document.getElementById("social");
    if (!social) return;

    const items = social.querySelectorAll<HTMLElement>(".social-item-wrap");
    const cleanupFns: (() => void)[] = [];

    items.forEach((item) => {
      const link = item.querySelector<HTMLElement>("a");
      if (!link) return;

      let rafId: number | null = null;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let isHovered = false;

      const animate = () => {
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;

        link.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;

        if (
          isHovered ||
          Math.abs(targetX - currentX) > 0.1 ||
          Math.abs(targetY - currentY) > 0.1
        ) {
          rafId = requestAnimationFrame(animate);
        } else {
          currentX = targetX;
          currentY = targetY;
          link.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
          rafId = null;
        }
      };

      const onMouseEnter = () => {
        isHovered = true;
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        targetX = (e.clientX - centerX) * 0.4;
        targetY = (e.clientY - centerY) * 0.4;
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      };

      const onMouseLeave = () => {
        isHovered = false;
        targetX = 0;
        targetY = 0;
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      };

      item.addEventListener("mouseenter", onMouseEnter);
      item.addEventListener("mousemove", onMouseMove);
      item.addEventListener("mouseleave", onMouseLeave);

      cleanupFns.push(() => {
        item.removeEventListener("mouseenter", onMouseEnter);
        item.removeEventListener("mousemove", onMouseMove);
        item.removeEventListener("mouseleave", onMouseLeave);
        if (rafId) cancelAnimationFrame(rafId);
      });
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [socialLinks]);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        {socialLinks.map((profile) => (
          <span
            key={profile.id || profile.platform_slug}
            className="social-item-wrap"
          >
            <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={profile.label}
              className="social-icon-link"
            >
              {getSocialIcon(profile.platform_slug)}
            </a>
            <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-tooltip"
              data-cursor="disable"
            >
              <span className="social-tooltip-name">{profile.label}</span>
              <span className="social-tooltip-handle">{profile.handle}</span>
              <span className="social-tooltip-action">{profile.action_text}</span>
            </a>
          </span>
        ))}
      </div>
      <a
        className="resume-button"
        href={siteConfig.resume_url}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="disable"
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
