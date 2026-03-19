# Agent

## Mission

Tu interviens sur une application academique dont le point le plus critique est la generation de releves de cotes PDF.

Ta mission est de refactorer l'application pour rendre la generation PDF reutilisable et scalable, tout en preservant strictement le rendu du document existant.

## Priorite absolue

Le document PDF actuel a ete valide par le comite de gestion.

Tu ne dois jamais modifier:

- la mise en page
- les tailles
- les polices
- les marges
- les bordures
- les textes affiches
- les logos
- le filigrane
- la signature
- le sceau
- l'ordre visuel du contenu

Si une tache demande implicitement ou explicitement de changer ce rendu, tu dois refuser et proposer une solution qui preserve la sortie visuelle.

## Ce que tu dois comprendre avant d'agir

Le workflow cible est:

1. accueil sans sidebar
2. cartes de promotions
3. entree dans une promotion
4. affichage des annees academiques + structure du programme
5. navigation vers `/promotions/[id]/page.tsx`
6. affichage du bureau du jury
7. affichage des etudiants inscrits et de leurs notes
8. generation du releve pour un, plusieurs ou tous les etudiants

Le workflow initial a conserver comme base de reference est `LMD`.

Le workflow `AS` n'est pas encore defini en calcul et ne doit pas etre invente.

## Mode de travail attendu

Quand tu interviens:

1. identifier ce qui releve du chargement de donnees
2. identifier ce qui releve du calcul metier
3. identifier ce qui releve de la selection d'impression
4. identifier ce qui releve du rendu PDF
5. separer ces couches sans changer le resultat final

## Contrat de securite

Avant toute modification du code autour du PDF, tu dois verifier:

- que le changement ne touche pas la forme du document
- que le changement ameliore la reutilisation ou la lisibilite
- que le changement reste compatible avec la generation unitaire et en masse

Si ce n'est pas garanti, tu ne modifies pas.

## Resultat recherche

Tu dois guider le projet vers une architecture qui permet:

- de reutiliser le generateur PDF hors de la modale actuelle
- de charger les donnees d'une promotion et d'une annee depuis une vraie page
- de choisir facilement le lot d'etudiants a imprimer
- de preparer une future extension `AS`

## Ce que tu ne dois pas faire

- ne pas refaire le design du bulletin
- ne pas compenser un bug de calcul par un changement de rendu
- ne pas melanger la logique `LMD` avec une hypothese `AS`
- ne pas faire une grosse refonte monolithique
- ne pas supprimer trop tot les chemins existants

## Style de refactoring attendu

Le bon style est:

- petit
- incremental
- lisible
- reversible
- compatible avec l'existant
- documente par intention

Le mauvais style est:

- refonte brutale
- couplage fort entre UI et PDF
- calculs caches dans les composants
- changements visuels "mineurs" sur le bulletin

## Checklist avant livraison

Avant de considerer une tache comme terminee, verifier:

- le workflow `LMD` reste fonctionnel
- le rendu PDF reste identique
- le code est plus reutilisable qu'avant
- la selection unitaire, partielle et massive est couverte
- l'accueil et la navigation cibles sont respectes si la tache les concerne
- aucune hypothese metier `AS` n'a ete ajoutee

## Phrase guide

Preserver le bulletin, extraire la logique, simplifier le parcours utilisateur, preparer la generation en masse.
