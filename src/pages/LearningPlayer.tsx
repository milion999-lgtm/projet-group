import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, BookOpenCheck, Check, ChevronDown, ChevronUp, FileText, MessageSquareText, Play, Trophy, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { courses, type Course } from '../data'
import { useApp } from '../App'
import LessonReader from '../components/LessonReader'
import CourseTutor from '../components/CourseTutor'

const examples: Record<string, string[]> = {
  'web-html-css': ['<main>\n  <h1>Mon portfolio</h1>\n  <p>Je construis des pages accessibles.</p>\n</main>', '<article>\n  <h2>Un projet</h2>\n  <p>Un contenu autonome.</p>\n</article>', '<a href="/contact">Me contacter</a>\n<img src="portrait.jpg" alt="Portrait de Sara">', 'h1 { font-size: 2rem; }\n.card { padding: 1rem; border: 1px solid #ddd; }', '.navigation {\n  display: flex;\n  gap: 1rem;\n  align-items: center;\n}', '@media (max-width: 600px) {\n  .layout { grid-template-columns: 1fr; }\n}'],
  'python-fondamentaux': ['message = "Bonjour Python"\nprint(message)', 'prix = 24.5\ntaux = 0.2\ntotal = prix * (1 + taux)', 'note = 14\nif note >= 10:\n    print("Validé")', 'cours = ["HTML", "Python"]\nfor nom in cours:\n    print(nom)', 'def prix_ttc(prix, taux):\n    return prix * (1 + taux)\n\nprint(prix_ttc(100, 0.2))', 'import statistics\nnotes = [12, 15, 17]\nprint(statistics.mean(notes))'],
  'figma-interface': ['Frame → Header → Hero → Sections → Footer', 'Auto Layout · direction verticale · espacement 24', 'Component: Button / primary / default', 'Prototype: bouton → écran suivant → transition'],
  'javascript-fundamentals': ['const prix = [20, 35, 12];\nconst total = prix.reduce((somme, item) => somme + item, 0);', 'const stock = 3;\nif (stock > 0) console.log("Disponible");', 'function prixTTC(prix, taux) {\n  return prix * (1 + taux);\n}', 'const cours = [{titre: "HTML"}, {titre: "Python"}];\ncours.map(item => item.titre);'],
  'react-apps': ['function Badge() {\n  return <span>Débutant</span>;\n}', '<CourseCard titre="HTML" niveau="Débutant" />', 'const [ouvert, setOuvert] = useState(false);\n<button onClick={() => setOuvert(!ouvert)}>Afficher</button>', 'const visibles = cours.filter(cours => cours.actif);'],
  'git-github': ['git init\ngit status\ngit add index.html\ngit commit -m "Ajoute la page"', 'git switch -c ajout-contact\ngit status\ngit commit -am "Ajoute contact"', 'git remote add origin URL_DU_DEPOT\ngit push -u origin main', 'git fetch origin\ngit switch main\ngit merge origin/main'],
  'sql-databases': ['CREATE TABLE cours (\n id INTEGER PRIMARY KEY,\n titre TEXT NOT NULL\n);', 'INSERT INTO cours (id, titre)\nVALUES (1, \'HTML\');', 'SELECT titre, niveau\nFROM cours\nWHERE niveau = \'Débutant\';', 'SELECT apprenant.nom, inscription.date\nFROM apprenant\nJOIN inscription ON apprenant.id = inscription.apprenant_id;'],
  'node-express-api': ['import express from "express";\nconst app = express();\napp.use(express.json());', 'app.get("/api/cours", (req, res) => {\n  res.json([{ id: 1, titre: "HTML" }]);\n});', 'app.post("/api/cours", (req, res) => {\n  if (!req.body.titre) return res.status(400).json({ erreur: "Titre requis" });\n  res.status(201).json(req.body);\n});', 'app.use((erreur, req, res, next) => {\n  res.status(500).json({ erreur: "Erreur serveur" });\n});'],
  'typescript-pratique': ['const titre: string = "Formation web";\nconst duree: number = 6;', 'interface Cours {\n  id: number;\n  titre: string;\n  gratuit?: boolean;\n}', 'function afficher(valeur: string | number) {\n  if (typeof valeur === "string") return valeur.toUpperCase();\n  return valeur.toFixed(0);\n}', 'async function lireCours(): Promise<Cours[]> {\n  const response = await fetch("/api/cours");\n  return response.json();\n}'],
  'nextjs-rest-api': ['export async function GET() {\n  return Response.json({ status: "ok" });\n}', 'export async function POST(request: Request) {\n  const data = await request.json();\n  return Response.json(data, { status: 201 });\n}', 'export async function PATCH(request: Request) {\n  const data = await request.json();\n  return Response.json({ updated: data });\n}', 'export async function DELETE() {\n  return new Response(null, { status: 204 });\n}'],
  'java-fondamentaux': ['public class Bonjour {\n  public static void main(String[] args) {\n    System.out.println("Bonjour Java");\n  }\n}', 'int note = 14;\nif (note >= 10) {\n  System.out.println("Validé");\n}', 'static double prixTtc(double prix, double taux) {\n  return prix * (1 + taux);\n}', 'class Cours {\n  String titre;\n  Cours(String titre) { this.titre = titre; }\n}'],
  'cpp-fundamentals': ['#include <iostream>\n\nint main() {\n    std::cout << "Bonjour C++\\n";\n    return 0;\n}', '#include <iostream>\n#include <string>\n\nint main() {\n    std::string nom{};\n    std::cout << "Votre nom : ";\n    std::cin >> nom;\n    std::cout << "Bonjour " << nom << "\\n";\n}', 'if (note >= 16) {\n    std::cout << "Très bien\\n";\n} else if (note >= 10) {\n    std::cout << "Validé\\n";\n} else {\n    std::cout << "À retravailler\\n";\n}', 'for (int multiplicateur{1}; multiplicateur <= 10; ++multiplicateur) {\n    std::cout << 7 << " x " << multiplicateur\n              << " = " << 7 * multiplicateur << "\\n";\n}', 'double prixTtc(double prix, double taux) {\n    return prix * (1.0 + taux);\n}\n\n// Exemple : prixTtc(100.0, 0.20) retourne 120.0.', '#include <vector>\n\nstd::vector<int> notes{12, 15, 17};\nint total{};\nfor (int note : notes) {\n    total += note;\n}\ndouble moyenne = static_cast<double>(total) / notes.size();', 'int valeur{42};\nint* adresse{&valeur};\nif (adresse != nullptr) {\n    std::cout << *adresse << "\\n";\n}', 'class Compte {\nprivate:\n    double solde{};\npublic:\n    explicit Compte(double initial) : solde{initial} {}\n    double consulter() const { return solde; }\n};', '#include <string>\n#include <vector>\n\nstruct Cours { std::string titre; };\nstd::vector<Cours> cours{{"C++"}, {"HTML"}};\nfor (const Cours& element : cours) {\n    std::cout << element.titre << "\\n";\n}'],
  'c-fundamentals': ['#include <stdio.h>\n\nint main(void) {\n    printf("Bonjour C\\n");\n    return 0;\n}', 'int note = 14;\nif (note >= 10) {\n    puts("Validé");\n} else {\n    puts("À revoir");\n}', 'int somme(int a, int b) {\n    return a + b;\n}\n\nint notes[] = {12, 15, 17};', '#include <stdio.h>\n\nint valeur = 42;\nint *adresse = &valeur;\nprintf("%d\\n", *adresse);'],
  'csharp-fundamentals': ['Console.WriteLine("Bonjour C#");', 'int note = 14;\nif (note >= 10) Console.WriteLine("Validé");', 'static double PrixTtc(double prix, double taux) => prix * (1 + taux);', 'public sealed class Cours {\n    public string Titre { get; }\n    public Cours(string titre) => Titre = titre;\n}'],
  'php-fundamentals': ['<?php\n$message = "Bonjour PHP";\necho $message;', 'if ($note >= 10) {\n    echo "Validé";\n} else {\n    echo "À revoir";\n}', 'function prixTtc(float $prix, float $taux): float {\n    return $prix * (1 + $taux);\n}', '$stmt = $pdo->prepare("SELECT titre FROM cours WHERE id = :id");\n$stmt->execute(["id" => $id]);'],
  'rust-fundamentals': ['fn main() {\n    println!("Bonjour Rust");\n}', 'let note = 14;\nif note >= 10 {\n    println!("Validé");\n}', 'fn prix_ttc(prix: f64, taux: f64) -> f64 {\n    prix * (1.0 + taux)\n}', 'let nom = String::from("Ada");\nlet emprunt = &nom;\nprintln!("{emprunt}");'],
  'go-fundamentals': ['package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Bonjour Go")\n}', 'func prixTTC(prix, taux float64) float64 {\n    return prix * (1 + taux)\n}', 'if note >= 10 {\n    fmt.Println("Validé")\n} else {\n    fmt.Println("À revoir")\n}', 'http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {\n    fmt.Fprintln(w, "ok")\n})'],
  'flutter-apps': ['void main() {\n  runApp(const MonApp());\n}', 'const Text("Bienvenue sur mon application"),', 'ElevatedButton(\n  onPressed: () => setState(() => compteur++),\n  child: const Text("Ajouter"),\n)', 'final response = await http.get(Uri.parse(url));\nif (response.statusCode == 200) {\n  print(response.body);\n}'],
  'angular-fundamentals': ['@Component({\n  selector: "app-badge",\n  template: `<span>{{ label }}</span>`\n})\nexport class BadgeComponent { label = "Débutant"; }', '<button (click)="ajouter()">Ajouter</button>\n<p>{{ compteur }}</p>', '@Injectable({ providedIn: "root" })\nexport class CoursService {\n  lireCours() { return ["HTML", "C++"]; }\n}', 'const routes: Routes = [\n  { path: "cours", component: ListeCoursComponent }\n];'],
  'machine-learning-intro': ['from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)', 'from sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nmodele = make_pipeline(StandardScaler(), LogisticRegression())', 'modele.fit(X_train, y_train)\npredictions = modele.predict(X_test)', 'from sklearn.metrics import accuracy_score\nprint(accuracy_score(y_test, predictions))'],
  'bootstrap-layouts': ['<link href="bootstrap.min.css" rel="stylesheet">', '<div class="container">\n  <div class="row">\n    <main class="col-12 col-lg-8">Contenu</main>\n    <aside class="col-12 col-lg-4">Détails</aside>\n  </div>\n</div>', '<button class="btn btn-primary" type="button">Continuer</button>', '<label for="email" class="form-label">E-mail</label>\n<input id="email" class="form-control" type="email">'],
  'excel-fundamentals': ['=SOMME(B2:B20)', '=SI(C2>=10;"Validé";"À revoir")', '=NB.SI(D2:D100;"Actif")', '=MOYENNE(B2:B20)'],
  'vue-fundamentals': ['<script setup>\nimport { ref } from "vue"\nconst compteur = ref(0)\n</script>\n\n<button @click="compteur++">{{ compteur }}</button>', '<li v-for="cours in cours" :key="cours.id">{{ cours.titre }}</li>', '<CarteCours :titre="cours.titre" @ouvrir="ouvrirCours" />', '<input v-model="recherche" placeholder="Rechercher un cours">'],
  'django-fundamentals': ['from django.http import HttpResponse\n\ndef accueil(request):\n    return HttpResponse("Bonjour Django")', 'urlpatterns = [\n    path("", views.accueil, name="accueil"),\n]', 'class Cours(models.Model):\n    titre = models.CharField(max_length=120)\n    publie = models.BooleanField(default=False)', '{% for cours in cours_list %}\n  <h2>{{ cours.titre }}</h2>\n{% endfor %}'],
  'postgresql-fundamentals': ['CREATE TABLE cours (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  titre text NOT NULL\n);', 'INSERT INTO cours (titre) VALUES (\'C++\');\nSELECT id, titre FROM cours WHERE titre = \'C++\';', 'SELECT apprenant.nom, inscription.cours_id\nFROM apprenant\nJOIN inscription ON inscription.apprenant_id = apprenant.id;', 'BEGIN;\nUPDATE comptes SET solde = solde - 50 WHERE id = 1;\nCOMMIT;'],
  'docker-pratique': ['docker run --rm hello-world', 'FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD ["npm", "run", "start"]', 'docker volume create donnees\ndocker run -v donnees:/var/lib/app image', 'services:\n  web:\n    build: .\n    ports:\n      - "3000:3000"'],
  'accessibilite-web': ['<button type="button">Afficher les cours</button>', '<img src="cours.jpg" alt="Écran du cours HTML et CSS">', '<label for="email">Adresse e-mail</label>\n<input id="email" type="email" autocomplete="email">', '<a href="#contenu" class="skip-link">Aller au contenu</a>'],
  'linux-pratique': ['pwd\nls -la', 'mkdir exercices\ncd exercices\ntouch notes.txt', 'grep -n "erreur" application.log', 'systemctl status nginx\nsudo journalctl -u nginx --since today'],
  'kubernetes-admin': ['kubectl get nodes', 'kubectl create deployment web --image=nginx', 'kubectl expose deployment web --port=80 --type=ClusterIP', 'kubectl describe pod\nkubectl logs deployment/web'],
  'deploiement-cloud': ['ssh-keygen -t ed25519\nssh utilisateur@serveur', 'sudo ufw allow OpenSSH\nsudo ufw allow 80,443/tcp\nsudo ufw enable', 'location / {\n  proxy_pass http://127.0.0.1:3000;\n  proxy_set_header Host $host;\n}', 'name: Deploy\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4'],
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours ? `${hours} h ${String(minutes).padStart(2, '0')} min` : `${minutes} min`
}

export default function LearningPlayer() {
  const { id, lessonIndex } = useParams()
  const course = courses.find(item => item.id === id)
  const { hasAccess } = useApp()
  if (!course) return <div className="page-width not-found"><span className="eyebrow">404 / COURS INTROUVABLE</span><h1>Cette formation n’existe pas.</h1><Link to="/courses" className="button">Voir les cours <ArrowRight size={16}/></Link></div>
  if (!hasAccess(course.id)) return <div className="page-width not-found"><span className="eyebrow">ACCÈS DE TEST REQUIS</span><h1>Activez l’accès de démonstration.</h1><p>Prix fictif et simulation locale uniquement. Aucun paiement réel.</p><Link to={`/course/${course.id}`} className="button">Voir l’aperçu du cours <ArrowRight size={16}/></Link></div>
  const parsedIndex = Number(lessonIndex)
  const initialLesson = lessonIndex !== undefined && Number.isInteger(parsedIndex) && parsedIndex >= 0 && parsedIndex < course.curriculum.length ? parsedIndex : 0
  return <CoursePlayer key={course.id} course={course} initialLesson={initialLesson}/>
}

function CoursePlayer({ course, initialLesson }: { course: Course; initialLesson: number }) {
  const navigate = useNavigate()
  const { progressFor, isLessonComplete, completeLesson, studySecondsFor, addStudySeconds, scoreFor, recordQuizPass } = useApp()
  const progress = progressFor(course.id)
  const lessons = course.curriculum
  const [active, setActive] = useState(initialLesson)
  const [readingPage, setReadingPage] = useState(0)
  const [notesByLesson, setNotesByLesson] = useState<Record<number,string>>(()=>{try{return JSON.parse(localStorage.getItem(`ev-notes-${course.id}`)??'{}')}catch{return {}}})
  const [bookmarks, setBookmarks] = useState<number[]>(()=>{try{return JSON.parse(localStorage.getItem(`ev-bookmarks-${course.id}`)??'[]')}catch{return []}})
  const [quiz, setQuiz] = useState(false)
  const [answer, setAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<'cours'|'discussion'>('cours')
  const [mobileOpen, setMobileOpen] = useState(false)
  const lesson = lessons[active]
  const notes = notesByLesson[active] ?? ''
  const isDone = isLessonComplete(course.id, active)
  const modules = [...new Set(lessons.map(item=>item.module))]
  const hasVideo = Boolean(lesson.videoId ?? course.videoId)
  const videoId = lesson.videoId ?? course.videoId
  const snippets = examples[course.id] ?? []
  const example = snippets[Math.min(active, snippets.length - 1)]
  const studyTime = studySecondsFor(course.id)

  useEffect(() => { setActive(initialLesson); setQuiz(false); setChecked(false); setAnswer(null) }, [initialLesson])

  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') addStudySeconds(course.id, 30) }, 30000)
    return () => window.clearInterval(timer)
  }, [course.id, addStudySeconds])

  const toggleBookmark = () => setBookmarks(current => {const next=current.includes(active)?current.filter(index=>index!==active):[...current,active];localStorage.setItem(`ev-bookmarks-${course.id}`,JSON.stringify(next));return next})
  const selectLesson = (index: number) => { setActive(index); setReadingPage(0); setQuiz(false); setChecked(false); setActiveTab('cours'); setMobileOpen(false); navigate(`/learn/${course.id}/${index}`) }
  const completeAndAdvance = () => {
    if (active === lessons.length - 1) { setQuiz(true); setAnswer(null); setChecked(false); return }
    completeLesson(course.id,active)
    selectLesson(active+1)
    setQuiz(false)
    setActiveTab('cours')
  }
  const submitQuiz = () => {
    if (!checked) { if (answer!==null) setChecked(true); return }
    if (answer===course.quiz.answer) {
      completeLesson(course.id, active)
      recordQuizPass(course.id)
      setQuiz(false)
      setChecked(false)
      setAnswer(null)
      return
    }
    setChecked(false); setAnswer(null)
  }

  return <div className="player-page"><div className="player-topbar"><Link to={`/course/${course.id}`} className="player-back"><ArrowLeft size={16}/><span>Retour à la formation</span></Link><div className="player-course-title"><span>{course.title}</span><span>Leçon {active+1} sur {lessons.length}</span></div><button className="icon-button curriculum-toggle" onClick={()=>setMobileOpen(!mobileOpen)} aria-label={mobileOpen?'Fermer le programme':'Ouvrir le programme'}>{mobileOpen?<X/>:<ChevronDown/>}</button><div className="player-progress"><span>{progress}% · {scoreFor(course.id)} pts · {formatTime(studyTime)}</span><div className="progress-track"><span style={{width:`${progress}%`}}/></div></div></div>
      <div className="player-layout"><aside className={`player-sidebar ${mobileOpen?'sidebar-open':''}`}><div className="sidebar-head"><div><span className="eyebrow">Programme du cours</span><h2>{course.title}</h2></div><button className="icon-button curriculum-toggle" onClick={()=>setMobileOpen(false)} aria-label="Fermer le programme"><X size={17}/></button></div>{modules.map(module=><details className="player-module" key={module} open={module===lesson.module}><summary><span>{module}</span>{module===lesson.module?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</summary>{lessons.map((item,index)=>({item,index})).filter(({item})=>item.module===module).map(({item,index})=><button key={item.title} className={`player-lesson ${active===index?'lesson-active':''}`} aria-current={active===index?'page':undefined} onClick={()=>selectLesson(index)}><span className="lesson-status">{isLessonComplete(course.id,index)?<Check size={12}/>:<Play size={10}/>}</span><span className="player-lesson-info">{item.title}<small>{item.duration}</small></span>{active===index&&<span className="lesson-now">EN COURS</span>}</button>)}</details>)}<div className="sidebar-resource"><FileText size={16}/><span>Leçon complète<small>Vidéo, explication et exercice sur cette page</small></span></div></aside>
      <div className="player-main"><div className="video-frame">{quiz ? <div className="quiz-screen"><span className="eyebrow">TEST FINAL · +50 POINTS</span><h2>{course.quiz.question}</h2><p>Choisissez la meilleure réponse pour terminer le cours.</p><div className="quiz-answers">{course.quiz.options.map((option,index)=><button className={`quiz-option ${answer===index?'option-selected':''} ${checked&&index===course.quiz.answer?'option-correct':''} ${checked&&answer===index&&index!==course.quiz.answer?'option-wrong':''}`} key={option} onClick={()=>{setAnswer(index);setChecked(false)}}><span className="option-radio"/>{option}</button>)}</div>{checked&&<p className={`quiz-feedback ${answer===course.quiz.answer?'correct-feedback':''}`}>{answer===course.quiz.answer?`${course.quiz.explanation} Le bonus de 50 points a été ajouté.`:'Relisez le cours puis réessayez.'}</p>}<button disabled={answer===null} className="button" onClick={submitQuiz}>{checked?(answer===course.quiz.answer?'Terminer le cours':'Réessayer'):'Vérifier ma réponse'} <ArrowRight size={15}/></button></div> : hasVideo ? <div className="real-video-wrap"><iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0${lesson.videoStart?`&start=${lesson.videoStart}`:''}`} title={`${course.instructor} — ${lesson.title}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/><span className="video-label">VIDÉO · {course.mediaLanguage}</span></div> : <div className="reading-lesson"><span className="reading-icon"><BookOpenCheck size={23}/></span><span className="eyebrow">Leçon intégrée · {lesson.module}</span><h2>{lesson.title}</h2><p>{lesson.summary}</p><strong>À retenir</strong><p>Travaillez étape par étape : observez l’exemple, modifiez-le, puis comparez votre résultat au résumé de la leçon.</p></div>}</div>
        <div className="player-lesson-heading"><div><span className="eyebrow">{lesson.module} · {lesson.duration}</span><h1>{lesson.title}</h1></div><button className={`button button-outline ${bookmarks.includes(active)?'is-saved':''}`} onClick={toggleBookmark}><Bookmark size={15} fill={bookmarks.includes(active)?'currentColor':'none'}/>{bookmarks.includes(active)?'Enregistré':'Ajouter aux favoris'}</button></div>
        <LessonReader course={course} lesson={lesson} lessonNumber={active} page={readingPage} onPageChange={setReadingPage} objective={course.learningObjectives[Math.min(Math.floor(active * course.learningObjectives.length / lessons.length), course.learningObjectives.length - 1)]} example={example}/>
        <CourseTutor course={course} lesson={lesson}/>
        <div className="lesson-tabs"><button className={activeTab==='cours'?'tab-active':''} aria-pressed={activeTab==='cours'} onClick={()=>setActiveTab('cours')}><FileText size={15}/> Leçon</button><button className={activeTab==='discussion'?'tab-active':''} aria-pressed={activeTab==='discussion'} onClick={()=>setActiveTab('discussion')}><MessageSquareText size={15}/> Discussion</button></div>{activeTab==='discussion'&&<div className="discussion-preview"><MessageSquareText size={17}/><strong>Discussion du cours</strong><span>Le forum sera disponible après la configuration d’un service de compte.</span></div>}
        <div className="lesson-complete"><span>{isDone?<><Check size={15}/> Leçon terminée</>:active===lessons.length-1?'Terminez le cours avec le test final.':'Terminez cette leçon pour gagner 20 points.'}</span><button className="button" onClick={completeAndAdvance}>{active<lessons.length-1?(isDone?'Leçon suivante':'Terminer et continuer'):'Passer le test'} <ArrowRight size={15}/></button></div></div>
      <aside className="notes-panel"><div className="notes-title"><h3>Mes notes</h3><Bookmark size={15}/></div><p>Les notes sont conservées sur cet appareil.</p><textarea value={notes} onChange={event=>setNotesByLesson(current=>{const next={...current,[active]:event.target.value};localStorage.setItem(`ev-notes-${course.id}`,JSON.stringify(next));return next})} placeholder="Notez ici ce que vous voulez retenir…" aria-label="Notes de la leçon"/><div className="notes-status">{notes?'Enregistré automatiquement':'Notes pour cette leçon'}</div><div className="notes-divider"/><div className="notes-resource"><Trophy size={17}/><span>Votre progression<small>{scoreFor(course.id)} points · {formatTime(studyTime)} étudiées</small></span></div><div className="lesson-switch"><button disabled={active===0} onClick={()=>selectLesson(active-1)}><ArrowLeft size={14}/> Leçon précédente</button><button disabled={active===lessons.length-1} onClick={()=>selectLesson(active+1)}>Leçon suivante <ArrowRight size={14}/></button></div></aside></div></div>
}
