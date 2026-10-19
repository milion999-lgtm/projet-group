import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Move3D } from 'lucide-react'

type CaptureEventTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void
  hasPointerCapture: (pointerId: number) => boolean
  releasePointerCapture: (pointerId: number) => void
}
import { BufferGeometry, Float32BufferAttribute, Group } from 'three'

function createLatitudeLines() {
  const positions: number[] = []
  const radius = 1.44
  for (let latitude = -1.25; latitude <= 1.25; latitude += 0.42) {
    for (let step = 0; step < 64; step++) {
      const a = (step / 64) * Math.PI * 2
      const b = ((step + 1) / 64) * Math.PI * 2
      positions.push(radius * Math.cos(latitude) * Math.cos(a), radius * Math.sin(latitude), radius * Math.cos(latitude) * Math.sin(a))
      positions.push(radius * Math.cos(latitude) * Math.cos(b), radius * Math.sin(latitude), radius * Math.cos(latitude) * Math.sin(b))
    }
  }
  for (let longitude = 0; longitude < Math.PI; longitude += Math.PI / 6) {
    for (let step = 0; step < 48; step++) {
      const a = -Math.PI / 2 + (step / 48) * Math.PI
      const b = -Math.PI / 2 + ((step + 1) / 48) * Math.PI
      positions.push(radius * Math.cos(a) * Math.cos(longitude), radius * Math.sin(a), radius * Math.cos(a) * Math.sin(longitude))
      positions.push(radius * Math.cos(b) * Math.cos(longitude), radius * Math.sin(b), radius * Math.cos(b) * Math.sin(longitude))
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

function createParticles() {
  const positions: number[] = []
  for (let i = 0; i < 170; i++) {
    const y = 1 - (i / 169) * 2
    const radius = Math.sqrt(1 - y * y)
    const angle = i * 2.399963
    positions.push(1.47 * Math.cos(angle) * radius, 1.47 * y, 1.47 * Math.sin(angle) * radius)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

export function Planet({ reduceMotion, globalPointer = false, variant = 'home' }: { reduceMotion: boolean; globalPointer?: boolean; variant?: 'home' | 'auth' }) {
  const globe = useRef<Group>(null)
  const manualRotation = useRef({ x: 0, y: 0 })
  const pointer = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const spin = useRef(0)
  const { gl } = useThree()
  const latitudes = useMemo(createLatitudeLines, [])
  const particles = useMemo(createParticles, [])
  useEffect(() => {
    if (reduceMotion) return
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || dragging.current) return
      if (globalPointer) {
        pointer.current.x = Math.max(-0.5, Math.min(0.5, event.clientX / window.innerWidth - 0.5))
        pointer.current.y = Math.max(-0.5, Math.min(0.5, event.clientY / window.innerHeight - 0.5))
      } else {
        const rect = gl.domElement.getBoundingClientRect()
        pointer.current.x = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5))
        pointer.current.y = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5))
      }
    }
    const leave = () => { pointer.current = { x: 0, y: 0 } }
    if (globalPointer) {
      window.addEventListener('pointermove', move, { passive: true })
      return () => window.removeEventListener('pointermove', move)
    }
    const canvas = gl.domElement
    canvas.addEventListener('pointermove', move, { passive: true })
    canvas.addEventListener('pointerleave', leave, { passive: true })
    return () => { canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave) }
  }, [gl, globalPointer, reduceMotion])
  useFrame(({ clock }, delta) => {
    if (!globe.current) return
    spin.current = reduceMotion ? 0 : clock.elapsedTime * 0.11
    const pointerX = reduceMotion ? 0 : pointer.current.x
    const pointerY = reduceMotion ? 0 : pointer.current.y
    const desiredX = manualRotation.current.x + pointerY * 0.68
    const desiredY = manualRotation.current.y + spin.current + pointerX * 0.92
    const easing = Math.min(1, delta * 3.2)
    globe.current.rotation.x += (desiredX - globe.current.rotation.x) * easing
    globe.current.rotation.y += (desiredY - globe.current.rotation.y) * easing
    globe.current.position.x += (pointerX * 0.16 - globe.current.position.x) * easing
    globe.current.position.y += (Math.sin(clock.elapsedTime * 0.55) * 0.045 - pointerY * 0.13 - globe.current.position.y) * easing
  })
  return <group ref={globe}>
    <mesh
      onPointerDown={event => {
        event.stopPropagation()
        dragging.current = true
        lastPointer.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
        manualRotation.current = { x: (globe.current?.rotation.x ?? 0) - pointer.current.y * 0.68, y: (globe.current?.rotation.y ?? 0) - spin.current - pointer.current.x * 0.92 }
        ;(event.target as CaptureEventTarget | null)?.setPointerCapture(event.pointerId)
        document.body.style.cursor = 'grabbing'
      }}
      onPointerMove={event => {
        if (!dragging.current) return
        event.stopPropagation()
        const dx = event.nativeEvent.clientX - lastPointer.current.x
        const dy = event.nativeEvent.clientY - lastPointer.current.y
        manualRotation.current.y += dx * 0.008
        manualRotation.current.x = Math.max(-1.25, Math.min(1.25, manualRotation.current.x + dy * 0.008))
        lastPointer.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
      }}
      onPointerUp={event => {
        dragging.current = false
        const captureTarget = event.target as CaptureEventTarget | null
        if (captureTarget?.hasPointerCapture(event.pointerId)) captureTarget.releasePointerCapture(event.pointerId)
        document.body.style.cursor = ''
      }}
      onPointerCancel={() => { dragging.current = false; document.body.style.cursor = '' }}
      onPointerLeave={() => { if (!dragging.current) document.body.style.cursor = '' }}
    >
      <sphereGeometry args={[1.42, 48, 48]} />
      <meshPhysicalMaterial color={variant === 'auth' ? '#351747' : '#111c49'} roughness={variant === 'auth' ? 0.2 : 0.28} metalness={variant === 'auth' ? 0.22 : 0.32} clearcoat={0.9} clearcoatRoughness={0.16} emissive={variant === 'auth' ? '#7439a4' : '#173c9a'} emissiveIntensity={variant === 'auth' ? 0.34 : 0.22}/>
    </mesh>
    <mesh scale={1.045}>
      <sphereGeometry args={[1.42, 40, 40]} />
      <meshBasicMaterial color={variant === 'auth' ? '#d6b0ff' : '#46d9ff'} wireframe transparent opacity={variant === 'auth' ? 0.22 : 0.1}/>
    </mesh>
    <lineSegments geometry={latitudes}><lineBasicMaterial color={variant === 'auth' ? '#d4c0ff' : '#78e8ff'} transparent opacity={variant === 'auth' ? 0.46 : 0.29}/></lineSegments>
    <points geometry={particles}><pointsMaterial color={variant === 'auth' ? '#a9edff' : '#8beaff'} size={0.018} transparent opacity={0.82} sizeAttenuation/></points>
    <mesh rotation={[0.25, 0.2, 0.42]}><torusGeometry args={[1.57, 0.008, 8, 180]}/><meshBasicMaterial color={variant === 'auth' ? '#ed82ff' : '#ed72ff'} transparent opacity={0.9}/></mesh>
    <mesh rotation={[1.08, 0.35, -0.62]}><torusGeometry args={[1.72, 0.006, 8, 180]}/><meshBasicMaterial color={variant === 'auth' ? '#68e9ff' : '#5cddff'} transparent opacity={0.72}/></mesh>
    <mesh position={[1.66, 0.24, 0.12]} rotation={[0.4, 0.7, 0.2]}><icosahedronGeometry args={[0.075, 1]}/><meshStandardMaterial color={variant === 'auth' ? '#a9edff' : '#e2a2ff'} emissive={variant === 'auth' ? '#8b4dff' : '#a845ff'} emissiveIntensity={1.4} metalness={0.65} roughness={0.2}/></mesh>
  </group>
}

export default function Globe({ reduceMotion = false }: { reduceMotion?: boolean }) {
  return <div className="globe-stage" role="group" aria-label="Globe pédagogique interactif en trois dimensions. Déplacez le pointeur ou faites glisser la boule pour la tourner.">
    <Canvas camera={{ position: [0, 0, 5.1], fov: 43 }} dpr={[0.8, 1.15]} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}>
      <ambientLight intensity={0.7}/><pointLight position={[4, 3, 5]} color="#b0f4ff" intensity={7}/><pointLight position={[-3, -2, -2]} color="#884fff" intensity={5}/>
      <Planet reduceMotion={reduceMotion}/>
    </Canvas>
    <span className="orbit-label label-one">APPRENDRE · CRÉER</span><span className="orbit-label label-two">VOTRE PARCOURS</span>
    <div className="globe-drag-cue"><Move3D size={14}/> Pointez ou glissez pour tourner</div><div className="float-chip"><span className="live-dot"/> HTML · Python · Design UI</div>
  </div>
}
