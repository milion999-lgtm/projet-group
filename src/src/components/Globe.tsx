import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

function Planet() {
  const globe = useRef<Group>(null)
  useFrame((_, delta) => { if (globe.current) globe.current.rotation.y += delta * 0.11 })
  return <group ref={globe}>
    <mesh onPointerMove={event => { if(event.buttons === 1 && globe.current) globe.current.rotation.y += event.movementX * 0.004 }} onPointerOver={() => { document.body.style.cursor='grab' }} onPointerOut={() => { document.body.style.cursor='default' }}>
      <sphereGeometry args={[1.45, 26, 26]} /><meshBasicMaterial color="#11506a" transparent opacity={0.11} />
    </mesh>
    <mesh><sphereGeometry args={[1.48, 36, 36]} /><meshBasicMaterial color="#5bdfff" wireframe transparent opacity={0.19} /></mesh>
    <mesh rotation={[0.2, 0, 0.4]}><torusGeometry args={[1.52, 0.006, 8, 160]} /><meshBasicMaterial color="#ff5ac8" transparent opacity={0.8} /></mesh>
    <mesh rotation={[1.2, 0.4, 0.7]}><torusGeometry args={[1.67, 0.004, 8, 180]} /><meshBasicMaterial color="#47cfff" transparent opacity={0.5} /></mesh>
    <mesh><sphereGeometry args={[1.46, 30, 30]} /><meshBasicMaterial color="#081626" transparent opacity={0.37} /></mesh>
    {Array.from({ length: 34 }, (_, i) => {
      const lat = -1.3 + (i % 9) * 0.31; const lon = (i * 2.399) % (Math.PI * 2)
      const r = 1.5
      return <mesh key={i} position={[r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon)]}>
        <sphereGeometry args={[i % 5 === 0 ? 0.035 : 0.018, 8, 8]} /><meshBasicMaterial color={i % 4 === 0 ? '#ff5ac8' : '#62eaff'} />
      </mesh>
    })}
  </group>
}

export default function Globe() {
  return <div className="globe-stage" aria-label="Rotating 3D wireframe globe" role="img">
    <Canvas camera={{ position: [0, 0, 5.2], fov: 44 }} dpr={[1, 1.25]} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}>
      <Planet />
    </Canvas>
    <span className="orbit-label label-one">LEARN / CREATE</span><span className="orbit-label label-two">EARTH · 2026</span>
    <div className="float-chip"><span className="live-dot" /> 24,000+ learners worldwide</div>
  </div>
}
