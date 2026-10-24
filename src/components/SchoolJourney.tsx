import { ArrowDown, ArrowRight, Play } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const campusPoster = 'https://images.unsplash.com/photo-1763890699288-e34cad0e221f?auto=format&fit=crop&w=2560&q=88'
const classroomPoster = 'https://images.unsplash.com/photo-1758270704524-596810e891b5?auto=format&fit=crop&w=2560&q=88'
const campusPosterSet = [640, 960, 1440, 1920, 2560].map((width) => `${campusPoster.replace('w=2560', `w=${width}`)} ${width}w`).join(', ')
const classroomPosterSet = [640, 960, 1440, 1920, 2560].map((width) => `${classroomPoster.replace('w=2560', `w=${width}`)} ${width}w`).join(', ')
const campusVideo = 'https://videos.pexels.com/video-files/38684065/16431978_1920_1080_25fps.mp4'
const classroomVideo = 'https://videos.pexels.com/video-files/8419565/8419565-hd_1920_1080_30fps.mp4'

export default function SchoolJourney() {
  const scene = useRef<HTMLElement>(null)
  const outsideRef = useRef<HTMLVideoElement>(null)
  const insideRef = useRef<HTMLVideoElement>(null)
  const reducedMotion = useReducedMotion()
  const [sceneActive, setSceneActive] = useState(false)
  const [insideActive, setInsideActive] = useState(false)
  const [outsideReady, setOutsideReady] = useState(false)
  const [insideReady, setInsideReady] = useState(false)
  const [isInside, setIsInside] = useState(false)
  const { scrollYProgress } = useScroll({ target: scene, offset: ['start start', 'end end'] })
  const outsideOpacity = useTransform(scrollYProgress, [0, .36, .53, .64], reducedMotion ? [1, 1, 1, 1] : [1, 1, .78, 0])
  const insideOpacity = useTransform(scrollYProgress, [.42, .59, .72, 1], reducedMotion ? [0, 0, 1, 1] : [0, 0, 1, 1])
  const insideReveal = useTransform(scrollYProgress, [.4, .68], reducedMotion ? ['circle(150% at 50% 50%)', 'circle(150% at 50% 50%)'] : ['circle(0% at 52% 56%)', 'circle(150% at 52% 56%)'])
  const outsideScale = useTransform(scrollYProgress, [0, 1], reducedMotion ? [1, 1] : [1, 1.22])
  const insideScale = useTransform(scrollYProgress, [.42, 1], reducedMotion ? [1, 1] : [1.14, 1])
  const outsideTitle = useTransform(scrollYProgress, [0, .2, .4, .5], [1, 1, 0, 0])
  const insideTitle = useTransform(scrollYProgress, [.53, .68, .9, 1], [0, 1, 1, 1])
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  useEffect(() => {
    const element = scene.current
    if (!element || reducedMotion) return
    const observer = new IntersectionObserver(([entry]) => setSceneActive(entry.isIntersecting), { rootMargin: '240px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [reducedMotion])

  useEffect(() => {
    const element = scene.current
    if (!element || !window.matchMedia('(max-width: 680px)').matches) return
    const images = element.querySelectorAll('.school-scene-image')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('scene-in-view')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.3 })
    images.forEach((image) => observer.observe(image))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    return scrollYProgress.on('change', (progress) => {
      if (progress > .39) setInsideActive(true)
      setIsInside(progress >= .53)
    })
  }, [reducedMotion, scrollYProgress])

  useEffect(() => {
    const videos = [outsideRef.current, insideRef.current].filter((video): video is HTMLVideoElement => Boolean(video))
    videos.forEach((video) => {
      if (!sceneActive) video.pause()
      else if (video.dataset.loaded === 'true') void video.play().catch(() => {})
    })
  }, [sceneActive, outsideReady, insideReady])

  const markReady = (video: HTMLVideoElement, setReady: (ready: boolean) => void) => {
    video.dataset.loaded = 'true'
    setReady(true)
    if (sceneActive) void video.play().catch(() => {})
  }

  return <section ref={scene} className="school-journey" aria-label="De l’extérieur du campus à la salle de cours">
    <div className="school-scene-sticky">
      <motion.div className="school-scene-image school-scene-exterior" style={{ opacity: outsideOpacity, scale: outsideScale }}>
        <img src={campusPoster} srcSet={campusPosterSet} sizes="100vw" alt="Des étudiants marchent vers un bâtiment de campus" fetchPriority="high" decoding="async" />
        {!reducedMotion && <video ref={outsideRef} className={`school-scene-video ${outsideReady ? 'is-ready' : ''}`} src={sceneActive ? campusVideo : undefined} muted loop playsInline preload="none" poster={campusPoster} aria-hidden="true" onCanPlay={(event) => markReady(event.currentTarget, setOutsideReady)} />}
      </motion.div>
      <motion.div className="school-scene-image school-scene-interior" style={{ opacity: insideOpacity, scale: insideScale, clipPath: insideReveal }}>
        <img src={classroomPoster} srcSet={classroomPosterSet} sizes="100vw" alt="Des étudiants suivent un cours dans un amphithéâtre" loading="eager" fetchPriority="high" decoding="async" />
        {!reducedMotion && <video ref={insideRef} className={`school-scene-video ${insideReady ? 'is-ready' : ''}`} src={sceneActive && insideActive ? classroomVideo : undefined} muted loop playsInline preload="none" poster={classroomPoster} aria-hidden="true" onCanPlay={(event) => markReady(event.currentTarget, setInsideReady)} />}
      </motion.div>
      <div className="school-scene-shade" aria-hidden="true" />
      <div className="school-scene-grain" aria-hidden="true" />

      <motion.div className="school-scene-copy school-copy-outside" style={{ opacity: outsideTitle }} aria-hidden={isInside || undefined}>
        <span className="school-scene-index"><i /> EDUVERSE · LEARNING</span>
        <h1>Votre prochain savoir-faire<br />commence <span>ici.</span></h1>
        <p>Des formations en français, des vidéos et des exercices pour apprendre en construisant.</p>
        <Link to="/courses" tabIndex={isInside ? -1 : 0} className="school-scene-link">Découvrir les cours <ArrowRight size={16} /></Link>
      </motion.div>
      <motion.div className="school-scene-copy school-copy-inside" style={{ opacity: insideTitle }} aria-hidden={!isInside || undefined}>
        <span className="school-scene-index"><i /> DU PREMIER COURS AU PREMIER PROJET</span>
        <h2>Apprendre.<br /><span>Comprendre. Créer.</span></h2>
        <p>Entrez, choisissez un parcours et mettez chaque notion en pratique à votre rythme.</p>
        <Link to="/courses" tabIndex={isInside ? 0 : -1} className="school-scene-link">Explorer les formations <ArrowRight size={16} /></Link>
      </motion.div>

      <div className="school-scene-bottom">
        <div className="school-scene-credit">Vidéo : <a href="https://www.pexels.com/video/university-campus-on-sunny-day-with-students-walking-38684065/" target="_blank" rel="noreferrer">Media Hopper Studio</a> · <a href="https://www.pexels.com/video/students-inside-a-classroom-8419565/" target="_blank" rel="noreferrer">RDNE Stock project</a> / Pexels</div>
        <div className="school-scene-progress" aria-hidden="true"><motion.span style={{ scaleX: progressScale }} /></div>
        <motion.span className="school-scene-scroll" style={{ opacity: outsideTitle }}><ArrowDown size={14} /> DÉFILEZ POUR ENTRER</motion.span>
      </div>
      <span className="school-scene-play" aria-hidden="true"><Play size={12} fill="currentColor"/> VIDEO IMMERSIVE</span>
    </div>
  </section>
}
