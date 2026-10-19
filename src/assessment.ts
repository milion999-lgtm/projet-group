export type SkillAssessmentResult = {
  score: number
  total: number
  answers: number[]
  recommendedCourseIds: string[]
  completedAt: string
}

export const skillQuestions = [
  { skill: 'HTML', courseId: 'web-html-css', question: 'Quel élément HTML représente le contenu principal d’une page ?', options: ['<main>', '<style>', '<footer>'], answer: 0 },
  { skill: 'CSS', courseId: 'web-html-css', question: 'Quelle règle CSS centre les éléments d’une ligne avec Flexbox ?', options: ['font-weight: center', 'justify-content: center', 'position: middle'], answer: 1 },
  { skill: 'JavaScript', courseId: 'javascript-fundamentals', question: 'Quelle déclaration empêche la réaffectation d’une variable ?', options: ['varies', 'static', 'const'], answer: 2 },
  { skill: 'Python', courseId: 'python-fondamentaux', question: 'Quelle structure répète un bloc pour chaque élément d’une liste ?', options: ['for', 'import', 'return'], answer: 0 },
  { skill: 'SQL', courseId: 'sql-databases', question: 'Quelle commande lit des lignes dans une table SQL ?', options: ['PAINT', 'SELECT', 'RENAME ALL'], answer: 1 },
  { skill: 'Git', courseId: 'git-github', question: 'À quoi sert un commit Git ?', options: ['À installer un navigateur', 'À publier automatiquement une application', 'À enregistrer un état du projet dans son historique'], answer: 2 },
  { skill: 'React', courseId: 'react-apps', question: 'Quel outil React mémorise une valeur qui change après une interaction ?', options: ['useState', 'useTitle', 'useFolder'], answer: 0 },
  { skill: 'TypeScript', courseId: 'typescript-pratique', question: 'À quoi servent principalement les types TypeScript ?', options: ['À remplacer HTML', 'À détecter des incohérences de données pendant le développement', 'À héberger une base de données'], answer: 1 },
  { skill: 'Node.js', courseId: 'node-express-api', question: 'Que permet Node.js ?', options: ['Créer des styles CSS sans navigateur', 'Remplacer le protocole HTTP', 'Exécuter JavaScript hors du navigateur'], answer: 2 },
  { skill: 'Figma', courseId: 'figma-interface', question: 'Quel outil Figma adapte l’espacement des éléments à leur contenu ?', options: ['Auto Layout', 'Version control', 'DevTools'], answer: 0 },
] as const

export function createAssessmentResult(answers: number[]): SkillAssessmentResult {
  const score = skillQuestions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0)
  const missedCourseIds = skillQuestions.filter((question, index) => answers[index] !== question.answer).map(question => question.courseId)
  const recommendedCourseIds: string[] = [...new Set<string>(missedCourseIds)]
  if (recommendedCourseIds.length === 0) recommendedCourseIds.push('nextjs-rest-api', 'docker-pratique')
  if (recommendedCourseIds.length < 3) recommendedCourseIds.push(...['accessibilite-web', 'linux-pratique'].filter(id => !recommendedCourseIds.includes(id)))
  return { score, total: skillQuestions.length, answers, recommendedCourseIds: recommendedCourseIds.slice(0, 3), completedAt: new Date().toISOString() }
}
