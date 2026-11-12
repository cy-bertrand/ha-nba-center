# Phase 3 — Detailed Game Center

**Statut :** première tranche backend et frontend intégrée sur `main` ; CI verte. Validation fonctionnelle Home Assistant et vérification sur réponses ESPN réelles encore requises.

## Objectif
Transformer l'overlay Match Center de la Phase 2 en fiche de match approfondie, sans appels ESPN depuis le navigateur et sans casser le calendrier ni les services existants.

## Première tranche livrée

- Le parseur de résumé de match extrait désormais les statistiques d'équipe et les lignes de joueurs depuis `boxscore.teams` et `boxscore.players`.
- Les données joueurs sont associées à leur équipe, avec nom, numéro, position, portrait, statut titulaire/actif, DNP/raison et statistiques par clé ESPN.
- Les statistiques brutes sont conservées sous forme de chaînes (par exemple `10-20`, `38:12`) ; aucune valeur manquante n'est transformée en zéro.
- Le Match Center affiche les box scores des deux équipes, les titulaires en premier, les statistiques disponibles et une comparaison des statistiques collectives.
- Les tableaux sont défilables horizontalement et adaptés aux petits écrans.
- Une première timeline Play-by-Play est ajoutée : chronologie inversée (actions récentes en haut), filtre « points seulement », score associé quand fourni et affichage progressif des actions.
- Le parseur `summary.plays` conserve texte, quart-temps, horloge, type, équipe, score et indicateur de panier sans reconstituer les champs absents.
- Le service historique `nba.get_game_details` et la commande WebSocket `nba/game_details` conservent leur contrat externe ; les nouveaux champs sont ajoutés à la réponse.

## Fichiers modifiés / créés

- `custom_components/nba/game_details.py` : nouveau parseur pur des box scores.
- `custom_components/nba/coordinator.py` : intégration des statistiques au résumé ESPN.
- `tests/test_game_details.py` : tests unitaires du parsing des statistiques équipes/joueurs, DNP et valeurs manquantes.
- `frontend/src/nba-center-card.js` : tableaux joueurs et comparaison équipes dans le Match Center.
- `frontend/test-bundle.mjs` : assertions de présence du nouveau box score.

## Tests

- Tests unitaires backend : fixtures synthétiques couvrant les deux équipes, joueurs, statistiques, titulaires, DNP et valeurs absentes.
- CI GitHub : workflow `43327044234` terminé avec succès (compilation Python, tests unitaires backend, build Lit, assertions frontend et génération du bundle).
- Aucun fixture brut ESPN capturé depuis un appel réel n'est encore versionné. Le schéma ESPN reste non officiel et peut varier.
- Le Play-by-Play repose à ce stade sur les champs facultatifs observés dans les exemples de schéma disponibles ; il doit être confirmé sur une réponse ESPN réelle avant de considérer l'affichage comme validé.

## Suite de la Phase 3

1. Capturer et anonymiser des réponses `summary` réelles : match terminé, match en direct et réponse partielle. L'accès direct au endpoint ESPN n'a pas pu être vérifié depuis l'outil de consultation utilisé ; aucune fixture réelle n'est donc revendiquée.
2. Vérifier les clés et l'ordre des statistiques sur les réponses actuelles d'ESPN.
3. Ajouter les tests de parsing sur ces fixtures réelles et les cas de structures absentes.
4. Enrichir le Match Center : cinq majeurs, joueurs DNP, totaux/ratios collectifs, et états de chargement/indisponibilité.
5. Vérifier le Play-by-Play sur des réponses réelles : structure, ordre chronologique, pagination/volume, fréquence de rafraîchissement et disponibilité en direct. La première interface est intégrée mais reste expérimentale tant que le schéma réel n'est pas confirmé.
6. Tester la fiche de match sur Home Assistant desktop et mobile, avec matchs terminés et live.
7. Publier une version candidate et demander la validation de l'utilisateur avant de clôturer la Phase 3.

## Hors périmètre

- Profils complets et comparaisons de joueurs (Phase 5).
- Exploration approfondie des 30 franchises (Phase 4).
- Tableaux de leaders saisonniers avancés (Phase 6).
- Aucune statistique estimée ou reconstituée si ESPN ne la fournit pas.
