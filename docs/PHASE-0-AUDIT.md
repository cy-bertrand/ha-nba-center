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


## 13. Cartographie ESPN approfondie — état au 12 novembre 2026

La documentation communautaire de référence hoopR décrit plusieurs hôtes ESPN publics sans authentification. Elle précise que le site API v2 est le plus stable pour scores, équipes, effectifs, calendriers, classements et statistiques d'équipe ; le Web API common v3 sert aux statistiques détaillées des joueurs, mais est moins stable ; le Core API v2 expose des ressources approfondies et paginées. Ces endpoints restent non officiels et non garantis par ESPN.

### Matrice fonctionnelle

| Vue NBA Center | Endpoint candidat | Données / usage | État de validation |
|---|---|---|---|
| HOME / SCORES | `site.api.../scoreboard?dates=YYYYMMDD` | Matchs d'une date précise ; scoreboard live et programmés | Paramètre documenté par sportsdataverse et catalogues ESPN ; réponse brute live à capturer |
| GAME DETAILS | `site.api.../summary?event={id}` | Résumé, box score équipes/joueurs, leaders, play-by-play et diffusion selon disponibilité | Endpoint déjà utilisé par l'intégration ; forme `boxscore.players[]` confirmée dans un fixture de schéma observé, mais valeurs explicitement illustratives |
| TEAMS | `site.api.../teams` | Catalogue des franchises, logos, identifiants | Déjà utilisé au config flow ; wrapper hoopR confirme les champs usuels team_id, abbreviation, display_name, color, logo |
| TEAM DETAILS | `site.api.../teams/{id}` | Identité, record, coachs et informations équipe | Documenté par hoopR ; échantillon brut à capturer |
| TEAM ROSTER | `site.api.../teams/{id}/roster` | Liste des joueurs, identifiants, maillots, positions, dates de naissance, statuts | Fixture de forme NBA observé en octobre 2026 ; liste `athletes[]` plate, sans sous-clé `items` |
| TEAM SCHEDULE | `site.api.../teams/{id}/schedule` | Calendrier complet d'une franchise | Déjà utilisé par l'intégration |
| PLAYER PROFILE | `site.api.../athletes/{id}` | Bio, taille, poids, position, équipe, statut, draft | Documenté par les wrappers hoopR ; validation NBA brute requise |
| PLAYER OVERVIEW | `site.web.api.../athletes/{id}/overview` | Vue synthétique, dernières rencontres, prochaine rencontre et actualités selon disponibilité | Documenté par hoopR ; endpoint common v3 moins stable |
| PLAYER STATS | `site.web.api.../athletes/{id}/stats?season={year}` | Statistiques de saison, catégories, moyennes et totaux | Wrapper hoopR confirme des catégories variables ; réponse vide possible pour certaines saisons/profils |
| PLAYER GAMELOG | `site.web.api.../athletes/{id}/gamelog?season={year}` | Ligne statistique par match | Fixture de forme observé : `events` est un dictionnaire par identifiant et les lignes sont dans `seasonTypes[].categories[].events[]` |
| PLAYER SPLITS | `site.web.api.../athletes/{id}/splits?season={year}` | Domicile/extérieur, adversaire et autres répartitions | Documenté par hoopR ; validation brute requise |
| LEAGUE LEADERS | `site.web.api.../statistics/byathlete` | Classements statistiques par catégorie | Déjà utilisé ; wrapper hoopR confirme un résultat par couple catégorie/joueur, rang et valeur |

Les domaines abrégés du tableau correspondent aux hôtes complets :
- `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/`
- `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/`

### Détails de box score

Le fixture de forme NBA `nba_summary` documente `boxscore.players` comme un tableau frère de `boxscore.teams`, avec une entrée par équipe. Chaque groupe joueur contient des catégories statistiques, des noms de colonnes et une liste d'athlètes avec leurs valeurs. Le parseur actuel de `_parse_summary` ignore complètement ce bloc.

Un wrapper NBA de box score joueur documente notamment les champs suivants : identifiant/nom du joueur, équipe, minutes, tirs réussis/tentés (2 points, 3 points, lancers francs), rebonds offensifs/défensifs/totaux, passes, interceptions, contres, pertes de balle, fautes, points, titulaire, éjecté, did-not-play, actif, maillot, position et photo. Ce schéma fonctionnel est suffisant pour concevoir le modèle interne du Match Center, mais les noms/valeurs brutes ESPN doivent être vérifiés sur une réponse NBA réelle avant d'écrire le parseur.

### Données joueurs : précautions

- Les catégories de statistiques ne sont pas fixes : les noms et colonnes doivent être lus depuis la réponse ESPN, jamais codés en dur sur la seule base d'un exemple.
- Les valeurs peuvent être des chaînes, y compris les minutes et pourcentages.
- Les statistiques de carrière, de saison régulière, de playoffs et de pré-saison doivent rester distinguées.
- Les historiques de joueurs peuvent être incomplets ou renvoyer 404 selon le profil/saison.
- Le gamelog est une structure liée par `eventId`, pas une simple liste plate garantie.
- Les identifiants ESPN joueurs/équipes ne doivent pas être confondus avec d'autres fournisseurs.

### Limite de validation directe

Les pages ESPN JSON ne sont pas accessibles via l'outil de consultation utilisé dans cette session. Les preuves réunies sont donc des documentations de wrappers qui interrogent ESPN et des fixtures de schéma dont les valeurs sont explicitement illustratives. Je ne prétends pas avoir capturé ici une réponse ESPN brute ni testé un appel HTTP live. Un test runtime depuis Home Assistant ou un environnement Python avec accès réseau reste obligatoire avant l'implémentation.

Références consultées :
- ESPN basketball endpoints / hoopR : https://hoopr.sportsdataverse.org/articles/espn-endpoints.html
- Catalogue des endpoints ESPN : https://github.com/sejaldua/espn-api/blob/main/references/endpoints.md
- Documentation scoreboard NBA : https://sportsdataverse-py.sportsdataverse.org/docs/0.0.73/nba/reference/site
- Schéma fixture summary/roster/gamelog (valeurs illustratives) : https://github.com/machina-sports/sports-skills/blob/main/skills/espn-api/references/shape-fixtures.json
- Description du box score équipes : https://hoopr.sportsdataverse.org/reference/espn_nba_team_box.html
- Description des statistiques joueurs : https://hoopr.sportsdataverse.org/reference/espn_nba_player_stats_v3.html
- Description des leaders NBA : https://hoopr.sportsdataverse.org/reference/espn_nba_leaders.html
- Catalogue des franchises : https://hoopr.sportsdataverse.org/reference/espn_nba_teams.html

## 14. Choix d'architecture frontend/backend recommandés

### Transport des données

Pour les nouvelles vues interactives, le meilleur ajustement est une **API WebSocket Home Assistant dédiée à l'intégration**, avec commandes typées et réponses JSON. La documentation Home Assistant prévoit explicitement l'extension du WebSocket par une intégration et l'appel depuis JavaScript via `hass.connection.sendMessagePromise`.

Commandes proposées (noms de travail, pas encore implémentés) :
- `nba/center/scoreboard` : date, éventuels filtres ; renvoie la liste normalisée des matchs ;
- `nba/center/game` : game_id ; renvoie résumé, box score, leaders et métadonnées ;
- `nba/center/teams` : renvoie le catalogue de franchises ;
- `nba/center/team` : team_id ; renvoie profil, roster, record et calendrier paginé ;
- `nba/center/players/search` : query et filtres ; renvoie des résultats limités ;
- `nba/center/player` : athlete_id, season ; renvoie bio et statistiques ;
- `nba/center/player_gamelog` : athlete_id, season, season_type ; renvoie l'historique ;
- `nba/center/leaders` : season, season_type, category, limit ; renvoie les leaders.

Le service historique `nba.get_game_details` doit rester disponible pour la compatibilité des automatisations et des utilisateurs existants. Il pourra partager la même logique backend que la nouvelle commande WebSocket.

### Ressource Lovelace intégrée

La carte doit être distribuée dans le dossier de l'intégration et servie par Home Assistant avec `async_register_static_paths` et `StaticPathConfig`. La ressource JavaScript doit être enregistrée comme ressource Lovelace de type module, en respectant le mode de dashboard :
- mode stockage : inscription automatique dans le gestionnaire de ressources Lovelace, si disponible ;
- mode YAML : documenter l'URL de ressource à ajouter manuellement, car l'intégration ne doit pas réécrire le dashboard de l'utilisateur.

Éviter de charger la carte via `frontend.extra_module_url` comme unique mécanisme : la documentation frontend indique que les ressources Lovelace sont le mécanisme de chargement attendu pour les cartes de dashboard. Le module frontend ne doit contenir aucun appel ESPN direct.

### Lit et dépendances

Home Assistant construit son frontend avec Lit, mais ne fournit pas d'API publique stable pour tous ses composants internes. NBA Center doit donc éviter de dépendre de composants internes non garantis. Utiliser Lit avec un bundle maîtrisé, les primitives HTML accessibles, `ha-card` et les variables CSS de thème documentées ; limiter les dépendances externes.

Références Home Assistant :
- WebSocket custom commands : https://developers.home-assistant.io/docs/frontend/extending/websocket-api
- Custom cards et Lit : https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card
- Register resources : https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources
- Enregistrement statique asynchrone : https://developers.home-assistant.io/blog/2024/06/18/async_register_static_paths

## 15. Points de code à intégrer aux tests de non-régression

1. `_parse_leaders` prend la première statistique comme valeur de repli si le nom attendu n'est pas présent. Cela peut associer une mauvaise statistique à un libellé. Le nouveau parseur doit renvoyer une valeur indisponible si la catégorie attendue manque.
2. `_to_int` transforme une valeur absente ou invalide en zéro. Pour les nouveaux contrats, conserver `None` quand la donnée est absente ; zéro ne doit signifier que zéro confirmé.
3. `_parse_standings` trie par `playoffSeed`, qui peut être absent ou égal à zéro. Tester le classement hors saison et préserver l'ordre source lorsque les seeds ne sont pas exploitables.
4. Les appels scoreboard, standings et schedules sont séquentiels et les erreurs des appels principaux font échouer l'actualisation complète. La couche NBA Center doit isoler les ressources et exposer fraîcheur/erreurs partielles.
5. Le coordinateur charge automatiquement les détails de chaque match des cinq dernières rencontres de toutes les équipes favorites. Cette stratégie ne doit pas être étendue à toutes les franchises ; le chargement du box score complet doit être à la demande.
6. Les traductions françaises sont identiques dans `strings.json` et `translations/fr.json`. Vérifier la cohérence après toute modification de flux ou de service.
7. Le blueprint expose une liste statique des 30 équipes ; il faudra vérifier sa cohérence avec le catalogue ESPN actuel, sans le réécrire pendant l'audit.

## 16. Décisions restantes avant clôture de Phase 0

- Capturer depuis un environnement réseau les réponses brutes ESPN de scoreboard (dates différentes), summary d'un match terminé, roster, player profile, player stats, gamelog, splits et leaders.
- Déterminer si les réponses nécessitent pagination, paramètres de région/langue, ou traitement spécifique par saison.
- Valider le contrat WebSocket et l'enregistrement de la ressource Lovelace sur les versions Home Assistant prises en charge.
- Ajouter une suite de tests fixtures et lancer les tests d'intégration.
- Confirmer la licence GPL-3.0 du dépôt cible.


## 17. Vérification supplémentaire des réponses ESPN et compatibilité Home Assistant

### Capture JSON réellement consultée : roster

Une réponse JSON ESPN a pu être ouverte directement pour :
`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/2/roster`

La réponse consultée est datée du **1er mai 2026** (elle ne constitue donc pas une photographie de l'effectif au 12 novembre 2026). Elle confirme notamment :
- `athletes[]` est bien un tableau plat ;
- chaque joueur expose `id`, `firstName`, `lastName`, `fullName`, `displayName`, `height`, `weight`, `age`, `dateOfBirth`, `jersey`, `position`, `headshot.href`, `experience.years`, `status`, `injuries[]` ;
- les informations d'équipe peuvent apparaître sous `teams[]` sous forme de références ESPN, pas nécessairement comme un objet équipe directement exploitable ;
- les liens ESPN du joueur proposent des relations playercard, stats, splits, gamelog, bio et overview ;
- des champs comme `contracts` sont présents dans cette réponse, mais ne doivent pas être récupérés ni exposés par NBA Center sans besoin explicite.

Cela permet de confirmer la forme générale du roster et les champs de profil de base. La réponse étant datée, le roster ne doit pas être utilisé comme effectif actuel sans rechargement.

### Limites d'accès aux autres routes ESPN

Les tentatives d'ouverture directe du scoreboard à date, du summary d'un événement, du profil joueur, des stats et du gamelog ont échoué dans l'outil de consultation. Ce résultat indique une limite d'accès de cet outil, et **ne prouve pas que les routes ESPN sont indisponibles**. Le résumé d'un match et les endpoints joueurs doivent donc rester des hypothèses à valider par une exécution HTTP depuis Home Assistant.

### Ressources JavaScript : décision prudente

La documentation actuelle Home Assistant confirme que :
- `async_register_static_paths([StaticPathConfig(...)])` est la méthode asynchrone prévue pour servir les fichiers statiques ; l'ancienne méthode synchrone est dépréciée et a été retirée en 2025.7 ;
- les ressources Lovelace sont des modules JavaScript ;
- en mode YAML, la ressource doit être ajoutée explicitement dans `lovelace.resources` ;
- les commandes WebSocket d'intégration se déclarent avec `@websocket_api.websocket_command`, s'enregistrent via `websocket_api.async_register_command`, et les appels asynchrones utilisent `@websocket_api.async_response` ;
- le frontend peut appeler ces commandes avec `hass.callWS()` ou `hass.connection.sendMessagePromise()`.

**Décision de compatibilité proposée :** augmenter la version minimale Home Assistant du nouveau dépôt à **2024.6.0** au minimum pour utiliser `async_register_static_paths` sans retomber sur une API statique dépréciée. À confirmer au moment de l'implémentation et selon les dépendances réelles.

**Décision d'enregistrement Lovelace :**
- servir le bundle depuis un chemin propre à l'intégration, par exemple `/nba-center/nba-center-card.js` ;
- prendre en charge le mode YAML avec une instruction de ressource manuelle documentée ;
- en mode stockage, l'auto-enregistrement pourra être étudié, mais il repose sur des API Lovelace internes non garanties comme stables. Ne pas le promettre comme comportement garanti sans test sur plusieurs versions de Home Assistant.
- éviter de modifier automatiquement le dashboard de l'utilisateur.

### Références officielles Home Assistant

- WebSocket API custom commands : https://developers.home-assistant.io/docs/frontend/extending/websocket-api
- WebSocket API contributor docs : https://contributors.home-assistant.io/frontend/extending/websocket-api/
- Register resources : https://contributors.home-assistant.io/frontend/custom-ui/resources/
- async_register_static_paths : https://contributors.home-assistant.io/blog/2024/06/18/async_register_static_paths/

## 18. Licence

L'utilisateur a confirmé le **12 novembre 2026** que le dépôt `ha-nba-center` doit conserver la licence **GNU GPL-3.0**. Le fichier `LICENSE` existant est donc conservé. Cette décision concerne le nouveau dépôt ; le dépôt source `ha-nba` n'est pas modifié.
