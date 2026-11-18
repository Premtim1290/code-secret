# Vérifications · 11 novembre 2026 · v1.0.0

## Tests reproductibles du moteur

Commande : `npm test` ou `node --test`. Résultat : **17/17 réussis**. Les valeurs attendues sont codées dans `tests/game.test.js` avant les appels.

| Cas | Attendu | Obtenu |
| --- | --- | --- |
| T01–T09 du contrat | 1/2, 0/2, 0/4, 2/2, 4/0, 2/0, 2/2, 4/0, 1/2 | Identique pour les neuf cas |
| État initial/configuration | `not-started`, 0 essai, historique vide ; contrat 0.2 | Conforme |
| Refus avant démarrage/après fin | Priorité à `game-not-started`/`game-finished` | Conforme |
| Tableau creux, type, longueur, couleur | Refus dans cet ordre, aucun essai consommé | Conforme |
| Options/secrets invalides | Promesse rejetée, état et notifications inchangés | Conforme |
| Refus après neuf essais puis code exact | Toujours 9 puis victoire à 10 | Conforme |
| Dix propositions fausses | `lost`, 10 essais ; historique conservé après refus | Conforme |
| Redémarrage depuis victoire/défaite | `playing`, 0 essai, historique vide, champs last… nuls | Conforme |
| Mutation des entrées et copies retournées | Aucun effet sur le moteur | Conforme |
| Tirages sans code imposé | Partie jouable avec palette commune | Conforme ; distribution statistique non mesurée |

## Intégration dans le navigateur

Script : `scripts/check-browser.cjs`, avec Playwright et Google Chrome installés comme outils de développement facultatifs. Démarrer le serveur local puis lancer `node scripts/check-browser.cjs`. Pour une installation de Playwright externe au projet, `PLAYWRIGHT_MODULE` peut désigner son module. `BROWSER_TEST_URL` permet de tester une autre URL terminée par `/`, sans paramètres préexistants.

Vérifié dans Google Chrome sans interface graphique :

- Mode test initial, démarrage imposé, saisie incomplète refusée sans essai, proposition saisie dans les menus et état API identiques ; résultat attendu et obtenu 2 bien / 2 mal.
- Proposition gagnante par API : deux lignes visibles, message de victoire, validation désactivée. Refus après fin : toujours deux lignes.
- Nouvelle partie par bouton : historique vide ; démarrage invalide par API : HTML strictement identique avant/après.
- Dix échecs par API : dix lignes, compteur 10/10, défaite visible.
- Rechargement du mode test : retour à `not-started`. Sans paramètre : API absente, validation disponible.
- Clavier : flèche dans le premier menu puis Tab, focus sur le deuxième menu.
- Largeur 375 px : aucun débordement horizontal ; revue visuelle de la capture pleine page et de celle à 1280 px. Aucune erreur JavaScript capturée.

Ces contrôles sont locaux ; ils ne remplacent pas la vérification de l’application publiée ni celle sur un téléphone réel.

## Correction réelle : noms trop serrés sur mobile

**Avant** : à 375 px, les quatre menus sur une seule ligne sont trop étroits pour afficher confortablement le nom des couleurs. [Capture avant](images/mobile-avant.png).

**Attendu** : chaque menu a assez de place pour afficher le symbole et le nom ; toutes les positions restent modifiables et utilisables au clavier.

**Changement** : à moins de 760 px, les quatre menus sont disposés sur deux colonnes, avec une hauteur tactile de 48 px et une police de 14 px. Les contrôles natifs et le moteur sont conservés.

**Après** : nouvelle exécution du même parcours à 375 px réussie, noms lisibles dans les menus de 139 px environ et aucun débordement. [Capture après](images/mobile-apres.png). Les 17 tests du moteur restent réussis.

## À compléter par l’étudiant

- URL du dépôt, URL Pages, commit et tag de chaque remise ; reprendre les contrôles API sur l’URL publiée.
- Appareil smartphone réel, navigateur, date, parcours et résultat : non vérifiés à ce stade.
- Bref retour après essai du jeu d’un camarade : non réalisé à ce stade.
- Capsule écran/voix : à enregistrer personnellement, puis à remettre en privé sur Cyberlearn.
