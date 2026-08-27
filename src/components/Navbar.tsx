import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { setSmootherInstance, smoother } from "./utils/smoother";
import { usePortfolioData } from "../context/usePortfolioData";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

const Navbar = () => {
  const { data } = usePortfolioData();
  const siteConfig = data.site_config;

  useEffect(() => {
    if (window.innerWidth > 1024) {
      const instance = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true,
        autoResize: true,
        ignoreMobileResize: true,
      });

      setSmootherInstance(instance);
      instance.scrollTop(0);
      instance.paused(true);
    }

    const links = document.querySelectorAll<HTMLAnchorElement>(".header ul a");
    const clickHandlers: Array<{ el: HTMLAnchorElement; handler: (e: MouseEvent) => void }> = [];

    links.forEach((element) => {
      const handler = (e: MouseEvent) => {
        if (window.innerWidth > 1024 && smoother) {
          e.preventDefault();
          const target = e.currentTarget as HTMLAnchorElement;
          const section = target.getAttribute("data-href");
          if (section) {
            smoother.scrollTo(section, true, "top top");
          }
        }
      };
      element.addEventListener("click", handler);
      clickHandlers.push({ el: element, handler });
    });

    const onResize = () => {
      if (smoother) {
        ScrollSmoother.refresh(true);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      clickHandlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          {siteConfig.display_name}
        </a>
        <a
          href={`mailto:${siteConfig.contact_email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          {siteConfig.contact_email}
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
