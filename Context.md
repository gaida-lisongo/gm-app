# Context

## Objectif

Refactorer progressivement l'application pour faire de la generation en masse des releves de cotes la fonctionnalite centrale, sans casser le code existant et sans modifier la mise en page du document PDF deja valide par le comite de gestion.

Le refactoring vise d'abord le workflow `LMD`. Le workflow `AS` sera traite plus tard, apres definition des regles de calcul des points par le metier.

## Contexte actuel

Le projet est une application `Next.js 15` avec `React 19`, `TypeScript`, `Tailwind`, `mysql2`, `zustand` et `pdfmake`.

Le domaine principal deja present dans le code est:

- `mention`
- `section`
- `promotion`
- `unites d'enseignement`
- `matieres`
- `jury`
- `etudiants inscrits`
- `notes`

Le flux actuel est pilote depuis la sidebar:

1. chargement des mentions et sections
2. navigation vers une section
3. affichage des promotions d'une section
4. ouverture d'une modale de jury
5. chargement des etudiants et des notes
6. generation PDF via `src/utils/pdfGenerator.ts`

## Probleme a resoudre

Le code fonctionne autour d'un workflow de consultation avec modales, alors que le besoin prioritaire est un workflow de production:

- entrer rapidement dans une promotion
- choisir une annee academique
- afficher le bureau du jury, le palmares et les unites
- generer les releves de cotes en masse
- generer un releve unique
- generer un lot filtre d'etudiants

Le besoin n'est pas de refaire le PDF visuellement. Le besoin est de rendre le systeme de generation reutilisable, parametrable et exploitable a grande echelle.

## Workflow cible

### Accueil

La page d'accueil devient la porte d'entree principale.

Contraintes:

- pas de sidebar sur l'accueil
- le menu du haut peut rester
- l'accueil affiche des cartes de promotions
- l'utilisateur doit pouvoir revenir facilement a l'accueil depuis les pages internes

### Entree dans une promotion

Quand l'utilisateur ouvre une promotion, il doit voir:

- les informations de la promotion
- la liste des annees academiques disponibles
- la structure du programme
- la liste des unites d'enseignement

Cette vue sert de page de preparation avant la consultation des resultats.

### Consultation d'une annee academique

Quand l'utilisateur clique sur une annee academique, il va vers une page de type:

- `/promotions/[id]/page.tsx`

Cette page doit charger et afficher:

- le bureau du jury
- la liste des etudiants inscrits
- les notes de chaque etudiant
- le palmares necessaire a l'emission du releve

Cette page doit aussi offrir:

- retour a l'accueil
- generation du releve pour toute la classe
- generation du releve pour un sous-ensemble d'etudiants
- generation du releve pour un seul etudiant

## Invariant critique

Le document PDF existant est critique.

Regle absolue:

- aucune modification de mise en page
- aucune modification des dimensions
- aucune modification des libelles
- aucune modification des logos, filigranes, signature, sceau
- aucune modification des alignements, marges, espacements, bordures, polices, tailles ou structure du document

Le fichier `src/utils/pdfGenerator.ts` doit etre considere comme une reference de sortie visuelle. Toute evolution doit viser la reutilisation et l'encapsulation du comportement, pas la transformation du rendu.

## Strategie de refactoring attendue

Le refactoring doit etre incremental et sans rupture.

Principes:

- conserver les routes et comportements existants tant qu'un remplacement stable n'existe pas
- isoler la logique de chargement des donnees de la logique d'affichage
- isoler la logique de calcul `LMD` de la logique de rendu PDF
- faire du generateur PDF un composant applicatif reutilisable par plusieurs ecrans
- eviter de lier la generation PDF a une modale specifique
- introduire des points d'extension clairs pour `AS`

## Architecture cible a atteindre

Le systeme doit evoluer vers ces blocs:

### 1. Navigation

- accueil sans sidebar
- navigation centree sur les promotions
- pages dediees plutot que flux principal en modales

### 2. Chargement des donnees

Services ou fonctions dediees pour charger:

- promotions
- annees academiques
- unites d'enseignement
- jury
- etudiants inscrits
- notes

### 3. Calcul metier

Calculs `LMD` extraits dans une couche stable:

- moyenne
- credits valides
- total des points
- mention
- decisions de selection des notes session/rattrapage

### 4. Selection d'impression

Couche dediee pour definir le lot a imprimer:

- classe complete
- etudiants filtres
- etudiant unique

### 5. Generation PDF

Couche dediee a la production du document:

- input normalise
- rendu strictement identique a l'existant
- aucune logique UI dans le generateur

## Hors perimetre pour l'instant

- calcul des points pour `AS`
- refonte graphique generale
- modification du document PDF
- suppression immediate des anciens ecrans sans migration
- optimisation prematuree qui toucherait au rendu du bulletin

## Definition du succes

Le refactoring sera considere comme reussi si:

- l'accueil devient une entree simple par cartes de promotions
- la consultation d'une promotion et d'une annee est claire
- la generation de releves fonctionne pour 1, N ou toute la classe
- le rendu PDF reste strictement identique
- le workflow `LMD` est stabilise
- le code devient pret a accueillir `AS` sans duplication majeure
