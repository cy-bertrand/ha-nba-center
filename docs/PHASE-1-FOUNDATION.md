# Phase 1 — Foundation NBA Center

**Branche :** `phase-1-foundation`  
**Statut :** en cours — premier incrément de livraison

## Objectif

Mettre en place la distribution de la ressource frontend par l'intégration Home Assistant et créer le shell visuel NBA Dark avec les cinq espaces de navigation.

## Réalisé dans ce premier incrément

- Création de `custom_components/nba/frontend.py`.
- Enregistrement du fichier statique via `hass.http.async_register_static_paths` et `StaticPathConfig`.
- Enregistrement de la ressource pendant le setup de l'intégration, sans bloquer les capteurs historiques si l'enregistrement échoue.
- Ajout de `http` et `lovelace` dans `after_dependencies`.
- Création de `custom_components/nba/www/nba-center-card.js`.
- Déclaration du custom element `nba-center-card`.
- Structure visuelle NBA Dark, responsive et cinq onglets : HOME, SCORES, TEAMS, PLAYERS, STATS.
- Navigation locale, styles dans le shadow DOM et annonce dans `window.customCards`.
- Documentation de l'installation en mode YAML et stockage dans `docs/FRONTEND-INSTALLATION.md`.

## Limites explicites

- Le composant livré est pour l'instant un Web Component natif. Il **n'est pas encore le composant Lit demandé**. Le bundling Lit et la chaîne de build sont le prochain jalon de cette phase.
- Les onglets contiennent des états d'attente : aucune donnée NBA n'est encore branchée.
- La ressource doit être ajoutée une fois dans les ressources Lovelace par l'utilisateur ; l'intégration ne modifie pas automatiquement son dashboard.
- Le shell n'a pas encore été exécuté dans un Home Assistant réel.
- Aucune suite de tests automatisés n'a été lancée.

## Contrôles à exécuter

1. Vérifier le chargement Python de l'intégration avec la nouvelle fonction frontend.
2. Vérifier l'accès HTTP à `/nba-center/nba-center-card.js`.
3. Vérifier la détection de `custom:nba-center-card` et l'affichage des cinq onglets.
4. Vérifier mode YAML et mode stockage.
5. Vérifier le rendu mobile, desktop et le thème sombre.
6. Vérifier que les capteurs, le service `nba.get_game_details`, le blueprint et les événements existants fonctionnent sans changement.
7. Remplacer le shell natif par le bundle Lit autonome, puis exécuter les contrôles de build et de compatibilité.

## Critères de sortie Phase 1

- Bundle Lit construit et livré dans le répertoire statique.
- Ressource Lovelace installable et stable.
- Cinq onglets opérationnels avec gestion d'état, chargement, erreur et vide.
- Tests frontend et tests Home Assistant exécutés.
- Aucun changement de comportement des fonctionnalités historiques.
- Documentation et compte rendu mis à jour, puis validation utilisateur.

## Fichiers touchés

- `custom_components/nba/__init__.py`
- `custom_components/nba/manifest.json`
- `custom_components/nba/frontend.py`
- `custom_components/nba/www/nba-center-card.js`
- `docs/FRONTEND-INSTALLATION.md`

