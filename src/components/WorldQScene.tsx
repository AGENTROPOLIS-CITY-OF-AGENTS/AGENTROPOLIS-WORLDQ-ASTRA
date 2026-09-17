import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, Line, OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AgentNode, ExecutionEvent, WorldLayer } from '../lib/types';
import { demoAgents } from '../lib/demo';

const COLORS = {
  red: '#ff334d', cyan: '#34d9ff', lime: '#7dff72', pink: '#ff4fd8', purple: '#9a6cff', ink: '#05070a',
};

const layerY: Record<WorldLayer, number> = { ORBIT: 6.2, GLOBE: 3.65, WORLD_GRID: 1.4, CITY: -0.7, WORLDQ: -3.0 };

function LayerLabel({ title, subtitle, y }: { title: string; subtitle: string; y: number }) {
  return <Html position={[5.6, y, 0]} transform distanceFactor={8} occlude={false}><div className="layer-label"><strong>{title}</strong><span>{subtitle}</span></div></Html>;
}

function Ring({ y, radius, color, speed = 0.08 }: { y: number; radius: number; color: string; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * speed; });
  return <mesh ref={ref} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.035, 10, 160]} /><meshBasicMaterial color={color} transparent opacity={0.68} toneMapped={false} /></mesh>;
}

function OrbitLayer() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.05; });
  return <group ref={group} position={[0, layerY.ORBIT, 0]}>
    {[0,1,2].map((i)=><mesh key={i} rotation={[Math.PI/2+i*0.3,i*0.4,0]}><torusGeometry args={[3.1+i*0.42,0.018,8,100]}/><meshBasicMaterial color={i===1?COLORS.pink:COLORS.cyan} transparent opacity={0.45}/></mesh>)}
    {Array.from({length:10},(_,i)=>{const a=(i/10)*Math.PI*2;return <Float key={i} speed={1.1+(i%3)*0.2} floatIntensity={0.35}><mesh position={[Math.cos(a)*3.6,Math.sin(i)*0.28,Math.sin(a)*3.6]}><boxGeometry args={[0.12,0.08,0.22]}/><meshStandardMaterial color={i%2?COLORS.cyan:COLORS.purple} emissive={i%2?COLORS.cyan:COLORS.purple} emissiveIntensity={2.2}/></mesh></Float>;})}
  </group>;
}

function GlobeLayer() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_,dt)=>{if(ref.current) ref.current.rotation.y += dt*0.045;});
  const points=useMemo(()=>Array.from({length:80},(_,i)=>{const phi=Math.acos(-1+(2*i)/80);const theta=Math.sqrt(80*Math.PI)*phi;return new THREE.Vector3(1.65*Math.cos(theta)*Math.sin(phi),1.65*Math.sin(theta)*Math.sin(phi),1.65*Math.cos(phi));}),[]);
  return <group position={[0,layerY.GLOBE,0]}><mesh ref={ref}><sphereGeometry args={[1.62,64,64]}/><meshPhysicalMaterial color="#08131e" roughness={0.28} metalness={0.22} transmission={0.12} transparent opacity={0.95} emissive="#061522" emissiveIntensity={0.7}/></mesh><mesh><sphereGeometry args={[1.68,32,32]}/><meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.12}/></mesh>{points.map((p,i)=><mesh key={i} position={p.toArray()}><sphereGeometry args={[i%9===0?0.045:0.025,10,10]}/><meshBasicMaterial color={i%3===0?COLORS.red:COLORS.cyan} toneMapped={false}/></mesh>)}</group>;
}

function WorldGridLayer(){return <group position={[0,layerY.WORLD_GRID,0]}><gridHelper args={[9,24,COLORS.cyan,'#183443']} position={[0,0,0]}/>{[2.1,3.2,4.15].map((r,i)=><Ring key={r} y={0} radius={r} color={i===1?COLORS.red:COLORS.cyan} speed={0.08+i*0.04}/>)}</group>;}

function CityLayer(){const buildings=useMemo(()=>Array.from({length:70},(_,i)=>{const angle=(i/70)*Math.PI*2;const radius=1+(i%8)*0.38;const h=0.3+((i*17)%9)*0.16;return{x:Math.cos(angle)*radius,z:Math.sin(angle)*radius,h,hue:i%5};}),[]);return <group position={[0,layerY.CITY,0]}>{buildings.map((b,i)=>{const colors=[COLORS.cyan,COLORS.red,COLORS.purple,COLORS.pink,'#56a8ff'];return <mesh key={i} position={[b.x,b.h/2,b.z]}><boxGeometry args={[0.18,b.h,0.18]}/><meshStandardMaterial color="#07131c" emissive={colors[b.hue]} emissiveIntensity={0.65} metalness={0.7} roughness={0.32}/></mesh>;})}<mesh rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[4.7,4.7,0.18,96]}/><meshStandardMaterial color="#071118" metalness={0.9} roughness={0.24} emissive="#0b2431" emissiveIntensity={0.35}/></mesh></group>;}

function WorldQCore({pulse}:{pulse:number}){const core=useRef<THREE.Mesh>(null);useFrame((state)=>{if(!core.current)return;const s=1+Math.sin(state.clock.elapsedTime*2.4+pulse)*0.055;core.current.scale.setScalar(s);core.current.rotation.y+=0.006;});return <group position={[0,layerY.WORLDQ,0]}><Ring y={0} radius={2.2} color={COLORS.red} speed={0.12}/><Ring y={0} radius={2.85} color={COLORS.cyan} speed={-0.08}/><mesh ref={core}><icosahedronGeometry args={[0.92,3]}/><meshPhysicalMaterial color="#1d0910" emissive={COLORS.red} emissiveIntensity={1.7} roughness={0.18} metalness={0.82} transmission={0.12}/></mesh><pointLight color={COLORS.red} intensity={20} distance={8}/></group>;}

function AgentMarker({agent,active}:{agent:AgentNode;active:boolean}){const y=layerY[agent.layer]+0.18;const color=agent.status==='verifying'?COLORS.lime:agent.status==='blocked'?COLORS.red:COLORS.cyan;return <Float speed={1.8} floatIntensity={0.18}><group position={[agent.x,y,agent.z]}><mesh><sphereGeometry args={[active?0.16:0.11,18,18]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={active?4:2}/></mesh>{active&&<Html distanceFactor={7} position={[0.2,0.22,0]}><div className="agent-tag"><strong>{agent.name}</strong><span>{agent.task}</span></div></Html>}</group></Float>;}

function ActiveTrace({event,agents}:{event?:ExecutionEvent;agents:AgentNode[]}){if(!event)return null;const agent=agents.find((a)=>a.id===event.agentId);if(!agent)return null;const from=new THREE.Vector3(agent.x,layerY[agent.layer]+0.18,agent.z);const to=new THREE.Vector3(0,layerY.WORLDQ+0.25,0);const mid=from.clone().lerp(to,0.5).add(new THREE.Vector3(0,1.8,0));const curve=new THREE.QuadraticBezierCurve3(from,mid,to);return <Line points={curve.getPoints(40)} color={event.kind==='verification.passed'?COLORS.lime:COLORS.red} lineWidth={1.8} transparent opacity={0.72}/>;}

function Scene({events}:{events:ExecutionEvent[]}){const latest=events.at(-1);return <><color attach="background" args={[COLORS.ink]}/><fog attach="fog" args={[COLORS.ink,11,28]}/><ambientLight intensity={0.45}/><directionalLight position={[6,12,4]} intensity={1.8} color="#d9f8ff"/><pointLight position={[-6,3,2]} intensity={10} color={COLORS.cyan} distance={12}/><Stars radius={60} depth={35} count={1400} factor={2.8} saturation={0} fade speed={0.3}/><OrbitLayer/><GlobeLayer/><WorldGridLayer/><CityLayer/><WorldQCore pulse={events.length}/><LayerLabel title="ORBIT" subtitle="global signals · real-time intelligence" y={layerY.ORBIT}/><LayerLabel title="GLOBE (ATLAS)" subtitle="real-world context · people · places · systems" y={layerY.GLOBE}/><LayerLabel title="WORLD GRID" subtitle="routing · memory · tools · governance" y={layerY.WORLD_GRID}/><LayerLabel title="CITY" subtitle="agents · districts · tasks · economy" y={layerY.CITY}/><LayerLabel title="WORLDQ" subtitle="execution layer · ideas → action → impact" y={layerY.WORLDQ}/>{demoAgents.map((agent)=><AgentMarker key={agent.id} agent={agent} active={latest?.agentId===agent.id}/>) }<ActiveTrace event={latest} agents={demoAgents}/><OrbitControls enablePan={false} minDistance={8} maxDistance={20} autoRotate autoRotateSpeed={0.25} target={[0,1.1,0]} minPolarAngle={0.72} maxPolarAngle={1.55}/></>;}

export function WorldQScene({events}:{events:ExecutionEvent[]}){return <Canvas camera={{position:[10.8,5.8,13.6],fov:42}} dpr={[1,1.7]} gl={{antialias:true,powerPreference:'high-performance'}}><Suspense fallback={null}><Scene events={events}/></Suspense></Canvas>;}
