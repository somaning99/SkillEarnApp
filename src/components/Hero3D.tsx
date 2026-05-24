import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function GlowingGlassCube() {
  const cubeRef = useRef<THREE.Mesh>(null);
  const platformRef = useRef<THREE.Mesh>(null);

  const { pedestal, ring, coreRing, cube, orb1, orb2 } = useMemo(() => {
    // 1. Pedestal Base
    const pedestalGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.15, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c30,
      roughness: 0.5,
      metalness: 0.8
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.rotation.x = -Math.PI / 2;
    pedestalMesh.position.y = -0.4;

    // 2. Neon glowing ring on base
    const ringGeo = new THREE.RingGeometry(1.2, 1.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.32;

    // 3. Inner glowing core ring
    const coreGeo = new THREE.RingGeometry(0, 1.1, 64);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.x = -Math.PI / 2;
    coreMesh.position.y = -0.32;

    // 4. Floating Glowing Glass Cube
    const cubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xa78bfa,
      transparent: true,
      transmission: 0.9,
      opacity: 1,
      roughness: 0.1,
      metalness: 0.1,
      thickness: 1.5,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.y = 0.5;

    // 5. Orbs
    const orbGeo1 = new THREE.SphereGeometry(0.1, 16, 16);
    const orbMat1 = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const orbMesh1 = new THREE.Mesh(orbGeo1, orbMat1);
    orbMesh1.position.set(1.8, 0.8, -0.5);

    const orbGeo2 = new THREE.SphereGeometry(0.08, 16, 16);
    const orbMat2 = new THREE.MeshBasicMaterial({ color: 0x7c3aed });
    const orbMesh2 = new THREE.Mesh(orbGeo2, orbMat2);
    orbMesh2.position.set(-1.8, 0.3, 0.8);

    return {
      pedestal: pedestalMesh,
      ring: ringMesh,
      coreRing: coreMesh,
      cube: cubeMesh,
      orb1: orbMesh1,
      orb2: orbMesh2
    };
  }, []);

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    
    // Float and rotate the cube
    if (cubeRef.current) {
      cubeRef.current.rotation.y = elapsedTime * 0.25;
      cubeRef.current.rotation.x = elapsedTime * 0.15;
      cubeRef.current.rotation.z = elapsedTime * 0.1;
      cubeRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.15 + 0.5;
    }

    // Pulse the platform glow
    if (platformRef.current) {
      const material = platformRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = 0.6 + Math.sin(elapsedTime * 3) * 0.2;
      }
    }
  });

  return (
    // @ts-ignore
    <group position={[0, -0.5, 0]}>
      {/* @ts-ignore */}
      <primitive object={pedestal} />
      {/* @ts-ignore */}
      <primitive ref={platformRef} object={ring} />
      {/* @ts-ignore */}
      <primitive object={coreRing} />
      {/* @ts-ignore */}
      <primitive ref={cubeRef} object={cube} />
      {/* @ts-ignore */}
      <primitive object={orb1} />
      {/* @ts-ignore */}
      <primitive object={orb2} />
    {/* @ts-ignore */}
    </group>
  );
}

export default function Hero3D() {
  const { ambient, point1, point2, directional } = useMemo(() => {
    return {
      ambient: new THREE.AmbientLight(0xffffff, 0.4),
      point1: new THREE.PointLight(0x7c3aed, 1.5),
      point2: new THREE.PointLight(0x06b6d4, 0.5),
      directional: new THREE.DirectionalLight(0xffffff, 1.0)
    };
  }, []);

  // Configure light positions
  useMemo(() => {
    point1.position.set(10, 10, 10);
    point2.position.set(-10, -10, -10);
    directional.position.set(0, 5, 0);
  }, [point1, point2, directional]);

  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[550px] relative">
      <Canvas
        camera={{ position: [0, 1.5, 4.5], fov: 45 }}
        className="bg-transparent"
      >
        <Suspense fallback={null}>
          {/* @ts-ignore */}
          <primitive object={ambient} />
          {/* @ts-ignore */}
          <primitive object={point1} />
          {/* @ts-ignore */}
          <primitive object={point2} />
          {/* @ts-ignore */}
          <primitive object={directional} />
          
          <GlowingGlassCube />
          
          <Environment preset="city" background={false} />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />
        </Suspense>
      </Canvas>
      
      {/* Decorative Floating CSS orbs for extra layers */}
      <div className="absolute top-[10%] left-[20%] w-32 h-32 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-40 h-40 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
    </div>
  );
}


