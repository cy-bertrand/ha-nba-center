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
