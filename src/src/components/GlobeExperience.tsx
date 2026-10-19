import { Suspense, lazy, useEffect, useState } from 'react'

const Globe3D = lazy(() => import('./Globe'))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch { return false }
}

export default function GlobeExperience() {
  const [mode, setMode] = useState<'static' | '3d'>('static')
  useEffect(() => {
    const query = window.matchMedia('(max-width: 620px), (prefers-reduced-motion: reduce)')
    const update = () => setMode(query.matches || !supportsWebGL() ? 'static' : '3d')
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  if (mode === 'static') return <div className="globe-stage globe-static" role="img" aria-label="Illustration of a learning globe"><span className="static-globe"><i/><b/><em/></span><span className="static-star star-a">✳</span><span className="static-star star-b">✧</span><div className="float-chip"><span className="live-dot"/> 24,000+ learners worldwide</div></div>
  return <Suspense fallback={<div className="globe-stage globe-loading" aria-label="Loading 3D globe"/>}><Globe3D/></Suspense>
}
