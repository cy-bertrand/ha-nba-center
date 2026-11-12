# NBA Center — Contrats de données backend/frontend (proposition)

**Statut :** proposition Phase 0, non implémentée  
**Principe :** le frontend consomme uniquement des données normalisées émises par l'intégration. Aucun accès ESPN depuis le navigateur.

## Enveloppe commune

Toute commande WebSocket répond avec une enveloppe stable :

```json
{
  "data": {},
  "meta": {
    "resource": "scoreboard",
    "fetched_at": "2026-11-12T20:00:00+01:00",
    "source": "espn",
    "stale": false,
    "season": 2027
  },
  "warnings": []
}
```

En cas de panne de source, ne pas remplacer des données connues par des valeurs fabriquées :
- si un cache existe, renvoyer les données en cache avec `stale: true` et un avertissement ;
- sans cache, renvoyer une erreur Home Assistant structurée ;
- ne pas convertir les champs absents en `0`, `false` ou chaîne vide si cela change leur sens.

## Modèle Match

```json
{
  "id": "401234567",
  "date": "2026-11-12T19:30:00Z",
  "status": {
    "state": "in|pre|post",
    "short": "Q2",
    "long": "2nd Quarter",
    "completed": false,
    "period": 2,
    "clock": "05:42"
  },
  "venue": {"name": null, "city": null},
  "broadcasts": [],
  "home": {
    "id": "1",
    "abbreviation": "BOS",
    "name": "Boston Celtics",
    "logo": null,
    "score": 54,
    "record": null,
    "winner": null,
    "linescore": [{"period": 1, "score": 28}]
  },
  "away": {},
  "links": {"summary": null, "recap": null}
}
```

Règles :
- score nul si non communiqué, jamais zéro par défaut ;
- conserver l'heure UTC source puis convertir à l'affichage dans le fuseau HA ;
- le modèle accepte les périodes supplémentaires et les matchs sans lignescore ;
- le statut est un enum interne indépendant des libellés ESPN.

## Modèle Box Score

```json
{
  "game_id": "401234567",
  "teams": [
    {
      "team_id": "1",
      "players": [
        {
          "athlete_id": "3975",
          "name": "Player Name",
          "position": null,
          "jersey": null,
          "starter": null,
          "status": "active",
          "did_not_play_reason": null,
          "statistics": {
            "minutes": "36:12",
            "points": 24,
            "rebounds": 8,
            "assists": 6,
            "steals": 1,
            "blocks": 0,
            "turnovers": 2,
            "fouls": 3,
            "fg": "9-18",
            "three_pt": "3-7",
            "ft": "3-4",
            "plus_minus": 7
          }
        }
      ],
      "totals": {}
    }
  ],
  "available_columns": ["MIN", "FG", "3PT", "FT", "REB", "AST", "TO", "STL", "BLK", "PF", "+/-", "PTS"]
}
```

Règles :
- conserver les valeurs source et les noms/ordre de colonnes disponibles ;
- fournir des champs normalisés pour les statistiques courantes ;
- une statistique non fournie vaut `null`, pas zéro ;
- gérer DNP, blessure, joueur inactif, joueur éjecté et joueur sans temps de jeu ;
- les totaux d'équipe viennent de la source, ne pas les recalculer si les règles d'arrondi ou les données sont incomplètes.

## Modèle Team

```json
{
  "id": "1",
  "abbreviation": "BOS",
  "name": "Boston Celtics",
  "display_name": "Boston Celtics",
  "nickname": "Celtics",
  "logo": null,
  "color": null,
  "record": {"wins": null, "losses": null, "win_pct": null},
  "conference": null,
  "division": null,
  "roster": [],
  "schedule": []
}
```

Le roster et le calendrier sont des sous-ressources chargées à la demande, pas un bloc obligatoire de la liste des 30 équipes.

## Modèle Player

```json
{
  "id": "3975",
  "full_name": "Player Name",
  "first_name": null,
  "last_name": null,
  "headshot": null,
  "team": {"id": "1", "abbreviation": "BOS", "name": "Boston Celtics"},
  "position": null,
  "jersey": null,
  "height": null,
  "weight": null,
  "age": null,
  "birth_date": null,
  "experience": null,
  "status": null,
  "season": 2027,
  "season_type": "regular"
}
```

Le profil, les stats, les gamelogs et les splits sont des ressources distinctes afin de gérer les absences partielles et les caches indépendamment.

## Modèle statistiques joueurs

- `season` : année ESPN de la saison (à vérifier : ESPN utilise souvent l'année de fin de saison) ;
- `season_type` : preseason, regular, postseason ;
- `categories` : identifiant/nom, libellé, unité, colonnes, lignes ;
- `gamelog` : lignes avec `event_id`, date, adversaire, résultat et statistiques ;
- `splits` : groupe, libellé, échantillon, statistiques.

Ne pas coder en dur la liste des catégories retournées par ESPN : elle peut varier selon les profils et types de saison.

## Commandes WebSocket proposées

| Commande | Paramètres minimum | Réponse |
|---|---|---|
| `nba/center/scoreboard` | `date` (YYYY-MM-DD) | liste Match |
| `nba/center/game` | `game_id` | Match + Box Score + résumé |
| `nba/center/teams` | aucun | liste Team légère |
| `nba/center/team` | `team_id`, sections optionnelles | profil / roster / calendrier |
| `nba/center/players/search` | `query`, `limit` borné | liste Player légère |
| `nba/center/player` | `athlete_id`, `season`, `season_type` | Player + stats |
| `nba/center/player_gamelog` | `athlete_id`, `season`, `season_type`, pagination | gamelog |
| `nba/center/leaders` | `season`, `season_type`, `category`, `limit` | leaders |

Les identifiants doivent être validés côté serveur et les limites de pagination plafonnées.

## Stratégie cache initiale (à mesurer)

| Ressource | TTL indicatif | Motif |
|---|---:|---|
| Scoreboard live | 30 s pendant les matchs ; 2 min hors direct | scores évolutifs |
| Summary / box score | 15 s pendant le match ; 15 min après final | stats live puis stables |
| Standings | 15 min | faible volatilité |
| Teams catalogue | 24 h | très faible volatilité |
| Team profile / roster | 6 h | changements occasionnels |
| Team schedule | 1 h | mises à jour de calendrier |
| Player profile | 24 h | faible volatilité |
| Player season stats | 30 min | mises à jour journalières |
| Player gamelog / splits | 6 h | données historiques quasi stables |
| Leaders | 15 min | dépend des matchs en cours |

Les TTL sont des valeurs de départ, pas des garanties. Les ressources identiques doivent être dédupliquées en vol (single-flight). Un appel par joueur ne doit jamais être lancé pour l'ensemble de la ligue lors du chargement de la carte.

## Politique de requêtes et dégradation

1. Le chargement HOME ne doit pas appeler 30 rosters ou 30 schedules.
2. Charger les sections détaillées uniquement quand l'utilisateur ouvre une fiche.
3. Limiter et paginer les recherches joueurs.
4. Les ressources indépendantes doivent avoir un état de disponibilité distinct ; une panne des leaders ne doit pas cacher le scoreboard.
5. Respecter les quotas/limitations raisonnables et ajouter un backoff en cas de 429/5xx.
6. Ajouter un timeout explicite, limiter les tentatives et journaliser sans spam.
7. Cache mémoire au premier incrément ; persistance uniquement si un besoin réel est établi.
8. Les données de l'intégration historique doivent continuer à être alimentées par les structures attendues par les capteurs existants.

## Cas de tests requis

- scoreboard : date sans match, match pré-match, en direct, terminé, reporté/annulé, plusieurs matchs, date locale proche de minuit ;
- match : absence de boxscore, overtime, joueur DNP, statistiques manquantes, colonnes réordonnées, source 404/429/500 ;
- roster : tableau vide, joueur sans position, doublon, statut absent ;
- joueur : historique vide, saison non disponible, valeurs statistiques en chaîne, pagination ;
- cache : hit, expiration, stale-if-error, appels simultanés dédupliqués ;
- compatibilité : mêmes entités, attributs, services et événements existants.

Aucun de ces tests n'est déclaré exécuté dans cette proposition.
