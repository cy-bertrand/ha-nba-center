# Phase 0 — Audit technique initial

**Date :** 2026-11-12  
**Dépôt source :** https://github.com/cy-bertrand/ha-nba  
**Dépôt cible :** https://github.com/cy-bertrand/ha-nba-center

## 1. Éléments confirmés

Le dépôt source est une intégration Home Assistant Python existante, utilisant ESPN sans clé API. Le README source décrit déjà :
- plusieurs équipes favorites ;
- matchs du jour, dernier/prochain/en cours par équipe ;
- classements Est/Ouest ;
- leaders de saison (points, rebonds, passes, interceptions, contres) ;
- événements `nba_game_start` et `nba_game_end` ;
- service `nba.get_game_details` avec réponse ;
- blueprint de notification installé automatiquement ;
- cartes Lovelace YAML existantes.

Les fichiers centraux inspectés :
- `custom_components/nba/__init__.py`
- `custom_components/nba/coordinator.py`
- `custom_components/nba/manifest.json`
- `README.md`

Version déclarée dans le manifest inspecté : `0.4.1`.

## 2. Architecture backend observée

### NBACoordinator

`NBACoordinator` hérite de `DataUpdateCoordinator` et centralise déjà :
- la session HTTP asynchrone Home Assistant ;
- la récupération scoreboard et standings ;
- les calendriers des équipes favorites ;
- les leaders de statistiques ;
- le parsing des rencontres et des équipes ;
- les événements de début et fin de match ;
- un cache de détails de match ;
- une fréquence de mise à jour adaptée à la présence d'un match live.

Les données sont actuellement structurées principalement autour de `games`, `standings`, `teams`, `leaders` et `favorites`.

### Service existant

Le service `nba.get_game_details` accepte `game_id` et utilise `SupportsResponse.ONLY`. Le frontend pourra appeler les services Home Assistant via son API de services, sans accès direct à ESPN.

### Compatibilité à protéger

Le portage devra conserver sans changement non justifié :
- les identifiants et attributs des capteurs ;
- le domaine `nba` ;
- le service `nba.get_game_details` et son schéma ;
- les événements `nba_game_start` et `nba_game_end` ;
- le flux de configuration ;
- les options des équipes favorites ;
- l'installation et le comportement du blueprint.

## 3. Écart entre le backend actuel et NBA Center

Le backend existant semble fournir une bonne base pour HOME, les scores courants, les favoris, les classements et les leaders. Les fonctionnalités suivantes ne sont pas encore confirmées comme disponibles sous une forme générique :
- récupération du calendrier de n'importe quelle date ;
- détails complets d'un match et box score individuel de tous les joueurs ;
- données structurées des 30 franchises ;
- recherche de joueurs et fiches de carrière/saison ;
- historique statistique nécessaire aux courbes d'évolution ;
- comparaison de deux joueurs.

Ces capacités doivent être vérifiées endpoint par endpoint et échantillon de réponse par échantillon de réponse avant de définir les nouveaux contrats.

## 4. Risques techniques

1. **ESPN non officiel :** endpoints et champs susceptibles de changer ; prévoir validation des schémas, timeouts, cache et erreurs partielles.
2. **Périmètre du cache :** éviter les appels répétés lors des navigations et des re-rendus ; cache backend avec TTL adapté par type de donnée.
3. **Charge réseau :** ne pas récupérer en boucle les 30 calendriers complets ; privilégier des requêtes ciblées et mutualisées.
4. **Compatibilité Home Assistant :** utiliser les APIs documentées pour enregistrer et servir les ressources frontend ; tester les versions minimales annoncées.
5. **Données historiques :** ne pas présenter une donnée absente comme zéro ; distinguer indisponible, non applicable et valeur nulle.
6. **Fuseaux horaires :** transmettre des timestamps explicites et laisser le frontend les formater dans le contexte Home Assistant.
7. **Déploiement :** une carte embarquée dans l'intégration nécessite une stratégie de ressource statique et de cache/versionnement compatible HACS.

## 5. Plan technique proposé

### Étape A — Reprise contrôlée

Reprendre le code existant dans le nouveau dépôt sans historique Git. Aucun changement métier initial. Vérifier l'intégrité du package, les dépendances, les traductions, les blueprints et les cartes Lovelace.

### Étape B — Contrat de données

Documenter les schémas de réponses des fonctions backend existantes, puis définir des méthodes de lecture à la demande pour calendrier par date, match, équipe, joueur et leaders. Réutiliser le coordinator et ses caches ; ne pas multiplier les capteurs pour les données historiques.

### Étape C — Transport frontend

Choisir une API Home Assistant documentée (WebSocket/commands ou services) et définir les commandes, paramètres, réponses, erreurs et version du contrat. ESPN reste exclusivement côté Python.

### Étape D — Frontend

Construire la carte Lit en composants isolés, avec état local de navigation, chargement par vue, gestion des erreurs partielles et nettoyage des abonnements. Aucun composant ne doit appeler ESPN.

### Étape E — Validation

Tests Python des parseurs et services, tests du contrat JSON, tests de carte avec données simulées, puis tests dans Home Assistant réel sur mobile et desktop.

## 6. Tests requis avant Phase 1

- Vérifier tous les fichiers et l'arborescence source.
- Exécuter les tests existants, s'ils sont présents.
- Vérifier l'import de l'intégration et la configuration flow.
- Capturer des exemples de réponses ESPN pour chaque catégorie.
- Vérifier les attributs exacts des entités et les événements.
- Vérifier le chargement des cartes Lovelace actuelles.
- Définir la version minimale Home Assistant et la stratégie de ressources frontend.

## 7. Réserve importante sur cet audit

Cet audit est préliminaire : les fichiers centraux ont été consultés, mais l'inventaire exhaustif de l'arborescence, de tous les parseurs, des traductions, tests, cartes et réponses ESPN n'est pas encore achevé. Aucun endpoint ou champ ESPN non vérifié ne doit être considéré comme acquis. La Phase 0 ne pourra être déclarée terminée qu'après cet inventaire complet.

## Décision proposée

Conserver le backend existant comme socle et ajouter une couche de consultation à la demande. Ne pas refactoriser le coordinator en profondeur avant d'avoir documenté les capacités manquantes et les contrats de données. Démarrer la Phase 1 uniquement après validation de cet audit complet et du plan technique.
