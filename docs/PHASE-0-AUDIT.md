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


## 8. Inventaire exhaustif du dépôt source

L'arborescence Git source a été récupérée avec l'API GitHub (arbre récursif non tronqué). Elle contient 23 fichiers suivis :
- 11 fichiers dans `custom_components/nba/` et ses sous-dossiers ;
- 10 fichiers dans `lovelace/` ;
- `hacs.json` ;
- `README.md`.

Aucun dossier de tests, fichier de dépendances séparé, configuration de lint ou workflow GitHub Actions n'apparaît dans cette arborescence.

La comparaison de l'arbre source et de l'arbre cible confirme que tous les fichiers de code, traductions, services, blueprint, cartes et métadonnées ont été repris avec le même identifiant Git de contenu, sauf :
- `README.md`, remplacé par la présentation NBA Center ;
- `custom_components/nba/manifest.json`, dont les liens documentation et issue tracker pointent maintenant vers le nouveau dépôt.

Le dépôt cible contient également un fichier `LICENSE` GPL-3.0 qui n'existe pas dans l'arbre source. Il faut confirmer que cette licence est bien intentionnelle avant publication de versions ou diffusion du projet. Ne pas la supprimer ni la remplacer sans décision du propriétaire.

## 9. Constats détaillés sur le code existant

### 9.1 Charge réseau et actualisation

Dans `_async_update_data`, les appels scoreboard, standings et calendriers des équipes favorites sont effectués séquentiellement. Ensuite, le coordinateur récupère les résumés des cinq derniers matchs de chaque équipe favorite, en dédupliquant les identifiants, mais toujours séquentiellement.

Conséquences :
- le temps de rafraîchissement augmente avec le nombre d'équipes favorites ;
- une panne d'un scoreboard, standings ou calendrier d'équipe fait échouer le rafraîchissement global ;
- un premier démarrage ou un redémarrage avec beaucoup d'équipes peut déclencher de nombreuses requêtes summary ;
- les détails terminés sont mis en cache uniquement en mémoire ; les erreurs de détail ne sont pas mises en cache.

**Orientation recommandée :** ne pas charger les détails historiques automatiquement pour toutes les équipes. Les charger à la demande, les mettre en cache avec une politique explicite, et séparer les erreurs partielles des données principales. Préserver toutefois les attributs existants des capteurs récents.

### 9.2 Détails de match et box score

Le parseur `_parse_summary` lit les équipes, scores par quart-temps et leaders de catégories. Il ne lit pas le bloc `boxscore.players` ni les statistiques individuelles complètes. Le service `nba.get_game_details` n'est donc pas encore un box score complet.

La documentation communautaire des endpoints ESPN décrit le summary comme une réponse contenant le box score des équipes et des joueurs. C'est une piste prometteuse pour construire Game Details sans multiplier les appels, à confirmer avec des réponses réelles et des tests de schéma.

### 9.3 Calendrier

Le scoreboard existant est appelé sans paramètre de date. Il alimente donc la journée par défaut de l'endpoint et ne fournit pas encore un contrat de calendrier arbitraire pour la navigation SCORES.

Des références publiques d'endpoints ESPN documentent le paramètre `dates=YYYYMMDD` et les plages de dates. La logique devra être conçue en fonction du jour demandé et du fuseau horaire Home Assistant, plutôt que de supposer que la journée ESPN par défaut correspond toujours au jour local belge.

### 9.4 Données équipes et joueurs

Le flux de configuration utilise déjà l'endpoint `teams` pour proposer les franchises. L'intégration n'exploite toutefois pas encore un catalogue générique de toutes les équipes pour l'affichage NBA Center : elle récupère les calendriers uniquement pour les équipes favorites.

Les références ESPN recensent également les routes roster, profil d'athlète, statistiques de saison, gamelog et splits. Elles constituent des candidats pour TEAMS et PLAYERS, mais les réponses et champs doivent être échantillonnés et validés avant de figer les contrats internes.

### 9.5 Robustesse des parseurs

- `_parse_leaders` utilise la première valeur disponible en repli lorsque le champ statistique attendu n'est pas trouvé. Ce comportement peut afficher une statistique d'une autre catégorie sous le mauvais libellé. Il faudra privilégier une valeur indisponible plutôt qu'une valeur incorrectement étiquetée.
- `_parse_standings` utilise `playoffSeed` comme clé de tri. Hors playoffs ou lorsque cette statistique est absente, les rangs peuvent être à zéro ; l'ordre renvoyé par ESPN doit être conservé et testé.
- Les données de score manquantes sont converties en zéro par `_to_int`. Il faudra distinguer zéro réel et donnée absente dans les nouveaux contrats, surtout pour les matchs non commencés ou les données partielles.
- Les exceptions des appels principaux remontent au coordinateur et peuvent empêcher la mise à jour de toutes les entités. Des résultats partiels avec état de fraîcheur et erreurs explicites seront préférables.

Ces constats sont des points à corriger dans les phases correspondantes, pas des modifications apportées au code source lors de l'audit.

## 10. Cartographie ESPN préliminaire

Les routes suivantes sont identifiées à partir du code existant et de catalogues publics communautaires :
- scoreboard : données de matchs, avec prise en charge documentée d'une date ;
- standings : endpoint déjà utilisé ;
- teams et teams/{id}/schedule : endpoints déjà utilisés ;
- teams/{id}/roster : candidat pour les effectifs ;
- summary?event={id} : candidat pour le box score complet ;
- common/v3/.../athletes/{id}/overview, /stats, /gamelog et /splits : candidats pour PLAYERS.

Les endpoints ESPN ne constituent pas une API NBA officielle documentée. Les formats peuvent changer ou être indisponibles. Le backend devra contrôler les statuts HTTP, le format JSON, les champs requis et la fraîcheur des données, sans supposer qu'un endpoint fonctionnera indéfiniment.

Références de travail :
- https://github.com/sejaldua/espn-api/blob/main/references/endpoints.md
- https://sportsdataverse-py.sportsdataverse.org/docs/0.0.73/nba/reference/site
- https://sportsapis.dev/espn-api

## 11. Tests et état de validation

L'arbre source ne contient pas de tests automatisés ni de workflow CI. Aucun test Home Assistant n'a été exécuté dans cette session ; la simple comparaison des fichiers ne prouve pas le chargement runtime.

À ajouter avant la clôture de Phase 0 :
- tests unitaires des parseurs avec réponses ESPN enregistrées ;
- tests de contrat pour les méthodes backend et le service ;
- tests des erreurs HTTP, timeouts, données absentes et réponses partielles ;
- test de chargement de l'intégration sur la version minimale HA annoncée ;
- test des cartes historiques existantes ;
- validation du choix de licence GPL-3.0 présent dans le dépôt cible.

## 12. Architecture recommandée pour NBA Center

1. **Conserver le domaine `nba` et les entités historiques** : ne pas casser les installations existantes.
2. **Ajouter une API de données à la demande** côté intégration : calendrier par date, détail d'un match, équipes, effectifs, profils et statistiques joueurs.
3. **Centraliser les requêtes ESPN** dans des modules backend spécialisés, tous appelés par le coordinateur ou une couche de service unique.
4. **Définir un cache par ressource** : TTL court pour scores live, TTL moyen pour calendrier/rosters, TTL long pour historiques et profils ; cache borné et invalidation contrôlée.
5. **Séparer l'état des données** : `value`, `updated_at`, `is_stale`, `error` ou équivalent ; ne jamais convertir une absence en zéro.
6. **Transporter les données vers Lit via l'API Home Assistant** : commandes typées, réponses JSON versionnées et erreurs explicites. Aucun appel ESPN depuis le navigateur.
7. **Servir les fichiers statiques de la carte depuis l'intégration** avec versionnement de ressource et cache busting, sans imposer une carte HACS séparée.
8. **Tester les vues indépendamment** avec des fixtures JSON : HOME, SCORES, TEAMS, PLAYERS, STATS.

## Conclusion provisoire

La base actuelle est conservable, mais elle est conçue pour alimenter des capteurs de favoris et non pour servir un centre NBA complet à la demande. La priorité n'est pas de réécrire les capteurs : c'est d'ajouter une couche de données générique, performante et testable, en maintenant les contrats historiques.
