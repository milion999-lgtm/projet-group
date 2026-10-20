import { ArrowRight, BookOpenCheck, ExternalLink, Play, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const principles = [
  {
    number: '01',
    icon: Play,
    title: 'Des vidéos de leurs auteurs',
    copy: 'Les vidéos restent hébergées par leurs éditeurs. Chaque formation indique qui a publié le contenu et renvoie vers la source originale.',
  },
  {
    number: '02',
    icon: BookOpenCheck,
    title: 'Un parcours guidé',
    copy: 'Les leçons rassemblent les notions, exemples et étapes de pratique dans EduVerse, afin de suivre un fil clair pendant l’apprentissage.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Des sources vérifiables',
    copy: 'Les ressources de référence sont présentées avec les cours pour vous permettre de vérifier une notion et d’approfondir à votre rythme.',
  },
]

export default function About() {
  return <main className="about-page page-width">
    <Link to="/" className="back-link">← Accueil</Link>
    <section className="about-hero">
      <span className="eyebrow">À PROPOS D’EDUVERSE</span>
      <h1>Apprendre avec méthode.<br/><span>Construire des compétences réelles.</span></h1>
      <p>EduVerse est un espace d’apprentissage du développement et des outils numériques. Il relie des vidéos publiées par leurs auteurs à des leçons guidées, des exercices et des références consultables.</p>
      <div className="about-actions">
        <Link to="/courses" className="button">Découvrir les formations <ArrowRight size={16}/></Link>
        <Link to="/sources" className="button button-outline">Voir les sources <ExternalLink size={15}/></Link>
      </div>
    </section>

    <section className="about-principles" aria-labelledby="about-principles-title">
      <div className="about-section-heading">
        <span className="eyebrow">NOTRE APPROCHE</span>
        <h2 id="about-principles-title">Un parcours clair, de la vidéo à la pratique.</h2>
        <p>Chaque outil a un rôle précis : comprendre une notion, la vérifier, puis l’appliquer dans un petit exercice.</p>
      </div>
      <div className="about-principle-grid">
        {principles.map(({number, icon: Icon, title, copy}) => <article className="about-principle" key={number}>
          <span className="about-principle-number">{number}</span>
          <span className="about-principle-icon"><Icon size={20}/></span>
          <h3>{title}</h3>
          <p>{copy}</p>
        </article>)}
      </div>
    </section>

    <section className="about-transparency">
      <div>
        <span className="eyebrow">TRANSPARENCE</span>
        <h2>Les contenus et leurs auteurs restent identifiables.</h2>
        <p>EduVerse organise des ressources d’apprentissage et ajoute un fil pédagogique. Les vidéos et documents externes gardent leurs auteurs et leurs conditions d’accès. Les fonctions de paiement visibles sur le site sont des démonstrations de test, sans débit réel.</p>
      </div>
      <Link to="/sources" className="text-link">Explorer les références <ArrowRight size={15}/></Link>
    </section>
  </main>
}
