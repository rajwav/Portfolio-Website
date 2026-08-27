import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let isHoveringIcons = false;

    // Use GSAP quickTo for smooth 60-120fps hardware-accelerated cursor following
    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.3,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.3,
      ease: "power3.out",
    });

    const onMouseMove = (e: MouseEvent) => {
      if (!isHoveringIcons) {
        xTo(e.clientX);
        yTo(e.clientY);
      }
    };

    // Event delegation for all [data-cursor] elements
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "[data-cursor]"
      ) as HTMLElement | null;
      if (!target) return;

      const cursorType = target.dataset.cursor;
      if (cursorType === "icons") {
        const rect = target.getBoundingClientRect();
        cursor.classList.add("cursor-icons");
        cursor.style.setProperty("--cursorH", `${rect.height}px`);
        xTo(rect.left);
        yTo(rect.top);
        isHoveringIcons = true;
      } else if (cursorType === "disable") {
        cursor.classList.add("cursor-disable");
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "[data-cursor]"
      ) as HTMLElement | null;
      const related = (e.relatedTarget as HTMLElement)?.closest(
        "[data-cursor]"
      ) as HTMLElement | null;

      // Only deactivate if we're actually leaving the [data-cursor] element
      if (target && target !== related) {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        isHoveringIcons = false;
        xTo(e.clientX);
        yTo(e.clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
