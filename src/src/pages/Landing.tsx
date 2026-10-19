import { ArrowDown, ArrowRight, ArrowUpRight, BookOpenCheck, Code2, ExternalLink, FileText, Palette, Play, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlobeExperience from '../components/GlobeExperience'
import { CourseCard, SectionHeading } from '../components/UI'
import { courses } from '../data'
import { useApp } from '../App'

const categories = [
  { title: 'Développement web', icon: Code2 },
  { title: 'Programmation', icon: BookOpenCheck },
  { title: 'Design UI/UX', icon: Palette },
]

export default function Landing() {
  const { saved, toggleSaved } = useApp()
  return <>
    <section className="hero"><div className="hero-grid"/><div className="hero-inner page-width">
      <div className="hero-copy"><span className="hero-kicker"><BookOpenCheck size={14}/> Cours gratuits, vidéos originales et documentation</span><motion.h1 initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.55,ease:'easeOut'}}>Apprenez pour<br/>de vrai. <span>Construisez<br className="desktop-break"/> vos compétences.</span></motion.h1><p>Suivez des formations complètes en français, travaillez avec des exemples concrets et ouvrez les ressources officielles quand vous voulez approfondir.</p>
        <div className="hero-actions"><Link to="/courses" className="button">Découvrir les cours <ArrowRight size={16}/></Link><Link to={`/course/${courses[0].id}`} className="button button-outline"><Play size={14} fill="currentColor"/> Commencer gratuitement</Link></div>
        <div className="hero-proof"><span><strong>{courses.length} formations</strong> sélectionnées et documentées</span></div>
      </div>
      <div className="hero-art"><div className="hero-halo"/><div className="hero-coordinate coordinate-a">HTML · CSS · PYTHON</div><div className="hero-coordinate coordinate-b">APPRENDRE / PRATIQUER / CRÉER</div><GlobeExperience/><div className="orbit-card orbit-card-top"><span className="orbit-card-icon"><FileText size={16}/></span><span><strong>Sources identifiées</strong><small>Vidéos et docs d’origine</small></span></div><div className="orbit-card orbit-card-bottom"><span className="pulse-ring"><span/></span><span><strong>À votre rythme</strong><small>Progression enregistrée ici</small></span></div></div>
    </div><a className="scroll-cue" href="#cours"><ArrowDown size={14}/> Parcourir les formations</a></section>

    <section className="featured-section section-pad" id="cours"><div className="page-width"><div className="section-row"><SectionHeading eyebrow="Cours sélectionnés" title="Des compétences à mettre en pratique" copy="Chaque formation renvoie à la vidéo publiée par son auteur et à des ressources de référence."/><Link to="/courses" className="text-link view-all">Voir le catalogue <ArrowUpRight size={15}/></Link></div>
      <div className="course-grid">{courses.map(course => <CourseCard key={course.id} course={course} saved={saved.includes(course.id)} onSave={toggleSaved}/>)}</div>
    </div></section>

    <section className="category-section section-pad" id="categories"><div className="page-width"><div className="section-row"><SectionHeading eyebrow="Choisir un parcours" title="Apprendre par domaine"/><Link to="/courses" className="text-link view-all">Tous les cours <ArrowUpRight size={15}/></Link></div><div className="category-grid">{categories.map(({ title, icon: Icon }, i) => {const count=courses.filter(course=>course.category===title).length;return <Link to={`/courses?category=${encodeURIComponent(title)}`} className={`category-card cat-${i===0?'blue':i===1?'orange':'pink'}`} key={title}><span className="category-number">0{i + 1}</span><span className="category-icon"><Icon size={22}/></span><span className="category-title">{title}</span><span className="category-count">{count} {count>1?'cours':'cours'} <ArrowUpRight size={13}/></span></Link>})}</div></div></section>

    <section className="stats-section" id="about"><div className="page-width stats-inner"><div className="stats-copy"><span className="eyebrow">Comment ça marche</span><h2>Regardez.<br/><span>Pratiquez. Comprenez.</span></h2><p>Les vidéos restent hébergées chez leurs auteurs. Les leçons ajoutent un fil conducteur en français et des liens vers les documents officiels pour vérifier et approfondir les notions.</p><Link to="/courses" className="text-link">Choisir une formation <ArrowRight size={15}/></Link></div><div className="source-list"><article><span className="source-icon"><Play size={17}/></span><div><strong>Une vraie formation vidéo</strong><p>Visionnez le cours complet intégré depuis sa chaîne d’origine.</p></div></article><article><span className="source-icon"><ShieldCheck size={17}/></span><div><strong>Des références consultables</strong><p>Documentation MDN, tutoriel Python et centre d’aide Figma associés aux leçons.</p></div></article><article><span className="source-icon"><BookOpenCheck size={17}/></span><div><strong>Un parcours suivi</strong><p>Enregistrez vos favoris, vos notes et les leçons terminées sur cet appareil.</p></div></article></div><div className="stats-orb" aria-hidden="true">✳</div></div></section>

    <section className="instructor-section section-pad"><div className="page-width instructor-inner"><div className="instructor-photo"><div className="source-logo-grid"><span>MDN</span><span>Python</span><span>Figma</span><span>OpenClassrooms</span></div><div className="instructor-note"><ShieldCheck size={15}/> Auteurs et éditeurs indiqués sur chaque cours</div></div><div className="instructor-copy"><span className="eyebrow">Transparence des sources</span><h2>Apprendre avec<br/>des ressources publiées.</h2><p>EduVerse rassemble des formations accessibles, mais ne prétend pas les avoir produites. Chaque fiche indique l’auteur, la vidéo originale et des ressources écrites fiables.</p><a href="https://developer.mozilla.org/fr/docs/Learn_web_development/Core" target="_blank" rel="noreferrer" className="button button-outline">Explorer le parcours MDN <ExternalLink size={15}/></a></div></div></section>

    <section className="testimonial-section section-pad"><div className="page-width"><SectionHeading eyebrow="À savoir avant de commencer" title="Un accès simple et transparent"/><div className="testimonial-grid"><article className="testimonial-card"><div className="quote-mark"><Play size={20}/></div><h3>Les vidéos</h3><p>Elles sont intégrées depuis YouTube. Le lecteur affiche la vidéo de son auteur et peut dépendre de la disponibilité de l’intégration.</p></article><article className="testimonial-card testimonial-featured"><div className="quote-mark"><FileText size={20}/></div><h3>Les ressources</h3><p>Les guides et exercices restent hébergés chez MDN, Python et Figma. Vous pouvez les ouvrir pour approfondir chaque notion.</p></article><article className="testimonial-card"><div className="quote-mark"><BookOpenCheck size={20}/></div><h3>Votre progression</h3><p>La version actuelle conserve la progression dans le navigateur. Elle n’est pas encore synchronisée entre plusieurs appareils.</p></article></div></div></section>

    <section className="faq-section section-pad"><div className="page-width faq-layout"><SectionHeading eyebrow="Questions fréquentes" title="Avant de vous lancer" copy="Ce que la plateforme fournit aujourd’hui."/><div className="faq-list">{[
      ['Les cours sont-ils payants ?', 'Les vidéos et les documentations sélectionnées sont accessibles gratuitement depuis leurs éditeurs. Figma peut demander un compte gratuit pour pratiquer.'],
      ['Les vidéos sont-elles créées par EduVerse ?', 'Non. Elles restent la propriété de leurs auteurs et sont intégrées depuis leurs pages YouTube publiques. Le nom de la source apparaît sur chaque formation.'],
      ['Est-ce que j’obtiens une certification officielle ?', 'Non. La plateforme ne délivre pas de certification reconnue par un organisme. Elle suit votre progression personnelle dans le navigateur.'],
      ['Puis-je publier ces cours sur le site ?', 'Les vidéos intégrées restent hébergées chez leurs éditeurs. Avant la mise en ligne publique, il faut configurer l’hébergement, la politique de confidentialité et les comptes réels de la plateforme.'],
    ].map(([question, answer], index) => <details className="faq-item" key={question} open={index===0}><summary><span>{question}</span><span className="faq-plus">+</span></summary><p>{answer}</p></details>)}</div></div></section>

    <section className="closing-cta"><div className="page-width closing-inner"><div><span className="eyebrow">Commencez aujourd’hui</span><h2>Choisissez votre premier cours.</h2><p>Accédez aux vidéos et aux ressources sans frais de cours.</p></div><Link to="/courses" className="button button-light">Voir le catalogue <ArrowRight size={16}/></Link><span className="cta-spark">✳</span></div></section>
  </>
}
