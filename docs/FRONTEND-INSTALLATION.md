# NBA Center — installation de la carte

## Prérequis

- Home Assistant **2024.7 ou plus récent**.
- Intégration NBA installée et configurée.
- Au moins une équipe favorite sélectionnée pour afficher les fiches équipes.

## Ressource Lovelace

La ressource est servie par l'intégration à l'URL :

```text
/nba-center/nba-center-card.js
```

Ajoute cette ressource une seule fois dans **Paramètres → Tableaux de bord → Ressources** :

- URL : `/nba-center/nba-center-card.js`
- Type : **JavaScript module**

En mode YAML :

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /nba-center/nba-center-card.js
      type: module
```

Ne la déclare pas deux fois si elle est déjà enregistrée dans les ressources Lovelace.

## Carte minimale

```yaml
type: custom:nba-center-card
```

## Configuration facultative

Le titre, le sous-titre et les entity_id peuvent être surchargés si Home Assistant a généré des identifiants différents :

```yaml
type: custom:nba-center-card
title: NBA CENTER
subtitle: Your league. Your teams. One center.
entities:
  games: sensor.nba_matchs_du_jour
  east: sensor.nba_classement_est
  west: sensor.nba_classement_ouest
  points: sensor.nba_meilleurs_marqueurs
  rebounds: sensor.nba_meilleurs_rebondeurs
  assists: sensor.nba_meilleurs_passeurs
  steals: sensor.nba_meilleurs_intercepteurs
  blocks: sensor.nba_meilleurs_contreurs
```

Les identifiants ci-dessus sont les valeurs par défaut attendues à partir des noms actuels des capteurs. La carte tente aussi de découvrir automatiquement les capteurs par leurs attributs ; utilise la surcharge si tu as renommé des entités.

## Vues disponibles

- **HOME** : matchs en direct, prochaines rencontres, équipes favorites et leaders en points.
- **SCORES** : matchs chargés par le coordinateur, filtres Tous / Live / À venir / Terminés et recherche par équipe.
- **TEAMS** : fiches des équipes favorites, dernier et prochain match.
- **PLAYERS** : leaders en points, rebonds, passes, interceptions et contres.
- **STATS** : classements Est/Ouest et leaders statistiques.

Les vues exploitent exclusivement les états et attributs Home Assistant. Le navigateur n'appelle pas ESPN.

## Limites actuelles

- Le capteur historique expose le scoreboard courant ; le sélecteur de dates et les archives seront ajoutés dans la phase Match Center.
- Les joueurs sont présentés via les capteurs de leaders existants ; les profils, recherches et comparaisons individuelles viendront dans Players Center.
- Les détails complets / box scores ne sont pas encore exposés dans cette interface.
- La validation automatique du bundle ne remplace pas un test sur une instance Home Assistant réelle.
