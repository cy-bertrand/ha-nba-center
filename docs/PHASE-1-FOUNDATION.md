# Phase 1 — Foundation NBA Center

**Branche :** `phase-1-foundation`  
**Statut :** en cours — carte Lit et bundle livrés ; validation Home Assistant réelle restante

## Objectif

Mettre en place la distribution de la ressource frontend par l'intégration Home Assistant et créer le shell visuel NBA Dark avec les cinq espaces de navigation.

## Réalisé dans ce premier incrément

- Création de `custom_components/nba/frontend.py`.
- Enregistrement du fichier statique via `hass.http.async_register_static_paths` et `StaticPathConfig`.
- Enregistrement de la ressource pendant le setup de l'intégration, sans bloquer les capteurs historiques si l'enregistrement échoue.
- Ajout de `http` et `lovelace` dans `after_dependencies`.
- Création du shell de secours `custom_components/nba/www/nba-center-card.js` et de la source Lit `frontend/src/nba-center-card.js`.
- Ajout de `package.json`, `build.mjs` et d'un workflow GitHub Actions pour construire et committer le bundle Lit.
- Déclaration du custom element `nba-center-card`.
- Structure visuelle NBA Dark, responsive et cinq onglets : HOME, SCORES, TEAMS, PLAYERS, STATS.
- Navigation locale, styles dans le shadow DOM et annonce dans `window.customCards`.
- Documentation de l'installation en mode YAML et stockage dans `docs/FRONTEND-INSTALLATION.md`.

## Limites explicites

- La source du composant Lit est maintenant présente dans `frontend/src/nba-center-card.js`, avec dépendances épinglées dans `package.json` et build esbuild dans `build.mjs`.
- Le workflow GitHub Actions a construit et committé le bundle Lit autonome dans `custom_components/nba/www/nba-center-card.js`.
- Les onglets contiennent des états d'attente : aucune donnée NBA n'est encore branchée.
- La ressource doit être ajoutée une fois dans les ressources Lovelace par l'utilisateur ; l'intégration ne modifie pas automatiquement son dashboard.
- La carte n'a pas encore été installée ni exécutée dans une instance Home Assistant réelle.
- Le build Lit et les contrôles statiques du bundle passent dans GitHub Actions ; aucun test d'intégration Home Assistant n'a encore été exécuté.

## Contrôles automatisés exécutés

Workflow GitHub Actions : [run 43302534529](https://github.com/cy-bertrand/ha-nba-center/actions/runs/43302534529) — **succès**.

- `python -m compileall -q custom_components/nba` : réussi.
- `npm ci`, `npm run build` : réussis.
- `npm test` : réussi (présence du custom element et des métadonnées Lovelace, Lit embarqué, aucune dépendance Lit externe, aucun endpoint ESPN dans le bundle).

Ces contrôles sont statiques. Ils ne remplacent pas un démarrage réel de Home Assistant ni un test navigateur.

## Contrôles à exécuter

1. Vérifier le chargement Python de l'intégration avec la nouvelle fonction frontend.
2. Vérifier l'accès HTTP à `/nba-center/nba-center-card.js`.
3. Vérifier la détection de `custom:nba-center-card` et l'affichage des cinq onglets.
4. Vérifier mode YAML et mode stockage.
5. Vérifier le rendu mobile, desktop et le thème sombre.
6. Vérifier que les capteurs, le service `nba.get_game_details`, le blueprint et les événements existants fonctionnent sans changement.
7. Installer la ressource et vérifier la carte dans une instance HA réelle.

## Critères de sortie Phase 1

- Bundle Lit construit, autonome et livré dans le répertoire statique.
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

