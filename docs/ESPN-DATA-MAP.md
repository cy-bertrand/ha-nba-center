# NBA Center — Cartographie des données ESPN

**État :** analyse documentaire préliminaire, 12 novembre 2026  
**Important :** les endpoints ESPN utilisés ici ne sont pas une API publique officielle garantie. Les formats et disponibilités doivent être testés à l'exécution.

## Endpoints candidats

| Besoin | Route ESPN | Utilisation prévue |
|---|---|---|
| Matchs par date | `site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD` | HOME et SCORES |
| Détails d'un match | `site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={game_id}` | GAME DETAILS, box score, leaders, play-by-play |
| Franchises | `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams` | TEAMS |
| Profil d'équipe | `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{team_id}` | TEAM CENTER |
| Effectif | `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{team_id}/roster` | Roster et navigation vers les profils joueurs |
| Calendrier équipe | `site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{team_id}/schedule` | Calendrier d'équipe |
| Classements | `site.api.espn.com/apis/v2/sports/basketball/nba/standings` | Conférences |
| Profil joueur | `site.api.espn.com/apis/site/v2/sports/basketball/nba/athletes/{athlete_id}` | PLAYERS |
| Vue joueur | `site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{athlete_id}/overview` | Résumé du joueur |
| Stats joueur | `site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{athlete_id}/stats?season={year}` | Stats de saison |
| Gamelog joueur | `site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{athlete_id}/gamelog?season={year}` | Historique match par match |
| Splits joueur | `site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{athlete_id}/splits?season={year}` | Domicile/extérieur et autres splits |
| Leaders | `site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete` | Classements statistiques |

## Schémas et précautions

- Le scoreboard accepte un paramètre `dates=YYYYMMDD` documenté.
- La réponse de summary comprend un bloc `boxscore` ; un fixture de forme identifie `boxscore.players[]` à côté de `boxscore.teams[]`. Le parseur actuel n'exploite pas encore les joueurs.
- Les rosters NBA ont été observés sous la forme d'un tableau plat `athletes[]`.
- Les réponses stats joueurs sont structurées par catégories variables.
- Les gamelogs peuvent utiliser un dictionnaire d'événements et des lignes reliées par `eventId`.
- Les saisons, types de saison, valeurs absentes et champs facultatifs doivent être conservés explicitement.
- Ne jamais interpréter une valeur absente comme zéro.
- Le cache doit être centralisé dans le backend. Ne jamais appeler ESPN depuis la carte JavaScript.

## Contrats backend envisagés

Les commandes WebSocket de travail sont documentées dans [PHASE-0-AUDIT.md](PHASE-0-AUDIT.md), section 14. Elles couvriront le scoreboard par date, le détail de match, les franchises, le profil et roster d'équipe, la recherche et le profil joueur, le gamelog et les leaders.

Le service existant `nba.get_game_details` est conservé pour la compatibilité.

## État de validation

Cette cartographie est fondée sur la documentation de wrappers ESPN et des schémas communautaires. Elle ne constitue pas une capture des réponses ESPN brutes. Les appels HTTP réels, les fixtures enregistrées, les tests de parsing et les tests Home Assistant restent à effectuer avant de clôturer la Phase 0.

## Références

- https://hoopr.sportsdataverse.org/articles/espn-endpoints.html
- https://github.com/sejaldua/espn-api/blob/main/references/endpoints.md
- https://sportsdataverse-py.sportsdataverse.org/docs/0.0.73/nba/reference/site
- https://github.com/machina-sports/sports-skills/blob/main/skills/espn-api/references/shape-fixtures.json
- https://hoopr.sportsdataverse.org/reference/espn_nba_team_box.html
- https://hoopr.sportsdataverse.org/reference/espn_nba_player_stats_v3.html
- https://hoopr.sportsdataverse.org/reference/espn_nba_leaders.html
- https://hoopr.sportsdataverse.org/reference/espn_nba_teams.html


## Historique des séries de playoffs — recherche complémentaire (13 novembre 2026)

### Source candidate identifiée : NBA Stats API

La documentation communautaire de l'API NBA décrit l'endpoint suivant :

`GET https://stats.nba.com/stats/commonplayoffseries?LeagueID=00&Season=2024-25&SeriesID=`

Paramètres :
- `LeagueID=00` pour la NBA.
- `Season` au format `YYYY-YY`, par exemple `2024-25`.
- `SeriesID` facultatif pour filtrer une série.

Jeu de données `PlayoffSeries` :
- `GAME_ID`
- `HOME_TEAM_ID`
- `VISITOR_TEAM_ID`
- `SERIES_ID`
- `GAME_NUM`

La documentation sportsdataverse précise que `SERIES_ID` correspond à la racine de l'identifiant du match de playoffs, sans le dernier chiffre de séquence. Les identifiants de matchs de playoffs commencent par `004`. Des sources communautaires décrivent les derniers chiffres de l'identifiant de match comme encodant le tour, la série et le numéro de match. Cette convention devra être vérifiée sur plusieurs saisons et ne doit pas être utilisée sans validation de longueur et de préfixe.

### Limites à traiter avant implémentation

- NBA Stats API n'est pas une API publique officiellement garantie.
- Les endpoints `stats.nba.com` sont protégés par des mécanismes anti-bot : des clients HTTP standards peuvent recevoir 403/429. La disponibilité depuis l'environnement Home Assistant réel n'est pas confirmée.
- La documentation du schéma est communautaire ; elle ne remplace pas une capture brute réelle.
- Le résultat `CommonPlayoffSeries` relie les matchs aux séries, mais ne fournit pas à lui seul les noms des franchises, les scores, les dates ni le gagnant final. Ces éléments devront être enrichis depuis une source déjà utilisée (scoreboard/summary ESPN ou données de matchs existantes), sans créer de doublons.
- Le calcul du gagnant de série doit compter uniquement les matchs terminés et les victoires explicites ; ne jamais déduire un résultat d'une donnée manquante.
- Le tour (1er tour, demi-finales de conférence, finales de conférence, Finals) doit être dérivé uniquement après validation de la convention d'identifiants sur des exemples réels.

### Décision actuelle

**Pas d'implémentation de production à ce stade.** La piste NBA Stats API est suffisamment documentée pour préparer un adaptateur isolé et des tests de parsing, mais pas pour déclarer l'accès réseau fiable ni le format complet validé. Prochaine étape : obtenir et conserver une réponse brute réelle de `CommonPlayoffSeries` pour au moins deux saisons, vérifier les IDs et les associer à des matchs terminés, puis décider si la source est exploitable depuis Home Assistant.

### Références complémentaires

- https://py.sportsdataverse.org/docs/nba/reference/nba_stats/common
- https://github.com/swar/nba_api/blob/master/docs/nba_api/stats/endpoints/commonplayoffseries.md
- https://github.com/llimllib/nba_data/blob/main/docs/DATA_DICTIONARY.md
- https://nba-api-ts.riccardo.lol/endpoints/stats/games/common-playoff-series/


### Vérification complémentaire du schéma et des identifiants

Une seconde documentation technique (nba-api-ts) confirme le même contrat de cinq champs et signale explicitement que les appels à `stats.nba.com` nécessitent un client de type navigateur. La documentation SportsDataverse signale également que les requêtes standard peuvent échouer avec 403/429 et recommande un transport compatible navigateur (`curl_cffi`). Cela renforce le risque d'exploitation depuis aiohttp/Home Assistant sans garantir qu'un contournement soit acceptable ou durable.

Une documentation de données NBA décrit le format des identifiants :
- `001` : présaison ;
- `002` : saison régulière ;
- `003` : All-Star ;
- `004` : playoffs ;
- `005` : play-in ;
- `006` : finale NBA Cup.

Pour les matchs de playoffs, elle décrit les trois derniers chiffres comme `RSG` : tour, numéro de série dans le tour, match dans la série. Cette règle est documentée comme vérifiée sur les playoffs 2025-26, mais elle reste une convention communautaire à contrôler avec des identifiants provenant de la réponse brute de la source retenue.

**Conséquence d'architecture :** si l'API NBA Stats reste inaccessible dans l'environnement Home Assistant, ne pas intégrer une dépendance à un client HTTP navigateur/anti-bot dans l'intégration. Évaluer plutôt une source de données accessible et stable ou construire les séries à partir des identifiants de matchs et résultats déjà récupérés par ESPN, avec validation explicite des IDs et tests sur fixtures. Le champ `SERIES_ID` de CommonPlayoffSeries reste la référence la plus directe lorsqu'il est disponible.

### État après recherche du 13 novembre 2026

- Contrat de données documenté par plusieurs clients indépendants : **confirmé au niveau documentaire**.
- Réponse brute actuelle de l'endpoint depuis cet environnement : **non obtenue** (la page de l'API est inaccessible ici).
- Accès direct depuis Home Assistant/aiohttp : **non validé**.
- Dérivation du tour à partir du game ID : **documentée par une source communautaire, à tester sur fixtures**.
- Implémentation : **bloquée jusqu'à validation d'une source accessible et d'au moins une réponse brute**.



## Piste ESPN pour récupérer les matchs de playoffs (13 novembre 2026)

La documentation SportsDataverse identifie une possibilité plus cohérente avec l'architecture actuelle : réutiliser le **scoreboard ESPN** avec les paramètres de saison et de type de saison, plutôt que d'ajouter immédiatement NBA Stats API.

Route candidate :

`GET https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD-YYYYMMDD&seasontype=3&limit=1000`

Éléments documentés :
- `seasontype=3` désigne la postseason ;
- `dates` accepte une date ou une plage `YYYYMMDD-YYYYMMDD` ;
- `limit` borne le nombre d'événements retournés ;
- les événements du scoreboard ont le même format général que celui déjà traité par `_parse_game` : identifiant, date, compétition, concurrents, scores et statut.

La documentation du calendrier d'équipe ESPN confirme également les paramètres `season` et `seasontype`, ce qui pourrait servir de solution de repli ciblée. Toutefois, un appel par équipe serait moins efficace qu'un scoreboard de saison.

### Ce que cette piste permet — et ne permet pas encore

Si une capture brute confirme le contrat attendu, le scoreboard postseason peut fournir la liste des matchs terminés, les deux franchises, leurs scores, les dates et les statuts. On pourra alors agréger les matchs par confrontations et compter les victoires pour produire un historique des séries.

En revanche, **le scoreboard seul ne prouve pas le numéro de série ni le tour**. Il ne faut pas supposer que l'ordre des matchs ou les derniers chiffres de l'identifiant ESPN constituent une clé de série sans fixtures multi-saisons qui le démontrent. Le regroupement des confrontations peut être envisagé en premier ; l'attribution du tour et le positionnement dans un tableau de bracket restent distincts et doivent être validés.

### Décision de travail mise à jour

1. Tester la route scoreboard postseason sur une saison complète avec une capture JSON brute, et vérifier la pagination/limite réelle ainsi que les métadonnées de saison.
2. Vérifier que chaque événement possède deux équipes, des identifiants stables, un statut terminé et des scores cohérents.
3. Créer des fixtures couvrant au minimum une série de quatre matchs, une série de six ou sept matchs, et plusieurs tours/saisons.
4. Déterminer si les confrontations peuvent être regroupées sans collision (mêmes équipes rejouant en saisons différentes, séries de play-in, etc.).
5. N'implémenter l'historique que lorsque ces tests sont concluants. Garder NBA Stats `CommonPlayoffSeries` comme source de comparaison, pas comme dépendance de production tant que son accès réseau n'est pas validé.

**Statut :** meilleure piste identifiée, mais réponse brute ESPN et comportement réel de l'endpoint saisonnier non vérifiés. Aucune modification du code de production à ce stade.

### Références complémentaires

- https://sportsdataverse-py.sportsdataverse.org/docs/0.0.73/nba/reference/site
- https://js.sportsdataverse.org/docs/nba/reference/cdn
- https://rdrr.io/cran/hoopR/src/R/espn_basketball_team_helpers.R
- https://github.com/machina-sports/sports-skills/blob/main/skills/nba-data/references/api-reference.md



## Validation de la piste ESPN : labels de playoffs dans les événements (13 novembre 2026)

Une implémentation communautaire NBA/ESPN (Scorva) documente un champ utile observé sur les événements :
- le type de saison est disponible via `event.season.type` ;
- lorsque `event.season.type === 3`, le libellé de playoffs est lu dans `event.competitions[0].notes[0].headline` ;
- exemples publiés : `NBA Finals - Game 1` et `NBA Finals - Game 3`.

Cela ouvre une piste plus robuste que le décodage des derniers chiffres du game ID : utiliser les labels ESPN lorsqu'ils sont présents, tout en gardant le match et ses résultats comme source de vérité.

### Point de vigilance sur la récupération d'une saison entière

Les références consultées ne sont pas parfaitement cohérentes sur le filtre `dates` :
- SportsDataverse décrit `dates` comme acceptant une date, une plage ou une année ;
- une documentation d'API récente signale que les plages de dates peuvent renvoyer HTTP 400 ;
- le paramètre `limit` est documenté avec une valeur par défaut de 500, mais la limite maximale effective n'est pas établie.

Par conséquent, **ne pas implémenter un unique appel avec une plage de dates et `limit=1000` comme s'il était validé**. Deux solutions de test restent à comparer :
1. charger les calendriers d'équipe avec `season=YYYY`, puis filtrer les événements postseason ; cela implique jusqu'à 30 requêtes pour reconstruire une saison complète ;
2. appeler le scoreboard par dates quotidiennes sur la période postseason, avec un cache et une limite contrôlée.

Le calendrier d'équipe est déjà utilisé par l'intégration pour les équipes favorites. Sa réponse actuelle n'est cependant pas capturée dans les fixtures avec une saison historique complète.

### Règles de reconstruction proposées pour le prototype

- Filtrer explicitement les événements dont le type de saison ESPN est postseason (id `3`), sans se baser uniquement sur le préfixe du game ID.
- Lire le label depuis `competitions[0].notes` en tolérant l'absence, une liste vide ou plusieurs notes.
- Conserver le label original et le game ID ; ne pas normaliser agressivement le texte.
- Regrouper les matchs par saison + paire d'équipes non ordonnée, puis vérifier que le label et la chronologie ne révèlent pas plusieurs confrontations distinctes.
- Pour le play-in, ne pas le confondre avec une série best-of-seven ; utiliser le label explicite lorsqu'il existe et laisser les cas non classables comme inconnus.
- Calculer le score de série uniquement à partir des matchs terminés avec un vainqueur explicite.
- Ne pas déduire le tour depuis la date de début ou l'ordre des confrontations tant que cela n'a pas été vérifié sur plusieurs saisons.

Cette stratégie suffit potentiellement pour un historique des confrontations et de leurs résultats. Un bracket complet (positions 1–8, progression des vainqueurs et branches) nécessite des règles supplémentaires et une validation distincte.

### Statut après cette vérification

- Paramètres scoreboard `seasontype=3`, `dates` et `limit` : documentés, limites d'usage saisonnier à confirmer.
- Label postseason `competitions[0].notes[].headline` : observé dans une implémentation communautaire, pas encore confirmé par une fixture brute de ce dépôt.
- Récupération complète d'une saison depuis l'endpoint : non validée.
- Reconstruction et bracket : non implémentés.
- Prochaine action : capturer une réponse réelle de calendrier d'équipe historique et une réponse scoreboard de match de playoffs, puis écrire les tests sur leur forme exacte.

### Référence complémentaire

- https://github.com/yassinbenelhajlahsen/Scorva



## Validation sur réponses ESPN réelles — 13 novembre 2026

Deux réponses brutes fournies depuis les endpoints ESPN ont été inspectées et réduites en fixtures ciblées dans `tests/fixtures/`.

### Calendrier d'équipe historique — Boston Celtics, saison 2024-25

Réponse demandée avec `season=2025&seasontype=3`.

Constats sur cette capture :
- `requestedSeason` confirme explicitement `year=2025`, `type=3`, `displayName=2024-25`.
- `events` contient 11 matchs des Celtics : cinq contre Orlando au premier tour, puis six contre New York en demi-finale de conférence.
- Chaque événement porte `seasonType.id="3"` et `seasonType.type=3`.
- Chaque `competitions[0]` contient `notes[0].headline`, avec des libellés tels que `East 1st Round - Game 1` et `East Semifinals - Game 6`.
- `competitions[0].type` fournit aussi une classification : `Round of 16` au premier tour et `Quarterfinal` au tour suivant.
- Les deux équipes, le score, le booléen `winner` et le statut final sont présents dans les événements de cette capture.
- L'objet de saison au niveau racine (`season`) correspond à la saison courante de la réponse, pas à la saison historique demandée. Pour identifier la saison des matchs, utiliser `requestedSeason` et/ou les champs `season` de chaque événement, jamais le seul `season` racine.

Cette capture confirme le format du calendrier d'équipe pour cette saison et cette franchise. Elle ne démontre pas à elle seule que les 30 calendriers d'équipe peuvent être récupérés sans restriction, ni qu'un calendrier d'équipe suffit à produire le tableau complet de la ligue.

### Scoreboard d'une journée de playoffs — 5 juin 2025

Réponse demandée avec `dates=20250605&seasontype=3`. L'événement est daté du 6 juin en UTC, ce qui explique le décalage de date dans le JSON.

Constats :
- L'événement contient `season.type=3`.
- Le libellé `NBA Finals - Game 1` est présent dans `competitions[0].notes[0].headline`.
- Les concurrents, scores et vainqueurs sont disponibles dans `competitions[0].competitors`.
- Un objet `competitions[0].series` est présent sur cette capture : `summary` donne le score de la série, `completed` son état, `totalCompetitions` le nombre prévu de matchs et `competitors[].wins` le nombre de victoires de chaque équipe.

**Précision importante :** l'objet `series` est présent dans le scoreboard fourni, mais absent des événements du calendrier d'équipe fourni. Le parseur devra donc le traiter comme un enrichissement facultatif, et non comme un champ garanti sur tous les endpoints.

### Décision technique après fixtures réelles

La piste ESPN est désormais confirmée au niveau du schéma réel pour :
1. détecter les matchs de postseason ;
2. lire le tour et le numéro du match à partir du libellé ESPN ;
3. récupérer les scores et les vainqueurs ;
4. exploiter, lorsqu'il est présent, le résumé ESPN de la série et le nombre de victoires.

La reconstruction des séries ne doit pas dépendre exclusivement de `series`, puisque ce champ n'apparaît pas dans la capture du calendrier d'équipe. Les labels `notes[].headline` sont la meilleure clé explicite observée dans les deux réponses. Il faudra conserver le texte source et gérer les champs absents.

Le comportement d'une récupération complète de la postseason reste à valider : ces fixtures représentent un calendrier d'une équipe et un seul événement du scoreboard, pas une saison entière. La prochaine étape est donc un parseur pur testé sur ces fixtures, puis une vérification de la couverture et de la stratégie de collecte avant toute intégration dans le coordinateur.

### Fixtures enregistrées

- `tests/fixtures/espn_playoff_team_schedule_2024_25.json` — les 11 matchs postseason du calendrier des Celtics, avec les champs utiles au parseur.
- `tests/fixtures/espn_playoff_scoreboard_2025_06_05.json` — le match NBA Finals Game 1 IND–OKC, incluant l'objet `series`.

Les fixtures sont volontairement réduites aux champs nécessaires pour les tests ; elles conservent les structures imbriquées réelles utilisées par le parseur.


## Captures complémentaires — 13 novembre 2026

Trois nouvelles réponses réelles ont été fournies et inspectées : calendrier OKC 2024-25, scoreboard du 20 avril 2025 et scoreboard du 16 avril 2025 (Play-In).

### Calendrier Oklahoma City Thunder — 2024-25

Requête : `teams/25/schedule?season=2025&seasontype=3`.

- `requestedSeason` indique bien 2024-25, postseason (année 2025, type 3).
- La réponse contient 23 événements postseason.
- Les notes `competitions[0].notes[0].headline` distinguent :
  - West 1st Round — Games 1 à 4 (4 événements dans le calendrier OKC) ;
  - West Semifinals — Games 1 à 7 (7 événements) ;
  - West Finals — Games 1 à 5 (5 événements) ;
  - NBA Finals — Games 1 à 7 (7 événements).
- Les finales NBA apparaissent dans le calendrier OKC après la finale de conférence, avec les mêmes champs de saison et de notes.
- `competitions[0].type` est une classification ESPN complémentaire : Round of 16, Quarterfinal, Semifinal et Final. Ne pas confondre ces libellés ESPN avec le texte de tour dans `notes[].headline`.
- La réponse racine contient encore `season=2026-27` (Regular Season), alors que `requestedSeason` et les événements décrivent 2024-25 postseason. La saison racine ne doit jamais servir seule à classer les événements.

### Scoreboard du 20 avril 2025 — quatre rencontres

Requête : `scoreboard?dates=20250420&seasontype=3`.

- Quatre événements sont renvoyés dans une seule réponse.
- Les quatre événements portent `season.type=3`.
- Chacun contient un label de tour dans `competitions[0].notes[].headline`.
- Sur les quatre événements de cette capture, `competitions[0].series` est présent et contient notamment `summary`, `completed`, `totalCompetitions` et `competitors[].wins`.
- Les scores sont des chaînes dans le scoreboard (`"131"`, par exemple), alors que le calendrier d'équipe observé fournit un objet score avec `value` et `displayValue`. Le parseur devra accepter ces deux formes.

### Scoreboard du 16 avril 2025 — Play-In

Requête : `scoreboard?dates=20250416&seasontype=3`.

- Deux événements sont renvoyés.
- Les deux événements portent `season.type=5` et `slug=play-in-season`.
- Les notes identifient explicitement le Play-In et le match de classement (9e contre 10e).
- Le champ `competitions[0].series` est absent.
- `competitions[0].type` vaut `STD` : le type de compétition seul ne permet donc pas de distinguer playoffs et Play-In.

### Conséquences pour le parseur

1. Lire le type de saison au niveau de chaque événement : `event.season.type` dans le scoreboard, ou `event.seasonType.type` dans le calendrier d'équipe. Dans la capture du calendrier, `event.season.type` ne porte pas le type postseason ; il est fourni par `event.seasonType`.
2. Classer `3` comme postseason et `5` comme Play-In ; ne pas fusionner les deux.
3. Extraire le libellé d'événement depuis `competitions[0].notes[].headline`, en le conservant tel quel.
4. Traiter `series` comme facultatif, même si sa présence est confirmée sur les quatre matchs du scoreboard du 20 avril.
5. Normaliser les scores depuis une chaîne ou depuis un objet `value/displayValue`, sans convertir une valeur absente en zéro.
6. Gérer les deux variantes de saison : `seasonType.type` dans les calendriers d'équipe et `season.type` dans les scoreboards.

### Fixtures ciblées

- `tests/fixtures/espn_playoff_scoreboard_2025_04_20.json` : quatre matchs et leurs objets `series`.
- `tests/fixtures/espn_playin_scoreboard_2025_04_16.json` : deux matchs de Play-In sans objet `series`.

Ces fichiers sont des fixtures réduites aux champs utiles, recopiés depuis les réponses réelles ; ce ne sont pas des dumps complets des réponses ESPN.


## Parseur indépendant — première version (13 novembre 2026)

Le module `custom_components/nba/playoff_data.py` est maintenant créé. Il reste volontairement pur : aucune requête HTTP, aucune dépendance Home Assistant, aucune modification du coordinateur.

Fonctions publiques :
- `parse_playoff_event(event)` : normalise un événement ESPN, ou renvoie `None` si le type n'est pas postseason/Play-In ou si les équipes indispensables sont absentes.
- `parse_playoff_payload(payload)` : applique le parseur à `payload.events` et ignore les événements non exploitables.

Contrat normalisé :
- `phase` vaut `playoffs` pour le type 3 et `play_in` pour le type 5 ;
- `season_year` vient de l'événement, jamais de la saison racine de la réponse ;
- `label` conserve le headline ESPN original ; `round_label` et `game_number` ne sont renseignés que si le label suit le motif `<tour> - Game N` ;
- les équipes sont ordonnées domicile puis extérieur, avec leurs identifiants, abréviations, scores et vainqueur explicite ;
- les scores manquants/invalides restent `None`, jamais zéro ;
- `completed` reste inconnu si ESPN ne fournit pas un booléen explicite ;
- `series` est un enrichissement facultatif, et ses nombres de victoires ne sont pas calculés par le parseur.

Tests ajoutés dans `tests/test_playoff_data.py` : calendrier historique, scoreboard Finals, journée multi-matchs, Play-In, saison régulière ignorée, compétiteurs incomplets, scores absents et variantes de structure des scores.

**Limite actuelle :** le parseur normalise les événements ; il ne regroupe pas encore les rencontres en séries, ne déduit pas les gagnants d'une série et ne construit pas de bracket. Ces règles nécessiteront des tests dédiés avant toute intégration au coordinateur.


## Reconstruction des séries — première version

Le module expose maintenant `build_playoff_series(games)`, toujours sans réseau ni dépendance Home Assistant.

### Règles appliquées

- Les événements Play-In sont exclus : ils ne sont pas des séries au meilleur des sept.
- Le regroupement exige une saison, un libellé de tour reconnu et exactement deux équipes identifiées.
- La clé de regroupement est saison + phase + libellé du tour + paire d'identifiants d'équipes (paire triée, donc indépendante du domicile).
- Les événements sont dédupliqués par identifiant de match, puis triés par numéro de match ESPN et date.
- Une victoire n'est comptée que si `completed is True` et qu'une seule équipe porte explicitement `winner is True`. Aucun résultat n'est déduit du score.
- Une équipe atteint le statut de vainqueur de série à quatre victoires.
- Plus de sept matchs, deux équipes à quatre victoires ou des numéros de match dupliqués signalent une série `inconsistent`, sans vainqueur déclaré.
- Les événements avec résultat incomplet restent dans la série et augmentent `unknown_results` ; ils ne sont pas comptés comme des victoires.

Le résultat contient notamment le statut (`in_progress`, `completed` ou `inconsistent`), les équipes et leurs victoires, le nombre de matchs, les résultats inconnus, les anomalies détectées et les matchs normalisés.

### Validation sur les calendriers complets fournis

Les fixtures de calendrier d'équipe ont été reconstruites depuis les fichiers JSON originaux joints dans la conversation. La fixture Celtics contient les 11 matchs réellement présents dans la réponse ESPN (5 contre Orlando, 6 contre New York). Une seconde fixture contient les 23 matchs du calendrier postseason OKC.

Résultats attendus et vérifiés par les tests :
- Boston–Orlando : Boston gagne 4–1.
- Boston–New York : New York gagne 4–2.
- Oklahoma City–Memphis : Oklahoma City gagne 4–0.
- Oklahoma City–Denver : Oklahoma City gagne 4–3.
- Oklahoma City–Minnesota : Oklahoma City gagne 4–1.
- Oklahoma City–Indiana (Finales NBA) : Oklahoma City gagne 4–3.

Ces tests valident la reconstruction des séries à partir des événements du calendrier, sans dépendre des résumés `series` d'ESPN. Le bracket et l'enchaînement automatique des équipes qualifiées entre les tours restent hors périmètre : ils ne doivent pas être inférés à partir du seul libellé de série.


## Reconstruction du parcours du bracket — prototype pur

Le module expose également `build_playoff_bracket(series)`. Il organise les séries par saison et par conférence lorsque le libellé ESPN permet de reconnaître le tour.

### Liens entre les tours

- Les tours reconnus sont le premier tour, les demi-finales de conférence, les finales de conférence et les NBA Finals.
- Les séries Est et Ouest sont conservées séparément ; les NBA Finals sont placées dans une section distincte.
- Un lien vers le tour suivant n'est créé que si le vainqueur explicite d'une série apparaît comme l'une des deux équipes dans une série du tour immédiatement suivant.
- Les liens entrants et sortants sont exposés via `advanced_from` et `advances_to`.
- Les libellés inconnus restent dans `unplaced` au lieu d'être affectés arbitrairement à une conférence ou à un tour.
- Le Play-In n'est pas intégré au bracket postseason.

### Limites explicites

Cette version reconstruit un **parcours des équipes vérifiable**, pas encore un tableau officiel complet :
- les têtes de série et les positions 1 à 8 ne sont pas disponibles dans les fixtures actuelles ;
- les emplacements de branches et les croisements théoriques ne sont donc pas inventés ;
- une série sans vainqueur explicite ne produit aucun lien sortant ;
- le prototype ne récupère pas encore les séries des équipes absentes des calendriers fournis.

### Validation

Les tests utilisent le calendrier complet OKC 2024-25 : le vainqueur de la première série est relié aux demi-finales, puis au vainqueur des finales Ouest et enfin aux NBA Finals. Des tests défensifs vérifient qu'aucune progression n'est inventée lorsqu'une équipe n'apparaît pas dans la série suivante, et que les tours non reconnus restent non classés.

Aucune intégration au coordinateur Home Assistant ni aucun capteur n'est modifié à ce stade.


## Recherche d'une source de seeds et de positions de bracket — 13 novembre 2026

### ESPN standings : piste prioritaire à valider

La documentation SportsDataverse de l'endpoint ESPN NBA standings expose notamment :
- `playoff_seed` ;
- `group_name` / `group_abbreviation` ;
- `team_id`, `team_abbreviation`, `team_display_name` ;
- les bilans et statistiques de saison.

Endpoint documenté :
`GET https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?season={year}`

La documentation ESPN site API décrit les paramètres `season`, `group` et `type` pour les classements, et la documentation core ESPN décrit aussi les standings avec le champ `playoff_seed`.

**Ce que cela pourrait permettre :** récupérer l'ordre des équipes par conférence et rattacher un seed à un identifiant ESPN stable.

**Ce qui n'est pas encore démontré :**
- que la route renvoie correctement les standings historiques pour toutes les saisons ;
- que `playoff_seed` représente le seed final effectivement utilisé dans le bracket après le Play-In, et pas seulement le classement de fin de saison régulière ;
- que les valeurs restent cohérentes pour les équipes classées 7 à 10 avant et après le Play-In ;
- que la réponse peut être récupérée de façon fiable depuis l'environnement Home Assistant.

Aucune donnée de standings brute n'est encore enregistrée dans les fixtures du dépôt. Cette piste ne doit donc pas être branchée au parseur de production avant capture et vérification.

### NBA.com : référence officielle de contrôle

Les pages NBA.com publient les brackets officiels par saison, avec les seeds et les confrontations du premier tour. La page 2025 confirme par exemple les affiches (1)-(8), (2)-(7), (3)-(6) et (4)-(5) dans chaque conférence.

Ces pages sont une bonne référence de validation manuelle des résultats calculés, mais aucune API JSON publique stable pour les extraire n'a été établie dans cette recherche.

### Sportradar : schéma complet, mais fournisseur commercial

La documentation Sportradar NBA Series Schedule expose directement :
- le seed de chaque participant ;
- le numéro de tour ;
- l'identifiant et le titre de la série ;
- les participants et leur bilan dans la série ;
- des identifiants de source reliant un participant à une série précédente ;
- les matchs, leurs équipes, scores et statuts.

Le guide explique aussi que les séries peuvent être publiées avec des équipes TBD, puis mises à jour après le Play-In et au fur et à mesure de l'avancement.

C'est le schéma le plus complet repéré pour un vrai bracket, mais il nécessite un accès Sportradar et une clé/API souscrite. Il ne constitue donc pas une source à ajouter implicitement à une intégration autonome gratuite.

### Décision

1. Garder ESPN comme source principale candidate.
2. Capturer les standings ESPN historiques pour au moins 2024-25 et 2025-26, puis comparer les seeds à des brackets NBA.com officiels.
3. Vérifier spécifiquement les seeds 7 et 8 après le Play-In.
4. Ne construire les positions 1 à 8 qu'à partir de seeds confirmés ; sinon laisser le bracket partiellement positionné.
5. Ne pas ajouter Sportradar comme dépendance sans décision explicite sur la clé, le coût et les conditions d'utilisation.

### Correctif de classification des tours

Le classement des tours du prototype a été rendu strict : `NBA Finals` est maintenant reconnu exactement comme le quatrième tour, et non comme une finale de conférence. Cela évite de confondre les deux étapes lors de la création des liens de progression.
