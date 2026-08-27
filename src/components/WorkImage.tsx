import React, { useState, useRef } from "react";
import { MdArrowOutward } from "react-icons/md";

interface Props {
  image: string;
  alt?: string;
  video?: string;
  link?: string;
  number?: string;
}

const WorkImage: React.FC<Props> = ({ image, alt, link, number }) => {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [glareStyle, setGlareStyle] = useState<{ opacity: number; x: number; y: number }>({
    opacity: 0,
    x: 50,
    y: 50,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    );

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlareStyle({ opacity: 0.25, x: glareX, y: glareY });
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlareStyle({ opacity: 0, x: 50, y: 50 });
  };

  return (
    <div className="work-image">
      <a
        ref={cardRef}
        className="work-image-in"
        href={link}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="disable"
        style={{
          transform: transformStyle || undefined,
          transition: transformStyle ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        }}
      >
        <div className="work-artifact-header">
          <span className="work-artifact-tag">[ARTIFACT // {number || "01"} · SCHEMATIC]</span>
          <span className="work-artifact-inspect">INSPECT ↗</span>
        </div>

        <div className="work-image-media-wrap">
          <img src={image} alt={alt || "Project schematic"} />
        </div>

        {/* Dynamic Specular Glare Layer */}
        <div
          className="work-card-glare"
          style={{
            opacity: glareStyle.opacity,
            background: `radial-gradient(circle at ${glareStyle.x}% ${glareStyle.y}%, rgba(194, 164, 255, 0.45) 0%, rgba(194, 164, 255, 0) 65%)`,
          }}
        />

        {link && (
          <div className="work-link">
            <MdArrowOutward />
          </div>
        )}
      </a>
    </div>
  );
};

export default WorkImage;
