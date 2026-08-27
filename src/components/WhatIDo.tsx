import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePortfolioData } from "../context/usePortfolioData";
import "./styles/WhatIDo.css";

const WhatIDo = () => {
  const { data } = usePortfolioData();
  const labModules = (data.lab_modules || [])
    .filter((m) => m.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);

  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    const containers = containerRef.current.filter(Boolean) as HTMLDivElement[];
    if (ScrollTrigger.isTouch) {
      containers.forEach((container) => {
        container.classList.remove("what-noTouch");
        container.addEventListener("click", () => handleClick(container));
      });
    }
    return () => {
      containers.forEach((container) => {
        container.removeEventListener("click", () => handleClick(container));
      });
    };
  }, []);

  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          THE
          <div>
            <span className="hat-h2">LAB</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%" height="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>

          {labModules.map((module, idx) => (
            <div
              key={module.id || module.module_code}
              className="what-content what-noTouch"
              ref={(el) => setRef(el, idx)}
            >
              <div className="what-border1">
                <svg width="100%" height="100%">
                  {idx === 0 && (
                    <line
                      x1="0"
                      y1="0"
                      x2="100%"
                      y2="0"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="6,6"
                    />
                  )}
                  <line
                    x1="0"
                    y1="100%"
                    x2="100%"
                    y2="100%"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="6,6"
                  />
                </svg>
              </div>
              <div className="what-corner"></div>

              <div className="what-content-in">
                <div className="what-module-badge">{module.module_status}</div>
                <h3>{module.module_code}</h3>
                <h4>{module.subtitle}</h4>
                <div className="what-core-specs">
                  {module.specs.map((spec, sIdx) => (
                    <span key={sIdx}>
                      {spec.startsWith("▸") ? spec : `▸ ${spec}`}
                    </span>
                  ))}
                </div>
                <h5>Skillset &amp; tools</h5>
                <div className="what-content-flex">
                  {module.toolchain.map((tool, tIdx) => (
                    <div key={tIdx} className="what-tags">
                      {tool}
                    </div>
                  ))}
                </div>
                <div className="what-arrow"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
