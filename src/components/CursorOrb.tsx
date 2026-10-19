import { useEffect, useRef } from 'react'

export default function CursorOrb() {
  const orb = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let targetX = x
    let targetY = y
    const animate = () => {
      x += (targetX - x) * 0.24
      y += (targetY - y) * 0.24
      orb.current?.style.setProperty('--cursor-x', `${x}px`)
      orb.current?.style.setProperty('--cursor-y', `${y}px`)
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.4) frame = window.requestAnimationFrame(animate)
      else frame = 0
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      targetX = event.clientX
      targetY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(animate)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { window.removeEventListener('pointermove', move); if (frame) window.cancelAnimationFrame(frame) }
  }, [])
  return <span ref={orb} className="cursor-orb" aria-hidden="true"><span className="cursor-orb-core"/></span>
}
