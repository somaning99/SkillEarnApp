import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Generate random particle positions
function generatePoints(count = 500) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 6; // x
    positions[i3 + 1] = (Math.random() - 0.5) * 6; // y
    positions[i3 + 2] = (Math.random() - 0.5) * 6; // z
  }
  return positions;
}

function RotatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useRef(generatePoints());

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions.current}>
        <PointMaterial
          size={0.03}
          color="#7c3aed"
          transparent
          opacity={0.7}
          sizeAttenuation={true}
        />
      </Points>
  );
}

export default function UniqueSection() {
  return (
    <section className="relative py-28 bg-gradient-to-b from-[#03001e] to-slate-950 overflow-hidden border-y border-white/5">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest px-3 py-1 bg-purple-950/40 border border-purple-500/20 rounded-full">
          COLLABORATION
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Explore the Future of <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Digital Partnership
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          A live-calculated 3D particle field reacting to user interaction, simulating decentralized peer-to-peer data nodes.
        </p>
        <button 
          onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-7 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all text-xs"
        >
          View Plans
        </button>
      </div>
      
      {/* Background Canvas particle field */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: 'transparent' }}>
          <Suspense fallback={null}> 
            <RotatingParticles />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Suspense>
        </Canvas>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}

