import * as THREE from "three";
import { gsap } from "gsap";

const setLighting = (scene: THREE.Scene) => {
  const directionalLight = new THREE.DirectionalLight(0xc7a9ff, 0);
  directionalLight.position.set(-0.5, 2, 4);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0x7c3aed, 0);
  fillLight.position.set(3, -1, 2);
  scene.add(fillLight);

  const ambientLight = new THREE.AmbientLight(0x2a2438, 0.8);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xa78bfa, 0, 50, 2);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  const duration = 2;
  const ease = "power2.inOut";

  function turnOnLights() {
    gsap.to(directionalLight, {
      intensity: 1.6,
      duration: duration,
      ease: ease,
    });
    gsap.to(fillLight, {
      intensity: 1.2,
      duration: duration,
      ease: ease,
    });
    gsap.to(ambientLight, {
      intensity: 1.1,
      duration: duration,
      ease: ease,
    });
    gsap.to(pointLight, {
      intensity: 3.5,
      duration: duration,
      ease: ease,
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 0.8,
      delay: 0.2,
      duration: 2,
    });
  }

  return { turnOnLights };
};

export default setLighting;
