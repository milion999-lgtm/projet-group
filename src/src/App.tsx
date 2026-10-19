import { Suspense, createContext, lazy, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { courses } from './data'
const Landing = lazy(() => import('./pages/Landing'))
const Catalog = lazy(() => import('./pages/Catalog'))
const CourseDetails = lazy(() => import('./pages/CourseDetails'))
const LearningPlayer = lazy(() => import('./pages/LearningPlayer'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const Management = lazy(() => import('./pages/Management'))

type AppContextType = { saved: string[]; toggleSaved: (id: string) => void; enrolled: string[]; enroll: (id: string) => void; progressFor: (courseId: string) => number; isLessonComplete: (courseId: string, lessonIndex: number) => boolean; completeLesson: (courseId: string, lessonIndex: number) => void; user: string | null; signIn: (email: string, password: string, name?: string) => string; signOut: () => void; search: string; setSearch: (value: string) => void; theme: 'dark' | 'light'; toggleTheme: () => void }
export const AppContext = createContext<AppContextType>(null!)
export function useApp() { return ReactUseContext(AppContext) }
import { useContext as ReactUseContext } from 'react'

function readString(key: string, fallback: string) { try { return localStorage.getItem(key) ?? fallback } catch { return fallback } }
function readList<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback } }
function readCourseList(key: string, fallback: string[]) { const stored = readList<string[]>(key, fallback); const valid = stored.filter(id=>courses.some(course=>course.id===id)); return valid.length ? valid : fallback }

function Header({ user, onSignOut, theme, onToggleTheme }: { user: string | null; onSignOut: () => void; theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const [menu, setMenu] = useState(false)
  return <header className="site-header"><div className="header-inner">
    <Link to="/" className="brand"><span className="brand-symbol"><span/></span><span>eduverse<span className="brand-dot">.</span></span></Link>
    <nav className={`main-nav ${menu ? 'nav-open' : ''}`} aria-label="Navigation principale">
      <NavLink to="/courses">Formations</NavLink><a href="/#categories">Domaines</a><a href="/#about">À propos</a><NavLink to="/dashboard">Mon espace</NavLink>
    </nav>
    <div className="header-actions"><button className="icon-button theme-toggle" aria-label="Changer de thème" onClick={onToggleTheme}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button>
      {user ? <><Link to="/dashboard" className="user-pill"><span className="avatar">{user.slice(0,1).toUpperCase()}</span><span>{user.split('@')[0]}</span><ChevronDown size={14}/></Link><button className="icon-button signout" onClick={onSignOut} aria-label="Se déconnecter"><LogOut size={17}/></button></> : <><Link to="/login" className="login-link">Connexion</Link><Link to="/signup" className="button button-small">Créer un compte <ArrowRight size={15}/></Link></>}
      <button className="icon-button mobile-menu" aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
    </div>
  </div></header>
}

function Footer() { return <footer className="site-footer"><div className="footer-top"><Link to="/" className="brand"><span className="brand-symbol"><span/></span><span>eduverse<span className="brand-dot">.</span></span></Link><p>Apprendre avec des ressources vérifiables.</p><div className="footer-links"><Link to="/courses">Formations</Link><Link to="/dashboard">Mon espace</Link><Link to="/instructor">Espace formateur</Link><Link to="/admin">Administration démo</Link></div></div><div className="footer-bottom"><span>© 2026 EduVerse · Plateforme pédagogique</span><span>Les contenus vidéo restent la propriété de leurs éditeurs.</span></div></footer> }

export default function App() {
  const [saved, setSaved] = useState<string[]>(() => readCourseList('ev-saved', []))
  const [enrolled, setEnrolled] = useState<string[]>(() => readCourseList('ev-enrolled', ['web-html-css']))
  const [lessonProgress, setLessonProgress] = useState<Record<string, number[]>>(() => readList('ev-lesson-progress', {}))
  const [user, setUser] = useState<string | null>(() => readString('ev-user', '') || null)
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => readString('ev-theme', 'dark') as 'dark' | 'light')
  const navigate = useNavigate()
  const value = useMemo<AppContextType>(() => ({ saved, toggleSaved: id => { const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id]; setSaved(next); localStorage.setItem('ev-saved', JSON.stringify(next)) }, enrolled, enroll: id => { const next = enrolled.includes(id) ? enrolled : [...enrolled, id]; setEnrolled(next); localStorage.setItem('ev-enrolled', JSON.stringify(next)) }, progressFor: courseId => { const done = lessonProgress[courseId] ?? []; const length = courses.find(course=>course.id===courseId)?.curriculum.length ?? 1; return Math.round(done.filter(index=>index>=0&&index<length).length / length * 100) }, isLessonComplete: (courseId, lessonIndex) => (lessonProgress[courseId] ?? []).includes(lessonIndex), completeLesson: (courseId, lessonIndex) => { const next = { ...lessonProgress, [courseId]: [...new Set([...(lessonProgress[courseId] ?? []), lessonIndex])] }; setLessonProgress(next); localStorage.setItem('ev-lesson-progress', JSON.stringify(next)) }, user, signIn: (email, password, name) => { if (!email.includes('@')) return 'Saisissez une adresse e-mail valide.'; if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.'; const identity = email.trim().toLowerCase(); setUser(identity); localStorage.setItem('ev-user', identity); if (name?.trim()) localStorage.setItem('ev-name', name.trim()); return '' }, signOut: () => { setUser(null); localStorage.removeItem('ev-user'); navigate('/') }, search, setSearch, theme, toggleTheme: () => setTheme(old => { const next = old === 'dark' ? 'light' : 'dark'; localStorage.setItem('ev-theme', next); return next }) }), [saved, enrolled, lessonProgress, user, search, theme, navigate])
  return <AppContext.Provider value={value}><div className={`app-shell theme-${theme}`}><Header user={user} onSignOut={value.signOut} theme={theme} onToggleTheme={value.toggleTheme}/><main><Suspense fallback={<div className="route-loading" role="status">Chargement de votre espace de formation…</div>}><Routes>
    <Route path="/" element={<Landing/>}/><Route path="/courses" element={<Catalog/>}/><Route path="/course/:id" element={<CourseDetails/>}/><Route path="/learn/:id" element={<LearningPlayer/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/signup" element={<AuthPage mode="signup"/>}/><Route path="/instructor" element={<Management role="instructor"/>}/><Route path="/admin" element={<Management role="admin"/>}/><Route path="*" element={<div className="not-found"><span className="eyebrow">404 / PAGE INTROUVABLE</span><h1>Cette page n’existe pas.</h1><Link className="button" to="/courses">Voir les formations <ArrowRight size={16}/></Link></div>}/>
  </Routes></Suspense></main><Footer/></div></AppContext.Provider>
}
