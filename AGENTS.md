# Consignes de travail

- Répondre et documenter en français. Garder les modifications petites et vérifiables.
- Ce projet suit l’énoncé « Code secret en couleurs », édition 2.2, son annexe `code-couleurs-1.0` et le contrat API 0.2. Ne pas changer les règles communes : 4 positions, 6 couleurs ordonnées rouge/bleu/vert/jaune/orange/violet, doublons autorisés, 10 essais.
- Garder un seul moteur (`js/game.js`) et une seule partie partagée par l’interface et l’API. Exposer `window.codeSecretTest` uniquement avec `?test=1`, dans l’état initial `not-started`.
- Respecter la priorité des erreurs, les promesses des mutations et les copies indépendantes. Un démarrage invalide ne change rien, même pas `lastError`.
- Ne jamais exposer ni afficher le secret, même après une défaite. Les indices sont des totaux, pas des indications par position.
- Préserver une application statique, sans compte, paiement, serveur applicatif, service d’IA, clé ou données personnelles. Tous les chemins doivent fonctionner sous `/nom-du-depot/` sur GitHub Pages.
- Préserver les noms/symboles des couleurs, le clavier, le tactile, le contraste et la disposition mobile. Ne pas se fier uniquement à la couleur.
- Exécuter `npm test` après toute modification des règles ou de l’API. Après modification de l’interface, vérifier le parcours dans le navigateur, dont la synchronisation API/écran et une petite largeur.
- Pour une correction réelle, conserver un cas reproductible avec attendu, obtenu avant, changement et obtenu après. Ne jamais inventer un défaut, un résultat ou une vérification sur appareil réel.
- Mettre le README à jour : choix avec Codex, vérifications réellement réalisées, limites restantes. Ne pas présenter la publication ou les jalons comme terminés sans preuve.
- Garder des versions récupérables avec Git. Ne pas créer les tags `jalon-1` ou `final` tant que le rendu correspondant n’est pas prêt. Ne publier aucune conversation, vidéo de remise, donnée personnelle ou secret d’accès.
