# Phase 2 — Match Center

**Branche :** `main`  
**Statut :** validation fonctionnelle confirmée par l'utilisateur sur Home Assistant (v0.5.2) ; tests backend ciblés ajoutés ; validation CI de cette dernière série de changements en attente

## Décisions produit confirmées

- Identité visuelle : NBA Dark, conservée.
- Navigation : onglets actuels en haut, inchangés.
- Détails : panneau superposé (overlay) qui se ferme sans perdre la date, les filtres ni la recherche.
- Périmètre équipes : les 30 franchises seront accessibles dans Teams Center (Phase 4), pas seulement les favoris.

## Objectif

Faire de SCORES un calendrier NBA consultable par date et transformer chaque rencontre en élément interactif ouvrant un premier aperçu Match Center. Les données sont demandées par le frontend à Home Assistant ; aucun appel ESPN ne doit être effectué depuis le navigateur.

## Périmètre fonctionnel

### A. Calendrier et navigation par date

- Afficher tous les matchs de la journée sélectionnée, sans limite arbitraire aux quatre premières rencontres.
- Contrôles jour précédent / jour suivant et raccourci « Aujourd'hui ».
- Sélecteur de date utilisable sur mobile et desktop.
- Conserver les filtres Tous / Live / À venir / Terminés et la recherche par équipe lors du changement de date.
- Trier chronologiquement et distinguer clairement LIVE, À VENIR et TERMINÉ.
- Afficher un état vide explicite lorsqu'aucun match n'est programmé.
- Le tableau de bord HOME garde une sélection compacte des matchs du jour ; SCORES devient le calendrier complet.

### B. Overlay Match Center — première version

- Ouvrir un panneau superposé au clic/tap sur une rencontre.
- Fermer par bouton, touche Échap et clic sur l'arrière-plan lorsque cela est possible.
- Garder la position de défilement, la date sélectionnée et les filtres à la fermeture.
- Afficher les équipes, logos, date/heure locale, statut, score et scores par quart-temps lorsque fournis par ESPN.
- Afficher les meilleurs joueurs fournis par le résumé ESPN.
- Prévoir chargement, données indisponibles et bouton de nouvelle tentative.
- Les box scores complets par joueur, les statistiques avancées et le play-by-play restent le périmètre de Phase 3.

### C. Architecture des données

- Ajouter une méthode backend de récupération du scoreboard pour une date donnée.
- Exposer cette méthode au frontend via une commande WebSocket propre à l'intégration, par exemple `nba/scoreboard`, avec validation stricte de la date.
- Réutiliser le parseur de match existant et normaliser la réponse en contrat stable.
- Réutiliser le service/cache de résumé existant pour l'aperçu du match, en évitant les doubles requêtes.
- Aucun accès ESPN depuis le bundle JavaScript.
- Dédupliquer les requêtes simultanées et borner le cache par date et par match.
- TTL indicatif : court pour les journées avec matchs LIVE, plus long pour les journées terminées ou futures ; les valeurs définitives seront déterminées après mesure.

### D. Fuseaux horaires

- Les dates sélectionnées et affichées suivent le fuseau horaire configuré dans Home Assistant.
- Le raccourci « Aujourd'hui » utilise le même fuseau HA ; le déplacement jour précédent/suivant travaille sur une date ISO sans dépendre du fuseau du navigateur.
- Attention au décalage entre la date NBA ESPN (calendrier américain) et la date locale européenne : une rencontre disputée le soir aux États-Unis peut apparaître le lendemain en Belgique.
- La stratégie à valider est de récupérer les journées ESPN adjacentes nécessaires, convertir les dates en heure HA, puis filtrer les événements selon le jour local demandé.
- Ajouter des fixtures de tests autour du passage minuit et des changements CET/CEST ; ne jamais supposer que `YYYYMMDD` local correspond directement au jour ESPN.

## Contrat de données proposé

### Réponse calendrier

```json
{
  "date": "YYYY-MM-DD",
  "timezone": "Europe/Brussels",
  "updated_at": "ISO-8601",
  "stale": false,
  "games": [
    {
      "id": "ESPN_EVENT_ID",
      "date": "ISO-8601 local",
      "date_text": "ven. 13/11 à 01:00",
      "state": "pre | in | post",
      "detail": "Scheduled / Final / ...",
      "period": 0,
      "clock": null,
      "home": {},
      "away": {}
    }
  ]
}
```

Les valeurs de score absentes restent nulles ; elles ne doivent pas être transformées artificiellement en zéro.

### Réponse résumé de match

- Identifiant du match.
- Statut et score courant/final.
- Scores par période.
- Résumé des leaders par équipe.
- Date de mise à jour et indication de fraîcheur.
- Erreur explicite et récupérable en cas d'indisponibilité.

Les champs précis seront arrêtés à partir de fixtures JSON réelles, pas d'hypothèses sur la structure ESPN.

## Endpoints à valider

- Scoreboard : `/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD`.
- Résumé : `/apis/site/v2/sports/basketball/nba/summary?event={event_id}`.

La documentation communautaire consultée décrit le paramètre `dates` et le résumé de match, mais ESPN ne publie pas de contrat officiel stable pour ces endpoints. Ils doivent donc être considérés comme non officiels et soumis à tests de fixtures et tolérance aux changements :
- https://sportsdataverse-py.sportsdataverse.org/docs/0.0.73/nba/reference/site
- https://github.com/sejaldua/espn-api/blob/main/references/endpoints.md
- https://github.com/pseudo-r/Public-ESPN-API/blob/main/docs/response_schemas.md

## Fichiers pressentis

- `custom_components/nba/coordinator.py` : récupération par date, cache et normalisation.
- `custom_components/nba/const.py` : paramètres/constantes de cache et commandes.
- Nouveau module backend WebSocket, par exemple `custom_components/nba/websocket.py`.
- `custom_components/nba/__init__.py` : enregistrement/désenregistrement propre des commandes si nécessaire.
- `frontend/src/nba-center-card.js` : date, états asynchrones, interaction des matchs et overlay.
- `frontend/test-bundle.mjs` et nouveaux tests Python : couverture frontend/backend.
- `docs/FRONTEND-INSTALLATION.md` : documentation des nouvelles interactions si nécessaire.

Ne pas modifier le contrat des capteurs existants sans raison et préserver les événements, le service `nba.get_game_details`, le blueprint et les dashboards Lovelace historiques.

## Plan d'exécution

1. Capturer des réponses ESPN réelles (jour passé, jour courant, jour futur, match terminé et match live si disponible) et les figer en fixtures anonymisées.
2. Tester le décalage de date entre ESPN et le fuseau Home Assistant Europe/Brussels.
3. Implémenter la récupération backend par date, validation WebSocket, cache et tests Python.
4. Implémenter le calendrier interactif et les états de chargement/erreur/absence de match.
5. Implémenter l'overlay de résumé et les tests frontend.
6. Construire le bundle, lancer la CI, inspecter le diff et tester les régressions.
7. Livrer un rapport et demander la validation utilisateur avant Phase 3.

## Critères de sortie

- Navigation entre dates fiable, y compris les rencontres qui passent minuit en Europe.
- Tous les matchs de la date sont présentés ; filtres et recherche restent fonctionnels.
- L'overlay fonctionne sur mobile et desktop, et conserve l'état de la liste à la fermeture.
- Score, périodes et leaders sont affichés uniquement si les données source les fournissent.
- Aucun appel ESPN depuis le navigateur.
- Cache borné, erreurs récupérables et absence de régression des fonctionnalités historiques.
- CI réussie et validation sur Home Assistant réel par l'utilisateur.

## Hors périmètre

- Box score complet et play-by-play (Phase 3).
- Exploration des 30 équipes et effectifs (Phase 4).
- Profils et comparaisons de joueurs (Phase 5).
- Refonte des onglets ou ajout d'une barre de navigation basse (non retenu).

## État d'implémentation — 12 novembre 2026

Déjà intégré sur `main` :
- Récupération du scoreboard ESPN par dates US adjacentes et filtrage après conversion dans le fuseau local Home Assistant.
- Cache par date, verrou contre les requêtes simultanées et TTL de 30 secondes en LIVE / 180 secondes hors LIVE.
- Repli sur le dernier calendrier en cache marqué obsolète si un appel de date adjacent échoue ; sans cache complet, une erreur est remontée plutôt qu'une liste partielle présentée comme complète.
- Commandes WebSocket `nba/scoreboard` et `nba/game_details`, enregistrées une seule fois par instance HA.
- Navigation par date, recherche et filtres dans SCORES.
- Clic sur les rencontres ouvrant un overlay avec résumé ESPN, quart-temps et leaders disponibles.
- Contrôles frontend ajoutés pour vérifier les commandes WebSocket et les composants Match Center.
- Ordre d'affichage NBA vérifié dans les cartes et l'overlay : équipe visiteuse en premier, équipe recevante en second ; les objets internes `home` / `away` restent inchangés.
- Navigation par date durcie : calcul indépendant du fuseau navigateur, raccourci « Aujourd'hui » basé sur le fuseau HA et protection contre les réponses asynchrones arrivant dans le désordre.
- En cas de repli sur un cache obsolète, le message d'état peut aussi afficher le détail de l'erreur ESPN.
- Workflow GitHub Actions exécuté avec succès le 12 novembre 2026 (build frontend et validation de syntaxe Python ; génération du bundle commitée automatiquement).

Vérifications restantes :
- Refaire un test dans Home Assistant après les dernières corrections de navigation et de gestion des réponses asynchrones.
- Validation du paramètre ESPN `dates` sur l'instance réelle, car l'endpoint est non officiel (les références communautaires confirment le format YYYYMMDD).
- Tests interactifs dans Home Assistant, notamment navigation des dates, overlay mobile et fuseau Europe/Brussels.
- Vérifier le comportement en cas de réponse ESPN obsolète/indisponible et les changements d'heure CET/CEST.
- Tests unitaires Python sans réseau ajoutés pour la validation stricte des dates, le parsing des scores absents/numériques et les TTL du cache (LIVE 30 s, hors LIVE 180 s).\n- Les tests de l'orchestration asynchrone du coordinateur (requêtes ESPN adjacentes, stale fallback, concurrence et changement CET/CEST) restent à compléter avec fixtures ESPN et tests Home Assistant.
