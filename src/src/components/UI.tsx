import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Bookmark, Clock3, Play } from 'lucide-react'
import type { Course } from '../data'

export function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
}

export function CourseCard({ course, onSave, saved = false }: { course: Course; onSave: (id: string) => void; saved?: boolean }) {
  return <article className="course-card">
    <Link to={`/course/${course.id}`} className={`course-art ${course.color} course-art-photo`} aria-label={`Découvrir ${course.title}`}>
      <img src={`https://i.ytimg.com/vi/${course.videoId}/hqdefault.jpg`} alt="" loading="lazy"/><span className="art-category">Vidéo de {course.instructor}</span>
    </Link>
    <div className="course-content">
      <div className="course-meta"><span>{course.category}</span><span>{course.level}</span></div>
      <h3><Link to={`/course/${course.id}`}>{course.title}</Link></h3>
      <div className="instructor-line"><span className="avatar">{course.initials}</span><span>{course.instructor}</span><span className="course-hours"><Clock3 size={12}/> {course.duration}</span></div>
      <div className="course-bottom"><strong className="free-course-label">Cours gratuit</strong><button className={`icon-button ${saved ? 'is-saved' : ''}`} onClick={() => onSave(course.id)} aria-label={saved ? 'Retirer des favoris' : 'Ajouter aux favoris'}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button><Link className="text-link" to={`/course/${course.id}`}>Voir la formation <ArrowUpRight size={14}/><Play size={13}/></Link></div>
    </div>
  </article>
}

export function Stat({ value, label }: { value: string; label: string }) { return <div className="stat"><strong>{value}</strong><span>{label}</span></div> }

export function EmptyState({ icon, title, copy, children }: { icon: ReactNode; title: string; copy: string; children?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{copy}</p>{children}</div>
}
