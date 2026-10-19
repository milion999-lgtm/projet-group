import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpenCheck, Check, Clock3, ExternalLink, Play, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { courses } from '../data'
import { CourseCard, SectionHeading } from '../components/UI'
import { useApp } from '../App'

type YouTubePlayer = {
  getCurrentTime: () => number
  getPlayerState: () => number
  pauseVideo: () => void
  destroy: () => void
}
type YouTubeApi = { Player: new (element: HTMLElement, options: { videoId: string; playerVars: Record<string, number | string>; events: { onReady: (event: { target: YouTubePlayer }) => void } }) => YouTubePlayer }
declare global { interface Window { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void } }

let youtubeApiPromise: Promise<YouTubeApi> | undefined
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!youtubeApiPromise) youtubeApiPromise = new Promise(resolve => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { previous?.(); if (window.YT) resolve(window.YT) }
    if (!document.getElementById('youtube-iframe-api')) {
      const script = document.createElement('script')
      script.id = 'youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  })
  return youtubeApiPromise
}

function CoursePreview({ videoId, title, price, pointsCost, canUnlock, onUnlock }: { videoId: string; title: string; price: number; pointsCost?: number; canUnlock: boolean; onUnlock: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [locked, setLocked] = useState(false)
  useEffect(() => {
    let player: YouTubePlayer | undefined
    let interval = 0
    let cancelled = false
    loadYouTubeApi().then(YT => {
      if (cancelled || !mountRef.current) return
      player = new YT.Player(mountRef.current, {
        videoId,
        playerVars: { controls: 1, enablejsapi: 1, origin: window.location.origin, rel: 0 },
        events: { onReady: event => {
          player = event.target
          interval = window.setInterval(() => {
            if (player?.getPlayerState() === 1 && player.getCurrentTime() >= 120) {
              player.pauseVideo()
              setLocked(true)
            }
          }, 300)
        } },
      })
    }).catch(() => setLocked(true))
    return () => { cancelled = true; window.clearInterval(interval); player?.destroy() }
  }, [videoId])
  return <div className="course-preview-video"><div className="course-preview-player" ref={mountRef}/>{locked&&<div className="preview-paywall" role="dialog" aria-label="Fin de l’aperçu"><span className="preview-lock-icon">🔒</span><span className="eyebrow">APERÇU TERMINÉ · 2 MIN</span><h3>Payez pour continuer le cours</h3><p>Débloquez toutes les leçons de « {title} » {canUnlock&&pointsCost?`avec ${pointsCost} points`: `pour ${price} MAD` }.</p><button className="button" onClick={onUnlock}>{canUnlock&&pointsCost?`Débloquer · ${pointsCost} points`:`Continuer · ${price} MAD`} <ArrowRight size={15}/></button><small>{canUnlock?'Vos points sont utilisés sans paiement.':'Le paiement est simulé : aucun débit réel.'}</small></div>}</div>
}

export default function CourseDetails() {
  const { id = '' } = useParams()
  const course = courses.find(item => item.id === id)
  const { saved, toggleSaved, enroll, hasAccess, simulatePurchase, canUnlockWithPoints, unlockWithPoints, pointsBalance, scoreFor, studySecondsFor, user } = useApp()
  const [checkout, setCheckout] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const navigate = useNavigate()
  if (!course) return <div className="page-width not-found"><span className="eyebrow">404 / COURS INTROUVABLE</span><h1>Cette formation n’existe pas.</h1><Link to="/courses" className="button">Voir le catalogue <ArrowRight size={16}/></Link></div>
  const onEnroll = () => {
    if (!user) { navigate(`/signup?next=${encodeURIComponent(`/course/${course.id}`)}`); return }
    if (course.priceMAD && !hasAccess(course.id)) {
      if (!user) { navigate(`/login?next=/course/${course.id}`); return }
      if (canUnlockWithPoints(course.id) && unlockWithPoints(course.id)) { setPurchased(true); return }
      setCheckout(true)
      return
    }
    enroll(course.id)
    navigate(`/learn/${course.id}`)
  }
  const confirmTestPurchase = () => { simulatePurchase(course.id); setCheckout(false); setPurchased(true) }
  const coursePoints = scoreFor(course.id)
  const ranking = [{name:user?.split('@')[0] || 'Votre profil local', points:coursePoints, current:true},{name:'Profil fictif · Lina',points:160,current:false},{name:'Profil fictif · Yassine',points:100,current:false},{name:'Profil fictif · Salma',points:40,current:false}].sort((a,b)=>b.points-a.points)
  const courseRank = ranking.findIndex(item=>item.current)+1
  return <div className="course-detail-page"><div className="page-width">
    <Link to="/courses" className="back-link"><ArrowLeft size={15}/> Retour au catalogue</Link>
    <div className="detail-hero"><div className="detail-copy">
      <span className="eyebrow">{course.category} · {course.level} · {course.priceMAD ? `${course.priceMAD} MAD` : 'Gratuit'}</span>
      <h1>{course.title}</h1><p>{course.description}</p>
      <div className="detail-instructor"><span className="avatar">{course.initials}</span><span>Formation publiée par <strong>{course.instructor}</strong></span></div>
      <div className="detail-meta"><span><Clock3 size={16}/>{course.duration}</span><span><Play size={15}/>{course.curriculum.length} leçons</span><span><BookOpenCheck size={16}/>Ressources liées</span></div>
      <div className="detail-actions"><button onClick={onEnroll} className="button">{!user ? 'Créer un compte pour commencer' : hasAccess(course.id) ? 'Continuer le cours' : course.priceMAD ? canUnlockWithPoints(course.id) ? `Débloquer · ${course.pointsCost} points` : `Acheter · ${course.priceMAD} MAD` : 'Commencer le cours'} <ArrowRight size={16}/></button>{user ? <button onClick={() => toggleSaved(course.id)} className={`button button-outline ${saved.includes(course.id) ? 'is-saved' : ''}`}>{saved.includes(course.id) ? 'Enregistré dans mes favoris' : 'Garder pour plus tard'}</button> : <Link to={`/signup?next=${encodeURIComponent(`/course/${course.id}`)}`} className="button button-outline">Créer un compte pour enregistrer</Link>}</div>
      {course.pointsCost && !hasAccess(course.id) && <p className="points-unlock-note">Votre solde : <strong>{pointsBalance} points</strong> · Déblocage avec {course.pointsCost} points {pointsBalance < course.pointsCost && <span>(il vous en manque {course.pointsCost-pointsBalance})</span>}</p>}
      {course.priceMAD && <p className="test-payment-note">Tarif fictif réservé au test local. Aucun paiement réel n’est demandé ni effectué.</p>}
      {(!course.priceMAD||hasAccess(course.id))?<a className="text-link source-link" href={course.sourceUrl} target="_blank" rel="noreferrer">Voir la vidéo originale sur YouTube <ExternalLink size={14}/></a>:<p className="dashboard-honest-note">Vidéo de démonstration publiée par {course.instructor}. L’accès aux leçons de ce prototype est en mode test.</p>}
    </div><div className={`detail-art course-art ${course.color} course-art-photo`}><img src={`https://i.ytimg.com/vi/${course.videoId}/hqdefault.jpg`} alt={`Miniature de la formation ${course.title}`} /><span className="detail-play"><Play size={20} fill="currentColor"/></span><span className="art-category">FORMATION PUBLIÉE PAR {course.instructor.toUpperCase()}</span></div></div>
    {course.priceMAD&&!hasAccess(course.id)&&<section className="course-preview"><span className="eyebrow">APERÇU VIDÉO · 2 MIN</span><h2>Découvrez le cours avant de continuer</h2><CoursePreview videoId={course.videoId} title={course.title} price={course.priceMAD} pointsCost={course.pointsCost} canUnlock={canUnlockWithPoints(course.id)} onUnlock={()=>{if(!user){navigate(`/signup?next=${encodeURIComponent(`/course/${course.id}`)}`);return}if(canUnlockWithPoints(course.id)&&unlockWithPoints(course.id)){setPurchased(true);return}setCheckout(true)}}/><p>L’aperçu s’arrête automatiquement après deux minutes. Les vidéos restent hébergées et contrôlées par leurs auteurs.</p></section>}
    <div className="detail-body"><div className="detail-main">
      <section className="detail-section"><SectionHeading eyebrow="Objectifs pédagogiques" title="Ce que vous allez apprendre"/><div className="objectives-grid">{course.learningObjectives.map(objective=><span key={objective}><Check size={15}/>{objective}</span>)}</div></section>
      <section className="detail-section"><SectionHeading eyebrow="Plan de formation" title="Votre parcours" copy="Découvrez le premier aperçu, puis débloquez les leçons complètes grâce au mode test local."/><div className="curriculum-list">{course.curriculum.map((lesson,index)=>{const locked=Boolean(course.priceMAD&&!hasAccess(course.id)&&index>0);return locked?<details className="locked-lesson" key={lesson.title}><summary><span><strong>Leçon {index+1}</strong> {lesson.title}</span><small>🔒 Premium</small></summary><p className="lesson-lock-copy">Simulez l’accès de test pour ouvrir cette leçon.</p></details>:<details key={lesson.title} open={index===0}><summary><span><strong>{course.priceMAD&&!hasAccess(course.id)?'Aperçu':'Leçon '+(index+1)}</strong> {lesson.title}</span><small>{lesson.duration}</small></summary><p className="curriculum-summary">{lesson.summary}</p><div className="curriculum-resource-links"><span className="text-link">Leçon intégrée au parcours EduVerse <BookOpenCheck size={13}/></span></div></details>})}</div></section>
      <section className="detail-section source-detail"><SectionHeading eyebrow="Origine du contenu" title="Apprendre auprès de la source"/><p>La vidéo est publiée par <strong>{course.publisher}</strong>. Les explications du parcours et les exercices s’affichent dans EduVerse; les médias restent chez leur auteur.</p><p className="dashboard-honest-note">Références de fond : documentation officielle associée à {course.category}. Vous pouvez suivre les explications de ce cours sans quitter la plateforme.</p></section>
    </div><aside className="detail-aside"><h3>Avant de commencer</h3><p><Check size={15}/> Ressources publiques et gratuites</p><p><Check size={15}/> Progression enregistrée sur cet appareil</p><p><Check size={15}/> Cours et auteur cités sur la fiche</p><div className="aside-divider"/><span className="eyebrow">Prérequis</span><p>{course.prerequisites}</p><div className="aside-divider"/><span className="eyebrow">Durée indiquée</span><p>{course.duration}</p><small className="content-note">La durée du parcours de lecture est indicative. La vidéo complète peut être plus longue.</small></aside></div>
    <section className="course-ranking"><div className="panel-heading"><div><span className="eyebrow">CLASSEMENT DE CE COURS · DÉMO</span><h2>Votre rang : #{courseRank}</h2></div><strong className="points-total">{coursePoints} pts</strong></div><p className="dashboard-honest-note">Votre score et votre temps d’étude sont locaux. Les autres profils sont des exemples fictifs, pas d’autres visiteurs.</p><p className="ranking-study-time"><Clock3 size={15}/> Temps étudié sur ce cours : {Math.floor(studySecondsFor(course.id)/3600)} h {String(Math.floor(studySecondsFor(course.id)%3600/60)).padStart(2,'0')} min</p><div className="local-leaderboard">{ranking.map((item,index)=><div className={`leaderboard-row ${item.current?'leaderboard-you':''}`} key={item.name}><span>#{index+1}</span><strong>{item.current?`${item.name} (vous)`:item.name}</strong><span>{item.points} pts</span></div>)}</div></section>
    <section className="related-section"><div className="section-row"><SectionHeading eyebrow="Autres ressources" title="Continuer à apprendre"/><Link to="/courses" className="text-link">Voir le catalogue <ArrowRight size={15}/></Link></div><div className="course-grid">{courses.filter(item=>item.id!==course.id).map(item=><CourseCard key={item.id} course={item} saved={saved.includes(item.id)} onSave={user ? toggleSaved : null}/>)}</div></section>
  </div>
  {purchased&&<div className="test-success" role="status"><span>Accès de test activé sur cet appareil. Aucun paiement réel effectué.</span><button onClick={()=>navigate(`/learn/${course.id}`)} className="button button-small">Ouvrir le cours <ArrowRight size={14}/></button></div>}
  {checkout&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setCheckout(false)}}><section className="course-modal test-checkout" role="dialog" aria-modal="true" aria-labelledby="test-checkout-title"><button className="icon-button modal-close" onClick={()=>setCheckout(false)} aria-label="Fermer"><X size={18}/></button><span className="eyebrow">MODE TEST · SANS PAIEMENT</span><h2 id="test-checkout-title">Tester l’accès à la formation</h2><p><strong>{course.title}</strong></p><div className="test-price-summary"><span>Prix fictif de test</span><strong>{course.priceMAD} MAD</strong></div><p className="test-payment-note">Cette action simule l’achat et active l’accès localement sur cet appareil. Aucun moyen de paiement n’est demandé et aucune somme n’est débitée. Ce n’est pas un vrai achat.</p><div className="modal-actions"><button className="button button-outline" onClick={()=>setCheckout(false)}>Annuler</button><button className="button" onClick={confirmTestPurchase}>Simuler l’achat <ArrowRight size={15}/></button></div></section></div>}
  </div>
}
