import * as THREE from "three";

export interface CenterpieceInstance {
  group: THREE.Group;
  update: (delta: number, mouseX: number, mouseY: number) => void;
  dispose: () => void;
}

export function createAutonomousComputingCore(): CenterpieceInstance {
  const masterGroup = new THREE.Group();
  masterGroup.name = "AutonomousTelemetryCore";

  // 1. Inner Telemetry Core Crystal
  const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x9333ea,
    emissive: 0x6366f1,
    emissiveIntensity: 0.7,
    roughness: 0.25,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  masterGroup.add(coreMesh);

  // Wireframe Shell
  const wireGeo = new THREE.IcosahedronGeometry(1.58, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  masterGroup.add(wireMesh);

  // Internal Quantum Pulse Sphere
  const pulseGeo = new THREE.SphereGeometry(0.75, 24, 24);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0xe9d5ff,
    wireframe: false,
  });
  const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
  masterGroup.add(pulseMesh);

  // 2. Gimbal Rings
  // Ring 1 (Inner)
  const ring1Geo = new THREE.TorusGeometry(2.4, 0.06, 16, 90);
  const ring1Mat = new THREE.MeshStandardMaterial({
    color: 0xd8b4fe,
    metalness: 0.9,
    roughness: 0.2,
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  masterGroup.add(ring1);

  // Ring 2 (Middle Precision Gyro)
  const ring2Geo = new THREE.TorusGeometry(3.3, 0.07, 16, 90);
  const ring2Mat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    metalness: 0.85,
    roughness: 0.3,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 3;
  masterGroup.add(ring2);

  // Ring 3 (Outer Horizon Gimbal)
  const ring3Geo = new THREE.TorusGeometry(4.2, 0.08, 16, 100);
  const ring3Mat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.95,
    roughness: 0.2,
  });
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.rotation.y = Math.PI / 4;
  masterGroup.add(ring3);

  // Satellites on outer ring
  const satGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const satMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.2,
  });

  const satGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const sat = new THREE.Mesh(satGeo, satMat);
    sat.position.set(Math.cos(angle) * 4.2, Math.sin(angle) * 4.2, 0);
    satGroup.add(sat);
  }
  ring3.add(satGroup);

  // 3. Telemetry Particle Cloud
  const particleCount = 200;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 2.0 + Math.random() * 3.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    particlePositions[i * 3] = radius * Math.cos(phi) * Math.sin(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi);
    particlePositions[i * 3 + 2] = radius * Math.cos(phi) * Math.cos(theta);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xa78bfa,
    size: 0.05,
    transparent: true,
    opacity: 0.75,
  });
  const particleCloud = new THREE.Points(particleGeo, particleMat);
  masterGroup.add(particleCloud);

  // Damping variables
  let currentRotX = 0;
  let currentRotY = 0;
  let pulseTimer = 0;

  function update(delta: number, mouseX: number, mouseY: number) {
    pulseTimer += delta * 2;

    // Pulse core
    const scale = 1.0 + Math.sin(pulseTimer) * 0.04;
    pulseMesh.scale.set(scale, scale, scale);

    // Continuous Ring Kinematics
    coreMesh.rotation.y += delta * 0.3;
    coreMesh.rotation.x += delta * 0.15;
    wireMesh.rotation.y -= delta * 0.2;
    wireMesh.rotation.z += delta * 0.1;

    ring1.rotation.x += delta * 0.45;
    ring1.rotation.y += delta * 0.25;

    ring2.rotation.y -= delta * 0.35;
    ring2.rotation.z += delta * 0.2;

    ring3.rotation.z += delta * 0.2;
    ring3.rotation.x -= delta * 0.15;

    particleCloud.rotation.y += delta * 0.1;

    // Interactive Look-At Damping
    const targetRotY = mouseX * 0.45;
    const targetRotX = -mouseY * 0.35;
    const factor = 1 - Math.exp(-6 * Math.min(delta, 0.1));

    currentRotX = THREE.MathUtils.lerp(currentRotX, targetRotX, factor);
    currentRotY = THREE.MathUtils.lerp(currentRotY, targetRotY, factor);

    masterGroup.rotation.x = currentRotX;
    masterGroup.rotation.y = currentRotY;
  }

  function dispose() {
    coreGeo.dispose();
    coreMat.dispose();
    wireGeo.dispose();
    wireMat.dispose();
    pulseGeo.dispose();
    pulseMat.dispose();
    ring1Geo.dispose();
    ring1Mat.dispose();
    ring2Geo.dispose();
    ring2Mat.dispose();
    ring3Geo.dispose();
    ring3Mat.dispose();
    satGeo.dispose();
    satMat.dispose();
    particleGeo.dispose();
    particleMat.dispose();
  }

  return { group: masterGroup, update, dispose };
}
