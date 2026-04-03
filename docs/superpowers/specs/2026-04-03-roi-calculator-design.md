# ROI Calculator — Framer Component Design Spec

## Overview

Composant Framer autonome (single `.tsx` file) pour calculer le gain potentiel mensuel d'un cabinet dentaire utilisant Recept AI. Le composant est destiné à être intégré sur la landing page rcpt.ai pour convertir les prospects.

## Formule de calcul

```
gain_mensuel = appels_par_jour × taux_manqué × part_rdv × panier_moyen × 22
```

- 22 = jours ouvrés par mois (configurable)
- Max théorique : on suppose que 100% des appels manqués sont récupérés

## Structure du composant

### Header (optionnel, masquable)
- Titre : "Calculez le **gain potentiel** de votre cabinet"
- Sous-titre : "Ajustez les valeurs selon vos besoins, le résultat se met à jour instantanément."
- "gain potentiel" en couleur primaire (#3067FF)
- Font : Switzer, 48px, weight 500, letter-spacing -0.03em

### Paramètres — Layout 2 colonnes (desktop) / 1 colonne (mobile)

**Colonne gauche — Inputs numériques :**

1. **Nombre d'appels reçus par jour**
   - Type : stepper +/−
   - Défaut : 20 | Min : 5 | Max : 100 | Pas : 1
   - Hint : "Moy. secteur : 15 appels/jour"

2. **Panier moyen d'un nouveau patient**
   - Type : stepper +/− avec unité €
   - Défaut : 35 | Min : 5 | Max : 500 | Pas : 5
   - Hint : "Moy. France : 23-45€/visite"

**Colonne droite — Sliders :**

3. **Taux d'appels manqués**
   - Type : slider avec pill flottante
   - Défaut : 30% | Min : 5% | Max : 80% | Pas : 1%
   - Marqueur moyenne : point sur la barre au hover → "Moy. observée : 30%"

4. **Part des appels concernant une prise de RDV**
   - Type : slider avec pill flottante
   - Défaut : 45% | Min : 20% | Max : 100% | Pas : 1%
   - Marqueur moyenne : point sur la barre au hover → "Donnée Recept AI : 45%"

### Résultat
- Label : "Votre gain potentiel mensuel"
- Montant : animation counting fluide (ease-out cubic, ~350ms)
- Note : "Basé sur 22 jours ouvrés par mois"
- Font : Switzer, 72px (desktop) / 52px (mobile), weight 600, couleur primaire

### CTA (optionnel, masquable)
- Bouton pill (border-radius 120px)
- Texte et lien configurables
- Style : fond primaire, ombre douce multicouche

## Design Tokens (extraits de rcpt.ai)

| Token | Valeur |
|-------|--------|
| Couleur primaire | #3067FF |
| Fond page | #FCFCFC |
| Texte principal | #050505 / #1B1B1B |
| Texte secondaire | rgba(28,28,28,0.55) |
| Texte hint | rgba(28,28,28,0.2) |
| Fond track slider | #EBEBEB |
| Divider | #F0F0F0 |
| Border input btn | #E8E8E8 |
| Border-radius card | 24px |
| Border-radius CTA | 120px |
| Font | Switzer, fallback -apple-system, sans-serif |

## Composants UI détaillés

### Stepper input (+/−)
- Boutons : 44×44px, rond, border 1.5px #E8E8E8
- Hover : border #3067FF, couleur #3067FF, fond rgba(48,103,255,0.04)
- Chiffre : 44px, weight 600, couleur #1B1B1B
- Animation bump : micro translateY ±3px + opacity 0.7 pendant 80ms au clic
- Aligné à gauche sous le label

### Slider
- Track : 8px de hauteur, fond #EBEBEB, border-radius 4px
- Fill : même hauteur, fond #3067FF
- Pill (thumb) : flottante, découplée visuellement de la barre avec ring blanc 5px
  - Fond : #3067FF
  - Min-width : 60px, height : 40px, border-radius 120px
  - Texte : 16px, weight 600, blanc
  - Positionnée en absolue sur le slider-outer
- Marqueur moyenne : petit point 8px sur la track, tooltip au hover

### Résultat
- Counting animation : ease-out cubic, durée 350ms
- Slight scale(1.02) pendant l'animation
- Devise "€" en 36px, couleur primaire à 35% opacity

## Responsive

### Desktop (>680px)
- Grid 2 colonnes avec gap 40px
- Rangées séparées par divider 1px #F0F0F0
- Max-width : 640px

### Mobile (≤680px)
- 1 colonne, chaque param-cell empilée avec divider entre chaque
- Padding cell : 24px vertical
- Input number : 36px
- Result : 52px
- CTA : padding réduit

## Property Controls Framer

### Textes
- `headerTitle` : string — titre du header
- `headerSubtitle` : string — sous-titre
- `showHeader` : boolean — afficher/masquer le header
- `label1` à `label4` : string — labels des paramètres
- `hint1` à `hint4` : string — textes des hints
- `resultLabel` : string — "Votre gain potentiel mensuel"
- `resultNote` : string — "Basé sur 22 jours ouvrés par mois"
- `ctaText` : string — texte du bouton CTA
- `ctaLink` : string — URL du CTA
- `showCta` : boolean — afficher/masquer le CTA

### Valeurs par défaut
- `defaultCalls` : number — défaut appels/jour (20)
- `defaultMissedRate` : number — défaut taux manqué (30)
- `defaultRdvRate` : number — défaut part RDV (45)
- `defaultBasket` : number — défaut panier moyen (35)

### Plages
- `minCalls` / `maxCalls` / `stepCalls` : number
- `minMissedRate` / `maxMissedRate` / `stepMissedRate` : number
- `minRdvRate` / `maxRdvRate` / `stepRdvRate` : number
- `minBasket` / `maxBasket` / `stepBasket` : number

### Style
- `primaryColor` : color — couleur primaire (#3067FF)
- `workDays` : number — jours ouvrés par mois (22)
- `maxWidth` : number — largeur max du composant (640)

## Fichier de référence

Le mockup validé est disponible dans `.superpowers/brainstorm/9577-1775222807/content/calculator-mockup-v13.html`.

## Contraintes techniques

- **Zéro dépendance externe** : tout est inline (styles, logique)
- **Framer SDK** : utilise `addPropertyControls` et `ControlType` de `framer`
- **React** : hooks `useState` pour l'état, calcul en temps réel
- **Pas de CSS externe** : tous les styles sont des objets JS inline (comme les composants existants dans Plugin Framer Recept AI)
- **Font** : Switzer doit être chargée via @import ou supposée disponible dans le contexte Framer
