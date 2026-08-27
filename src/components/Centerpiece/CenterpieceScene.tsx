import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createAutonomousComputingCore } from "./utils/centerpiece";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/useLoading";
import { setCharTimeline, setAllTimeline } from "../utils/GsapScroll";
import { setProgress } from "../utils/loadingProgress";

const CenterpieceScene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    const containerEl = canvasDiv.current;
    if (!containerEl) return;

    let isDisposed = false;
    let animationFrameId: number;
    const rect = containerEl.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;
    const aspect = width / height;
    const scene = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    containerEl.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(18, aspect, 0.1, 1000);
    camera.position.set(0, 0, 24);
    camera.zoom = 1.0;
    camera.updateProjectionMatrix();

    const clock = new THREE.Clock();
    const light = setLighting(scene);
    const progress = setProgress((value) => setLoading(value));

    // Initialize Autonomous Telemetry Core
    const centerpiece = createAutonomousComputingCore();
    scene.add(centerpiece.group);

    // Bind GSAP timelines
    setCharTimeline(centerpiece.group, camera);
    setAllTimeline();

    // Signal loader completion
    progress.loaded().then(() => {
      setTimeout(() => {
        if (!isDisposed) {
          light.turnOnLights();
        }
      }, 1500);
    });

    const onResize = () => {
      if (!containerEl || !renderer || !camera) return;
      const r = containerEl.getBoundingClientRect();
      const w = r.width || window.innerWidth;
      const h = r.height || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      centerpiece.update(delta, mouse.x, mouse.y);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);

      centerpiece.dispose();
      scene.clear();
      renderer.dispose();
      if (containerEl && renderer.domElement && containerEl.contains(renderer.domElement)) {
        containerEl.removeChild(renderer.domElement);
      }
    };
  }, [setLoading]);

  return (
    <div className="character-container">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
      </div>
    </div>
  );
};

export default CenterpieceScene;
