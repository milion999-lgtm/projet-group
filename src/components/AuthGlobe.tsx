import { Canvas } from '@react-three/fiber'
import { Planet } from './Globe'

export default function AuthGlobe() {
  return <Canvas camera={{ position: [0, 0, 5.1], fov: 43 }} dpr={[0.8, 1.15]} gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}>
    <ambientLight intensity={0.7}/>
    <pointLight position={[4, 3, 5]} color="#a7efff" intensity={7}/>
    <pointLight position={[-3, -2, -2]} color="#cc8aff" intensity={5}/>
    <Planet reduceMotion={false} globalPointer variant="auth"/>
  </Canvas>
}
