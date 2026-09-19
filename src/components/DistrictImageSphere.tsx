import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { districtImages } from '../lib/districts';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - ((i + 0.5) / count) * 2;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;
    return new THREE.Vector3(
      Math.cos(theta) * radial * radius,
      y * radius,
      Math.sin(theta) * radial * radius,
    );
  });
}

export function DistrictImageSphere({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const positions = useMemo(() => fibonacciSphere(districtImages.length, 4.92), []);

  useFrame((_, dt) => {
    if (!group.current || !active) return;
    group.current.rotation.y += dt * 0.045;
  });

  if (!active) return null;

  return (
    <>
      <group ref={group} position={[1.45, 0.15, 0]}>
        {districtImages.map((district, index) => (
          <Html
            key={district.id}
            position={positions[index].toArray()}
            center
            distanceFactor={10.5}
            zIndexRange={[42, 4]}
            style={{ pointerEvents: 'auto' }}
          >
            <button
              type="button"
              className={`district-image-node ${selected === district.id ? 'selected' : ''}`}
              style={{ '--district-accent': district.accent } as React.CSSProperties}
              onClick={(event) => {
                event.stopPropagation();
                setSelected((current) => current === district.id ? null : district.id);
              }}
              aria-label={`${district.name}: ${district.subtitle}`}
            >
              <img src={district.image} alt={district.name} draggable={false} />
              <span>
                <strong>{district.name}</strong>
                <small>{district.subtitle}</small>
              </span>
            </button>
          </Html>
        ))}
      </group>

      {selected && (
        <Html position={[1.45, -3.65, 3.2]} center zIndexRange={[80, 60]} style={{ pointerEvents: 'auto' }}>
          {(() => {
            const district = districtImages.find((item) => item.id === selected)!;
            return (
              <div className="district-spotlight" style={{ '--district-accent': district.accent } as React.CSSProperties}>
                <img src={district.image} alt="" />
                <div>
                  <span>AGENTROPOLIS DISTRICT</span>
                  <strong>{district.name}</strong>
                  <small>{district.subtitle}</small>
                </div>
                <button type="button" onClick={() => setSelected(null)}>×</button>
              </div>
            );
          })()}
        </Html>
      )}
    </>
  );
}
