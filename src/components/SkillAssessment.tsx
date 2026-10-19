import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpenCheck, Check, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { createAssessmentResult, skillQuestions, type SkillAssessmentResult } from '../assessment'

export default function SkillAssessment({ onComplete }: { onComplete: (result: SkillAssessmentResult) => void }) {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<SkillAssessmentResult | null>(null)
  const reducedMotion = useReducedMotion()
  const question = skillQuestions[step]
  const selectAnswer = (answer: number) => setAnswers(current => current.map((value, index) => index === step ? answer : value).length > step ? current.map((value, index) => index === step ? answer : value) : [...current, answer])
  const next = () => {
    if (answers[step] === undefined) return
    if (step + 1 === skillQuestions.length) setResult(createAssessmentResult(answers))
    else setStep(current => current + 1)
  }

  return <div className="assessment-shell">
    <div className="assessment-ambient" aria-hidden="true"><span/><span/><span/></div>
    <header className="assessment-brand"><span className="brand-symbol"><span/></span><strong>eduverse<span className="brand-dot">.</span></strong><span className="assessment-brand-label">Apprentissage personnalisé</span></header>
    <AnimatePresence mode="wait" initial={false}>
      {!started ? <motion.section key="welcome" className="assessment-panel assessment-welcome" initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -12 }} transition={{ duration: reducedMotion ? 0 : .35 }}>
        <span className="assessment-icon"><BookOpenCheck size={23}/></span><span className="eyebrow">VOTRE PARCOURS COMMENCE ICI</span>
        <h1>Bienvenue sur EduVerse.</h1><p className="assessment-lead">Découvrez les formations qui correspondent à vos connaissances actuelles.</p>
        <div className="assessment-overview"><span><Check size={16}/> 10 questions courtes</span><span><Check size={16}/> HTML, programmation, données et design</span><span><Check size={16}/> Un résultat immédiat et des cours conseillés</span></div>
        <button className="button assessment-primary" onClick={() => setStarted(true)}>Commencer le diagnostic <ArrowRight size={16}/></button>
        <p className="assessment-privacy">Votre résultat est enregistré dans le navigateur utilisé. Ce test sert à orienter votre apprentissage; il ne constitue pas une certification.</p>
      </motion.section> : result ? <motion.section key="result" className="assessment-panel assessment-result" initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .35 }}>
        <span className="assessment-icon"><Sparkles size={22}/></span><span className="eyebrow">DIAGNOSTIC TERMINÉ</span><h1>Votre point de départ</h1>
        <div className="assessment-score"><strong>{result.score}<span>/{result.total}</span></strong><p>bonnes réponses</p></div>
        <p className="assessment-lead">Les recommandations sont calculées à partir des réponses manquées. Vous pourrez les retrouver sur l’accueil.</p>
        <div className="assessment-result-topics"><span>Domaines évalués</span><div>{skillQuestions.map(item => <span key={item.skill}>{item.skill}</span>)}</div></div>
        <button className="button assessment-primary" onClick={() => onComplete(result)}>Voir mes recommandations <ArrowRight size={16}/></button>
      </motion.section> : <motion.section key={`question-${step}`} className="assessment-panel assessment-question" initial={reducedMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reducedMotion ? undefined : { opacity: 0, x: -18 }} transition={{ duration: reducedMotion ? 0 : .22 }}>
        <div className="assessment-progress-head"><span className="eyebrow">DIAGNOSTIC DE COMPÉTENCES</span><span>{step + 1} / {skillQuestions.length}</span></div>
        <div className="assessment-progress"><span style={{ width: `${(step + 1) / skillQuestions.length * 100}%` }}/></div>
        <span className="assessment-skill">{question.skill}</span><h1>{question.question}</h1>
        <div className="assessment-options" aria-label={question.skill}>{question.options.map((option, index) => <button key={option} aria-pressed={answers[step] === index} className={answers[step] === index ? 'assessment-option selected' : 'assessment-option'} onClick={() => selectAnswer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}{answers[step] === index && <Check size={16}/>}</button>)}</div>
        <div className="assessment-nav">{step > 0 && <button className="assessment-back" onClick={() => setStep(current => current - 1)}><ArrowLeft size={15}/> Précédent</button>}<button className="button assessment-primary" disabled={answers[step] === undefined} onClick={next}>{step + 1 === skillQuestions.length ? 'Voir mon résultat' : 'Question suivante'} <ArrowRight size={16}/></button></div>
      </motion.section>}
    </AnimatePresence>
  </div>
}
