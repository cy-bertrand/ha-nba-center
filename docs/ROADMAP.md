# Roadmap NBA Center

## Gouvernance

Le développement suit strictement les phases ci-dessous. Chaque phase est inspectée, proposée, implémentée, testée et soumise à validation avant la suivante.

| Phase | Livrable | État |
|---|---|---|
| 0 | Audit du dépôt source, cartographie ESPN et plan technique | En cours — licence confirmée, roster capturé ; summary/stats, tests et compatibilité restent à valider |
| 1 | Carte Lit installable et navigation NBA Dark | À faire |
| 2 | Calendrier et scores | À faire |
| 3 | Fiches de match et box scores | À faire |
| 4 | Teams Center | À faire |
| 5 | Players Center | À faire |
| 6 | Stats Center | À faire |
| 7 | Robustesse, tests, HACS et documentation | À faire |

## Règles de validation

Pour chaque phase, fournir :
1. fichiers créés/modifiés ;
2. fonctionnalités livrées ;
3. tests exécutés et résultats ;
4. limites connues et risques résiduels ;
5. demande explicite de validation.

Ne pas commencer la phase suivante avant validation.

## Stratégie Git

- `main` : branche stable et validée.
- `phase-1-foundation`, `phase-2-match-center`, etc. : branches de travail.
- Une phase validée est intégrée à `main` après revue.
- Le dépôt source `ha-nba` n'est jamais modifié par ce projet.
