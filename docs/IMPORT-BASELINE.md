# Import du socle existant

**Source :** `cy-bertrand/ha-nba`  
**Cible :** `cy-bertrand/ha-nba-center`

## Fichiers importés

### Intégration Home Assistant
- `custom_components/nba/__init__.py`
- `custom_components/nba/coordinator.py`
- `custom_components/nba/manifest.json`
- `custom_components/nba/const.py`
- `custom_components/nba/config_flow.py`
- `custom_components/nba/sensor.py`
- `custom_components/nba/services.yaml`
- `custom_components/nba/strings.json`
- `custom_components/nba/translations/en.json`
- `custom_components/nba/translations/fr.json`
- `custom_components/nba/blueprints/automation/nba_game_notification.yaml`

### Cartes Lovelace existantes
- `lovelace/today-games-card.yaml`
- `lovelace/standings-card.yaml`
- `lovelace/team-card.yaml`
- `lovelace/leaders-card.yaml`
- `lovelace/last-games-card.yaml`
- `lovelace/top3-passeurs-card.yaml`
- `lovelace/top3-rebondeurs-card.yaml`
- `lovelace/top3-contreurs-card.yaml`
- `lovelace/top3-intercepteurs-card.yaml`
- `lovelace/dashboard-example.yaml`

### Métadonnées
- `hacs.json`

Le `README.md` racine a été remplacé par la présentation du projet NBA Center. Les métadonnées de documentation et de suivi d'incidents dans le manifest ont été redirigées vers le nouveau dépôt. Le domaine d'intégration, le nom, le codeowner, le flux de configuration, le type IoT et la version source `0.4.1` sont conservés.

## Préservation fonctionnelle

Aucune logique Python métier n'a été réécrite lors de cet import. Le domaine `nba`, les capteurs, le service `nba.get_game_details`, les événements et le blueprint sont repris tels quels dans les fichiers importés.

## Vérifications effectuées

- Dépôt cible public, branche par défaut `main).
- Fichiers Python centraux présents après import.
- Manifest vérifié et liens du dépôt mis à jour.
- Fichiers de traduction, métadonnées de service, blueprint et cartes Lovelace connues importés.

## À faire avant de clore la Phase 0

- Comparer exhaustivement l'arborescence Git source et cible, y compris fichiers cachés et workflows.
- Examiner l'intégralité de `coordinator.py`, `sensor.py`, `__init__.py` et des cartes.
- Vérifier la présence de tests et les exécuter dans un environnement Home Assistant adapté.
- Valider le chargement de l'intégration importée dans Home Assistant.
- Documenter des exemples de réponses ESPN et les limites des endpoints.
- Faire valider le plan technique avant toute implémentation de la Phase 1.

**Important :** l'import constitue une base de travail, pas une preuve de compatibilité d'exécution. Aucun test d'intégration Home Assistant n'a encore été exécuté.
