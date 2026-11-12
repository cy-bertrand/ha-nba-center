# Phase 1 — Foundation NBA Center

**Branche :** `phase-1-foundation`  
**Statut :** en cours — carte Lit interactive livrée ; validation sur Home Assistant réel restante

## Réalisé

- Enregistrement idempotent de la ressource JavaScript par Home Assistant.
- Compatibilité minimale alignée sur Home Assistant 2024.7 (API `StaticPathConfig` et `async_register_static_paths`).
- Bundle Lit autonome généré avec esbuild et livré dans `custom_components/nba/www/`.
- Interface NBA Dark responsive avec cinq vues.
- Consommation des entités et attributs Home Assistant existants : scoreboard, classements, leaders et capteurs des équipes favorites.
- Filtres de scores par état et recherche textuelle par équipe.
- Fiches des équipes favorites et tableaux de classements.
- Validation de la configuration YAML et surcharge facultative des entity_id.
- Aucun appel ESPN depuis le navigateur ; les données restent centralisées dans le coordinateur Python.
- Documentation d'installation et de configuration.

## Fonctionnalités présentes par vue

- **HOME** : matchs live, prochaines rencontres, équipes favorites, leader points.
- **SCORES** : scoreboard disponible, filtres Tous / Live / À venir / Terminés, recherche équipe.
- **TEAMS** : équipe favorite, dernier match, prochain match.
- **PLAYERS** : cinq catégories de leaders existantes.
- **STATS** : classements Est/Ouest et leaders par catégorie.

## Limites connues

- Le scoreboard actuel ne propose pas de sélection de date ; cela relève de Phase 2.
- Les données joueurs se limitent aux leaders actuels ; les profils et comparaisons relèvent de Phase 5.
- Les box scores complets et les détails de match relèvent de Phase 3.
- La carte n'a pas encore été testée dans une instance Home Assistant réelle.
- Aucun test navigateur / Playwright ni test d'intégration Home Assistant n'a été exécuté.
- Les anciens dashboards Lovelace restent inchangés et doivent être conservés pendant la validation.

## CI et contrôles

Le workflow GitHub Actions exécute :
- `python -m compileall -q custom_components/nba`
- `npm ci`
- `npm run build`
- `npm test` (bundle Lit, cinq vues, contrôles des fonctionnalités et absence d'appels ESPN dans le frontend).

Les résultats sont consultables dans l'onglet Actions du dépôt. Les tests statiques ne remplacent pas le test en instance HA.

## Installation

Voir `docs/FRONTEND-INSTALLATION.md`.

## Critères de sortie

- Installation et chargement de la ressource confirmés dans Home Assistant 2024.7+.
- Les cinq vues affichent les données de l'intégration sans entités mal associées.
- Vérification desktop et mobile.
- Capteurs, service `nba.get_game_details`, événements et blueprint historiques non régressés.
- Rapport final, puis validation explicite de l'utilisateur avant Phase 2.
