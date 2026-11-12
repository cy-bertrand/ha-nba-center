# NBA Center for Home Assistant

**NBA Dark · ESPN (sans clé API) · Home Assistant · Lovelace**

> Projet en phase de préparation. Cette nouvelle base est destinée à accueillir l'évolution de l'intégration `ha-nba` vers une expérience NBA complète dans Lovelace.

## Objectif

Créer une carte autonome `custom:nba-center-card` avec cinq espaces : HOME, SCORES, TEAMS, PLAYERS et STATS.

Le backend Python/Home Assistant reste la seule couche autorisée à communiquer avec ESPN. Le frontend consomme les données via les mécanismes Home Assistant documentés.

## Dépôts

- Projet de référence : https://github.com/cy-bertrand/ha-nba
- Nouveau projet : https://github.com/cy-bertrand/ha-nba-center

Le dépôt source reste intact. Le code sera repris sans historique Git, puis adapté progressivement. Les capteurs, services, événements, automatisations et blueprints existants doivent rester compatibles.

## Feuille de route

1. **Phase 0 — Audit** : inventaire du code, contrats de données, possibilités ESPN, risques et plan technique.
2. **Phase 1 — Socle** : ressources Lovelace, carte Lit, thème NBA Dark et navigation.
3. **Phase 2 — Match Center** : calendrier, filtres, scores et direct.
4. **Phase 3 — Game Details** : résumé et box score.
5. **Phase 4 — Teams Center** : 30 équipes et classements.
6. **Phase 5 — Players Center** : recherche, profils et comparaison.
7. **Phase 6 — Stats Center** : leaders et comparaisons.
8. **Phase 7 — Finalisation** : tests, performances, documentation et HACS.

Chaque phase fera l'objet d'une validation avant le démarrage de la suivante.

## Principes non négociables

- Pas d'appels ESPN depuis JavaScript.
- Pas de réécriture inutile des fonctionnalités Python existantes.
- Cache centralisé et gestion tolérante des erreurs.
- Pas de statistiques inventées ou extrapolées.
- Fuseaux horaires gérés par Home Assistant.
- Aucune suppression des anciennes cartes avant validation de leur remplacement.
- Pas de refactoring hors périmètre sans accord.

## État actuel

- [x] Dépôt public créé.
- [ ] Reprise du code source sans historique.
- [ ] Audit technique Phase 0.
- [ ] Validation du plan technique.

Voir `docs/ROADMAP.md` et `docs/PHASE-0-AUDIT.md`.
