import { useState, type FormEvent } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'
import type { Course, Lesson } from '../data'

const FREE_QUESTIONS = 5
const STORAGE_KEY = 'ev-tutor-credits-v1'
const plans = [
  { price: 20, label: 'Pack découverte', credits: 25 },
  { price: 100, label: 'Pack approfondi', credits: 150 },
]
type ChatMessage = { role: 'user' | 'assistant'; content: string }

function readCredits() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return { used: Number.isInteger(value.used) && value.used >= 0 ? value.used : 0, extra: Number.isInteger(value.extra) && value.extra >= 0 ? value.extra : 0 }
  } catch {
    return { used: 0, extra: 0 }
  }
}

export default function CourseTutor({ course, lesson }: { course: Course; lesson: Lesson }) {
  const [credits, setCredits] = useState(readCredits)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const freeLeft = Math.max(0, FREE_QUESTIONS - credits.used)
  const remaining = freeLeft + credits.extra

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const prompt = question.trim().slice(0, 500)
    if (!prompt || remaining === 0) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: course.id, lessonTitle: lesson.title, question: prompt, history: messages.slice(-8) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Le service IA est momentanément indisponible.')
      if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('Le service IA a renvoyé une réponse vide.')
      const next = freeLeft > 0 ? { ...credits, used: credits.used + 1 } : { ...credits, extra: credits.extra - 1 }
      setCredits(next)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* Keep this session usable if storage is unavailable. */ }
      setMessages(current => [...current, { role: 'user', content: prompt }, { role: 'assistant', content: data.answer }])
      setQuestion('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Impossible de joindre le service IA.')
    } finally {
      setBusy(false)
    }
  }

  function simulatePurchase(creditsToAdd: number) {
    const next = { ...credits, extra: credits.extra + creditsToAdd }
    setCredits(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* This purchase is only an in-browser demonstration. */ }
  }

  return <section className="course-tutor" aria-labelledby="tutor-title">
    <div className="tutor-heading"><span className="tutor-icon"><Bot size={18}/></span><div><span className="eyebrow">ASSISTANT IA · FORMATION SÉLECTIONNÉE</span><h2 id="tutor-title">Une question sur le cours ?</h2></div><span className="tutor-credit-count">{remaining} question{remaining === 1 ? '' : 's'}</span></div>
    <p className="tutor-disclosure"><Sparkles size={14}/> Discutez avec l’assistant sur les sujets de cette formation. Vous pouvez poser une question de suivi et demander une autre explication; il garde les derniers échanges de cette conversation.</p>
    {messages.length > 0 && <div className="tutor-conversation" aria-live="polite">{messages.map((message, index) => <div className={`tutor-message tutor-message-${message.role}`} key={`${index}-${message.role}`}><strong>{message.role === 'user' ? 'Vous' : 'Assistant du cours'}</strong><p>{message.content}</p></div>)}{busy && <div className="tutor-message tutor-message-assistant"><strong>Assistant du cours</strong><p>Je prépare une explication…</p></div>}</div>}
    {remaining > 0 ? <form className="tutor-form" onSubmit={ask}><label className="sr-only" htmlFor="course-question">Votre question sur le cours</label><textarea id="course-question" value={question} maxLength={500} onChange={event => setQuestion(event.target.value)} placeholder="Ex. Explique-moi HTML, puis donne-moi un autre exemple…" rows={2}/><button className="button" disabled={!question.trim() || busy}><Send size={14}/>{busy ? 'Réponse en cours…' : messages.length ? 'Continuer la conversation' : 'Poser ma question'}</button></form> : <div className="tutor-plans"><strong>Vos questions gratuites sont utilisées.</strong><span>Recharger des crédits de test (simulation locale, sans paiement réel) :</span>{plans.map(plan => <button key={plan.price} className="tutor-plan" onClick={() => simulatePurchase(plan.credits)}><span>{plan.label}<small>+{plan.credits} questions · prix fictif</small></span><b>{plan.price} DH</b></button>)}</div>}
    {error && <p className="tutor-error" role="alert">{error}</p>}
  </section>
}
