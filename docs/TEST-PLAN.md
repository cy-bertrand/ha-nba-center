# NBA Center — Plan de tests et critères d'acceptation

**Phase :** préparation Phase 0  
**Statut :** plan défini ; exécution non réalisée

## 1. Principes

- Ne jamais modifier le dépôt source `cy-bertrand/ha-nba`.
- Chaque nouvelle fonctionnalité est testée avec des fixtures JSON enregistrées et anonymisées si nécessaire.
- Les fixtures doivent refléter des réponses ESPN réelles ; les exemples illustratifs ne sont pas des fixtures de test d'intégration.
- Les tests unitaires de parsing ne doivent pas dépendre du réseau.
- Les tests Home Assistant utilisent les outils de test officiels et des sessions HTTP simulées.
- Un test live ESPN peut compléter les tests, mais ne doit pas être requis dans la CI afin d'éviter les échecs aléatoires liés au fournisseur.

## 2. Couverture Python

### Coordinateur et cache
- Cache miss puis cache hit.
- Expiration TTL.
- Requête identique simultanée dédupliquée.
- Erreur HTTP avec cache disponible : réponse stale et avertissement.
- Erreur HTTP sans cache : erreur structurée.
- Timeout, 429, 5xx, JSON invalide, réponse vide.
- Une ressource en erreur ne bloque pas les ressources indépendantes.
- Respect du nombre maximal de requêtes et des délais de retry.

### Parsers ESPN
- Scoreboard : match programmé, live, terminé, reporté, annulé, sans match.
- Date de match et conversion UTC / fuseau Home Assistant.
- Summary : équipes, périodes, overtime, box score joueurs, colonnes manquantes/réordonnées.
- Joueur DNP, blessé, inactif, expulsé, zéro minute et statistiques manquantes.
- Team : catalogue, profil, roster vide et joueur sans position.
- Player : profil incomplet, stats absentes, saison régulière et playoffs.
- Gamelog : saison sans match, événement absent, lignes reliées par eventId.
- Leaders : catégorie attendue absente, rang manquant et valeur absente.
- Standings : playoffSeed absent ou nul, ordre ESPN conservé si tri non fiable.

### Compatibilité existante
- IDs et noms d'entités historiques inchangés.
- Attributs existants conservés.
- Service `nba.get_game_details` conserve son schéma d'entrée et de sortie.
- Événements `nba_game_start` et `nba_game_end` inchangés.
- Blueprint existant et installation automatique conservés.
- Capteurs et automatisations ne dépendent pas des nouveaux endpoints.

## 3. Frontend Lit

- Chargement de la ressource Lovelace en mode YAML.
- Chargement en mode stockage sur les versions HA supportées.
- Changement de vues et retour arrière.
- Chargement, vide, erreur, stale et rafraîchissement.
- Gestion des écrans étroits et desktop.
- Accessibilité clavier, focus visible, libellés et contraste.
- Changement de thème HA sans perte du style NBA Dark.
- Aucun appel réseau ESPN depuis le navigateur.
- Désinscription correcte des listeners et timers lors de la déconnexion/reconnexion.

## 4. Tests manuels Home Assistant

Sur une instance de test :
1. Installation propre depuis HACS ou copie locale.
2. Configuration initiale et sélection d'équipes favorites.
3. Vérification des capteurs et attributs historiques.
4. Vérification des événements et du blueprint.
5. Ajout de la ressource Lovelace en mode YAML.
6. Ouverture de chaque vue NBA Center.
7. Simulation d'une indisponibilité ESPN et vérification du stale/error state.
8. Mise à jour depuis la version précédente sans perte de configuration.

## 5. CI et qualité

À créer au début de l'implémentation :
- pytest et pytest-homeassistant-custom-component ;
- fixtures ESPN par endpoint ;
- ruff (lint + format check) ;
- validation JSON/YAML ;
- build JavaScript reproductible ;
- contrôle du bundle et de ses dépendances ;
- GitHub Actions sur pull request et push de branches de phase.

Les versions exactes des outils seront épinglées après vérification de la version Python/Home Assistant minimale retenue.

## 6. Critères de sortie

Une phase n'est déclarée validée que si :
- les tests ciblés passent ;
- aucune régression des entités/services/événements historiques n'est constatée ;
- les erreurs et limites sont documentées ;
- le diff est relu ;
- le compte rendu de phase est fourni et approuvé.

**Important :** aucun des tests listés dans ce document n'est déclaré exécuté à ce stade.
