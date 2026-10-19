# EduVerse — parcours d’apprentissage

Plateforme React/Vite en français avec 30 formations, des vidéos publiques, des logos de technologies, un programme de leçons, des ressources de référence, un assistant IA par cours, une page dédiée à l’assistant, des quiz et un suivi local. Les trois premiers parcours sont gratuits; les autres sont des accès premium de démonstration. Les prix et les achats sont simulés dans le navigateur : aucun paiement réel n’est activé.

## Démarrer

```sh
npm install
npm run dev
```

La version de production se construit avec `npm run build`, puis se consulte avec `npm run preview`.

## Assistant IA en local

Le tuteur utilise un fournisseur IA côté serveur de développement. Il ne répond que dans le domaine du cours sélectionné et reçoit le programme de ce cours comme contexte. Pour l’activer, copiez `.env.example` vers `.env.local`, puis renseignez `OPENAI_API_KEY` et, si nécessaire, `OPENAI_MODEL`. Cette clé reste côté serveur : ne la préfixez pas par `VITE_`, ne l’ajoutez pas au dépôt et ne la partagez pas dans le navigateur.

L’interface réserve cinq questions gratuites par navigateur. Après ces questions, les packs de 20 DH et 100 DH ne sont que des simulations locales qui ajoutent des crédits fictifs. Les crédits stockés dans `localStorage` ne sont pas protégés contre la modification par l’utilisateur. L’API du tuteur présente dans `vite.config.ts` fonctionne en développement local uniquement; avant la publication, il faut la déplacer vers un backend sécurisé avec authentification, limites d’usage en base de données et paiement serveur.

## Comptes réels et connexion sociale

Les pages du site et le diagnostic de compétences demandent une session Supabase. Copiez `.env.example` vers `.env.local`, renseignez `VITE_SUPABASE_URL` et une clé publique (`VITE_SUPABASE_PUBLISHABLE_KEY`, ou l’ancienne `VITE_SUPABASE_ANON_KEY`), puis redémarrez Vite. La création de compte et la connexion par e-mail utilisent Supabase Auth; le diagnostic apparaît après la première connexion et son résultat est conservé séparément par compte sur cet appareil.

Pour activer les boutons Google et GitHub, créez une application OAuth chez chaque fournisseur, ajoutez leurs identifiants dans Supabase → Authentication → Providers, puis autorisez l’URL de votre site dans les réglages de redirection Supabase. La callback OAuth du fournisseur pointe vers l’adresse de callback affichée dans le tableau de bord Supabase. Configurez les adresses locales et celle du futur domaine public.

Sans URL et clé Supabase, le site reste sur l’écran de compte et affiche l’étape de configuration; aucun compte local fictif n’est accepté. La progression, les points, les favoris et les notes restent enregistrés dans le navigateur et ne sont pas synchronisés entre appareils.

## Contenu et attribution

- HTML/CSS : parcours [MDN](https://developer.mozilla.org/fr/docs/Learn_web_development/Core) et vidéo publique [OpenClassrooms](https://www.youtube.com/watch?v=pzpW-u23VII).
- Python : [tutoriel officiel Python en français](https://docs.python.org/fr/3/tutorial/index.html) et vidéo publiée par [Expertise Data](https://www.youtube.com/watch?v=5KtsO0sVu_o).
- C++ : cours vidéo de [freeCodeCamp.org · Mike Dane](https://www.youtube.com/watch?v=vLnPwxZdW4Y), chapitres repérés dans le lecteur et documentation de référence [LearnCpp](https://www.learncpp.com/).
- C, C#, PHP, Rust, Go, Flutter, Angular, Vue, Django, PostgreSQL, Bootstrap, Excel et machine learning : vidéos et documentations éditeurs indiquées dans chaque fiche et leçon.
- Figma : [cours Figma Design pour débutants](https://help.figma.com/hc/en-us/articles/30848209492887-Course-overview-Figma-Design-for-beginners-2025).
- Les autres formations renvoient aux éditeurs des vidéos et aux documentations officielles indiqués dans leur fiche et leur parcours.

Les vidéos restent hébergées chez leurs éditeurs. Leur disponibilité, leur langue, leurs sous-titres et leur intégration dépendent de ces éditeurs. Les ressources sont affichées dans l’espace du cours et peuvent aussi être ouvertes à leur source.

## État fonctionnel et publication

Le catalogue, les filtres, les fiches, les leçons, le diagnostic après connexion, les quiz, les favoris, les notes, les crédits de démonstration, le suivi de progression et la page `/assistant` fonctionnent dans l’interface. L’authentification réelle requiert la configuration du projet Supabase et des fournisseurs OAuth. Les pages `/admin` et `/instructor` restent fermées tant que des rôles ne sont pas vérifiés côté serveur. Le récapitulatif de progression n’est pas une certification.

Avant publication, vérifiez les URLs et callbacks OAuth du domaine, déployez l’API du tuteur dans un backend sécurisé, déplacez les quotas IA et les droits administrateur côté serveur, puis branchez le compte marchand et les webhooks de paiement. Prévoyez aussi une politique de confidentialité, un domaine et HTTPS. Le schéma initial de données est dans [`supabase/schema.sql`](supabase/schema.sql).

## Pages

- `/` : accueil et formations sélectionnées
- `/courses` : catalogue, recherche et filtres
- `/assistant` : espace dédié à l’assistant IA avec choix du cours
- `/sources` : vidéos et références par formation
- `/course/:id` : objectifs, programme, éditeur et ressources
- `/learn/:id/:lessonIndex?` : vidéo, lecture paginée, assistant et quiz
- `/dashboard` : progression, favoris et parcours terminés
- `/login` et `/signup` : compte Supabase et connexion Google/GitHub (après configuration)
- `/instructor` et `/admin` : accès réservé jusqu’à configuration serveur
