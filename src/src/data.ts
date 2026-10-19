export type Lesson = {
  title: string
  duration: string
  module: string
  summary: string
  resourceUrl: string
  videoStart?: number
}

export type Course = {
  id: string
  title: string
  category: string
  level: string
  duration: string
  instructor: string
  initials: string
  publisher: string
  color: string
  videoId: string
  sourceUrl: string
  resourceUrl: string
  communityUrl?: string
  description: string
  prerequisites: string
  learningObjectives: string[]
  curriculum: Lesson[]
  quiz: { question: string; options: string[]; answer: number; explanation: string }
}

const mdnHtml = 'https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Structuring_content'
const mdnCss = 'https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Styling_basics'
const mdnLayout = 'https://developer.mozilla.org/fr/docs/Learn_web_development/Core/CSS_layout'
const pythonDocs = 'https://docs.python.org/fr/3/tutorial/index.html'
const figmaCourse = 'https://help.figma.com/hc/en-us/articles/30848209492887-Course-overview-Figma-Design-for-beginners-2025'

export const courses: Course[] = [
  {
    id: 'web-html-css',
    title: 'Créer son premier site avec HTML et CSS',
    category: 'Développement web',
    level: 'Débutant',
    duration: 'Cours vidéo + parcours MDN',
    instructor: 'OpenClassrooms',
    initials: 'OC',
    publisher: 'OpenClassrooms · vidéo publique',
    color: 'blue',
    videoId: 'vtuMgtu0aXM',
    sourceUrl: 'https://www.youtube.com/watch?v=vtuMgtu0aXM',
    resourceUrl: mdnHtml,
    description: 'Construisez une vraie page web : structurez le contenu en HTML, mettez-le en forme avec CSS, puis vérifiez que la page reste claire sur mobile et accessible au clavier.',
    prerequisites: 'Un navigateur web et un éditeur de texte. Aucune expérience en programmation n’est nécessaire.',
    learningObjectives: ['Créer une page HTML structurée et sémantique', 'Ajouter des liens, images et formulaires accessibles', 'Mettre en forme avec les règles CSS et le modèle de boîte', 'Organiser la page avec Flexbox et une mise en page responsive'],
    curriculum: [
      { title: 'Lire la structure HTML d’une page', duration: '30 min', module: 'HTML', summary: 'Repérez le rôle de doctype, html, head et body. Écrivez une page avec un titre, des paragraphes et des sections dans un ordre logique.', resourceUrl: mdnHtml },
      { title: 'Écrire du HTML sémantique', duration: '35 min', module: 'HTML', summary: 'Choisissez des éléments adaptés au sens du contenu : header, nav, main, article, section et footer. La sémantique aide les navigateurs, les lecteurs d’écran et les moteurs de recherche.', resourceUrl: mdnHtml },
      { title: 'Ajouter liens, images et formulaires', duration: '40 min', module: 'HTML', summary: 'Créez des liens descriptifs, donnez un texte alternatif utile aux images et associez chaque champ de formulaire à une étiquette visible.', resourceUrl: mdnHtml },
      { title: 'Appliquer les bases de CSS', duration: '35 min', module: 'CSS', summary: 'Reliez une feuille CSS à la page, ciblez les éléments avec des sélecteurs, puis utilisez couleurs, typographie, marges et bordures pour clarifier la hiérarchie.', resourceUrl: mdnCss },
      { title: 'Comprendre les boîtes et Flexbox', duration: '45 min', module: 'CSS', summary: 'Le modèle de boîte décrit le contenu, le remplissage, la bordure et la marge de chaque élément. Utilisez Flexbox pour aligner et répartir les éléments dans un conteneur.', resourceUrl: mdnLayout },
      { title: 'Rendre la page responsive et accessible', duration: '40 min', module: 'Projet pratique', summary: 'Ajoutez une mise en page qui s’adapte aux petits écrans. Vérifiez les contrastes, l’ordre des titres, la navigation au clavier et les textes alternatifs.', resourceUrl: 'https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Accessibility' },
    ],
    quiz: { question: 'À quoi sert principalement HTML ?', options: ['À structurer et décrire le contenu d’une page', 'À stocker les mots de passe', 'À remplacer le navigateur'], answer: 0, explanation: 'HTML décrit la structure et le sens du contenu. CSS s’occupe de la présentation.' },
  },
  {
    id: 'python-fondamentaux',
    title: 'Python pour débutants : des bases aux premiers projets',
    category: 'Programmation',
    level: 'Débutant',
    duration: '9 h 55 · cours vidéo complet',
    instructor: 'Sébastien Daviot',
    initials: 'SD',
    publisher: 'Sébastien Daviot · Expertise Data',
    color: 'orange',
    videoId: '5KtsO0sVu_o',
    sourceUrl: 'https://www.youtube.com/watch?v=5KtsO0sVu_o',
    resourceUrl: pythonDocs,
    description: 'Suivez un cours vidéo complet en français, de l’installation de Python aux variables, conditions, listes, fonctions et premiers projets de traitement de données.',
    prerequisites: 'Un ordinateur. Le cours utilise Jupyter Notebook pour les premières manipulations.',
    learningObjectives: ['Exécuter du code Python dans un environnement adapté', 'Manipuler nombres, chaînes, listes et dictionnaires', 'Écrire des conditions, des boucles et des fonctions', 'Lire des erreurs et organiser un petit programme'],
    curriculum: [
      { title: 'Installer Python et démarrer avec Jupyter', duration: '34 min', module: 'Prise en main', summary: 'Installez l’environnement du cours et exécutez vos premières cellules. Une cellule permet d’essayer une instruction et de voir immédiatement son résultat.', resourceUrl: pythonDocs, videoStart: 213 },
      { title: 'Variables, nombres et chaînes', duration: '1 h 21', module: 'Fondamentaux', summary: 'Associez une valeur à un nom, distinguez les types de base et combinez des chaînes. Entraînez-vous avec un convertisseur d’angles comme dans le cours.', resourceUrl: 'https://docs.python.org/fr/3/tutorial/introduction.html', videoStart: 2227 },
      { title: 'Conditions et logique', duration: '1 h 15', module: 'Contrôle du programme', summary: 'Utilisez if, elif et else pour choisir une action selon une condition. Vérifiez votre logique avec un exercice qui détermine si un entier est pair ou impair.', resourceUrl: 'https://docs.python.org/fr/3/tutorial/controlflow.html', videoStart: 7121 },
      { title: 'Listes et dictionnaires', duration: '1 h 13', module: 'Collections', summary: 'Stockez plusieurs éléments dans une liste et associez des clés à des valeurs avec un dictionnaire. Parcourez les données et modifiez-les sans dupliquer le code.', resourceUrl: 'https://docs.python.org/fr/3/tutorial/datastructures.html', videoStart: 11582 },
      { title: 'Fonctions, modules et gestion des erreurs', duration: '1 h 05', module: 'Écrire du code réutilisable', summary: 'Regroupez une tâche dans une fonction, importez un module et repérez une exception. Une gestion d’erreur claire permet d’expliquer le problème au lieu de laisser le programme s’arrêter sans contexte.', resourceUrl: 'https://docs.python.org/fr/3/tutorial/errors.html', videoStart: 18960 },
      { title: 'Atelier : données et petite application', duration: '2 h 11', module: 'Projet pratique', summary: 'Mettez en pratique l’analyse de données avec Pandas et Plotly, puis découvrez la création d’une petite application avec Streamlit dans les ateliers de la vidéo.', resourceUrl: pythonDocs, videoStart: 29880 },
    ],
    quiz: { question: 'Quel type de collection associe des clés à des valeurs en Python ?', options: ['Une chaîne de caractères', 'Un dictionnaire', 'Une condition if'], answer: 1, explanation: 'Un dictionnaire stocke des paires clé-valeur. On accède à une valeur à partir de sa clé.' },
  },
  {
    id: 'figma-interface',
    title: 'Concevoir une interface web avec Figma',
    category: 'Design UI/UX',
    level: 'Débutant',
    duration: '13 vidéos · cours officiel Figma',
    instructor: 'Figma',
    initials: 'FG',
    publisher: 'Figma · cours officiel pour débutants',
    color: 'pink',
    videoId: 'zzhSFobLkYw',
    sourceUrl: 'https://www.youtube.com/watch?v=zzhSFobLkYw',
    resourceUrl: figmaCourse,
    communityUrl: 'https://www.figma.com/community/',
    description: 'Réalisez un site portfolio dans Figma en partant d’une page blanche. Le cours officiel aborde les calques, les formes, les frames, l’auto layout, les composants et le prototypage.',
    prerequisites: 'Un ordinateur, une connexion internet et un compte Figma. Le cours officiel indique que les outils présentés sont disponibles avec l’offre Starter.',
    learningObjectives: ['Organiser un fichier et ses calques', 'Composer un écran avec frames, formes et texte', 'Créer des éléments réutilisables avec les composants et l’auto layout', 'Relier des écrans dans un prototype interactif'],
    curriculum: [
      { title: 'Découvrir l’espace de travail et les frames', duration: '15 min', module: 'Prise en main', summary: 'Créez un fichier, nommez vos pages et utilisez les frames pour définir les écrans du portfolio. Une frame représente une zone de travail adaptée à un format donné.', resourceUrl: figmaCourse },
      { title: 'Construire une composition avec formes et texte', duration: '25 min', module: 'Fondamentaux visuels', summary: 'Utilisez les formes et les blocs de texte pour établir une hiérarchie visuelle. Gardez les titres, paragraphes et actions faciles à repérer.', resourceUrl: 'https://www.figma.com/resource-library/design-basics/' },
      { title: 'Organiser les calques et les sections', duration: '20 min', module: 'Organisation', summary: 'Donnez des noms utiles aux calques et regroupez les éléments qui vont ensemble. Un fichier bien organisé reste modifiable quand le projet grandit.', resourceUrl: figmaCourse },
      { title: 'Créer un système responsive avec Auto Layout', duration: '30 min', module: 'Mise en page', summary: 'Auto Layout ajuste l’espacement et la taille des éléments d’un groupe quand son contenu change. Testez le comportement avec des titres plus longs et plusieurs largeurs d’écran.', resourceUrl: 'https://help.figma.com/hc/en-us/articles/5731482952599-Use-auto-layout-in-design-files' },
      { title: 'Réutiliser des composants', duration: '25 min', module: 'Composants', summary: 'Transformez les éléments répétés, comme un bouton ou une carte, en composants. Une modification du composant principal peut ensuite être répercutée dans ses instances.', resourceUrl: 'https://help.figma.com/hc/en-us/articles/360038663994-Create-and-insert-component-instances' },
      { title: 'Relier les écrans dans un prototype', duration: '30 min', module: 'Prototype et projet', summary: 'Ajoutez des interactions entre les écrans, choisissez un point de départ et prévisualisez le parcours. Le projet final du cours est un portfolio personnalisable.', resourceUrl: figmaCourse },
    ],
    quiz: { question: 'Quel est le rôle d’Auto Layout dans Figma ?', options: ['Ajuster automatiquement la mise en page autour de son contenu', 'Compresser une image exportée', 'Écrire du code JavaScript'], answer: 0, explanation: 'Auto Layout gère l’espacement et le redimensionnement des éléments au sein d’un groupe.' },
  },
]

export const weeklyActivity = [
  { day: 'Lun', minutes: 0 }, { day: 'Mar', minutes: 0 }, { day: 'Mer', minutes: 0 },
  { day: 'Jeu', minutes: 0 }, { day: 'Ven', minutes: 0 }, { day: 'Sam', minutes: 0 }, { day: 'Dim', minutes: 0 },
]
