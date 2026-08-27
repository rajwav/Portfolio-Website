import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MdArrowOutward } from "react-icons/md";
import { FaGithub } from "react-icons/fa6";
import { usePortfolioData } from "../context/usePortfolioData";

gsap.registerPlugin(useGSAP);

const Work = () => {
  const { data } = usePortfolioData();
  const projects = (data.projects || [])
    .filter((p) => p.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);

  useGSAP(
    () => {
      function getTranslateX() {
        const workFlex = document.querySelector(".work-flex") as HTMLElement;
        if (!workFlex) return 0;
        const lastBox = document.querySelector(".work-box:last-child") as HTMLElement;
        if (lastBox) {
          const padRight = parseFloat(window.getComputedStyle(workFlex).paddingRight) || 80;
          const totalEnd = lastBox.offsetLeft + lastBox.offsetWidth + padRight;
          return Math.max(0, totalEnd - window.innerWidth);
        }
        return Math.max(0, workFlex.scrollWidth - window.innerWidth);
      }

      const getPinDuration = () => {
        const travel = getTranslateX();
        // Add a dedicated resting buffer so project 06 stays completely still and pinned before release
        return travel + Math.max(window.innerHeight * 0.5, 500);
      };

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".work-section",
          start: "top top",
          end: () => `+=${getPinDuration()}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          id: "work",
          invalidateOnRefresh: true,
        },
      });

      // Phase 1: Horizontal travel (01 -> 02 -> 03 -> 04 -> 05 -> 06)
      timeline.to(".work-flex", {
        x: () => -getTranslateX(),
        ease: "none",
        duration: 1,
      });

      // Phase 2: Settled resting buffer — Project 06 is 100% still and completely visible while Work remains pinned
      timeline.to({}, { duration: 0.25 });

      const handleResize = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", handleResize);

      const refreshTimeout1 = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      const refreshTimeout2 = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 400);

      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(refreshTimeout1);
        clearTimeout(refreshTimeout2);
        timeline.kill();
        ScrollTrigger.getById("work")?.kill();
      };
    },
    { dependencies: [projects] }
  );

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          ENGINEERING <span>ARCHIVE</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => {
            const projectNumber = String(index + 1).padStart(2, "0");
            return (
              <div className="work-box" key={project.id || project.slug}>
                <div className="work-info">
                  <div className="work-title">
                    <span className="work-number">{projectNumber}</span>
                    <div className="work-header-meta">
                      <span className="work-badge">{project.badge}</span>
                      <span className="work-category">{project.category}</span>
                    </div>
                  </div>

                  <h3 className="work-name">{project.name}</h3>
                  <p className="work-tagline">{project.tagline}</p>

                  <div className="work-systems-container">
                    <span className="work-systems-heading">
                      // ARCHITECTURE &amp; SUBSYSTEMS
                    </span>
                    <ul className="work-systems-list">
                      {project.systems_specs.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="work-tech-chip">
                    <span>STACK //</span> {project.tech_stack_summary}
                  </div>

                  <div className="work-links-row">
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="work-project-link"
                      data-cursor="disable"
                    >
                      <FaGithub /> Repository <MdArrowOutward />
                    </a>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="work-project-link work-demo-link"
                        data-cursor="disable"
                      >
                        Live Demo <MdArrowOutward />
                      </a>
                    )}
                  </div>
                </div>
                <WorkImage
                  image={project.image_url}
                  alt={project.name}
                  link={project.live_url || project.github_url}
                  number={projectNumber}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Work;
