import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Bookmark, Clock3, Play } from 'lucide-react'
import { siAngular, siBootstrap, siC, siCplusplus, siDjango, siDocker, siDotnet, siFigma, siFlutter, siGithub, siGo, siHtml5, siJavascript, siKubernetes, siMdnwebdocs, siMysql, siNextdotjs, siNginx, siNodedotjs, siOpenjdk, siPhp, siPostgresql, siPython, siReact, siRust, siScikitlearn, siTypescript, siUbuntu, siVuedotjs } from 'simple-icons'
import type { SimpleIcon } from 'simple-icons'
import type { Course } from '../data'

const courseBrands: Record<string, { icon?: SimpleIcon; label: string }> = {
  'web-html-css': { icon: siHtml5, label: 'HTML et CSS' },
  'python-fondamentaux': { icon: siPython, label: 'Python' },
  'figma-interface': { icon: siFigma, label: 'Figma' },
  'javascript-fundamentals': { icon: siJavascript, label: 'JavaScript' },
  'react-apps': { icon: siReact, label: 'React' },
  'git-github': { icon: siGithub, label: 'GitHub' },
  'sql-databases': { icon: siMysql, label: 'MySQL' },
  'node-express-api': { icon: siNodedotjs, label: 'Node.js' },
  'typescript-pratique': { icon: siTypescript, label: 'TypeScript' },
  'nextjs-rest-api': { icon: siNextdotjs, label: 'Next.js' },
  'java-fondamentaux': { icon: siOpenjdk, label: 'Java' },
  'docker-pratique': { icon: siDocker, label: 'Docker' },
  'accessibilite-web': { icon: siMdnwebdocs, label: 'MDN · accessibilité' },
  'linux-pratique': { icon: siUbuntu, label: 'Linux' },
  'kubernetes-admin': { icon: siKubernetes, label: 'Kubernetes' },
  'deploiement-cloud': { icon: siNginx, label: 'Nginx · déploiement' },
  'cpp-fundamentals': { icon: siCplusplus, label: 'C++' },
  'c-fundamentals': { icon: siC, label: 'C' },
  'csharp-fundamentals': { icon: siDotnet, label: 'C# · .NET' },
  'php-fundamentals': { icon: siPhp, label: 'PHP' },
  'rust-fundamentals': { icon: siRust, label: 'Rust' },
  'go-fundamentals': { icon: siGo, label: 'Go' },
  'flutter-apps': { icon: siFlutter, label: 'Flutter' },
  'angular-fundamentals': { icon: siAngular, label: 'Angular' },
  'machine-learning-intro': { icon: siScikitlearn, label: 'Machine learning' },
  'bootstrap-layouts': { icon: siBootstrap, label: 'Bootstrap' },
  'excel-fundamentals': { label: 'Excel' },
  'vue-fundamentals': { icon: siVuedotjs, label: 'Vue.js' },
  'django-fundamentals': { icon: siDjango, label: 'Django' },
  'postgresql-fundamentals': { icon: siPostgresql, label: 'PostgreSQL' },
}

export function ProgramLogo({ courseId }: { courseId: string }) {
  const brand = courseBrands[courseId as keyof typeof courseBrands]
  if (!brand) return null
  const { icon, label } = brand
  return <span className="program-logo" aria-label={`Technologie : ${label}`} title={label}>{icon ? <svg viewBox="0 0 24 24" role="img" aria-hidden="true" style={{ fill: `#${icon.hex}` }}><path d={icon.path}/></svg> : <span className="program-logo-letter" aria-hidden="true">XL</span>}<span>{label}</span></span>
}

export function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
}

export function CourseCard({ course, onSave, saved = false }: { course: Course; onSave: ((id: string) => void) | null; saved?: boolean }) {
  const resetTilt = (event: ReactPointerEvent<HTMLElement>) => { event.currentTarget.style.setProperty('--tilt-x', '0deg'); event.currentTarget.style.setProperty('--tilt-y', '0deg') }
  const setTilt = (event: ReactPointerEvent<HTMLElement>) => { if(event.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const rect=event.currentTarget.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width-.5;const y=(event.clientY-rect.top)/rect.height-.5;event.currentTarget.style.setProperty('--tilt-x',`${-y*2.2}deg`);event.currentTarget.style.setProperty('--tilt-y',`${x*2.8}deg`) }
  return <article className="course-card" onPointerMove={setTilt} onPointerLeave={resetTilt}>
    <Link to={`/course/${course.id}`} className={`course-art ${course.color} course-art-photo`} aria-label={`Découvrir ${course.title}`}>
      <img src={`https://i.ytimg.com/vi/${course.videoId}/hqdefault.jpg`} alt="" loading="lazy"/><span className="art-category">Vidéo de {course.instructor}</span>
    </Link>
    <div className="course-content">
      <div className="course-meta"><span>{course.category}</span><span>{course.level}</span><span>Vidéo : {course.mediaLanguage}</span></div>
      <h3><Link to={`/course/${course.id}`}>{course.title}</Link></h3>
      <div className="course-brand-row"><ProgramLogo courseId={course.id}/></div>
      <div className="instructor-line"><span className="avatar">{course.initials}</span><span>{course.instructor}</span><span className="course-hours"><Clock3 size={12}/> {course.duration}</span></div>
      <div className="course-bottom"><strong className={course.priceMAD ? 'test-price-label' : 'free-course-label'}>{course.priceMAD ? `${course.priceMAD} MAD` : 'Cours gratuit'}{course.pointsCost&&<small className="course-points-cost">ou {course.pointsCost} points</small>}</strong>{onSave ? <button className={`icon-button ${saved ? 'is-saved' : ''}`} onClick={() => onSave(course.id)} aria-label={saved ? 'Retirer des favoris' : 'Ajouter aux favoris'}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button> : <Link to="/signup" className="icon-button" aria-label="Créer un compte pour enregistrer ce cours" title="Connectez-vous pour garder ce cours"><Bookmark size={17}/></Link>}<Link className="text-link" to={`/course/${course.id}`}>Voir la formation <ArrowUpRight size={14}/><Play size={13}/></Link></div>
    </div>
  </article>
}

export function Stat({ value, label }: { value: string; label: string }) { return <div className="stat"><strong>{value}</strong><span>{label}</span></div> }

export function EmptyState({ icon, title, copy, children }: { icon: ReactNode; title: string; copy: string; children?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{copy}</p>{children}</div>
}
