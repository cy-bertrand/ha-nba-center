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
