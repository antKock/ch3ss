---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-ch3ss-2026-03-07.md
---

# UX Design Specification ch3ss

**Author:** Anthony
**Date:** 2026-03-07

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

Ch3ss est un jeu d'échecs mobile-first où le joueur choisit parmi 3 coups à chaque tour, au lieu de jouer librement. Stockfish analyse la position et propose 3 coups classés par qualité d'évaluation : Top (meilleur coup), Correct (stabilise), Bof (dégrade la position). Le joueur choisit à l'instinct sans connaître la qualité — le plaisir tactique des échecs sans la surcharge cognitive, le format idéal pour des micro-sessions détendues sur mobile (2-3 min par partie).

### Target Users

**"Le joueur de métro"** — Joueur d'échecs occasionnel à intermédiaire (ELO 800-1600) qui aime les échecs mais cherche une expérience détendue sur mobile. Utilise l'app dans les transports, en pause, en salle d'attente. Ne cherche pas à progresser activement, cherche à s'amuser. Enchaîne plusieurs parties courtes par session.

**Caractéristiques clés :**
- Familier avec les règles d'échecs, pas besoin d'apprentissage
- Frustré par la surcharge cognitive des apps d'échecs classiques sur mobile
- Anxieux vis-à-vis de la performance ELO en conditions non optimales
- Tech-savvy suffisant pour un jeu mobile standard

### Key Design Challenges

1. **Présentation des 3 coups** — Afficher 3 options de coups sur un échiquier mobile de manière neutre, instantanément lisible, sans surcharge visuelle
2. **Fluidité du cycle de jeu** — Le rythme "IA joue → 3 coups → choix → IA joue" doit être ultra-fluide pour maintenir l'état de flow casual
3. **Onboarding zéro-friction** — Le joueur doit comprendre la mécanique des 3 coups en jouant, sans tutoriel explicite
4. **Contraintes d'écran mobile** — Échiquier jouable + 3 coups visibles simultanément sur smartphone, sans compromis de lisibilité

### Design Opportunities

1. **Rythme addictif** — Un flow suffisamment fluide pour créer un rythme "un coup toutes les 2-3 secondes", rendant les parties enchaînables comme un scroll infini
2. **Micro-feedback satisfaisant** — Animations subtiles et transitions fluides qui transforment chaque choix en micro-moment de satisfaction
3. **Simplicité radicale comme différenciateur** — L'absence de features complexes (timer, ELO, menus) EST la proposition UX — une expérience "zen" qui contraste avec Chess.com/Lichess

## Core User Experience

### Defining Experience

L'expérience fondamentale de ch3ss est un cycle de décision rapide et satisfaisant :

**Le loop core :**
1. L'IA joue son coup (animation de déplacement, style Chess.com)
2. 3 coups apparaissent sur l'échiquier — cercles colorés sous les pièces sources, avec cercles assortis (plus transparents) sur les cases de destination
3. Le joueur tape sur un coup → la pièce se déplace immédiatement
4. Fenêtre d'annulation de ~1 seconde (bouton "annuler" discret) — passé ce délai, l'IA répond
5. Retour à l'étape 1

Ce geste "voir 3 options → choisir → voir la réponse" est le produit entier. Chaque itération doit prendre 2-5 secondes côté joueur.

### Platform Strategy

- **Mobile-first** : écran tactile, orientation portrait
- **Multi-plateforme** : navigateur mobile/tablette/desktop + publication stores possibles (à confirmer en architecture)
- **100% offline** : moteur Stockfish local, zéro dépendance serveur
- **Touch-native** : interactions tap uniquement, pas de drag-and-drop requis

### Effortless Interactions

- **Lancer une partie** : un seul tap depuis l'écran d'accueil
- **Choisir un coup** : un tap sur le cercle coloré ou la pièce surlignée
- **Annuler un coup** : tap sur "annuler" dans la seconde qui suit
- **Relancer après une partie** : un seul tap "Rejouer"
- **Reprendre une partie** : réouverture de l'app = retour direct à la partie en cours

### Critical Success Moments

1. **Premier coup de la première partie** — Le joueur voit 3 cercles colorés, comprend instantanément qu'il doit en choisir un. Zéro explication nécessaire
2. **"Moment aha"** — Après 2-3 tours, le joueur réalise que c'est tactiquement intéressant sans être stressant
3. **Fin de partie → relance** — La transition doit être si fluide que le joueur enchaîne sans réfléchir
4. **Annulation** — Quand le joueur tape par erreur, la fenêtre d'1 seconde le rassure sans casser le rythme

### Experience Principles

1. **Zéro friction** — Chaque interaction à un tap maximum. Jamais de confirmation modale, jamais de menu intermédiaire
2. **Rythme avant tout** — Le tempo du jeu prime sur tout le reste. Les animations sont rapides et non-bloquantes
3. **Neutralité visuelle des coups** — Les 3 options sont présentées de manière strictement neutre (couleurs distinctes mais sans hiérarchie). Aucune indication de qualité
4. **Prototyper pour trancher** — L'affichage des 3 coups (cercles colorés) devra être testé en HTML avec des variantes avant de figer le design final

## Desired Emotional Response

### Primary Emotional Goals

1. **Détente autopilote** — Le joueur est dans un état de relaxation active, comme scroller un feed. Le cerveau tourne au ralenti, les décisions se prennent à l'instinct, pas à la réflexion
2. **Flow léger** — Engagé mais sans effort. Le rythme du jeu porte le joueur, il ne "travaille" jamais. Le temps passe sans qu'on s'en rende compte
3. **Absence totale de pression** — Aucun enjeu perçu. Gagner est agréable, perdre n'est pas grave

### Emotional Journey Mapping

| Moment | Émotion visée |
|--------|--------------|
| **Ouverture de l'app** | Anticipation légère — "une petite partie" |
| **Premiers coups** | Curiosité — découverte des 3 options, choix instinctif |
| **Mid-game** | Flow léger — le rythme s'installe, décisions quasi-automatiques |
| **Coup décisif (mat, grosse prise)** | Micro-satisfaction — un petit "nice" intérieur, pas une explosion de joie |
| **Défaite** | "Ah dommage" léger → envie immédiate de relancer — jamais de frustration |
| **Victoire** | Satisfaction douce + curiosité pour le récap |
| **Récap fin de partie** | Moment de fierté — distribution des choix (Top/Correct/Bof) révèle la "qualité" de la partie. Motivant sans être punitif |
| **Relance** | Zéro hésitation — le geste est naturel, presque réflexe |

### Micro-Emotions

**À cultiver :**
- **Confiance** — Les 3 options sont toujours raisonnables, jamais de piège
- **Satisfaction de choix** — Chaque tap procure un micro-plaisir, même sans savoir si c'était "le meilleur"
- **Curiosité post-partie** — Le récap de distribution donne envie de "faire mieux" la prochaine fois

**À éviter absolument :**
- **Anxiété** — Aucun timer, aucun ELO visible pendant le jeu, aucune pression
- **Regret** — Pas d'indication de qualité en cours de partie. Le joueur ne sait jamais s'il a "mal joué"
- **Frustration** — L'annulation en 1 seconde absorbe les erreurs de tap

### Design Implications

- **Détente** → Palette de couleurs douce, pas de rouge agressif, animations fluides et lentes
- **Flow léger** → Transitions instantanées entre les états, aucune interruption modale
- **Absence de pression** → Pas de timer visible, pas de compteur de coups, pas de score en cours de partie
- **"Ah dommage" pas frustrant** → Écran de défaite minimal, bouton "Rejouer" proéminent, ton neutre
- **Fierté au récap** → Écran de fin avec distribution visuelle des choix (barres Top/Correct/Bof). Présenté comme info intéressante, pas comme jugement

### Emotional Design Principles

1. **Le zen pendant, la fierté après** — Pendant la partie : zéro feedback de qualité, pure détente. Après la partie : le récap de distribution révèle la performance de manière positive et motivante
2. **La défaite est une virgule, pas un point** — L'écran de défaite est un tremplin vers la partie suivante, jamais un mur
3. **Micro-satisfactions cumulatives** — Chaque tap de choix doit procurer un petit plaisir (animation, son subtil) qui s'accumule en sentiment de flow
4. **Jamais de jugement** — Le récap montre des faits (distribution), pas des évaluations ("bien/mal joué")

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Wordle**
- **Ce qu'il fait bien :** Interface ultra-épurée — un seul écran, zéro menu, zéro distraction. Le joueur comprend la mécanique en jouant. Feedback visuel immédiat (couleurs) sans texte explicatif. Partage organique via les carrés emoji
- **Pourquoi c'est pertinent :** Même philosophie que ch3ss — réduire un domaine complexe (les mots) à un choix contraint et satisfaisant. Onboarding implicite, parties courtes, rythme addictif

**2048**
- **Ce qu'il fait bien :** Boucle de jeu hypnotique — un swipe, résultat immédiat, on recommence. Zéro onboarding nécessaire. La mécanique est auto-explicative au premier geste. Relance instantanée après une défaite. Pas de compte, pas de login
- **Pourquoi c'est pertinent :** Le modèle exact du flow qu'on vise — décision rapide → feedback immédiat → décision suivante. L'état de "transe légère" que 2048 crée est exactement l'émotion cible de ch3ss

**Chess.com / Lichess (référence du domaine)**
- **Ce qu'ils font bien :** Échiquier standard bien exécuté, animations de pièces fluides, feedback sonore satisfaisant sur les coups
- **Ce qu'on ne reprend PAS :** Tout le reste — menus complexes, ELO omniprésent, timers stressants, notifications, social features, pubs

### Transferable UX Patterns

**De Wordle :**
- **Un seul écran = le jeu** — Pas de navigation, pas de menus imbriqués. L'app s'ouvre, le jeu est là
- **Feedback coloré immédiat** — Les couleurs communiquent sans mots. Pour ch3ss : les cercles colorés des 3 coups suivent cette logique
- **Récap partageable** — Le récap fin de partie (distribution Top/Correct/Bof) pourrait devenir un "résultat partageable" en V2, comme les carrés Wordle

**De 2048 :**
- **Boucle geste-résultat ultra-courte** — Minimiser le temps entre la décision et le feedback visuel. Pour ch3ss : tap → pièce bouge immédiatement
- **Relance sans friction** — Game over → "Rejouer" en un tap, sans écran intermédiaire lourd
- **Pas d'onboarding explicite** — Le premier geste enseigne la mécanique. Pour ch3ss : les 3 cercles colorés sur l'échiquier doivent être auto-explicatifs

**De Chess.com :**
- **Animation de déplacement des pièces** — Mouvement fluide et satisfaisant, pas de téléportation
- **Son du coup** — Le "clac" caractéristique d'une pièce posée sur l'échiquier, feedback audio satisfaisant

### Anti-Patterns to Avoid

1. **Surcharge informationnelle** — Chess.com affiche ELO, timer, historique, chat, suggestions simultanément. Ch3ss = un échiquier et 3 cercles, rien d'autre
2. **Onboarding tutoriel** — Pas de slides explicatifs, pas de tooltip "tapez ici pour jouer". Si la mécanique n'est pas évidente visuellement, c'est le design qui est mauvais
3. **Écran de défaite culpabilisant** — Pas de "Vous avez perdu !" en gros rouge. Transition douce vers le récap puis le bouton Rejouer
4. **Menus et settings au premier plan** — Aucun hamburger menu, aucun engrenage visible pendant la partie. Paramètres accessibles mais cachés

### Design Inspiration Strategy

**Adopter :**
- L'épure radicale de Wordle (un écran = le jeu)
- La boucle hypnotique de 2048 (geste → résultat → geste)
- Les animations de pièces de Chess.com (fluides, satisfaisantes)

**Adapter :**
- Le feedback coloré de Wordle → cercles colorés neutres pour les 3 coups (sans hiérarchie de "bon/mauvais")
- Le récap de Wordle → distribution des choix ELO en fin de partie (V2 : partageable)

**Éviter :**
- Tout ce qui fait de Chess.com une app "sérieuse" (timers, ELO, menus, social)
- Tout onboarding explicite (tutoriels, tooltips)
- Tout écran intermédiaire entre deux parties

## Design System Foundation

### Design System Choice

**Tailwind CSS + Chessground** — Approche minimaliste adaptée à un jeu avec très peu de composants UI classiques.

- **Chessground** (lib d'échiquier de Lichess) : composant échiquier éprouvé, touch-friendly, animations fluides, open-source
- **Tailwind CSS** : classes utilitaires pour le styling des éléments custom (cercles des 3 coups, boutons, écran de récap)

### Rationale for Selection

1. **Pas besoin d'un design system lourd** — Le MVP a ~5 éléments UI : un échiquier, 3 cercles overlay, un bouton Rejouer, un écran de récap, un bouton Abandonner. Material UI ou Chakra seraient du bloat
2. **Chessground est battle-tested** — Utilisé par Lichess (millions d'utilisateurs), touch-optimized, animations de pièces fluides, gestion des overlays. Exactement ce qu'il faut
3. **Tailwind est idéal pour du custom léger** — Pas de composants imposés, juste des utilitaires CSS. Parfait pour styler les quelques éléments sur mesure (cercles colorés, récap)
4. **Performance** — Zéro JS inutile, CSS purgé en production. Critique pour un jeu mobile offline

### Implementation Approach

- **Échiquier** : Chessground avec configuration custom (désactiver le drag-and-drop libre, activer le mode "choix parmi N coups")
- **Overlays des 3 coups** : Cercles colorés implémentés via le système d'overlays de Chessground ou en CSS absolu par-dessus le board
- **Éléments UI** : Tailwind pour les boutons (Rejouer, Abandonner), l'écran de récap, et les transitions
- **Animations** : CSS transitions/animations natives via Tailwind + animations Chessground pour les pièces

### Customization Strategy

- **Palette de couleurs** : Design tokens Tailwind custom — tons doux et apaisants (alignés avec l'objectif émotionnel "zen")
- **Thème échiquier** : Chessground permet des thèmes CSS custom pour le plateau et les pièces
- **Cercles des 3 coups** : 3 couleurs distinctes mais sans hiérarchie visuelle (pas rouge/jaune/vert). À prototyper en HTML
- **Typographie** : Minimale — une seule font, utilisée uniquement pour le récap et les boutons

## Defining Core Experience

### Defining Experience

> "Choisis un coup parmi 3 — fais confiance à ton instinct."

C'est le "Swipe to match" de ch3ss. L'interaction que les joueurs décriront à leurs amis. Le produit entier tient dans ce geste : voir 3 options, en choisir une à l'instinct, voir ce qui se passe.

### User Mental Model

Le joueur arrive avec un modèle mental d'échecs classique ("je réfléchis, je joue"). Ch3ss le subvertit en douceur : au lieu de chercher le meilleur coup dans un océan de possibilités, le joueur évalue 3 options pré-sélectionnées. Le modèle mental bascule naturellement de "je calcule" à "je choisis" — plus proche d'un QCM que d'une rédaction libre.

**Ce que le joueur comprend intuitivement :**
- 3 cercles colorés = 3 coups possibles
- Tap sur un cercle = jouer ce coup
- Les couleurs sont décoratives, pas hiérarchiques

**Ce que le joueur n'a PAS besoin de savoir :**
- Que les 3 coups sont classés par qualité d'évaluation Stockfish
- Quel coup est "le meilleur"
- Comment Stockfish sélectionne les options

### Success Criteria

L'expérience core est réussie si :
1. **Compréhension en 0 secondes** — Le joueur tape sur un cercle dès le premier tour sans hésitation
2. **Zéro regret** — Le joueur ne se demande jamais "est-ce que j'aurais dû choisir l'autre ?"
3. **Rythme naturel** — Le temps moyen par coup est de 2-5 secondes, pas 30
4. **Envie de rejouer** — Après la première partie, le joueur lance immédiatement la deuxième

### Novel UX Patterns

**Combinaison de patterns familiers et nouveaux :**

- **Familier** : L'échiquier, les pièces, les règles d'échecs — le joueur sait déjà jouer
- **Familier** : Tap pour sélectionner (pattern universel mobile)
- **Nouveau** : Les 3 cercles colorés comme seul choix possible — aucune app d'échecs ne fait ça
- **Nouveau** : Fenêtre d'annulation d'1 seconde au lieu d'une confirmation explicite

Le pattern nouveau (3 cercles) est suffisamment proche d'un pattern familier (tap sur une case) pour ne nécessiter aucune explication. La métaphore visuelle "cercle sur une case = tu peux jouer ici" est universellement comprise.

### Experience Mechanics

**1. Initiation (tour du joueur) :**
- L'IA vient de jouer → animation de sa pièce + son "clac"
- Les 3 cercles colorés apparaissent simultanément (pop) sur les cases sources ET destinations
- Chaque coup est représenté par : cercle opaque sous la pièce source + cercle plus transparent sur la case de destination (même couleur)

**2. Interaction (choix du coup) :**
- Le joueur tape sur n'importe quel cercle d'une couleur (source ou destination) → le coup est joué immédiatement
- Animation fluide de la pièce vers sa destination + son "clac"
- Les 2 autres options disparaissent (fade out rapide)

**3. Cas spéciaux :**
- **Prise de pièce** : Le cercle de destination se superpose à la pièce adverse sur sa case — pas d'indicateur spécial supplémentaire, le cercle suffit
- **Roque** : Le cercle est sur la case de destination du roi (e1→g1 ou e1→c1). La tour se déplace automatiquement
- **En passant** : Le cercle est sur la case de destination du pion. Le pion capturé disparaît automatiquement
- **Promotion** : Toujours promotion en Dame, automatique. Pas de choix supplémentaire — préserve le rythme "un tap = un coup"

**4. Feedback post-coup :**
- Bouton "Annuler" discret apparaît pendant ~1 seconde
- Si pas d'annulation → délai de ~1s (IA "réfléchit") → l'IA joue son coup
- Cycle recommence

**5. Completion (fin de partie) :**
- Mat, pat, ou abandon → transition douce vers l'écran de récap
- Récap : résultat (victoire/défaite/égalité) + distribution des choix Top/Correct/Bof
- Bouton "Rejouer" proéminent → nouvelle partie instantanée

## Visual Design Foundation

### Color System

**Approche : Light mode pastel (défaut) + Dark mode (à définir)**

**Light Mode — Palette pastel zen :**
- **Fond principal** : Blanc cassé / crème léger (`#F8F6F1` ou similaire)
- **Échiquier cases claires** : Beige doux / sable (`#E8DCC8`)
- **Échiquier cases sombres** : Brun rosé doux (`#B8A088`)
- **Texte principal** : Gris foncé chaud (`#3D3A36`) — jamais du noir pur
- **Boutons** : Tons neutres doux, pas de couleur vive

**Couleurs des 3 cercles (à prototyper) :**
- 3 couleurs distinctes mais de même "poids" visuel — pas de hiérarchie
- Piste : trio pastel harmonieux (ex: bleu lavande / ambre doux / vert sauge)
- Éviter rouge/jaune/vert (connotation feu tricolore = hiérarchie implicite)
- Opacité : cercle source ~70%, cercle destination ~35%

**Dark Mode :**
- À définir en phase prototype — inversion intelligente, pas un simple `invert()`
- Les cercles des 3 coups doivent rester aussi lisibles qu'en light mode

**Couleurs sémantiques :**
- Pas de rouge d'erreur, pas de vert de succès — l'app n'a pas de "bon/mauvais"
- Seule exception : le récap fin de partie pourra utiliser des couleurs pour la distribution

### Typography System

**Font : Poppins** (Google Font, bundlée dans l'app)
- Arrondie, moderne, friendly — cohérente avec l'ambiance casual/zen
- Chargement : bundlée localement (pas de requête réseau, compatible offline)

**Utilisation minimale :**
- **Boutons** : Poppins Medium, 16px — "Rejouer", "Abandonner"
- **Récap fin de partie** : Poppins Regular/Medium, tailles variables
- **Aucun texte pendant la partie** — l'échiquier et les cercles parlent seuls

**Type scale :**
- Titre récap : 24px / Poppins SemiBold
- Sous-titre récap : 16px / Poppins Regular
- Boutons : 16px / Poppins Medium
- Labels (si nécessaire) : 14px / Poppins Regular

### Spacing & Layout Foundation

**Layout principal : Un seul écran, centré sur l'échiquier**

- L'échiquier occupe la largeur maximale disponible (avec padding latéral de 16px)
- Orientation portrait uniquement sur mobile
- Aucun scroll — tout est visible sans défilement

**Spacing system : Base 8px**
- 8px : micro-espacement (padding interne boutons)
- 16px : espacement standard (marges, gaps)
- 24px : espacement large (séparation de sections)
- 32px : espacement XL (padding top/bottom de l'écran)

**Hiérarchie visuelle :**
1. Échiquier + cercles des 3 coups (90% de l'attention)
2. Bouton "Annuler" (apparition temporaire, discret)
3. Bouton "Abandonner" (toujours accessible mais non proéminent)

### Accessibility Considerations

- **Contrastes** : Ratio minimum 4.5:1 pour tout texte (WCAG AA)
- **Cercles des 3 coups** : Couleurs choisies pour être distinguables aussi par les daltoniens (tester avec simulateurs)
- **Taille des zones de tap** : Minimum 44x44px (recommandation Apple/Google)
- **Les cases de l'échiquier** font naturellement ~44px sur mobile (échiquier = ~350px de large / 8 = ~44px par case) — ça tombe bien
- **Pas de dépendance à la couleur seule** : Les cercles source/destination ont aussi une différence d'opacité comme signal secondaire

## Design Direction Decision

### Design Directions Explored

Exploration visuelle interactive via deux mockups HTML dédiés :

1. **Pièces & plateau** (`ux-design-directions.html`) — Comparaison de sets de pièces (Cburnett, Staunty, Maestro) avec configurateur de teintes (brightness/saturation/contrast) et 6 thèmes de couleurs plateau (Crème, Menthe, Pêche, Lavande, Rose, Custom).

2. **Affichage des 3 coups** (`ux-hints.html`) — Comparaison cercles vs flèches, puis itérations sur les flèches (épaisseur, forme L pour cavalier, arrondi de tête r=0.22, z-index, opacité, teinte des cases) et palettes de couleurs (8 palettes testées, audit accessibilité WCAG 2.1).

### Chosen Direction

- **Set de pièces** : Staunty (brightness 110%)
- **Thème plateau** : Menthe — cases claires `#E8F0E8`, cases sombres `#B8D0B4`
- **Affichage coups** : Flèches opaques (pas de cercles) avec chemin en L pour cavalier (Bézier Q, R=28), têtes arrondies (triangle avec coins arrondis r=0.22), cases source/destination teintées (background remplacé à rgba 45% opacité)
- **Palette flèches** : Ocean accessible — Bleu `#3A70B0` / Ambre doré `#B8860B` / Violet `#8D5AA5`
- **Accessibilité** : Contraste >= 3:1 (WCAG 2.1 SC 1.4.11) vérifié sur les deux types de cases. Distinguable sous protanopie, deutéranopie et tritanopie (vigilance marginale bleu/violet en protanopie ΔE=8.4)
- **Pas de légende ELO** : Le joueur ne doit pas savoir quel coup correspond à quel niveau — les couleurs sont purement distinctives

### Design Rationale

- **Staunty** : pièces élégantes et lisibles, style moderne cohérent avec l'identité casual-premium de ch3ss
- **Menthe** : palette pastel douce et apaisante, cohérente avec le positionnement "zen/détente" du jeu
- **Flèches > cercles** : standard chess (chess.com utilise des flèches), zone de clic plus grande, direction claire du mouvement source→destination, pas d'ambiguïté sur quelle pièce se déplace
- **Ocean accessible** : 3 couleurs suffisamment distinctes entre elles et du plateau vert, conformes WCAG. L'ambre doré remplace un orange initial trop clair pour l'accessibilité
- **Neutralité des couleurs** : les 3 couleurs (bleu/ambre/violet) n'induisent aucune hiérarchie implicite — pas de rouge/jaune/vert "feu tricolore"

### Implementation Approach

- **Bibliothèque plateau** : Chessground (lichess) avec thème custom Menthe
- **Pièces** : SVG Staunty via CDN lichess avec filtre CSS `brightness(1.1)`
- **Flèches** : SVG overlay positionné en absolu sur le board (z-index 1, entre le plateau z-index 0 et les pièces z-index 2). Paths SVG manuels avec arrowheads polygon arrondis — pas de SVG markers (instables en positionnement)
- **Teinte cases** : Remplacement direct du background de la case avec `rgba(couleur, 0.45)`
- **Framework CSS** : Tailwind CSS avec tokens custom
- **Police** : Poppins (bundlée localement)

## Screen Designs

> Mockups interactifs : `ux-screens.html`
> Tous les écrans existent en variante **Light (Sable)** et **Dark (Forêt)**.

### Thèmes et identité visuelle

#### Palette de thèmes

| Token | Light — Sable | Dark — Forêt |
|-------|---------------|--------------|
| `bg` | `#EDE8DF` | `#1E2A22` |
| `text` | `#3D3A36` | `#E0DDD6` |
| `textSec` | `#8A8078` | `#8A9A86` |
| `surface` (cards, toasts) | `#ffffff` | `#2A3A2E` |
| `accent` | `#6A8060` | `#6A8060` |

- **Dark mode par défaut** — choix différenciant vis-à-vis des apps d'échecs classiques ; le thème Forêt (vert sombre teinté) apporte du cachet et repose les yeux
- **Toggle light/dark** dans l'écran Réglages (toggle segmenté Clair/Sombre)
- **Icône engrenage** en haut à droite (opacité 50%) sur l'écran d'accueil et l'écran de récap. **Pas d'icône pendant la partie** — aucune distraction
- Le choix du thème est persisté en local storage

#### Branding

- **Nom de marque** : `ch3ss` (le "3" en couleur accent `#6A8060`)
- **Tagline** : "3 options, ton choix"
- **SEO/marketing** : utiliser "chess3" comme mot-clé SEO, `ch3ss` comme nom de marque
- **Typographie** : Poppins 800 (ExtraBold), logo 20px dans le header, 42px sur l'accueil
- **Logo** : texte uniquement — `ch3ss` avec le `3` en accent. Pas d'icône séparée

#### Gestion des couleurs en dark mode

- **Mélange opaque** : les teintes de cases (flèches, coups joués) utilisent un mélange opaque (`mixColors`) au lieu de `rgba()` pour éviter que le fond sombre ne transparaisse à travers les cases teintées
- **Pièces noires capturées** : `brightness(1.6)` + `drop-shadow(0 0 2px rgba(255,255,255,0.3))` pour rester visibles sur fond sombre
- **Détection dark mode** : basée sur la luminance du background (`parseInt(bg.slice(1,3), 16) < 80`)

---

### Écran d'accueil

**Layout** : centré verticalement (480px de hauteur), colonne flex avec gap 24px.

**Éléments (de haut en bas) :**

1. **Logo** — `ch3ss` en 42px ExtraBold, "3" en accent. Tagline "3 options, ton choix" en dessous (13px, textSec)
2. **Mini-plateau** — Grille 4×4 (140×140px, border-radius 14px) avec 3 mini-flèches stylisées :
   - Même style que les flèches de jeu : tracé en L pour cavalier (Bézier Q, R=18), têtes arrondies (r=0.22)
   - Couleurs : les 3 couleurs de la palette Ocean (bleu, ambre, violet)
   - Stroke=22, HEAD_HALF_W=28, HEAD_LEN=38
   - Rôle : illustration "logo" — communique visuellement la mécanique du jeu
3. **Bouton "Jouer"** — Accent bg, texte blanc, 16px SemiBold, border-radius 14px, padding 14×56px, box-shadow
4. **Compteur de parties** — en 11px textSec (stocké en local storage, pas de compte utilisateur)
   - Si ≥ 1 partie : "{n} parties jouées"
   - Si 0 partie : "Première partie !" (plus engageant que "0 parties jouées")

**Interactions :**
- Tap "Jouer" → lance une nouvelle partie
- Attribution noir/blanc aléatoire au lancement (pas de choix)

---

### Écran de jeu — 3 coups affichés

**Layout** : flex column, hauteur complète. Board centré verticalement avec `flex:1` spacers au-dessus et en-dessous.

**Éléments (de haut en bas) :**

1. **Header app** — Logo `ch3ss` (20px) centré, sans icône (pas de distraction pendant la partie)
2. **Spacer** (flex:1) — pousse le board au centre
3. **Pièces capturées adversaire** — rangée horizontale, alignée à gauche, pièces 22px, opacité 0.85, triées par valeur décroissante (D > T > F > C > P)
4. **Plateau 8×8** — Thème Menthe (claires `#E8F0E8`, sombres `#B8D0B4`), pièces Staunty 88%, border-radius 10px
5. **Flèches SVG** — overlay absolu sur le board (viewBox 800×800), 3 flèches en couleurs Ocean
   - Stroke=22, HEAD_HALF_W=28, HEAD_LEN=40
   - Cases source et destination teintées (mélange opaque 45% avec la couleur de la flèche). Si deux flèches partagent une case, les teintes sont mélangées (pas d'écrasement)
   - Tracé en L pour les coups de cavalier (Bézier Q, rayon R=28)
   - Têtes de flèche : triangle arrondi (r=0.22)
6. **Pièces capturées joueur** — rangée horizontale, alignée à gauche, mêmes dimensions (22px, opacité 0.85, tri par valeur)
7. **Spacer** (flex:1)
8. **Bouton "Abandonner"** — pinné en bas, 11px textSec, opacité 0.5, pas de bordure ni fond

**Interactions :**
- Tap sur une flèche ou case teintée → joue le coup (transition vers l'état "après un coup")
- Tap "Abandonner" → fin de partie (défaite)

**Variantes moquées :**

- **Ouverture (premier coup)** — Position initiale complète avec 3 flèches d'ouverture (e4, d4, Nc3). Vérifie la lisibilité des flèches sur un plateau plein de pièces
- **Joueur Noir (board retourné)** — Le plateau est retourné (rang 1 en haut, rang 8 en bas). Les pièces noires du joueur sont en bas, les pièces blanches adverses en haut. Les pièces capturées s'inversent aussi (adversaire en haut, joueur en bas)

---

### Après un coup — Toast d'annulation

**Contexte** : Le joueur vient de choisir un coup parmi les 3. La pièce se déplace, les flèches disparaissent.

**État du plateau :**
- La flèche choisie disparaît (pas de flèche visible)
- Les cases de départ et d'arrivée du coup joué sont teintées avec la couleur de la flèche choisie (mélange opaque 45%)
- Les 2 autres flèches ont disparu

**Toast d'annulation :**
- Apparaît en bas de l'écran (position absolute, bottom 16px)
- Background : blanc (light) / `#2A3A2E` (dark)
- Border-radius 18px, box-shadow
- Contenu : texte "Coup joué" (13px SemiBold) + bouton "Annuler" (accent sur fond accent 10%)
- **Anneau de cooldown** : path SVG qui suit le contour du toast, stroke accent, animation `stroke-dashoffset` linéaire 1.2s
- Animation d'entrée : slide-up + bounce (350ms ease-out)

**Comportement :**
- Le toast reste visible ~1.2 secondes (durée de l'anneau de cooldown)
- Tap "Annuler" pendant ce temps → annule le coup, les 3 mêmes flèches réapparaissent pour rechoisir
- **Race condition** : si le joueur tape "Annuler" au moment exact de l'expiration du cooldown, "Annuler" gagne toujours — le joueur a la priorité
- Si pas d'annulation → le toast disparaît, la pièce adverse glisse immédiatement (pas de pause supplémentaire — le cooldown du toast fait office de temps de réflexion IA perçu)

---

### Réponse adversaire

**Contexte** : L'IA a joué son coup en réponse.

**État du plateau :**
- La surbrillance du dernier coup du joueur **disparaît** — on ne voit plus la teinte du coup précédent
- Les cases de départ et d'arrivée du coup adverse sont teintées en couleur neutre `#8A8078` (mélange opaque 35%)
- Cette couleur neutre est volontairement distincte des 3 couleurs de flèches (bleu/ambre/violet) pour ne pas créer de confusion

**Puis** : 3 nouvelles flèches apparaissent → retour au cycle "3 coups affichés"

---

### Écran de fin de partie (Récap)

**Layout** : colonne centrée, padding-top 40px, gap 20px.

**3 résultats possibles** : Victoire, Défaite, Égalité (pat).

**Éléments (de haut en bas) :**

1. **Résultat**
   - Icône : SVG du roi de la couleur du joueur (`wK.svg` ou `bK.svg`)
     - Victoire : roi debout (56×56px)
     - Défaite : roi couché sur le côté (`transform: rotate(90deg)`, 56×56px)
     - Égalité : les deux rois (blanc + noir) côte à côte, debout (48×48px chacun, gap 4px)
   - Titre : "Victoire" / "Défaite" / "Égalité", 26px ExtraBold
   - Sous-titre : "{nb coups} coups · {durée}", 13px textSec (ex: "34 coups · 2:47")

2. **Card "Tes choix"** — récap de la distribution des choix du joueur
   - Background surface, border-radius 18px, padding 20px
   - Titre section : "TES CHOIX" en 12px uppercase textSec
   - 3 barres de progression avec :
     - Label (13px bold) + pourcentage (14px ExtraBold) en couleur accent
     - Barre track (6px, border-radius 3px) avec fill en couleur accent (opacity 0.7)
   - Labels : **"Top"** / **"Correct"** / **"Bof"** — ton décontracté, pas de jugement absolu
   - Couleur unique : `accent` (`#6A8060`) pour les 3 barres — neutre, pas de lien avec les couleurs des flèches

3. **Bouton "Rejouer"** — pleine largeur, accent bg, texte blanc, 16px SemiBold, border-radius 14px, box-shadow. CTA principal

4. **Icône engrenage** — en haut à droite (opacité 50%), même style que sur l'accueil

5. **Liens secondaires** — "Accueil" + "Voir le plateau", 12px textSec, discrets, sans bordure, en row centrée avec gap 16px

**Interactions :**
- Tap "Rejouer" → nouvelle partie immédiate (attribution noir/blanc aléatoire)
- Tap "Accueil" → retour à l'écran d'accueil
- Tap "Voir le plateau" → affiche la position finale de la partie (échiquier en état de fin)
- Tap engrenage → ouvre l'écran réglages

---

### Écran Réglages (Settings)

**Accès** : icône engrenage (opacité 50%) sur l'écran d'accueil (en haut à droite) et lien texte "Réglages" sur l'écran de récap. Non visible pendant la partie.

**Layout** : colonne, padding-top 12px, gap 16px. Flèche retour ← + titre "Réglages" en haut.

**Éléments (de haut en bas) :**

1. **Toggle thème** — card surface, border-radius 18px, row avec label "THÈME" et toggle segmenté Clair/Sombre
   - Le mode actif est en accent bg + texte blanc

2. **Sélecteur ELO adversaire** — card surface, border-radius 18px
   - Titre : "NIVEAU ELO" en 12px uppercase textSec
   - 5 presets en row : 800 / 1000 / 1200 / 1400 / 1600
   - Le sélectionné est en accent bg + texte blanc, les autres en inputBg + texte normal
   - Détermine le niveau de jeu de l'IA adversaire

2. **Eval-loss seuils** *(mode dev, visible initialement, à cacher en prod plus tard)* — card surface, border-radius 18px
   - Titre : "EVAL-LOSS SEUILS (CP)" + badge "DEV" en accent sur fond accent 15%
   - 2 inputs côte à côte :
     - T1 (Top→Correct) : seuil en centipawns (défaut 30cp)
     - T2 (Correct→Bof) : seuil en centipawns (défaut 100cp)
   - Contrôle la classification des coups : Top = eval-loss 0 à T1, Correct = T1 à T2, Bof = > T2

3. **Depth** *(mode dev)* — card surface, border-radius 18px
   - Titre : "DEPTH (DEMI-COUPS)" + badge "DEV"
   - Slider horizontal de 4 à 20 (défaut 12)
   - Valeur courante affichée en 14px ExtraBold sous le slider
   - Contrôle la profondeur d'analyse Stockfish pour la génération des 3 coups

4. **Historique des parties** — card surface, border-radius 18px
   - Titre : "HISTORIQUE" en 12px uppercase textSec
   - Liste des dernières parties avec :
     - Icône résultat : ✓ (accent) / ✗ (rouge) / = (textSec)
     - Stats : "{nb coups} coups · {durée}"
     - Distribution : "Top X% · Correct X% · Bof X%"
   - Séparateur divider entre chaque entrée

**Interactions :**
- Tap preset ELO → sélectionne le niveau, persisté en local storage
- Edit seuils T1/T2 → ajuste la classification des coups, persisté en local storage
- Drag slider depth → ajuste la profondeur d'analyse, persisté en local storage
- Tap ← → retour à l'écran d'accueil

---

### Animations

Toutes les animations sont CSS-native (keyframes + transitions). Pas de librairie d'animation externe.

#### Apparition des flèches (cascade)

- **Séquence** : les 3 flèches apparaissent une par une, avec un délai de **90ms** entre chaque
- **Ordre** : aléatoire à chaque apparition (shuffled `[0,1,2]`), jamais la même flèche en premier
- **Animation par flèche** : `scale(0.85) → scale(1.03) → scale(1)` + `opacity 0 → 1`, durée **220ms** ease-out
- **Teinte des cases** : chaque paire de cases (départ + arrivée) se teinte **en même temps** que sa flèche apparaît, transition `background 200ms ease-out`
- Les cases non encore "révélées" restent dans leur couleur de base — pas de pré-teintage

#### Sélection d'un coup (dismiss)

- **Flèche choisie** : `opacity 1 → 0`, durée **150ms** ease-out
- **Flèches non choisies** : `scale(1) → scale(0.9)` + `opacity 1 → 0`, durée **220ms** ease-out
- **Déteintage des cases non choisies** : transition `background` avec la même durée **220ms** que la disparition de la flèche, synchronisé
- **Cases du coup choisi** : restent teintées avec la couleur de la flèche choisie

#### Déplacement de pièce

- **Pièce clone** : un clone absolu est créé par-dessus le plateau, la pièce originale est masquée (`opacity: 0`)
- **Mouvement droit** (non-cavalier) : transition `left/top 200ms ease-out`
- **Mouvement du cavalier** (en L) : 2 jambes distinctes
  - Jambe 1 : case départ → coin du L (midpoint), **120ms** ease-in
  - Jambe 2 : coin du L → case arrivée, **120ms** ease-out
  - Le midpoint est calculé selon la forme du L : si déplacement vertical > horizontal → vertical d'abord, sinon horizontal d'abord
- **Capture** : la pièce capturée fait `opacity 1 → 0` + `scale(1) → scale(0.7)`, durée **150ms** ease-out, simultané avec l'arrivée
- Après l'animation, le clone est supprimé et la pièce originale est repositionnée dans la case d'arrivée

#### Coup de l'adversaire

- **Timing** : dans le vrai jeu, le coup adverse se joue directement à la fin du cooldown du toast (1.2s). Dans la démo interactive, une pause de 800ms simule ce délai
- **Effacement de la teinte du joueur** : toutes les cases retrouvent leur couleur de base, transition `background 300ms ease-out`
- **Déplacement adverse** : même mécanique de clone absolu, mouvement droit `200ms ease-out` (pas de cavalier dans l'exemple, mais même logique L si nécessaire)
- **Teinte adverse** : cases départ + arrivée teintées en `#8A8078` (mélange opaque 35%), transition `200ms ease-out`
- **Puis** : pause **1200ms** → les pièces reviennent à leur position initiale → nouvelles flèches apparaissent (boucle)

#### Shake / tap invalide

- **Déclencheur** : le joueur clique sur une case qui n'est pas une des 3 propositions
- **Shake** : `translateX(0 → -3px → 3px → -3px → 2px → 0)`, 2 oscillations, durée **300ms** ease-out, appliqué aux 3 groupes de flèches
- **Pulse** : `opacity 1 → 0.5 → 1`, durée **300ms** ease-out, simultané avec le shake
- Les flèches restent visibles après l'animation — pas de changement d'état

#### Toast d'annulation

- **Entrée** : slide-up + léger rebond (`translateY(12px) → translateY(-2px) → translateY(0)`), durée **350ms** ease-out
- **Anneau de cooldown** : stroke SVG qui suit le contour du toast, animation `stroke-dashoffset` linéaire **1.2s**

#### Échec et mat — Transition de fin

- **Tremblement du roi** : le roi maté tremble sur place avec une oscillation décroissante
  - Keyframes `king-tremble` : `translateX` oscillant de ±2px à ±0.5px + léger `rotate(±1deg)`
  - Durée **600ms** ease-out, infinite (boucle tant que visible)
- **Halo rouge** : la case du roi maté reçoit un `box-shadow: inset 0 0 18px 4px rgba(200, 50, 50, 0.4)`
- **Pulse de fierté** (côté gagnant uniquement) : la pièce qui délivre le mat fait un léger `scale(1 → 1.08 → 1)`, durée **400ms** ease-out, une seule fois — micro-moment de satisfaction
- **Pause** : ~1.5 secondes sur le plateau avec l'animation visible
- **Transition** : passage automatique vers l'écran de récap

#### Abandon — Transition de fin

- **Pas de tremblement du roi** — l'abandon est un choix, pas un mat. Le tremblement serait trop "violent" vs l'objectif "zéro frustration"
- **Transition douce** : fondu global du plateau (`opacity 1 → 0`, durée **400ms** ease-out) → passage direct vers l'écran de récap en mode défaite
- Pas de halo rouge, pas de pause prolongée

---

### Décisions de design transversales

| Décision | Choix | Raison |
|----------|-------|--------|
| Dark mode par défaut | Oui | Plus de cachet, différenciant, repose les yeux |
| Timer pendant la partie | Non | Aucune valeur pour un jeu casual — ajoute du bruit |
| Numéro du coup | Non | Idem — information non actionnable pour le joueur |
| Flèche visible après un coup | Non | Juste les cases teintées — plus léger et discret |
| Surbrillance joueur quand adversaire joue | Non | Seul le dernier coup (adversaire) est mis en avant |
| Couleur du coup adverse | `#8A8078` neutre | Distincte des 3 couleurs de choix pour éviter la confusion |
| Attribution couleur (noir/blanc) | Aléatoire | Simplifie l'onboarding, pas de choix supplémentaire |
| Stockage parties jouées | Local storage | Pas de compte utilisateur pour le MVP |
| Promotion pion | Auto-Dame | Pas de choix supplémentaire — préserve le rythme |
| Abandon | Défaite directe, fondu doux | Tap "Abandonner" → fondu du plateau (pas de tremblement) → récap en mode défaite |
| Reprise de partie | Direct sur le plateau | Réouverture de l'app = retour immédiat à la partie en cours, pas d'écran intermédiaire |
| Son | Aucun | Pas de son dans le MVP — le jeu est silencieux |
| Pat / Égalité | Annoncé avant les 50 coups | Écran récap "Égalité" avec les deux rois debout côte à côte |
| Labels récap | Top / Correct / Bof | Ton décontracté, pas de jugement absolu — le "top" est le meilleur des 3 options, pas le meilleur coup objectif |
| Pièces capturées | 22px, opacité 0.85, tri par valeur | D > T > F > C > P — lisibles sans être envahissantes |
| Cases partagées par 2 flèches | Mélange des teintes | Pas d'écrasement — les deux couleurs se combinent |
| Annuler vs cooldown expiré | Annuler gagne toujours | Le joueur a la priorité en cas de race condition |
| Couleurs barres récap | Accent unique | Couleur neutre `#6A8060` pour les 3 barres — aucun lien avec les couleurs des flèches |

## User Journey Flows

### Premier lancement

- Ouverture app → écran d'accueil → tap "Jouer" → attribution aléatoire noir/blanc → plateau
- Si noir : l'adversaire joue d'abord, puis 3 flèches apparaissent
- Zéro friction : pas de compte, pas de tutoriel, pas de choix de couleur
- Compteur : "Première partie !" (pas "0 parties jouées")

### Boucle de jeu (game loop)

```
3 flèches → tap valide → dismiss + déplacement → toast annulation 1.2s
    ↑         ↓ (invalide: shake)        ↓ (annuler: retour aux 3 flèches)
    |                                     ↓ (cooldown expiré)
    |                              coup adverse animé
    |                                     ↓
    |                              partie continue? ──non──→ écran récap
    └──────────────oui────────────────────┘
```

- Race condition : "Annuler" gagne toujours vs expiration cooldown
- Le coup adverse se lance immédiatement après expiration du toast
- Mat : tremblement roi + halo rouge + pause 1.5s → récap
- Pat : transition directe → récap "Égalité"

### Reprise de partie

- Ouverture app avec partie sauvegardée → plateau restauré directement (pas d'écran intermédiaire)
- Le joueur retrouve la position exacte comme s'il n'était jamais parti
- 3 flèches regénérées par Stockfish sur la position courante (pas de sauvegarde des flèches précédentes)
- Si c'était le tour de l'adversaire : son coup est joué d'abord, puis les flèches apparaissent

### Abandon

- Tap "Abandonner" → toast de confirmation (même UI que le toast d'annulation de coup)
- Texte : "Partie abandonnée" + bouton "Annuler" + anneau cooldown 1.2s
- Tap "Annuler" pendant le cooldown → retour à la partie
- Cooldown expiré → fondu du plateau (400ms) → écran récap en mode défaite
- Race condition identique : "Annuler" gagne toujours

### Journey Patterns

| Pattern | Description |
|---------|-------------|
| **Zéro interruption** | Jamais de modale, popup ou dialogue bloquant pendant le jeu |
| **Feedback immédiat** | Chaque tap produit un retour visuel en < 200ms |
| **Retour au cycle** | Toute action converge vers le game loop ou l'accueil — pas de cul-de-sac |
| **Priorité joueur** | En cas d'ambiguïté temporelle, le joueur a toujours la priorité |
| **Continuité silencieuse** | La reprise de partie est invisible — zéro transition |
| **Toast cooldown réutilisable** | Même composant pour annulation de coup et confirmation d'abandon |

## Component Strategy

### Design System Components

**Tailwind CSS + tokens custom** couvre nativement :
- Layout : flex columns, spacers, padding/gap
- Typographie : Poppins via tokens (ExtraBold, SemiBold, tailles définies)
- Couleurs : tokens `bg`, `text`, `textSec`, `surface`, `accent` par thème
- Boutons standard : "Jouer", "Rejouer" (accent bg, border-radius 14px)
- Cards : sections réglages (surface bg, border-radius 18px, box-shadow)
- Toggle segmenté : thème Clair/Sombre
- Inputs : champs T1/T2, slider depth

### Custom Components

| Composant | Rôle | Réutilisation |
|-----------|------|---------------|
| **ChessBoard** | Grille 8×8 avec pièces, teintes de cases, overlay SVG flèches | Écran jeu, ouverture, fin, reprise |
| **ArrowOverlay** | SVG des 3 flèches (tracé droit + L cavalier, têtes arrondies) | Écran jeu |
| **ToastCooldown** | Toast slide-up avec anneau SVG cooldown + bouton "Annuler" | Annulation coup, confirmation abandon |
| **CapturedPieces** | Rangée horizontale de pièces capturées (22px, triées par valeur) | Écran jeu (×2 : joueur + adversaire) |
| **RecapCard** | Card "Tes choix" avec 3 barres de progression + labels | Écran récap |
| **EloSelector** | Row de 5 presets cliquables (800-1600) | Réglages |
| **GameHistory** | Liste des parties passées avec icône résultat + stats | Réglages |
| **MiniBoard** | Grille 4×4 avec mini-flèches (illustration accueil) | Écran accueil |
| **AppHeader** | Logo `ch3ss` (20px) centré + engrenage optionnel | Accueil, récap |

### Component Implementation Strategy

- Tous les composants custom utilisent les tokens Tailwind définis (couleurs thème, spacing, border-radius)
- **ToastCooldown** est le seul composant réutilisé dans 2 contextes différents (coup joué + abandon) — paramétré par le texte affiché
- **ChessBoard** est le composant le plus complexe : gère les pièces, les teintes de cases, et le positionnement de l'overlay SVG. Toutes les animations (déplacement, capture, shake) sont pilotées par CSS

### Implementation Roadmap

**Phase 1 — Core (game loop fonctionnel) :**
- ChessBoard + ArrowOverlay + ToastCooldown + CapturedPieces

**Phase 2 — Écrans secondaires :**
- RecapCard + AppHeader + MiniBoard

**Phase 3 — Réglages :**
- EloSelector + GameHistory + inputs dev (seuils, depth)

## UX Consistency Patterns

### Hiérarchie des boutons

| Niveau | Style | Usage |
|--------|-------|-------|
| **Primaire** | Accent bg, texte blanc, border-radius 14px, box-shadow | "Jouer", "Rejouer" — une seule action primaire par écran |
| **Secondaire** | Accent texte sur fond accent 10%, border-radius 14px | "Annuler" dans le toast cooldown |
| **Tertiaire** | textSec, sans fond ni bordure, 11-12px | "Abandonner", "Accueil", "Voir le plateau" |
| **Icône** | Opacité 50%, sans fond | Engrenage (réglages) |

**Règle** : jamais plus d'un bouton primaire visible par écran. Le bouton primaire est toujours l'action que le joueur est le plus susceptible de vouloir faire.

### Feedback Patterns

| Situation | Feedback |
|-----------|----------|
| **Tap valide** (flèche/case teintée) | Dismiss flèches + déplacement pièce (< 200ms de réponse) |
| **Tap invalide** (case non proposée) | Shake des 3 flèches + pulse opacité (300ms) |
| **Coup joué** | Toast cooldown slide-up (350ms) |
| **Coup adverse** | Déplacement pièce animé + teinte cases neutres |
| **Mat** | Tremblement roi + halo rouge + pulse pièce matante |
| **Abandon confirmé** | Fondu du plateau (400ms) |
| **Sélection réglage** (ELO, thème) | Changement visuel immédiat (pas de toast de confirmation) |

**Règle** : tout feedback est visuel et non-bloquant. Pas de toast de succès, pas de notification — l'état de l'interface EST le feedback.

### Navigation Patterns

| Transition | Comportement |
|------------|-------------|
| Accueil → Partie | Immédiat (pas de transition) |
| Partie → Récap | Via mat (pause 1.5s) ou abandon (fondu 400ms) |
| Récap → Nouvelle partie | Immédiat (tap "Rejouer") |
| Récap → Accueil | Immédiat |
| Accueil/Récap → Réglages | Tap engrenage |
| Réglages → Retour | Tap flèche ← |
| Reprise (app rouverte) | Direct sur le plateau, pas d'écran intermédiaire |

**Règle** : pas de transitions d'écran animées (slide, fade entre pages). Les transitions sont réservées aux éléments de gameplay. La navigation est instantanée.

### États vides et edge cases

| Situation | Comportement |
|-----------|-------------|
| **Première visite** | "Première partie !" au lieu de "0 parties jouées" |
| **Historique vide** | Section historique masquée ou texte "Aucune partie" |
| **Aucune pièce capturée** | Rangée CapturedPieces invisible (pas de placeholder vide) |
| **Perte de focus** (app en arrière-plan) | Partie sauvegardée en localStorage, reprise transparente |
| **Promotion pion** | Auto-Dame, pas de choix — préserve le rythme |

## Responsive Design & Accessibility

### Responsive Strategy

**Approche : mobile-first, le reste fonctionne.**

L'app est conçue pour mobile (360-430px de large). Les écrans plus grands affichent le même layout centré, sans réorganisation.

| Device | Stratégie |
|--------|-----------|
| **Mobile** (320-480px) | Design natif — le board occupe ~95% de la largeur |
| **Tablette** (481-1023px) | Layout identique, centré, board avec max-width |
| **Desktop** (1024px+) | Layout identique, centré, max-width ~480px pour l'ensemble de l'app |

Pas de layout multi-colonnes — ch3ss est une app mono-colonne à tous les breakpoints. L'espace supplémentaire est simplement du padding.

### Breakpoints

Approche mobile-first avec Tailwind :

| Breakpoint | Rôle |
|------------|------|
| **Base** (< 480px) | Design par défaut — tout est conçu pour cette taille |
| **sm** (≥ 480px) | `max-width: 480px` + `margin: 0 auto` sur le conteneur principal |

Un seul breakpoint suffit. Au-delà de 480px, on centre et on cap la largeur. Le board reste carré et s'adapte via `width: 100%; aspect-ratio: 1`.

### Accessibility (WCAG AA)

**Contrastes :**

| Paire | Ratio | Verdict |
|-------|-------|---------|
| `text` (#3D3A36) sur `bg` (#EDE8DF) | ~7.5:1 | AA |
| `text` (#E0DDD6) sur `bg` (#1E2A22) | ~9.2:1 | AA |
| `textSec` (#8A8078) sur `bg` (#EDE8DF) | ~3.8:1 | AA pour grand texte, limite pour petit texte |
| `textSec` (#8A9A86) sur `bg` (#1E2A22) | ~4.1:1 | AA pour texte ≥ 14px bold |
| Blanc sur `accent` (#6A8060) | ~4.6:1 | AA |

Les textes en `textSec` ne descendent jamais en dessous de 11px et sont non-critiques (compteur parties, labels secondaires). Acceptable en AA.

**Touch targets :**
- Boutons primaires/secondaires : padding ≥ 14px → largeur > 44px
- Cases de l'échiquier : board 360px / 8 = **45px par case** — conforme
- Sur écran 320px : 320px / 8 = **40px** — légèrement sous les 44px recommandés. Acceptable car le tap est assisté par les teintes de cases (zone visuelle élargie)

**Clavier :**
- Navigation entre les 3 flèches avec Tab / Shift+Tab
- Entrée ou Espace pour jouer le coup sélectionné
- Escape pour annuler (pendant le cooldown du toast)
- Focus visible sur la flèche/case active (outline accent 2px)

**Screen reader :**
- Chaque flèche annonce : "Coup [n] : [pièce] de [case départ] vers [case arrivée]"
- Board en `role="grid"`, cases en `role="gridcell"`
- Toast annonce "Coup joué. Annuler disponible pendant [n] secondes"
- Résultat de fin annoncé : "Partie terminée. Victoire/Défaite/Égalité en [n] coups"

**`prefers-reduced-motion` :**
- Désactive : shake, tremblement roi, cascade flèches, bounce toast
- Conserve : déplacements de pièces (instantanés au lieu d'animés), teintes de cases (sans transition)

### Testing Strategy

| Type | Outil/Méthode |
|------|---------------|
| Contrastes | axe DevTools / Lighthouse |
| Clavier | Test manuel navigation complète sans souris |
| Screen reader | VoiceOver (iOS/macOS) — cible primaire mobile |
| Touch targets | Chrome DevTools device mode (320px, 360px, 414px) |
| Reduced motion | `prefers-reduced-motion: reduce` dans DevTools |
