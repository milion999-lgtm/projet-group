import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import type { Course, Lesson } from '../data'

const pageLabels = ['Notion essentielle', 'Compétence visée', 'Exemple commenté', 'Mise en pratique']

export default function LessonReader({ course, lesson, lessonNumber, page, onPageChange, objective, example }: {
  course: Course
  lesson: Lesson
  lessonNumber: number
  page: number
  onPageChange: (page: number) => void
  objective: string
  example?: string
}) {
  return <article className="lesson-content-panel" aria-labelledby="reading-title">
    <span className="eyebrow">COURS À LIRE ICI · LEÇON {lessonNumber + 1}</span>
    <div className="reading-page-heading"><div><span className="reading-page-count">PAGE {page + 1} / {pageLabels.length}</span><h2 id="reading-title">{pageLabels[page]} : {lesson.title}</h2></div><span className="course-tech-tag">{course.category}</span></div>
    {page === 0 && <section className="lesson-page-copy"><p className="lesson-lead">{lesson.summary}</p><h3>Le point à comprendre</h3><p>Cette partie du parcours traite précisément de « {lesson.title} ». L’objectif est de savoir reconnaître cette notion dans un projet et de comprendre le résultat attendu avant de passer à la pratique.</p><a className="lesson-source-link" href={lesson.resourceUrl} target="_blank" rel="noreferrer">Référence et documentation associées <ExternalLink size={14}/></a></section>}
    {page === 1 && <section className="lesson-page-copy"><h3>Compétence travaillée</h3><p className="lesson-lead">{objective || course.description}</p><h3>Pourquoi elle compte</h3><p>Dans un projet réel, cette compétence aide à prendre une décision adaptée au contexte plutôt qu’à appliquer une recette sans vérifier. Gardez en tête le sujet de cette leçon : {lesson.title.toLocaleLowerCase()}.</p><div className="lesson-callout"><strong>Repère</strong><span>À la fin de cette partie, vous devriez pouvoir expliquer la notion avec vos propres mots et montrer où elle intervient dans le cours.</span></div></section>}
    {page === 2 && <section className="lesson-page-copy"><h3>Exemple de la formation</h3>{example ? <><p>Voici un extrait associé à ce cours. Lisez-le en repérant les éléments qui mettent en œuvre la notion étudiée.</p><div className="lesson-example"><div><span className="eyebrow">EXEMPLE PRATIQUE · {lesson.title}</span></div><pre><code>{example}</code></pre></div><p>Modifiez une seule valeur ou une seule ligne à la fois, puis observez l’effet. Reliez chaque changement à la notion présentée dans la page précédente.</p></> : <><p>{lesson.summary}</p><p>Comparez la démarche décrite avec la documentation de référence. Notez les étapes et le résultat observé dans un exemple concret de votre choix.</p><a className="lesson-source-link" href={lesson.resourceUrl} target="_blank" rel="noreferrer">Consulter la référence de cette notion <ExternalLink size={14}/></a></>}</section>}
    {page === 3 && <section className="lesson-page-copy"><h3>Exercice de consolidation</h3><p>Réalisez une petite tâche autour de « {lesson.title} » dans l’environnement adapté à la formation. Commencez par un cas simple, vérifiez le résultat, puis essayez une variante.</p><ol className="lesson-practice-steps"><li>Reformulez l’objectif : {objective || lesson.title}.</li><li>Préparez un exemple minimal et décrivez le résultat attendu.</li><li>Testez une modification, puis comparez le résultat à la documentation liée à cette leçon.</li></ol><div className="lesson-callout"><strong>Auto-vérification</strong><span>Pouvez-vous expliquer ce que vous avez changé, pourquoi vous l’avez fait et comment vous avez vérifié le résultat ?</span></div><a className="lesson-source-link" href={lesson.resourceUrl} target="_blank" rel="noreferrer">Ouvrir la source de référence <ExternalLink size={14}/></a></section>}
    <nav className="lesson-page-nav" aria-label="Pages de la leçon"><button className="button button-outline" disabled={page === 0} onClick={() => onPageChange(page - 1)}><ArrowLeft size={14}/> Page précédente</button><div className="lesson-page-buttons">{pageLabels.map((label, index) => <button key={label} className={index === page ? 'page-number page-number-active' : 'page-number'} aria-label={`Page ${index + 1} : ${label}`} aria-current={index === page ? 'page' : undefined} onClick={() => onPageChange(index)}>{index + 1}</button>)}</div><button className="button button-outline" disabled={page === pageLabels.length - 1} onClick={() => onPageChange(page + 1)}>Page suivante <ArrowRight size={14}/></button></nav>
  </article>
}
