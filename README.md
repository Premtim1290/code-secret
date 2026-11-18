# Code secret · v1.0.0

Jeu solo en français inspiré du Mastermind, réalisé avec Codex en HTML, CSS et JavaScript, sans dépendances d’exécution.

## Jouer en local

Depuis le dossier du projet :

```sh
python3 -m http.server 8000
```

Ouvrir <http://localhost:8000>. Choisir les quatre couleurs dans les menus puis valider. Clavier : Tab, flèches et Entrée ; les menus fonctionnent aussi au toucher.

## Règles et sources

Un code caché de **4 couleurs**, parmi **rouge, bleu, vert, jaune, orange, violet**, avec répétitions autorisées. **10 essais**. Chaque indice compte d’abord les couleurs bien placées, puis les mal placées parmi les occurrences restantes, sans compter une occurrence deux fois. Les indices ne désignent aucune position. Quatre bien placées donnent la victoire, même au dixième essai ; sinon la partie est perdue. Une saisie invalide ne coûte aucun essai. Le secret reste caché après la fin.

Sources fournies : « Projet — Code secret en couleurs, inspiré du Mastermind », édition **2.2**, 03/11/2026, annexe **code-couleurs-1.0** ; « API commune de test — Code secret en couleurs », contrat **0.2**, édition Google **1.5**, 28/10/2026. L’énoncé 2.2 est utilisé, même si le contrat cite encore l’édition 2.1.

## Choix faits avec Codex

Un moteur unique (`js/game.js`) pilote l’interface (`js/app.js`) et l’API : les tests ne peuvent pas jouer une partie séparée. La séparation rend le calcul des indices vérifiable sans navigateur. Le site statique et les chemins relatifs permettent un hébergement GitHub Pages sans compilation. Des menus natifs, des noms et six symboles distincts rendent les couleurs reconnaissables au clavier et au toucher. La version est visible dans l’en-tête et `package.json`.

## API commune 0.2

Ouvrir `http://localhost:8000/?test=1`. L’API apparaît une fois le module chargé et commence à `not-started`. Sans `test=1`, elle n’est pas exposée et une partie aléatoire démarre. Elle n’enregistre rien entre deux chargements.

```js
const api = window.codeSecretTest;
api.getConfig(); // synchrone, comme getState()
await api.startGame({ secret: ['rouge', 'rouge', 'bleu', 'vert'] });
const state = await api.submitGuess(['rouge', 'bleu', 'rouge', 'vert']);
// state.lastResult : { wellPlaced: 2, misplaced: 2 }
api.getState();
```

Attendre chaque mutation. `startGame()` choisit un code aléatoire ; un démarrage invalide rejette une `Error` avec `code` et laisse tout inchangé. Un refus de proposition résout vers l’état avec `lastError`. Le secret n’est jamais exposé par l’état.

## Vérifications

Avec Node.js ≥ 18 : `npm test` (ou `node --test`). **17 tests réussis le 11/11/2026**, dont T01–T09 du contrat, les doublons, les priorités d’erreurs, les copies indépendantes, la victoire/défaite au dixième et le redémarrage.

Le parcours Chrome automatisé et la revue des captures à 1280 px et 375 px sont réussis : saisie réelle, API/écran, refus, fins de partie, rechargement, clavier et absence de débordement. Détails, attendu/obtenu et correction mobile avant/après : [vérifications](docs/VERIFICATIONS.md).

## Publier et préparer les rendus

Le code du projet est déposé dans [Premtim1290/code-secret](https://github.com/Premtim1290/code-secret). Pour mettre le jeu en ligne, activer **Settings → Pages → Deploy from a branch → branche principale → /(root)**. Aucun build n’est requis. Vérifier ensuite l’URL publiée avec et sans `?test=1`, y compris sous `/nom-du-depot/`.

- Dépôt : <https://github.com/Premtim1290/code-secret>. Lien de l’application : à renseigner après activation de GitHub Pages.
- J1, 20/11/2026 au soir : revoir les preuves et créer le tag `jalon-1` sur la version remise.
- J2, 18/12/2026 au soir : compléter les vérifications publiées, l’essai smartphone (appareil et résultat) et le bref retour sur le jeu d’un camarade ; créer le tag `final` sur la version remise.
- La capsule individuelle de 4–5 min, écran et voix, reste à enregistrer et à déposer sur Cyberlearn, jamais dans le dépôt public.

## Limites connues

Publication et test sur GitHub Pages encore à faire. Le format mobile a été vérifié dans Chrome, **pas sur un vrai smartphone** ; Safari et Firefox restent à vérifier. Le retour sur le jeu d’un camarade et la capsule ne sont pas encore réalisés. Pas de PWA, de sauvegarde ni de mode hors ligne garantis : ces extensions sont facultatives. Aucun compte, service d’IA, serveur applicatif ou donnée personnelle dans le jeu.
