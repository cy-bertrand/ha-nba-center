# NBA Center — installation de la carte

## Ressource Lovelace

La carte est servie par l'intégration à l'URL :

```text
/nba-center/nba-center-card.js
```

Ajoutez cette ressource une seule fois dans **Paramètres → Tableaux de bord → Ressources** :

- URL : `/nba-center/nba-center-card.js`
- Type : **JavaScript module**

En mode YAML, ajoutez dans `lovelace:` :

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /nba-center/nba-center-card.js
      type: module
```

Ne déclarez pas deux fois la ressource si elle est déjà enregistrée dans le stockage Lovelace.

## Carte manuelle

Ajoutez une carte manuelle avec :

```yaml
type: custom:nba-center-card
```

## État de ce premier socle

Cette première version valide la livraison du fichier statique, l'enregistrement du custom element, le style NBA Dark, les cinq onglets, la navigation clavier de base et l'adaptation mobile. Les vues utilisent encore des contenus d'attente.

**Limitation connue :** ce shell initial est un Web Component natif, pas encore le bundle Lit final. Le passage à Lit et la chaîne de build sont le prochain incrément de Phase 1. Aucune donnée ESPN n'est demandée depuis le navigateur.
