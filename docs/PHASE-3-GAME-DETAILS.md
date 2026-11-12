# Phase 3 — Detailed Game Center

**Statut :** première tranche backend et frontend intégrée sur `main` ; validation CI et Home Assistant à poursuivre.

## Objectif
Transformer l'overlay Match Center de la Phase 2 en fiche de match approfondie, sans appels ESPN depuis le navigateur et sans casser le calendrier ni les services existants.

## Première tranche livrée

- Le parseur de résumé de match extrait désormais les statistiques d'équipe et les lignes de joueurs depuis `boxscore.teams` et `boxscore.players`.
- Les données joueurs sont associées à leur équipe, avec nom, numéro, position, portrait, statut titulaire/actif, DNP/raison et statistiques par clé ESPN.
- Les statistiques brutes sont conservées sous forme de chaînes (par exemple `10-20`, `38:12`) ; aucune valeur manquante n'est transformée en zéro.
- Le Match Center affiche les box scores des deux équipes, les titulaires en premier, les statistiques disponibles et une comparaison des statistiques collectives.
- Les tableaux sont défilables horizontalement et adaptés aux petits écrans.
- Le service historique `nba.get_game_details` et la commande WebSocket `nba/game_details` conservent leur contrat externe ; les nouveaux champs sont ajoutés à la réponse.

## Fichiers modifiés / créés

- `custom_components/nba/game_details.py` : nouveau parseur pur des box scores.
- `custom_components/nba/coordinator.py` : intégration des statistiques au résumé ESPN.
- `tests/test_game_details.py` : tests unitaires du parsing des statistiques équipes/joueurs, DNP et valeurs manquantes.
- `frontend/src/nba-center-card.js` : tableaux joueurs et comparaison équipes dans le Match Center.
- `frontend/test-bundle.mjs` : assertions de présence du nouveau box score.

## Tests

- Tests unitaires backend : fixtures synthétiques couvrant les deux équipes, joueurs, statistiques, titulaires, DNP et valeurs absentes.
- CI GitHub : build frontend, contrôles Python et tests unitaires ; résultat du dernier workflow à confirmer avant livraison de cette tranche.
- Aucun fixture brut ESPN capturé depuis un appel réel n'est encore versionné. Le schéma ESPN reste non officiel et peut varier.

## Suite de la Phase 3

1. Capturer et anonymiser des réponses `summary` réelles : match terminé, match en direct et réponse partielle.
2. Vérifier les clés et l'ordre des statistiques sur les réponses actuelles d'ESPN.
3. Ajouter les tests de parsing sur ces fixtures réelles et les cas de structures absentes.
4. Enrichir le Match Center : cinq majeurs, joueurs DNP, totaux/ratios collectifs, et états de chargement/indisponibilité.
5. Étudier le play-by-play : structure, pagination/volume, fréquence de rafraîchissement et disponibilité pour les matchs live. Ne pas l'afficher tant que son contrat n'est pas vérifié.
6. Tester la fiche de match sur Home Assistant desktop et mobile, avec matchs terminés et live.
7. Publier une version candidate et demander la validation de l'utilisateur avant de clôturer la Phase 3.

## Hors périmètre

- Profils complets et comparaisons de joueurs (Phase 5).
- Exploration approfondie des 30 franchises (Phase 4).
- Tableaux de leaders saisonniers avancés (Phase 6).
- Aucune statistique estimée ou reconstituée si ESPN ne la fournit pas.
