---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - docs/chess3-brief.md
date: 2026-03-07
author: Anthony
---

# Product Brief: ch3ss

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

Ch3ss est un jeu d'échecs mobile-first où le joueur choisit parmi 3 coups générés par IA à chaque tour, au lieu de jouer librement. En réduisant le champ des possibles à 3 options de qualité variable (mais toujours plausibles), ch3ss offre le plaisir tactique des échecs sans la surcharge cognitive — le format idéal pour une partie rapide et détendue sur mobile.

---

## Core Vision

### Problem Statement

Les joueurs d'échecs occasionnels à intermédiaires aiment les échecs, mais ne jouent pas dans les conditions optimales sur mobile : manque de concentration, environnement inadapté, sessions trop courtes. Résultat : des coups bâclés, de la frustration, et une anxiété de performance (peur de faire baisser son ELO). Le jeu qu'ils aiment devient une source de stress au lieu de plaisir.

### Problem Impact

Ces joueurs finissent par éviter les parties classiques sur mobile, ou jouent en mode "pilote automatique" sans plaisir. Les alternatives existantes (puzzles, variantes comme chess960) ne résolvent pas le problème : les puzzles demandent encore trop de focus, et les variantes conservent la même complexité décisionnelle. Un segment entier de joueurs — ceux qui aiment les échecs mais veulent une expérience chill — n'est pas servi.

### Why Existing Solutions Fall Short

- **Chess.com / Lichess (parties classiques)** : même surcharge cognitive, même anxiété de performance
- **Puzzles** : pas de risque ELO mais encore trop "sérieux" — demandent une concentration active pour trouver le bon coup
- **Chess960 et variantes** : même profondeur de réflexion que les échecs classiques, voire plus
- **Aucune solution** ne propose de réduire le champ décisionnel tout en préservant la saveur d'une vraie partie

### Proposed Solution

Ch3ss propose une mécanique unique : à chaque tour, le joueur choisit parmi 3 coups générés par une IA à des niveaux ELO différents (inférieur, égal, supérieur au sien). Les 3 coups sont toujours plausibles — jamais de choix caricaturalement mauvais. Cette contrainte transforme l'expérience : au lieu de chercher le meilleur coup parmi des dizaines de possibilités, le joueur évalue 3 options crédibles. Le plaisir tactique est préservé, la charge mentale est divisée.

### Key Differentiators

- **Ratio plaisir/effort le plus bas de l'univers échecs** : la saveur d'une partie avec une fraction de l'effort mental
- **Zéro anxiété de performance** : le format invite au jeu détendu, pas à la compétition stressante
- **Effet secondaire d'apprentissage** : exposition à des coups au-dessus de son niveau habituel, sans pression pédagogique
- **Format mobile natif** : pensé pour le métro, la salle d'attente, la pause — pas pour la session studieuse

---

## Target Users

### Primary Users

**Profil : "Le joueur de métro"**

Joueur d'échecs qui connaît les règles et pratique occasionnellement (ELO typique : 800-1600), mais qui n'a ni le temps ni l'énergie pour une partie exigeante sur mobile. Il aime les échecs — il joue avec des amis le week-end, suit des parties en ligne — mais sur son téléphone, entre deux stations, il veut du plaisir sans prise de tête.

**Contexte d'utilisation :**
- Métro, bus, salle d'attente, pause café — micro-sessions de 2-3 minutes par partie
- Enchaîne plusieurs parties courtes dans une même session
- Ne cherche pas à progresser activement, cherche à s'amuser

**Frustrations actuelles :**
- Fait des coups ridicules sur mobile par manque de concentration → frustration
- Anxiété de performance : évite les parties classées quand il n'est pas "à fond"
- Les puzzles demandent trop de focus, les variantes sont tout aussi complexes

**Ce qui le ferait dire "c'est exactement ce qu'il me fallait" :**
- Retrouver la saveur d'une vraie partie d'échecs sans effort mental intense
- Ne jamais regretter un coup — les 3 options sont toujours raisonnables
- Parties rapides, enchaînables, sans engagement

### Secondary Users

N/A au MVP — pas de rôles secondaires identifiés.

### User Journey

1. **Découverte** : Bouche-à-oreille, réseaux sociaux, ou recherche "casual chess" sur les stores
2. **Premier lancement** : Aucun compte requis. Le joueur lance une partie immédiatement
3. **Première partie** : L'IA joue quasi instantanément (~1s de délai pour un rythme naturel, à l'image de chess.com). Le joueur découvre les 3 coups, choisit, voit la réponse de l'IA. Partie terminée en 2-3 minutes
4. **Moment "aha!"** : Le joueur réalise qu'il n'a pas eu à réfléchir 30 secondes sur un coup, et que la partie était quand même tactiquement intéressante
5. **Routine** : Enchaîne 3-5 parties par session, plusieurs fois par jour. Ch3ss remplace le scroll Instagram dans les temps morts

---

## Success Metrics

### Métriques utilisateur

| Métrique | Définition | Cible indicative |
|----------|-----------|-----------------|
| **Rétention J7** | % d'utilisateurs qui reviennent dans les 7 jours suivant leur première partie | À définir post-lancement |
| **Parties par session** | Nombre moyen de parties jouées par session | ≥ 3 |
| **Taux de partage** | % de joueurs qui utilisent la fonctionnalité "invite un ami" | À définir post-lancement |

### Business Objectives

- **MVP** : 100% gratuit, zéro monétisation — focus sur la validation du concept et la rétention
- **Post-MVP** : Monétisation légère via dons et cosmétiques (thèmes de plateau, sets de pièces). Objectif : couvrir les coûts serveur, pas maximiser le revenu
- **Modèle de croissance** : croissance organique via le partage in-app ("invite un ami")

### Key Performance Indicators

| KPI | Description | Signal de succès |
|-----|------------|-----------------|
| **Funnel d'onboarding** | Premier lancement → première partie terminée → deuxième partie lancée | Taux de conversion élevé à chaque étape (valeurs cibles à définir post-lancement) |
| **Croissance nette** | Nouveaux joueurs actifs − joueurs perdus (par semaine) | Positif de manière constante à 3 mois |
| **Stacking utilisateurs** | Base d'utilisateurs actifs hebdomadaires qui croît au fil du temps | Courbe ascendante régulière |

**Philosophie** : pas d'objectif de volume à court terme. Le succès se mesure par la qualité du funnel et la capacité à retenir et accumuler les joueurs au fil du temps.

---

## MVP Scope

### Core Features

1. **Échiquier jouable** — règles d'échecs 100% standard, interface épurée mobile-first
2. **Mécanique des 3 coups** — à chaque tour du joueur, 3 coups générés par IA à 3 niveaux ELO (ELO-X, ELO, ELO+X) avec X = ±300 (ajustable). Les 3 coups sont présentés de manière **neutre, sans indication de qualité** — le joueur choisit à l'instinct
3. **IA adversaire** — joue librement à ELO fixe (valeur par défaut), avec un délai de ~1s pour un rythme naturel
4. **Moteur d'échecs local** — exécution côté client, offline, zéro dépendance serveur pour le gameplay
5. **Fin de partie** — mat, nulle naturelle, ou abandon volontaire du joueur
6. **Sauvegarde locale** — la partie en cours est sauvegardée (localStorage) si le joueur ferme l'app
7. **Relance rapide** — après une partie, relancer immédiatement sans friction

### Out of Scope for MVP

- Compte utilisateur / authentification
- Suivi d'ELO ou historique de parties
- Fonctionnalité "invite un ami" / partage
- Multijoueur
- Monétisation (dons, cosmétiques)
- Choix de l'ELO de départ
- Indication post-coup de la qualité du choix
- Timer / limite de coups

### MVP Success Criteria

- Le funnel premier lancement → première partie terminée → deuxième partie lancée a un taux de conversion élevé
- Les joueurs enchaînent ≥ 3 parties par session en moyenne
- Croissance nette positive (plus de joueurs entrants/restants que de partants) sur les premières semaines
- La mécanique des 3 coups "à l'aveugle" est perçue comme plaisante, pas frustrante

### Future Vision

**V2 :**
- Choix de l'ELO (joueur et adversaire IA)
- ELO joueur qui évolue au fil des parties
- Fonctionnalité "invite un ami" + partage in-app
- Monétisation légère (dons, cosmétiques)

**V3 :**
- Multijoueur : parties contre d'autres humains (les deux joueurs soumis à la mécanique des 3 coups)

### Questions ouvertes (à résoudre en phase architecture)

- **Stack front** : à déterminer selon les contraintes — publication stores mobiles + jouable en navigateur (mobile/tablette/desktop)
- **Moteur IA** : Stockfish.js ou alternative, exécution locale obligatoire
- **Valeur de X** : ±300 comme point de départ, à ajuster par playtesting
- **Affichage des 3 coups** : design UX à définir — neutre, clair, pas brouillon
