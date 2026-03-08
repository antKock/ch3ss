# Brief produit — Chess3 *(nom de travail)*

## Concept central

Un jeu d'échecs où le joueur ne choisit pas librement son coup : à chaque tour, **3 coups sont proposés** par le système, chacun généré par une IA à un niveau ELO différent :

| Coup | Source |
|------|--------|
| 🔴 Coup faible | IA à `ELO - X` |
| 🟡 Coup moyen | IA à `ELO` (niveau actuel du joueur) |
| 🟢 Coup fort | IA à `ELO + X` |

L'intention : reproduire la variance naturelle d'un joueur humain, qui dans une vraie partie joue parfois en dessous ou au-dessus de son niveau réel. Pas de coup à 2500 pour un joueur à 1200.

**Valeur de X** : à calibrer (fourchette cible : 150–300 pts ELO). Probablement à rendre proportionnel à l'ELO du joueur pour éviter les absurdités aux niveaux bas.

Les règles des échecs restent **100% standards** — seule l'interface de sélection change.

**L'adversaire IA joue librement**, comme un moteur d'échecs classique à ELO fixe. Il n'est pas contraint par le système des 3 coups. Seul le joueur humain est soumis à cette mécanique.


## Problème résolu

Les échecs classiques en ligne sont trop exigeants cognitivement pour une session mobile détendue. Le champ des possibles est paralysant. Chess3 réduit la friction à son minimum : parties rapides, plaisir tactique préservé, surcharge cognitive éliminée.


## Cible utilisateur

Tous niveaux — pas seulement les débutants. Accessible mais pas condescendant.


## MVP

- Partie solo contre une IA à ELO fixe (valeur par défaut)
- À chaque tour du joueur : 3 coups proposés, qualité visible
- Victoire / défaite / nulle → retour à zéro, pas de persistance
- Pas de compte, pas de suivi d'ELO


## Roadmap post-MVP

**V2**
- Choix de l'ELO de départ (joueur et adversaire IA)
- ELO joueur qui évolue au fil des parties (victoires / défaites dans Chess3)

**V3**
- Multijoueur : parties contre d'autres utilisateurs humains
- (Dans ce cas : les deux joueurs sont contraints par le système des 3 coups)


## Style visuel

- **Référence** : chess.com — épuré, lisible, envie d'y jouer
- **Direction** : encore plus pastel, plus doux, plus accessible — sans copier chess.com
- **Priorité absolue** : lisibilité du plateau


## Stack technique cible

- **MVP** : Progressive Web App (PWA), mobile-first + web
- **Future** : publication iOS App Store + Google Play Store
- **Contrainte clé** : stack compatible avec un export natif simplifié (React Native ou Flutter — à confirmer)
- **Moteur d'échecs** : probablement Stockfish.js côté client (zéro coût serveur) — à confirmer


---

## Questions ouvertes avant de lancer BMAD

### Gameplay / mécanique

1. **Stack front** : React (PWA → React Native) ou Flutter (PWA + natif d'emblée) ? C'est le choix le plus structurant.

2. **Moteur IA** : Stockfish.js côté client ou API distante ? Côté client = zéro infra, mais contrainte de perf sur mobile bas de gamme.

3. **Valeur de X** : fixe (ex. toujours ±200) ou proportionnelle à l'ELO du joueur ? Un joueur à 400 ELO ne peut pas se voir proposer un coup à ELO négatif.

4. **Affichage de la qualité des coups** : valeur ELO numérique visible, ou icône / couleur seulement (🟢🟡🔴) ?

5. **Les 3 coups peuvent-ils concerner des pièces différentes**, ou toujours la même pièce avec 3 destinations ?

6. **Fin de partie** : mat / nulle naturelle uniquement, ou limite de temps / de coups au MVP ?

7. **Persistance partielle** : sauvegarde de la partie en cours si le joueur ferme l'app (localStorage), ou zéro persistance au MVP ?

### Nom & identité

8. **Nom du projet** : "Chess3", autre chose ? Conditionne le brief de branding.
