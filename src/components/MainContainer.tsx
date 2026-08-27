import { PropsWithChildren, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import TechStack from "./TechStack";
import setSplitText from "./utils/splitText";
import { usePortfolioData } from "../context/usePortfolioData";

const MainContainer = ({ children }: PropsWithChildren) => {
  const { data } = usePortfolioData();
  const visibility = data.site_config.section_visibility || {
    hero: true,
    about: true,
    lab: true,
    path: true,
    work: true,
    tech: true,
    contact: true,
  };

  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth > 1024 : true
  );

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const resizeHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSplitText();
        setIsDesktopView(window.innerWidth > 1024);
        ScrollTrigger.refresh();
      }, 100);
    };

    setSplitText();
    window.addEventListener("resize", resizeHandler);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            {visibility.hero !== false && (
              <Landing>{!isDesktopView && children}</Landing>
            )}
            {visibility.about !== false && <About />}
            {visibility.lab !== false && <WhatIDo />}
            {visibility.path !== false && <Career />}
            {visibility.work !== false && <Work />}
            {visibility.tech !== false && <TechStack />}
            {visibility.contact !== false && <Contact />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
