# Phase 3 — Detailed Game Center

**Statut :** première tranche backend et frontend intégrée sur `main` ; CI verte. Les parseurs sont désormais couverts par des réponses ESPN réelles live et terminée. La validation fonctionnelle dans Home Assistant reste à faire.

## Objectif
Transformer l'overlay Match Center de la Phase 2 en fiche de match approfondie, sans appels ESPN depuis le navigateur et sans casser le calendrier ni les services existants.

## Première tranche livrée

- Le parseur de résumé de match extrait désormais les statistiques d'équipe et les lignes de joueurs depuis `boxscore.teams` et `boxscore.players`.
- Les données joueurs sont associées à leur équipe, avec nom, numéro, position, portrait, statut titulaire/actif, DNP/raison et statistiques par clé ESPN.
- Les statistiques brutes sont conservées sous forme de chaînes (par exemple `10-20`, `38:12`) ; aucune valeur manquante n'est transformée en zéro.
- Le Match Center affiche les box scores des deux équipes, les titulaires en premier, les statistiques disponibles et une comparaison des statistiques collectives.
- Un bouton d'actualisation manuelle permet de recharger les détails d'un match ; les erreurs renvoyées par le backend sont désormais visibles avec une action de nouvelle tentative.
- Les tableaux sont défilables horizontalement et adaptés aux petits écrans.
- Une première timeline Play-by-Play est ajoutée : chronologie inversée (actions récentes en haut), filtre « points seulement », score associé quand fourni et affichage progressif des actions.
- Le parseur `summary.plays` conserve texte, quart-temps, horloge, type, équipe, score et indicateur de panier sans reconstituer les champs absents.
- Le service historique `nba.get_game_details` et la commande WebSocket `nba/game_details` conservent leur contrat externe ; les nouveaux champs sont ajoutés à la réponse.

## Fichiers modifiés / créés

- `custom_components/nba/game_details.py` : nouveaux parseurs purs des box scores et actions Play-by-Play.
- `custom_components/nba/coordinator.py` : intégration des statistiques et des actions au résumé ESPN.
- `tests/test_game_details.py` : tests unitaires du parsing des statistiques équipes/joueurs, DNP, valeurs manquantes et actions Play-by-Play.
- `frontend/src/nba-center-card.js` : tableaux joueurs, comparaison équipes, actualisation manuelle et affichage des erreurs dans le Match Center.
- `frontend/test-bundle.mjs` : assertions de présence du box score, du Play-by-Play et des contrôles d'actualisation/erreur.

## Tests

- Une capture réelle ESPN en cours de match (Wizards–Pistons, événement `401909977`, 13/11/2026) a été fournie et réduite à un fixture de test ciblé : `tests/fixtures/espn_summary_live_401909977.json`. Elle conserve les structures réelles du header live, du box score équipes/joueurs et d'un échantillon Play-by-Play avec substitution. Les données annexes sans rapport avec le parseur (news, cotes, etc.) ne sont pas incluses.
- Un test dédié `tests/test_game_details_live_fixture.py` vérifie le score live du header, les statistiques équipes/joueurs, les joueurs DNP et l'enrichissement des participants d'une substitution à partir des identifiants ESPN.
- Le nouveau test `tests/test_game_details_completed_fixture.py` contrôle cinq axes sur le match terminé : état/score final, box scores complets et DNP, volume/catégories Play-by-Play, résolution des participants et coordonnées de tir.
- Une seconde capture réelle terminée (Lakers–Bucks, événement `401909971`) est désormais versionnée dans `tests/fixtures/espn_summary_completed_401909971.json` : payload complet pour les sections `header`, `boxscore`, `plays` et `meta` (environ 300 Ko), extrait du résumé source de 483 Ko.
- Tests unitaires backend : fixtures synthétiques couvrant les cas génériques, complétées par ce fixture réel ciblé.
- CI GitHub : workflow `43384846830` terminé avec succès sur le commit `07d3a52` (13/11/2026) : compilation Python, **38 tests unitaires backend réussis**, build Lit et assertions frontend réussis. Le nouveau fichier `test_game_details_live_fixture.py` est bien détecté par `unittest discover` ; ses 3 tests passent.
- Le fixture live reste un échantillon représentatif. Le fixture terminé couvre en revanche l'intégralité des sections utilisées par le parseur pour le header, les statistiques et les 515 actions Play-by-Play. Les sections annexes ESPN sans rapport avec ce parseur sont volontairement exclues.
- Le schéma du Play-by-Play et ses champs facultatifs sont maintenant confirmés sur une réponse ESPN réelle terminée de 515 actions, en complément de l'extrait live. Les cas de pagination, de rafraîchissement continu et les éventuelles variantes d'autres rencontres restent à tester.

## Suite de la Phase 3

1. Fixture live et fixture de match terminé ajoutés ; ajouter ensuite une réponse partielle / sans box score et vérifier que les champs absents restent explicitement indisponibles.
2. Vérifier les clés et l'ordre des statistiques sur d'autres réponses actuelles d'ESPN, notamment les totaux et les variations de colonnes.
3. Étendre les tests de parsing aux structures absentes, aux groupes statistiques multiples et aux cas de joueurs actifs / inactifs / DNP.
4. Enrichir le Match Center : cinq majeurs, joueurs DNP, totaux/ratios collectifs, et états de chargement/indisponibilité.
5. La structure du Play-by-Play est maintenant contrôlée sur une réponse réelle terminée (515 actions, 70 substitutions, 128 actions de score) et sur un extrait live. Il reste à vérifier la pagination/volume, la fréquence de rafraîchissement et la disponibilité en direct. La première interface reste expérimentale tant que ces points ne sont pas confirmés.
6. Tester la fiche de match sur Home Assistant desktop et mobile, avec matchs terminés et live.
7. Publier une version candidate et demander la validation de l'utilisateur avant de clôturer la Phase 3.

## Hors périmètre

- Profils complets et comparaisons de joueurs (Phase 5).
- Exploration approfondie des 30 franchises (Phase 4).
- Tableaux de leaders saisonniers avancés (Phase 6).
- Aucune statistique estimée ou reconstituée si ESPN ne la fournit pas.
