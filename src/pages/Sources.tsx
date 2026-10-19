import { ArrowLeft, ArrowUpRight, BookOpenCheck, FileText, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { courses } from '../data'

export default function SourcesPage() {
  return <section className="page-width sources-page">
    <Link to="/" className="text-link sources-back"><ArrowLeft size={15}/> Retour à l’accueil</Link>
    <span className="eyebrow">TRANSPARENCE PÉDAGOGIQUE</span>
    <h1>Sources des formations</h1>
    <p className="sources-intro">Les vidéos restent publiées par leurs éditeurs. Chaque formation relie son cours vidéo et ses leçons aux références associées. Les explications principales restent consultables dans EduVerse.</p>
    <div className="sources-grid">{courses.map(course => {
      const videos = [...new Map(course.curriculum.map(lesson => {
        const id = lesson.videoId ?? course.videoId
        return [id, { id, title: lesson.videoId ? lesson.title : `Cours vidéo · ${course.instructor}` }]
      })).values()]
      const refs = [...new Set(course.curriculum.map(lesson => lesson.resourceUrl))]
      return <article className="source-course-card" key={course.id}>
        <div className="source-course-heading"><span className="source-icon"><BookOpenCheck size={18}/></span><div><span className="eyebrow">{course.category} · {course.level}</span><h2>{course.title}</h2></div></div>
        <p>{course.description}</p>
        <div className="source-course-links"><h3><Play size={14}/> Vidéos originales</h3>{videos.map(video=><a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">{video.title}<ArrowUpRight size={14}/></a>)}</div>
        <div className="source-course-links"><h3><FileText size={14}/> Références</h3>{refs.map(url=><a key={url} href={url} target="_blank" rel="noreferrer">{new URL(url).hostname.replace(/^www\./,'')}<ArrowUpRight size={14}/></a>)}</div>
        <Link className="button button-outline source-course-action" to={`/course/${course.id}`}>Voir la formation <ArrowUpRight size={14}/></Link>
      </article>
    })}</div>
  </section>
}
