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
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setReduceMotion(query.matches); setMode(supportsWebGL() ? '3d' : 'static') }
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  if (mode === 'static') return <div className="globe-stage globe-static" role="img" aria-label="Globe illustrant les formations EduVerse"><span className="static-globe"><i/><b/><em/></span><span className="static-node star-a"/><span className="static-node star-b"/><div className="float-chip"><span className="live-dot"/> HTML · Python · Design UI</div></div>
  return <Suspense fallback={<div className="globe-stage globe-loading" role="status" aria-label="Chargement de l’illustration 3D"/>}><Globe3D reduceMotion={reduceMotion}/></Suspense>
}
