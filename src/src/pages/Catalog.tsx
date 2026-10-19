import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { CourseCard, EmptyState } from '../components/UI'
import { courses } from '../data'
import { useApp } from '../App'

export default function Catalog() {
  const { saved, toggleSaved, search, setSearch } = useApp()
  const [params, setParams] = useSearchParams()
  const [level, setLevel] = useState('Tous les niveaux')
  const [sort, setSort] = useState('A–Z')
  const [count, setCount] = useState(6)
  const category = params.get('category') ?? 'Toutes les catégories'
  const filtered = useMemo(() => {
    const list = courses.filter(c => (category === 'Toutes les catégories' || c.category === category) && (level === 'Tous les niveaux' || c.level === level) && `${c.title} ${c.instructor} ${c.category}`.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'Z–A') return list.sort((a,b) => b.title.localeCompare(a.title, 'fr'))
    return list.sort((a,b) => a.title.localeCompare(b.title, 'fr'))
  }, [category, level, sort, search])
  return <div className="page-width catalog-page"><div className="catalog-heading"><div><span className="eyebrow">Des ressources pour apprendre</span><h1>Catalogue des formations</h1><p>Des cours vidéo publics accompagnés de ressources documentées.</p></div><span className="results-badge">{filtered.length} cours</span></div>
    <div className="catalog-toolbar"><label className="search-field"><Search size={18}/><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un cours ou un auteur" aria-label="Rechercher un cours ou un auteur"/>{search && <button aria-label="Effacer la recherche" onClick={() => setSearch('')}><X size={15}/></button>}</label><div className="filter-controls"><SlidersHorizontal size={16}/><select aria-label="Catégorie" value={category} onChange={e => setParams(e.target.value === 'Toutes les catégories' ? {} : { category: e.target.value })}><option>Toutes les catégories</option>{[...new Set(courses.map(course=>course.category))].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Niveau" value={level} onChange={e=>setLevel(e.target.value)}>{['Tous les niveaux','Débutant'].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Trier les cours" value={sort} onChange={e=>setSort(e.target.value)}>{['A–Z','Z–A'].map(x=><option key={x}>{x}</option>)}</select></div></div>
    {filtered.length ? <><div className="course-grid catalog-grid">{filtered.slice(0,count).map(course => <CourseCard key={course.id} course={course} saved={saved.includes(course.id)} onSave={toggleSaved}/>)}</div>{count < filtered.length && <button className="button button-outline load-more" onClick={() => setCount(n=>n+6)}>Afficher plus</button>}</> : <EmptyState icon={<Search size={25}/>} title="Aucun cours trouvé" copy="Essayez une autre recherche ou modifiez les filtres."><button className="text-link" onClick={() => { setSearch(''); setParams({}); setLevel('Tous les niveaux') }}>Effacer les filtres</button></EmptyState>}
  </div>
}
