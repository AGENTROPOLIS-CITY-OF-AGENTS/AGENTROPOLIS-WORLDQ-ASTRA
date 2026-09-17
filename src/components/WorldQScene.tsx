import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, Stars } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { ExecutionEvent, WorldLayer } from '../lib/types';
import { demoAgents } from '../lib/demo';

const CYAN = '#35f0df';
const RED = '#ff334d';
const GOLD = '#ead493';
const INK = '#03070b';

const cameraTargets: Record<WorldLayer, THREE.Vector3> = {
  ORBIT: new THREE.Vector3(0.4, 1.8, 12.8),
  GLOBE: new THREE.Vector3(0.3, 0.8, 11.2),
  WORLD_GRID: new THREE.Vector3(-0.2, 0.5, 10.0),
  CITY: new THREE.Vector3(0.4, 0.1, 9.2),
  WORLDQ: new THREE.Vector3(0.1, -0.4, 8.4),
};

function CameraRig({ selectedLayer }: { selectedLayer: WorldLayer }) {
  useFrame(({ camera }, dt) => {
    const target = cameraTargets[selectedLayer];
    camera.position.lerp(target, 1 - Math.exp(-dt * 2.2));
    camera.lookAt(1.2, 0.15, 0);
  });
  return null;
}

function GlobeShell({ selectedLayer }: { selectedLayer: WorldLayer }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * (selectedLayer === 'CITY' ? 0.018 : 0.035);
  });

  const nodes = useMemo(() => Array.from({ length: 120 }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / 120);
    const theta = Math.sqrt(120 * Math.PI) * phi;
    return new THREE.Vector3(
      4.78 * Math.cos(theta) * Math.sin(phi),
      4.78 * Math.cos(phi),
      4.78 * Math.sin(theta) * Math.sin(phi),
    );
  }), []);

  return (
    <group ref={group} position={[1.45, 0.15, 0]}>
      <mesh>
        <sphereGeometry args={[4.7, 42, 32]} />
        <meshBasicMaterial color={CYAN} wireframe transparent opacity={selectedLayer === 'WORLD_GRID' ? 0.28 : 0.14} />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.56, 64, 48]} />
        <meshPhysicalMaterial color="#02090d" transparent opacity={0.54} roughness={0.9} metalness={0.1} />
      </mesh>
      {nodes.map((p, i) => (
        <mesh key={i} position={p.toArray()}>
          <sphereGeometry args={[i % 13 === 0 ? 0.045 : 0.018, 8, 8]} />
          <meshBasicMaterial color={i % 17 === 0 ? RED : CYAN} transparent opacity={i % 13 === 0 ? 0.9 : 0.35} />
        </mesh>
      ))}
    </group>
  );
}

function OrbitRings({ selectedLayer }: { selectedLayer: WorldLayer }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.z += dt * 0.022;
  });
  const opacity = selectedLayer === 'ORBIT' ? 0.72 : 0.28;
  return (
    <group ref={group} position={[1.45, 0.15, 0]}>
      <mesh rotation={[Math.PI / 2.8, 0.35, 0]}>
        <torusGeometry args={[5.45, 0.022, 8, 180]} />
        <meshBasicMaterial color={CYAN} transparent opacity={opacity} />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, -0.45, 0.4]}>
        <torusGeometry args={[5.8, 0.018, 8, 180]} />
        <meshBasicMaterial color={RED} transparent opacity={selectedLayer === 'ORBIT' ? 0.55 : 0.22} />
      </mesh>
    </group>
  );
}

function RegionLabels({ selectedLayer }: { selectedLayer: WorldLayer }) {
  if (selectedLayer !== 'GLOBE' && selectedLayer !== 'WORLD_GRID') return null;
  const jurisdiction = selectedLayer === 'WORLD_GRID';
  const labels = [
    { name: 'Americas', pos: [-2.25, -0.35, 1.2] as [number, number, number] },
    { name: 'Eurasia', pos: [2.95, 2.65, 0.2] as [number, number, number] },
    { name: 'APAC', pos: [3.2, 1.45, 2.0] as [number, number, number] },
    { name: 'Africa', pos: [3.75, -0.4, 2.2] as [number, number, number] },
  ];
  return <group position={[1.45, 0.15, 0]}>{labels.map((label) => (
    <Html key={label.name} position={label.pos} transform={false} center>
      <div className={jurisdiction ? 'jurisdiction-label' : 'region-label'}>
        <strong>{label.name}</strong>{jurisdiction && <span>JURISDICTION</span>}
      </div>
    </Html>
  ))}</group>;
}

function CityNodes({ selectedLayer }: { selectedLayer: WorldLayer }) {
  if (selectedLayer !== 'CITY' && selectedLayer !== 'WORLDQ') return null;
  const nodes = [
    { code: 'MC', title: 'MISSION CONTROL', pos: [2.5, 2.3, 1.2] as [number, number, number], hot: true },
    { code: 'HX', title: 'HERMES CITY', pos: [-1.1, 0.8, 2.4] as [number, number, number] },
    { code: 'PX', title: 'PARRALLAX', pos: [1.7, 0.55, 2.65] as [number, number, number] },
    { code: 'CR', title: 'CREATOR / CONSTRUCTION', pos: [-0.25, -0.25, 2.9] as [number, number, number] },
  ];
  return <group position={[1.45, 0.15, 0]}>{nodes.map((node) => (
    <Html key={node.code} position={node.pos} center>
      <div className={`city-node ${node.hot ? 'hot' : ''}`}><span>{node.code}</span><strong>{node.title}</strong></div>
    </Html>
  ))}</group>;
}

function AgentTraffic({ events }: { events: ExecutionEvent[] }) {
  const latest = events.at(-1);
  const arcs = useMemo(() => [
    [new THREE.Vector3(-3.2, 1.3, 2.4), new THREE.Vector3(-0.6, 4.2, 1.1), new THREE.Vector3(3.35, 1.5, 1.7)],
    [new THREE.Vector3(-2.5, -1.1, 2.9), new THREE.Vector3(0.5, 3.8, 2.2), new THREE.Vector3(3.6, -0.8, 1.5)],
    [new THREE.Vector3(-1.0, 3.4, 2.5), new THREE.Vector3(1.1, 5.1, 0.4), new THREE.Vector3(3.8, 2.4, 0.8)],
  ], []);

  return (
    <group position={[1.45, 0.15, 0]}>
      {arcs.map((pts, i) => {
        const curve = new THREE.QuadraticBezierCurve3(pts[0], pts[1], pts[2]);
        return <Line key={i} points={curve.getPoints(36)} color={i === events.length % arcs.length ? RED : CYAN} lineWidth={i === events.length % arcs.length ? 1.6 : 0.7} transparent opacity={i === events.length % arcs.length ? 0.9 : 0.28} />;
      })}
      {demoAgents.map((agent, i) => {
        const angle = (i / demoAgents.length) * Math.PI * 2 + 0.4;
        const y = -1.2 + i * 0.8;
        const r = Math.sqrt(Math.max(0.2, 4.55 * 4.55 - y * y));
        const active = latest?.agentId === agent.id;
        return <group key={agent.id} position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}>
          <mesh><sphereGeometry args={[active ? 0.13 : 0.075, 12, 12]} /><meshBasicMaterial color={active ? RED : CYAN} /></mesh>
          {active && <Html position={[0.18, 0.16, 0]}><div className="agent-tag"><strong>{agent.name}</strong><span>{latest?.kind}</span></div></Html>}
        </group>;
      })}
    </group>
  );
}

function WorldQPulse({ selectedLayer, events }: { selectedLayer: WorldLayer; events: ExecutionEvent[] }) {
  if (selectedLayer !== 'WORLDQ') return null;
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.6 + events.length) * 0.08;
    ref.current.scale.setScalar(s);
  });
  return <group position={[1.45, 0.15, 2.2]}>
    <mesh ref={ref}><icosahedronGeometry args={[1.0, 3]} /><meshBasicMaterial color={RED} wireframe transparent opacity={0.85} /></mesh>
    <pointLight color={RED} intensity={18} distance={7} />
    <Html position={[0, -1.55, 0]} center><div className="worldq-live-label">WORLDQ · EXECUTION STREAM</div></Html>
  </group>;
}

function Scene({ events, selectedLayer }: { events: ExecutionEvent[]; selectedLayer: WorldLayer }) {
  return <>
    <color attach="background" args={[INK]} />
    <fog attach="fog" args={[INK, 13, 34]} />
    <ambientLight intensity={0.3} />
    <pointLight position={[-5, 5, 8]} intensity={7} color={CYAN} distance={22} />
    <Stars radius={70} depth={35} count={1100} factor={2.4} saturation={0} fade speed={0.18} />
    <GlobeShell selectedLayer={selectedLayer} />
    <OrbitRings selectedLayer={selectedLayer} />
    <RegionLabels selectedLayer={selectedLayer} />
    <CityNodes selectedLayer={selectedLayer} />
    <AgentTraffic events={events} />
    <WorldQPulse selectedLayer={selectedLayer} events={events} />
    {selectedLayer === 'WORLD_GRID' && <Html position={[0.5, 3.7, 0]} center><div className="grid-banner">AGENTROPOLIS <i>jurisdiction</i></div></Html>}
    {selectedLayer === 'ORBIT' && <Html position={[1.4, 4.35, 0]} center><div className="orbit-banner">ORBITAL INTELLIGENCE · SIGNALS · SYSTEMS</div></Html>}
    <CameraRig selectedLayer={selectedLayer} />
  </>;
}

export function WorldQScene({ events, selectedLayer }: { events: ExecutionEvent[]; selectedLayer: WorldLayer }) {
  return <Canvas camera={{ position: [0.3, 0.8, 11.2], fov: 46 }} dpr={[1, 1.7]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <Suspense fallback={null}><Scene events={events} selectedLayer={selectedLayer} /></Suspense>
  </Canvas>;
}
