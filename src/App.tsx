import { Suspense, createContext, lazy, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import type { AuthError, Provider, Session } from '@supabase/supabase-js'
import { ArrowRight, ChevronDown, LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { courses } from './data'
import SkillAssessment from './components/SkillAssessment'
import type { SkillAssessmentResult } from './assessment'
import { supabase, supabaseConfigured } from './lib/supabase'
import CursorOrb from './components/CursorOrb'
const Landing = lazy(() => import('./pages/Landing'))
const Catalog = lazy(() => import('./pages/Catalog'))
const CourseDetails = lazy(() => import('./pages/CourseDetails'))
const LearningPlayer = lazy(() => import('./pages/LearningPlayer'))
const SourcesPage = lazy(() => import('./pages/Sources'))
const About = lazy(() => import('./pages/About'))
const MDNPath = lazy(() => import('./pages/MDNPath'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const Assistant = lazy(() => import('./pages/Assistant'))
const AuthPage = lazy(() => import('./pages/AuthPage'))

type AuthResult = { error: string; confirmationRequired?: boolean }
type AppContextType = { saved: string[]; toggleSaved: (id: string) => void; enrolled: string[]; enroll: (id: string) => void; hasAccess: (id: string) => boolean; simulatePurchase: (id: string) => void; canUnlockWithPoints: (id: string) => boolean; unlockWithPoints: (id: string) => boolean; pointsBalance: number; pointsEarned: number; pointsSpent: number; progressFor: (courseId: string) => number; isLessonComplete: (courseId: string, lessonIndex: number) => boolean; completeLesson: (courseId: string, lessonIndex: number) => void; studySecondsFor: (courseId: string) => number; addStudySeconds: (courseId: string, seconds: number) => void; scoreFor: (courseId: string) => number; recordQuizPass: (courseId: string) => void; user: string | null; authConfigured: boolean; signIn: (email: string, password: string, name: string, mode: 'login' | 'signup') => Promise<AuthResult>; signInOAuth: (provider: Extract<Provider, 'google' | 'github'>) => Promise<string>; signOut: () => void; search: string; setSearch: (value: string) => void; theme: 'dark' | 'light'; toggleTheme: () => void; assessment: SkillAssessmentResult | null; resetAssessment: () => void }
export const AppContext = createContext<AppContextType>(null!)
export function useApp() { return useContext(AppContext) }

function readString(key: string, fallback: string) { try { return localStorage.getItem(key) ?? fallback } catch { return fallback } }
function readList<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback } }
function readCourseList(key: string, fallback: string[]) { const stored = readList<string[]>(key, fallback); const valid = stored.filter(id=>courses.some(course=>course.id===id)); return valid.length ? valid : fallback }
function assessmentFor(userId: string | null) { return userId ? readList<SkillAssessmentResult | null>(`ev-skill-assessment:${userId}`, null) : null }
function calculateCourseScore(courseId: string, lessonProgress: Record<string, number[]>, passedQuizzes: string[], studySeconds: Record<string, number>) { return (lessonProgress[courseId] ?? []).length * 20 + (passedQuizzes.includes(courseId) ? 50 : 0) + Math.floor((studySeconds[courseId] ?? 0) / 600) * 5 }
function safeNext(value: string | null) { return value?.startsWith('/') && !value.startsWith('//') ? value : '/' }

function Header({ user, onSignOut, theme, onToggleTheme }: { user: string | null; onSignOut: () => void; theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const [menu, setMenu] = useState(false)
  return <header className="site-header"><div className="header-inner">
    <Link to="/" className="brand"><span className="brand-symbol"><span/></span><span>eduverse<span className="brand-dot">.</span></span></Link>
    <nav className={`main-nav ${menu ? 'nav-open' : ''}`} aria-label="Navigation principale">
      <NavLink to="/courses">Formations</NavLink><NavLink to="/assistant">Assistant IA</NavLink><Link to="/#categories" onClick={() => setMenu(false)}>Domaines</Link><Link to="/about" onClick={() => setMenu(false)}>À propos</Link><NavLink to="/dashboard">Mon espace</NavLink>
    </nav>
    <div className="header-actions"><button className="icon-button theme-toggle" aria-label="Changer de thème" onClick={onToggleTheme}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button>
      {user ? <><Link to="/account" className="user-pill"><span className="avatar">{user.slice(0,1).toUpperCase()}</span><span>{user.split('@')[0]}</span><ChevronDown size={14}/></Link><button className="icon-button signout" onClick={onSignOut} aria-label="Se déconnecter"><LogOut size={17}/></button></> : <><Link to="/login" className="login-link">Connexion</Link><Link to="/signup" className="button button-small">Créer un compte <ArrowRight size={15}/></Link></>}
      <button className="icon-button mobile-menu" aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
    </div>
  </div></header>
}

function Footer() { return <footer className="site-footer"><div className="footer-top"><Link to="/" className="brand"><span className="brand-symbol"><span/></span><span>eduverse<span className="brand-dot">.</span></span></Link><p>Apprendre avec des ressources vérifiables.</p><div className="footer-links"><Link to="/courses">Formations</Link><Link to="/dashboard">Mon espace</Link></div></div><div className="footer-bottom"><span>© 2026 EduVerse · Plateforme pédagogique</span><span>Les contenus vidéo restent la propriété de leurs éditeurs.</span></div></footer> }

export default function App() {
  const [saved, setSaved] = useState<string[]>(() => readCourseList('ev-saved', []))
  const [enrolled, setEnrolled] = useState<string[]>(() => readCourseList('ev-enrolled', ['web-html-css']))
  const [testEntitlements, setTestEntitlements] = useState<string[]>(() => readCourseList('ev-test-entitlements', []))
  const [pointUnlocks, setPointUnlocks] = useState<string[]>(() => readCourseList('ev-point-unlocks', []))
  const [lessonProgress, setLessonProgress] = useState<Record<string, number[]>>(() => readList('ev-lesson-progress', {}))
  const [studySeconds, setStudySeconds] = useState<Record<string, number>>(() => readList('ev-study-seconds', {}))
  const [passedQuizzes, setPassedQuizzes] = useState<string[]>(() => readList('ev-passed-quizzes', []))
  const [user, setUser] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => readString('ev-theme', 'dark') as 'dark' | 'light')
  const [assessment, setAssessment] = useState<SkillAssessmentResult | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const targetId = decodeURIComponent(location.hash.slice(1))
    let frame = 0
    let attempts = 0
    let cancelled = false
    const scrollToHash = () => {
      if (cancelled) return
      const target = document.getElementById(targetId)
      if (target) {
        const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12
        window.scrollTo({ top, behavior: 'smooth' })
        return
      }
      if (attempts++ < 120) frame = window.requestAnimationFrame(scrollToHash)
    }
    frame = window.requestAnimationFrame(scrollToHash)
    return () => { cancelled = true; window.cancelAnimationFrame(frame) }
  }, [location.pathname, location.hash])

  useEffect(() => {
    localStorage.removeItem('ev-user')
    localStorage.removeItem('ev-name')
    localStorage.removeItem('ev-skill-assessment')
    if (!supabase) { setAuthReady(true); return }
    let active = true
    const applySession = (session: Session | null) => {
      if (!active) return
      const id = session?.user.id ?? null
      setUserId(id)
      const metadata = session?.user.user_metadata
      setUser(session ? session.user.email ?? session.user.phone ?? metadata?.full_name ?? metadata?.name ?? metadata?.user_name ?? id : null)
      setAssessment(assessmentFor(id))
      setAuthReady(true)
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => applySession(session))
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Could not restore the account session.', error.message)
      applySession(data.session)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const pointsEarned = courses.reduce((sum, course) => sum + calculateCourseScore(course.id, lessonProgress, passedQuizzes, studySeconds), 0)
  const pointsSpent = pointUnlocks.reduce((sum, id) => sum + (courses.find(course => course.id === id)?.pointsCost ?? 0), 0)
  const pointsBalance = Math.max(0, pointsEarned - pointsSpent)
  const value = useMemo<AppContextType>(() => ({
    saved,
    toggleSaved: id => { const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id]; setSaved(next); localStorage.setItem('ev-saved', JSON.stringify(next)) },
    enrolled,
    enroll: id => { const next = enrolled.includes(id) ? enrolled : [...enrolled, id]; setEnrolled(next); localStorage.setItem('ev-enrolled', JSON.stringify(next)) },
    hasAccess: id => enrolled.includes(id) || testEntitlements.includes(id) || pointUnlocks.includes(id) || id === 'web-html-css',
    simulatePurchase: id => { const nextEntitlements = [...new Set([...testEntitlements, id])]; const nextEnrolled = [...new Set([...enrolled, id])]; setTestEntitlements(nextEntitlements); setEnrolled(nextEnrolled); localStorage.setItem('ev-test-entitlements', JSON.stringify(nextEntitlements)); localStorage.setItem('ev-enrolled', JSON.stringify(nextEnrolled)) },
    canUnlockWithPoints: id => { const cost = courses.find(course => course.id === id)?.pointsCost; return Boolean(cost && !enrolled.includes(id) && !testEntitlements.includes(id) && !pointUnlocks.includes(id) && pointsBalance >= cost) },
    unlockWithPoints: id => { const course = courses.find(item => item.id === id); if (!course?.pointsCost || pointsBalance < course.pointsCost || enrolled.includes(id) || testEntitlements.includes(id) || pointUnlocks.includes(id)) return false; const nextUnlocks = [...pointUnlocks, id]; const nextEnrolled = [...new Set([...enrolled, id])]; setPointUnlocks(nextUnlocks); setEnrolled(nextEnrolled); localStorage.setItem('ev-point-unlocks', JSON.stringify(nextUnlocks)); localStorage.setItem('ev-enrolled', JSON.stringify(nextEnrolled)); return true },
    progressFor: courseId => { const done = lessonProgress[courseId] ?? []; const length = courses.find(course=>course.id===courseId)?.curriculum.length ?? 1; return Math.round(done.filter(index=>index>=0&&index<length).length / length * 100) },
    isLessonComplete: (courseId, lessonIndex) => (lessonProgress[courseId] ?? []).includes(lessonIndex),
    completeLesson: (courseId, lessonIndex) => { const next = { ...lessonProgress, [courseId]: [...new Set([...(lessonProgress[courseId] ?? []), lessonIndex])] }; setLessonProgress(next); localStorage.setItem('ev-lesson-progress', JSON.stringify(next)) },
    studySecondsFor: courseId => studySeconds[courseId] ?? 0,
    addStudySeconds: (courseId, seconds) => { const next = { ...studySeconds, [courseId]: (studySeconds[courseId] ?? 0) + seconds }; setStudySeconds(next); localStorage.setItem('ev-study-seconds', JSON.stringify(next)) },
    scoreFor: courseId => calculateCourseScore(courseId, lessonProgress, passedQuizzes, studySeconds),
    recordQuizPass: courseId => { const next = [...new Set([...passedQuizzes, courseId])]; setPassedQuizzes(next); localStorage.setItem('ev-passed-quizzes', JSON.stringify(next)) },
    user,
    authConfigured: supabaseConfigured,
    signIn: async (email, password, name, mode) => {
      if (!supabase) return { error: 'Le service de compte n’est pas configuré. Ajoutez les identifiants Supabase dans .env.local.' }
      const cleanEmail = email.trim().toLowerCase()
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email: cleanEmail, password, options: { data: { display_name: name.trim() }, emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login` } })
        : await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      if (result.error) return { error: authMessage(result.error) }
      if (mode === 'signup' && !result.data.session) return { error: '', confirmationRequired: true }
      return { error: '' }
    },
    signInOAuth: async (provider) => {
      if (!supabase) return 'Le service de compte n’est pas configuré. Ajoutez les identifiants Supabase dans .env.local.'
      const next = safeNext(new URLSearchParams(location.search).get('next'))
      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}login?next=${encodeURIComponent(next)}`
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
      return error ? authMessage(error) : ''
    },
    signOut: () => { if (supabase) void supabase.auth.signOut(); setUser(null); setUserId(null); setAssessment(null); navigate('/login') },
    search, setSearch, theme,
    toggleTheme: () => setTheme(old => { const next = old === 'dark' ? 'light' : 'dark'; localStorage.setItem('ev-theme', next); return next }),
    pointsBalance, pointsEarned, pointsSpent,
    assessment,
    resetAssessment: () => { if (userId) localStorage.removeItem(`ev-skill-assessment:${userId}`); setAssessment(null) },
  }), [saved, enrolled, testEntitlements, pointUnlocks, lessonProgress, studySeconds, passedQuizzes, user, search, theme, navigate, pointsBalance, pointsEarned, pointsSpent, assessment, userId, location.search])

  const gated = (element: ReactNode, path: string) => !authReady ? <div className="route-loading" role="status">Vérification de votre session…</div> : user ? element : <Navigate to={`/signup?next=${encodeURIComponent(path)}`} replace/>
  return <AppContext.Provider value={value}><div className={`app-shell theme-${theme}`}><CursorOrb/><Header user={user} onSignOut={value.signOut} theme={theme} onToggleTheme={value.toggleTheme}/><main><Suspense fallback={<div className="route-loading" role="status">Chargement de votre espace de formation…</div>}><Routes>
    <Route path="/" element={<Landing/>}/><Route path="/courses" element={<Catalog/>}/><Route path="/sources" element={<SourcesPage/>}/><Route path="/about" element={<About/>}/><Route path="/parcours-mdn" element={<MDNPath/>}/><Route path="/course/:id" element={<CourseDetails/>}/><Route path="/assistant" element={gated(<Assistant/>, '/assistant')}/><Route path="/learn/:id/:lessonIndex?" element={gated(<LearningPlayer/>, location.pathname + location.search)}/><Route path="/dashboard" element={gated(<Dashboard/>, '/dashboard')}/><Route path="/account" element={gated(<AccountSettings/>, '/account')}/><Route path="/assessment" element={gated(<SkillAssessment onComplete={result => { if (userId) localStorage.setItem(`ev-skill-assessment:${userId}`, JSON.stringify(result)); setAssessment(result); navigate('/dashboard') }}/>, '/assessment')}/><Route path="/login" element={!authReady ? <div className="route-loading" role="status">Vérification de votre session…</div> : user ? <Navigate to={safeNext(new URLSearchParams(location.search).get('next'))} replace/> : <AuthPage mode="login"/>}/><Route path="/signup" element={!authReady ? <div className="route-loading" role="status">Vérification de votre session…</div> : user ? <Navigate to={safeNext(new URLSearchParams(location.search).get('next'))} replace/> : new URLSearchParams(location.search).get('next') === '/' ? <Navigate to="/" replace/> : <AuthPage mode="signup"/>}/><Route path="/instructor" element={gated(<section className="page-width workspace-setup"><span className="eyebrow">ESPACE FORMATEUR</span><h1>L’espace formateur n’est pas encore activé.</h1><p>Cette page reste fermée tant que les rôles ne sont pas vérifiés côté serveur.</p><Link to="/courses" className="button">Retour aux formations <ArrowRight size={15}/></Link></section>, '/instructor')}/><Route path="/admin" element={gated(<section className="page-width workspace-setup"><span className="eyebrow">ESPACE ADMINISTRATEUR</span><h1>L’espace admin doit être configuré.</h1><p>Cette page reste fermée tant que les rôles ne sont pas vérifiés côté serveur.</p><Link to="/courses" className="button">Retour aux formations <ArrowRight size={15}/></Link></section>, '/admin')}/><Route path="*" element={<div className="not-found"><span className="eyebrow">404 / PAGE INTROUVABLE</span><h1>Cette page n’existe pas.</h1><Link className="button" to="/courses">Voir les formations <ArrowRight size={15}/></Link></div>}/>
  </Routes></Suspense></main><Footer/></div></AppContext.Provider>
}

function authMessage(error: AuthError) {
  if (error.status === 400 || error.status === 422) return 'Vérifiez votre adresse e-mail et votre mot de passe, puis réessayez.'
  if (error.status === 429) return 'Trop de tentatives. Attendez quelques minutes avant de réessayer.'
  if (error.message.toLowerCase().includes('fetch')) return 'Impossible de joindre Supabase. Vérifiez la configuration réseau du projet.'
  return 'La connexion n’a pas abouti. Vérifiez vos informations et réessayez.'
}
