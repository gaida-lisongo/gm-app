# Rules

## Regle 1

Ne jamais modifier la mise en page du releve de cotes deja valide.

Cela inclut sans exception:

- structure
- largeur et hauteur de page
- marges
- polices
- tailles
- bordures
- alignements
- espacements
- entetes
- filigrane
- logos
- signature
- sceau
- libelles
- ordre d'affichage

## Regle 2

Toute evolution autour de `pdfGenerator` doit etre une evolution de reutilisation, pas une evolution visuelle.

Autorise:

- extraire des helpers
- normaliser les donnees d'entree
- encapsuler des calculs
- separer selection d'etudiants et rendu PDF
- ajouter une orchestration de generation en masse

Interdit:

- changer le `docDefinition` rendu a l'utilisateur
- changer le comportement visuel du document

## Regle 3

Refactorer sans casser l'existant.

Donc:

- pas de suppression brutale du workflow actuel tant que le nouveau flux n'est pas stable
- pas de renommage hasardeux des routes critiques
- pas de changement de contrat API sans plan de transition
- pas de refonte globale si un changement local suffit

## Regle 4

Le workflow cible doit etre implemente autour des pages, pas autour d'une modale unique.

Le chemin cible est:

1. accueil sans sidebar
2. cartes de promotions
3. entree dans une promotion
4. choix de l'annee academique
5. page `/promotions/[id]/page.tsx`
6. affichage jury + etudiants + notes
7. actions de generation PDF

## Regle 5

La logique metier `LMD` doit etre isolee de l'UI.

Les calculs ne doivent pas rester disperses dans les composants visuels.

Ils doivent pouvoir etre reutilises par:

- affichage ecran
- filtrage
- generation PDF
- futures variantes systeme `AS`

## Regle 6

Toujours separer ces responsabilites:

- recuperation des donnees
- transformation metier
- selection du lot a imprimer
- rendu PDF
- affichage UI

Un composant React ne doit pas devenir le centre de toutes ces responsabilites.

## Regle 7

Le systeme doit supporter nativement trois modes de generation:

- un etudiant
- plusieurs etudiants selectionnes
- toute la promotion ou toute la classe

Cette capacite doit etre pensee comme une primitive metier, pas comme un bricolage de bouton.

## Regle 8

Le workflow `LMD` est prioritaire et sert de reference.

Pour `AS`:

- ne pas inventer de formule
- ne pas hardcoder des calculs speculatifs
- preparer seulement les points d'extension

## Regle 9

Conserver les donnees source le plus brut possible jusqu'a la couche metier.

Eviter:

- melanges prematurement transformes dans les composants
- enrichissements implicites disperses
- duplications d'objets metier dans plusieurs couches

## Regle 10

Avant toute modification future du generateur PDF:

1. verifier le rendu actuel
2. definir le contrat d'entree cible
3. garantir que la sortie visuelle ne change pas
4. faire un refactoring mecanique et limite

## Regle 11

Priorite de securite du projet:

1. integrite du document PDF
2. exactitude des calculs `LMD`
3. stabilite des donnees chargees
4. fluidite du workflow utilisateur
5. simplification de l'architecture

Si une decision ameliore le code mais met en risque le PDF, elle doit etre refusee.

## Regle 12

Tout nouveau code doit etre concu pour permettre:

- retour a l'accueil
- chargement d'une promotion
- affichage des annees disponibles
- affichage du programme
- affichage du jury
- affichage des inscrits
- affichage des notes
- impression ciblee ou massive

## Regle 13

Ne pas toucher a la forme du document pour corriger un probleme de donnees.

Si un bug provient des donnees ou des calculs:

- corriger la preparation des donnees
- corriger la logique metier
- ne jamais compenser par une deformation du PDF

## Regle 14

Chaque etape de refactoring doit etre petite, testable et reversible.

Exemples de bonnes etapes:

- extraire les fonctions de calcul `LMD`
- extraire la preparation des donnees PDF
- introduire une page promotion detail
- introduire une selection d'etudiants avant impression

## Regle 15

La documentation de cadrage prime sur l'improvisation.

Si une ambiguite apparait:

- s'arreter
- clarifier la regle metier
- surtout ne pas supposer un comportement pour `AS`
