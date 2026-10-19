import { useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, BookOpenCheck, Check, ChevronDown, ChevronUp, ExternalLink, FileText, MessageSquareText, Play, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { courses, type Course } from '../data'
import { useApp } from '../App'

export default function LearningPlayer() {
  const { id } = useParams()
  const course = courses.find(item => item.id === id)
  if (!course) return <div className="page-width not-found"><span className="eyebrow">404 / COURS INTROUVABLE</span><h1>Cette formation n’existe pas.</h1><Link to="/courses" className="button">Voir les cours <ArrowRight size={16}/></Link></div>
  return <CoursePlayer course={course}/>
}

function CoursePlayer({ course }: { course: Course }) {
  const { progressFor, isLessonComplete, completeLesson } = useApp()
  const progress = progressFor(course.id)
  const lessons = course.curriculum
  const [active, setActive] = useState(0)
  const [notesByLesson, setNotesByLesson] = useState<Record<number,string>>(()=>{try{return JSON.parse(localStorage.getItem(`ev-notes-${course.id}`)??'{}')}catch{return {}}})
  const [bookmarks, setBookmarks] = useState<number[]>(()=>{try{return JSON.parse(localStorage.getItem(`ev-bookmarks-${course.id}`)??'[]')}catch{return []}})
  const [quiz, setQuiz] = useState(false)
  const [answer, setAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<'cours'|'discussion'>('cours')
  const [mobileOpen, setMobileOpen] = useState(false)
  const lesson = lessons[active]
  const notes = notesByLesson[active] ?? ''
  const isDone = isLessonComplete(course.id, active)
  const modules = [...new Set(lessons.map(item=>item.module))]
  const hasVideo = active === 0 || typeof lesson.videoStart === 'number'

  const toggleBookmark = () => setBookmarks(current => {const next=current.includes(active)?current.filter(index=>index!==active):[...current,active];localStorage.setItem(`ev-bookmarks-${course.id}`,JSON.stringify(next));return next})
  const completeAndAdvance = () => {
    if (active === lessons.length - 1) { setQuiz(true); setAnswer(null); setChecked(false); return }
    completeLesson(course.id,active)
    setActive(active+1)
    setQuiz(false)
  }
  const submitQuiz = () => {
    if (!checked) { if (answer!==null) setChecked(true); return }
    if (answer===course.quiz.answer) { completeLesson(course.id, active); setQuiz(false); setChecked(false); setAnswer(null); return }
    setChecked(false); setAnswer(null)
  }

  return <div className="player-page"><div className="player-topbar"><Link to={`/course/${course.id}`} className="player-back"><ArrowLeft size={16}/><span>Retour à la formation</span></Link><div className="player-course-title"><span>{course.title}</span><span>Leçon {active+1} sur {lessons.length}</span></div><button className="icon-button curriculum-toggle" onClick={()=>setMobileOpen(!mobileOpen)} aria-label={mobileOpen?'Fermer le programme':'Ouvrir le programme'}>{mobileOpen?<X/>:<ChevronDown/>}</button><div className="player-progress"><span>{progress}% terminé</span><div className="progress-track"><span style={{width:`${progress}%`}}/></div></div></div>
    <div className="player-layout"><aside className={`player-sidebar ${mobileOpen?'sidebar-open':''}`}><div className="sidebar-head"><div><span className="eyebrow">Programme de la formation</span><h2>{course.title}</h2></div><button className="icon-button curriculum-toggle" onClick={()=>setMobileOpen(false)} aria-label="Fermer le programme"><X size={17}/></button></div>{modules.map(module=><details className="player-module" key={module} open={module===lesson.module}><summary><span>{module}</span>{module===lesson.module?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</summary>{lessons.map((item,index)=>({item,index})).filter(({item})=>item.module===module).map(({item,index})=><button key={item.title} className={`player-lesson ${active===index?'lesson-active':''}`} onClick={()=>{setActive(index);setQuiz(false);setChecked(false);setMobileOpen(false)}}><span className="lesson-status">{isLessonComplete(course.id,index)?<Check size={12}/>:<Play size={10}/>}</span><span className="player-lesson-info">{item.title}<small>{item.duration}</small></span>{active===index&&<span className="lesson-now">EN COURS</span>}</button>)}</details>)}<a className="sidebar-resource" href={lesson.resourceUrl} target="_blank" rel="noreferrer"><FileText size={16}/><span>Ressource de la leçon<small>Documentation de référence</small></span><ExternalLink size={14}/></a></aside>
      <div className="player-main"><div className="video-frame">{quiz ? <div className="quiz-screen"><span className="eyebrow">Vérification des acquis</span><h2>{course.quiz.question}</h2><p>Choisissez la meilleure réponse.</p><div className="quiz-answers">{course.quiz.options.map((option,index)=><button className={`quiz-option ${answer===index?'option-selected':''} ${checked&&index===course.quiz.answer?'option-correct':''} ${checked&&answer===index&&index!==course.quiz.answer?'option-wrong':''}`} key={option} onClick={()=>{setAnswer(index);setChecked(false)}}><span className="option-radio"/>{option}</button>)}</div>{checked&&<p className={`quiz-feedback ${answer===course.quiz.answer?'correct-feedback':''}`}>{answer===course.quiz.answer?course.quiz.explanation:'Relisez la leçon puis réessayez.'}</p>}<button disabled={answer===null} className="button" onClick={submitQuiz}>{checked?(answer===course.quiz.answer?'Terminer la formation':'Réessayer'):'Vérifier ma réponse'} <ArrowRight size={15}/></button></div> : hasVideo ? <div className="real-video-wrap"><iframe src={`https://www.youtube-nocookie.com/embed/${course.videoId}?rel=0${lesson.videoStart?`&start=${lesson.videoStart}`:''}`} title={`${course.instructor} — ${course.title}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/><span className="video-label">VIDÉO PUBLIÉE PAR {course.instructor.toUpperCase()}</span></div> : <div className="reading-lesson"><span className="reading-icon"><BookOpenCheck size={23}/></span><span className="eyebrow">Leçon rédigée · {lesson.module}</span><h2>{lesson.title}</h2><p>{lesson.summary}</p><a href={lesson.resourceUrl} className="button button-outline" target="_blank" rel="noreferrer">Lire la documentation associée <ExternalLink size={15}/></a></div>}</div>
        <div className="player-lesson-heading"><div><span className="eyebrow">{lesson.module} · {lesson.duration}</span><h1>{lesson.title}</h1></div><button className={`button button-outline ${bookmarks.includes(active)?'is-saved':''}`} onClick={toggleBookmark}><Bookmark size={15} fill={bookmarks.includes(active)?'currentColor':'none'}/>{bookmarks.includes(active)?'Enregistré':'Ajouter aux favoris'}</button></div><div className="lesson-description"><p>{lesson.summary}</p><p className="demo-notice">Source de la leçon : <a href={lesson.resourceUrl} target="_blank" rel="noreferrer">documentation publiée par l’éditeur <ExternalLink size={12}/></a></p></div><div className="lesson-tabs"><button className={activeTab==='cours'?'tab-active':''} aria-pressed={activeTab==='cours'} onClick={()=>setActiveTab('cours')}><FileText size={15}/> Leçon</button><button className={activeTab==='discussion'?'tab-active':''} aria-pressed={activeTab==='discussion'} onClick={()=>setActiveTab('discussion')}><MessageSquareText size={15}/> Discussion</button></div>{activeTab==='discussion'&&<div className="discussion-preview"><MessageSquareText size={17}/><strong>Discussion du cours</strong><span>Le forum sera disponible après la configuration d’un service de compte.</span></div>}<div className="lesson-complete"><span>{isDone?<><Check size={15}/> Leçon terminée</>:active===lessons.length-1?'Terminez la formation avec le quiz.':'Prenez des notes puis continuez.'}</span><button className="button" onClick={completeAndAdvance}>{active<lessons.length-1?(isDone?'Leçon suivante':'Terminer et continuer'):'Passer le quiz'} <ArrowRight size={15}/></button></div></div>
      <aside className="notes-panel"><div className="notes-title"><h3>Mes notes</h3><Bookmark size={15}/></div><p>Les notes sont conservées sur cet appareil.</p><textarea value={notes} onChange={event=>setNotesByLesson(current=>{const next={...current,[active]:event.target.value};localStorage.setItem(`ev-notes-${course.id}`,JSON.stringify(next));return next})} placeholder="Notez ici ce que vous voulez retenir…" aria-label="Notes de la leçon"/><div className="notes-status">{notes?'Enregistré automatiquement':'Notes pour cette leçon'}</div><div className="notes-divider"/><div className="notes-resource"><FileText size={17}/><span>Documentation<small>{course.publisher}</small></span></div><a className="resource-download" href={lesson.resourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Ouvrir la ressource</a><div className="lesson-switch"><button disabled={active===0} onClick={()=>{setActive(active-1);setQuiz(false)}}><ArrowLeft size={14}/> Leçon précédente</button><button disabled={active===lessons.length-1} onClick={()=>{setActive(active+1);setQuiz(false)}}>Leçon suivante <ArrowRight size={14}/></button></div></aside></div></div>
}
