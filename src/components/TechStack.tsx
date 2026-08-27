import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { usePortfolioData } from "../context/usePortfolioData";
import "./styles/TechStack.css";

const textureLoader = new THREE.TextureLoader();

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

const spheres = [...Array(30)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive || !api.current) return;
    const clampedDelta = Math.min(0.05, delta);
    const pos = api.current.translation();
    const impulse = vec
      .set(pos.x, pos.y, pos.z)
      .normalize()
      .multiply(
        new THREE.Vector3(
          -45 * clampedDelta * scale,
          -120 * clampedDelta * scale,
          -45 * clampedDelta * scale
        )
      );
    api.current.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={2.5}
      angularDamping={1}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
      />
    </RigidBody>
  );
}

function Pointer({
  vec = new THREE.Vector3(),
  isActive,
}: {
  vec?: THREE.Vector3;
  isActive: boolean;
}) {
  const ref = useRef<RapierRigidBody | null>(null);
  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;
    const targetX = (pointer.x * viewport.width) / 2;
    const targetY = (pointer.y * viewport.height) / 2;
    ref.current.setNextKinematicTranslation(
      vec.set(targetX, targetY, 0)
    );
  });
  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const { data } = usePortfolioData();
  const techItems = (data.tech_stack || [])
    .filter((t) => t.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    ScrollTrigger.refresh();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => setIsActive(self.isActive),
    });

    return () => {
      st.kill();
      observer.disconnect();
    };
  }, []);

  const materials = useMemo(() => {
    const defaultDecals = [
      "/images/tech/python.svg",
      "/images/tech/pytorch.svg",
      "/images/tech/fastapi.svg",
      "/images/tech/sqlite.svg",
      "/images/tech/cpp.svg",
      "/images/tech/docker.svg",
      "/images/tech/linux.svg",
      "/images/tech/react.svg",
    ];
    const urls = techItems.length > 0
      ? techItems.map((t) => t.decal_url)
      : defaultDecals;

    const textures = urls.map((url) => textureLoader.load(url));
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.45,
          metalness: 0.7,
          roughness: 0.4,
          clearcoat: 0.8,
          clearcoatRoughness: 0.2,
        })
    );
  }, [techItems]);

  return (
    <div className="techstack" ref={containerRef}>
      <h2>
        TOOLS OF THE TRADE <span>// CORE ENVIRONMENT</span>
      </h2>

      <div className="techstack-legend">
        {techItems.map((item) => (
          <span key={item.id || item.tech_slug} className="tech-legend-pill">
            {item.display_name}
          </span>
        ))}
      </div>

      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[i % materials.length]}
              isActive={isActive}
            />
          ))}
        </Physics>
        <Environment
          preset="city"
          environmentIntensity={0.6}
          environmentRotation={[0, 4, 2]}
        />
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;
