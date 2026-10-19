import { useState } from 'react'
import { Bot, BookOpenCheck } from 'lucide-react'
import { courses } from '../data'
import CourseTutor from '../components/CourseTutor'

export default function Assistant() {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const course = courses.find(item => item.id === courseId) ?? courses[0]
  if (!course) return null
  const lesson = course.curriculum[0]
  return <div className="page-width assistant-hub">
    <header className="assistant-hub-heading"><span className="assistant-hub-icon"><Bot size={24}/></span><div><span className="eyebrow">ESPACE DÉDIÉ À VOS QUESTIONS</span><h1>Assistant IA</h1><p>Posez une question sur une formation. L’assistant s’appuie sur son programme et ses ressources pour vous expliquer les notions, avec des questions de suivi.</p></div></header>
    <label className="assistant-course-select"><span><BookOpenCheck size={16}/> Formation concernée</span><select value={course.id} onChange={event=>setCourseId(event.target.value)} aria-label="Choisir la formation pour l’assistant">{courses.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select><small>Les réponses restent centrées sur le cours choisi. Vous pouvez aussi retrouver l’assistant à l’intérieur de chaque leçon.</small></label>
    <CourseTutor key={course.id} course={course} lesson={lesson}/>
  </div>
}
