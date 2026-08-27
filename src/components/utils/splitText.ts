import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: SplitText;
}

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.innerWidth < 900) return;
  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  const TriggerStart = window.innerWidth <= 1024 ? "top 70%" : "20% 65%";
  const ToggleAction = "play pause resume reverse";

  paras.forEach((para: ParaElement) => {
    para.classList.add("visible");
    if (para.anim) {
      para.anim.kill();
    }
    if (para.split) {
      para.split.revert();
    }

    para.split = new SplitText(para, {
      type: "lines,words",
      linesClass: "split-line",
    });

    para.anim = gsap.fromTo(
      para.split.words,
      { autoAlpha: 0, y: 50 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: para.parentElement?.parentElement || para,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 1,
        ease: "power3.out",
        y: 0,
        stagger: 0.015,
      }
    );
  });

  titles.forEach((title: ParaElement) => {
    if (title.anim) {
      title.anim.kill();
    }
    if (title.split) {
      title.split.revert();
    }

    title.split = new SplitText(title, {
      type: "chars,lines",
      linesClass: "split-line",
    });

    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 60, rotate: 6 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement || title,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 0.9,
        ease: "power3.out",
        y: 0,
        rotate: 0,
        stagger: 0.02,
      }
    );
  });
}
