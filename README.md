# Code secret — Mastermind · v1.0.0

Jeu solo en français réalisé avec Codex en HTML, CSS et JavaScript. Dépôt : [Premtim1290/code-secret](https://github.com/Premtim1290/code-secret).

Pour jouer en local, lancer `python3 -m http.server 8000` dans le dossier du projet, puis ouvrir <http://localhost:8000>.

## 1. Règles du jeu

- Le programme choisit au hasard un code secret de **quatre couleurs** parmi **rouge, bleu, vert, jaune, orange et violet**. Les répétitions sont autorisées et le code reste fixe et caché.
- Le joueur dispose de **dix essais** pour retrouver les couleurs dans le bon ordre. Chaque position peut être modifiée avant de valider.
- Après chaque proposition valide, deux indices sont affichés : **bien placées** (bonne couleur à la bonne position) et **mal placées** (couleur présente ailleurs). Ce sont des totaux : ils n’indiquent pas les positions concernées.
- Les bien placées sont comptées d’abord, puis les mal placées parmi les occurrences restantes. Chaque occurrence ne compte qu’une fois.
- Une proposition incomplète ou invalide est refusée avec une explication, sans consommer d’essai ni modifier l’historique.
- Quatre couleurs bien placées donnent la victoire, même au dixième essai. Dix propositions valides sans victoire donnent la défaite.
- Après la fin, les propositions sont bloquées. « Nouvelle partie » tire un nouveau code et remet les essais, l’historique et les indices à zéro. Le secret n’est pas révélé après une défaite.

**Sources :** énoncé « Projet — Code secret en couleurs, inspiré du Mastermind », édition **2.2** du 03/11/2026, annexe **code-couleurs-1.0** ; document « API commune de test — Code secret en couleurs », contrat **0.2**, édition Google **1.5** du 28/10/2026. Ces règles pédagogiques font foi pour ce projet.

## 2. Choix faits avec Codex

- **Un moteur commun à l’interface et à l’API.** Les règles sont dans `js/game.js` et l’affichage dans `js/app.js`. Ce choix évite d’avoir un jeu pour le joueur et un autre pour les tests ; il permet aussi de tester les règles sans navigateur.
- **Une application statique sans dépendances d’exécution.** Aucun serveur applicatif ni compilation n’est nécessaire. Les chemins relatifs sont prévus pour GitHub Pages, y compris sous `/code-secret/`.
- **Des couleurs accompagnées de noms et de symboles.** Le joueur peut utiliser les menus au clavier ou au toucher, sans devoir reconnaître uniquement les couleurs.
- **Une disposition adaptée au mobile.** Une vérification à 375 px a montré que quatre menus sur une seule ligne étaient trop serrés. Avec Codex, la disposition a été corrigée en deux colonnes sur petit écran. Le parcours a ensuite été vérifié à nouveau : noms lisibles et aucun débordement horizontal. Les [preuves avant/après](docs/VERIFICATIONS.md#correction-réelle--noms-trop-serrés-sur-mobile) sont conservées.

Codex a aidé à produire le code, les tests et la documentation. Aucun service d’IA n’intervient pendant une partie.

## 3. Vérification API

L’API commune **0.2** est accessible dans la console du navigateur en ouvrant <http://localhost:8000/?test=1>. Attendre le chargement de `window.codeSecretTest`. Au chargement du mode test, son état est `not-started`. Sans `test=1`, cet objet n’est pas exposé et une partie aléatoire commence.

```js
const api = window.codeSecretTest;
api.version;     // "0.2"
api.getConfig(); // Règles communes et palette
api.getState();  // État courant, sans révéler le secret

await api.startGame({ secret: ['rouge', 'rouge', 'bleu', 'vert'] });
const etat = await api.submitGuess(['rouge', 'bleu', 'rouge', 'vert']);
console.log(etat.lastResult); // { wellPlaced: 2, misplaced: 2 }
```

`getConfig()` et `getState()` sont synchrones. `startGame()` et `submitGuess()` renvoient des promesses : il faut attendre chaque appel avant le suivant. Sans secret imposé, `startGame()` tire un code aléatoire.

Les vérifications portent sur la configuration, l’état initial, les résultats, les priorités d’erreurs, les fins de partie et l’indépendance des données retournées. Un démarrage invalide rejette une erreur avec un `code` et laisse tout l’état inchangé. Une proposition refusée renseigne seulement `lastError`.

**Résultats vérifiés :** les tests automatisés du moteur et du contrat réussissent. Le parcours local dans Chrome, réalisé le **11/11/2026**, a aussi vérifié la présence/absence de l’API selon l’URL, la synchronisation API/écran, une saisie par l’interface, le rechargement et le redémarrage. La vérification sur l’URL GitHub Pages reste à réaliser.

## 4. Tests : attendu / obtenu

Commande : `npm test` ou `node --test`, avec **Node.js ≥ 18**. Dernière exécution le **18/11/2026** : **17 tests réussis sur 17**.

Les abréviations du tableau servent uniquement à la lecture : R = rouge, B = bleu, V = vert, J = jaune. L’API utilise toujours les noms complets.

| Test | Résultat attendu | Résultat obtenu |
| --- | --- | --- |
| Secret R-B-V-J ; proposition R-V-B-orange | 1 bien placée, 2 mal placées ; 1 essai | 1 / 2 ; 1 essai |
| Secret R-R-B-V ; proposition R-R-R-R | 2 bien placées, 0 mal placée : les rouges supplémentaires ne comptent pas | 2 / 0 |
| Secret R-R-B-V ; proposition R-B-R-V | 2 bien placées, 2 mal placées | 2 / 2 |
| Proposition de quatre couleurs exactes | 4 bien placées ; état `won` | 4 / 0 ; `won` |
| Proposition contenant une seule couleur | `invalid-length` ; aucun essai consommé | Refus conforme ; compteur inchangé |
| Proposition contenant un élément `null` | `invalid-type`, avant le contrôle de longueur | `invalid-type` |
| Secret tout rouge ; neuf propositions tout bleu, puis tout rouge | Victoire au dixième essai | `won` ; 10 essais |
| Dix propositions tout bleu pour un secret tout rouge | Défaite au dixième essai | `lost` ; 10 essais |
| Proposition après une fin de partie | `game-finished` ; historique inchangé | Conforme |
| Redémarrage après victoire ou défaite | `playing` ; 0 essai ; historique vide ; champs `last…` nuls | Conforme |
| Démarrage avec un secret invalide | Promesse rejetée ; tout l’état précédent conservé | Conforme |
| Modification d’une entrée ou d’un état retourné | Aucun effet sur les données internes | Conforme |

Les neuf exemples T01–T09 du contrat sont inclus dans les 17 tests. Les détails du parcours navigateur et de la correction mobile figurent dans [les vérifications](docs/VERIFICATIONS.md), et les assertions reproductibles dans [les tests](tests/game.test.js).

## 5. Limites

- **GitHub Pages :** le code est déposé sur GitHub ; la mise en ligne et la conformité de l’API sur l’URL publiée ne sont pas encore vérifiées. Pour publier : Settings → Pages → Deploy from a branch → `main` → `/(root)`, puis reprendre les contrôles avec et sans `?test=1`.
- **Smartphone réel :** la disposition a été vérifiée dans Chrome à 375 px, mais aucun appareil physique n’a encore été testé. Le modèle, le navigateur et le résultat devront être indiqués après cet essai. Safari et Firefox restent aussi à vérifier.
- **Fonctions facultatives :** pas de PWA ni de sauvegarde de partie ; le fonctionnement hors ligne n’est pas garanti. Recharger la page efface la partie.
- **Hasard :** les codes utilisent la palette commune ; leur distribution statistique n’a pas été mesurée.
- **Rendus pédagogiques :** le retour sur le jeu d’un camarade, les tags `jalon-1` et `final` et la capsule individuelle restent à compléter. J1 : 20/11/2026 au soir ; J2 : 18/12/2026 au soir. La capsule de 4 à 5 minutes, écran et voix, doit être déposée sur Cyberlearn et non dans le dépôt public.

Le jeu ne demande aucun compte et n’intègre ni paiement, classement en ligne, clé API, service d’IA ou collecte de données personnelles.
