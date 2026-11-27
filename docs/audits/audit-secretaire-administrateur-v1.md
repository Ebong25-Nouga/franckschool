# Audit des espaces Secrétaire et Administrateur — V1

**Date :** 27/11/2026 · **Auteur :** Claude (audit demandé par le propriétaire) · **Statut :** constat, aucune modification faite.

Référence : prompt « Audit complet des espaces secrétaire et administrateur » du propriétaire (sections 1 à 10).

## 0. Ce qui a été examiné, et comment

| Élément | Résultat de l'examen |
|---|---|
| Backend Laravel (`backend/`) | **Vide pour l'école.** Un seul contrôleur (`Controller.php`, vide), un seul modèle (`User.php`), aucun middleware de permission, une seule route API (`GET /api/user`). Migrations : uniquement celles de Laravel (`users`, `cache`, `jobs`, `personal_access_tokens`). |
| Tables MySQL | **Aucune table métier créée.** Le modèle complet existe seulement sur papier (`docs/base-de-donnees/audit-bd-v1.md`), en attente de validation (D1 à D9). |
| Interfaces React | 11 pages pour l'établissement : `frontend/src/pages/etablissement/*`, menu dans `components/AppShell.tsx`, routes dans `App.tsx`. |
| Permissions | Définies dans `frontend/src/auth.tsx` (sessions de démonstration), filtrage du menu par `peut()`. |
| Tests | Scénarios 1 à 10 joués automatiquement dans un navigateur (Playwright) sur l'interface, le 27/11/2026. Résultats en section 9. |

**Conséquence principale :** aucune fonctionnalité de l'administrateur ou de la secrétaire ne fonctionne « réellement » au sens du prompt (enregistrement en base, contrôle serveur). Ce sont des **interfaces avec des données d'exemple**. Une action peut modifier l'écran pendant la visite (état local), mais rien n'est enregistré : tout disparaît au rechargement.

**Légende des états**

- **Écran fonctionnel (démo)** : l'écran existe et l'action change l'affichage pendant la visite. Pas de backend.
- **Simulé** : l'écran existe mais l'action affiche seulement un message de confirmation, sans effet.
- **Inactif** : le bouton existe mais ne fait rien.
- **Absent** : rien dans l'interface.

## 1 à 4. État de chaque fonctionnalité (sections A à Q du prompt)

### A. Tableau de bord — *incomplet*
Fichier : `pages/etablissement/TableauDeBord.tsx`

| Demandé | État | Preuve |
|---|---|---|
| Total élèves | Écran (chiffre fixe 842) | « Élèves inscrits » |
| Nouveaux / redoublants | Partiel (texte « +37 nouveaux, 19 redoublants ») | même tuile ; **anciens absent** |
| Total enseignants, total classes | **Absent** du tableau de bord | — |
| Statistiques des inscriptions | **Absent** | — |
| Paiements, recettes mensuelles, dépenses | Écran (graphique recettes/dépenses, « Encaissé en novembre ») | graphique Recharts |
| Recettes journalières | **Absent** (seulement dans la caisse) | — |
| Soldes et impayés | Écran (« Reste à percevoir ») | tuile |
| Notifications, activités récentes | Écran (cloche + « Dernières actions », données fixes) | `AppShell.tsx`, liste `activites` |
| Limité à l'établissement | Non vérifiable (une seule école, pas de backend) | — |

**Remarque :** la secrétaire et l'administrateur voient **le même tableau de bord**.

### B. Gestion des élèves — *incomplet*
Fichiers : `pages/etablissement/Eleves.tsx`, `components/Actions.tsx` (`InscriptionModal`)

| Demandé | État |
|---|---|
| Liste, recherche, filtres (classe, impayés, moyenne < 10) | Écran fonctionnel (démo) |
| Fiche individuelle (dossier, scolarité, notes) | Écran fonctionnel (démo) |
| Inscrire un nouvel élève (3 étapes) | **Simulé** : message de confirmation, l'élève n'apparaît pas dans la liste |
| Statut nouveau / ancien / redoublant | Choix dans le formulaire d'inscription (simulé) |
| Enregistrer le tuteur | Dans le formulaire d'inscription (simulé) |
| Modifier un élève, modifier le tuteur | **Inactif** (bouton crayon = ouvre la fiche, pas de formulaire de modification) |
| Affecter / changer de classe, transfert | **Absent** |
| Départs, abandons, anciens élèves | **Absent** |
| Archiver, masquer, supprimer logiquement, restaurer | **Absent** |

### C. Parents et tuteurs — *absent*
Seule information : le tuteur principal affiché dans la fiche élève. Pas de module dédié (ajout, modification, lien vers plusieurs élèves, liste des élèves d'un parent).

### D. Enseignants — *quasi absent*
Fichier : `pages/etablissement/ClassesProfesseurs.tsx` (`Professeurs`)

| Demandé | État |
|---|---|
| Consulter la liste (contrat, classes, professeur principal) | Écran (démo), filtre permanents/vacataires |
| Ajouter un enseignant | **Inactif** (bouton « Ajouter un professeur » sans action) |
| Modifier, profil détaillé, identifiants de connexion | **Absent** |
| Attribuer classes et matières, désigner le professeur principal | **Absent** (affichage seulement) |
| Désactiver, enseignants anciens | **Absent** |

### E. Classes — *incomplet*
| Demandé | État |
|---|---|
| Consulter les classes, effectifs, remplissage, professeur principal | Écran (démo) |
| Créer une classe | **Simulé** (test 1 : message seulement, nombre de classes inchangé) |
| Modifier, capacité, affecter le professeur principal | **Absent** / **Inactif** (« Désigner un professeur principal ») |
| Supprimer logiquement, archiver, restaurer | **Absent** |

### F. Matières — *incomplet*
Affichage des matières d'une classe avec code, groupe, coefficient et professeur. « Ajouter une matière » est **inactif**. Modifier, coefficients, affectation d'un enseignant, suppression, restauration : **absents**.

### G. Années scolaires — *absent*
Seul affichage : la frise des 6 séquences dans Paramètres. Création d'année, ouverture, passage en classe supérieure, redoublements, archivage, consultation des anciennes années : **absents**.

### H. Inscriptions et réinscriptions — *incomplet*
Inscription : simulée (voir B). Réinscription d'un ancien élève, fiche d'inscription imprimable, statistiques d'inscription : **absents**.

### I. Notes et évaluations — *incomplet*
Fichier : `pages/etablissement/Evaluations.tsx` (`ValidationNotes`)

| Demandé | État |
|---|---|
| Consulter les évaluations soumises, voir les notes | Écran fonctionnel (démo) |
| Valider / renvoyer une évaluation | Écran fonctionnel (démo, état local) — **réservé à quelle personne ? non contrôlé** (voir section 10) |
| Notes manquantes par classe | Écran (avancement de saisie sur le tableau de bord) |
| Résultats et classement par classe | Écran (dans Bulletins) |
| Gérer les évaluations, coefficients | **Absent** (consultation des coefficients dans Classes) |

### J. Bulletins — *incomplet*
Fichier : `Evaluations.tsx` (`Bulletins`). Choix classe et période, classement, aperçu au format camerounais : **écran (démo)**. « Générer » change l'état à l'écran ; « Télécharger » est **simulé** (pas de PDF). Bulletins des anciennes années et paramètres d'impression : **absents**.

### K. Absences et retards — *incomplet*
Fichier : `Evaluations.tsx` (`Absences`). Liste, filtre absences/retards, « Justifier » : **écran (démo)**. « Signaler une absence » : **simulé**. Modifier, consulter par élève, par classe, rapport imprimable : **absents**. Statistiques : 3 chiffres fixes.

### L. Discipline — *absent*
Aucune page, aucune donnée. **Aucune table prévue non plus dans l'audit BD V1** (sanctions, avertissements, observations).

### M. Emplois du temps (côté école) — *absent*
Il n'existe qu'une vue de l'emploi du temps **dans l'espace enseignant**. Création, affectation enseignant/matière/salle, vue par classe, impression : **absents** côté école. Une table `emplois_temps` est prévue dans l'audit BD.

### N. Caisse et paiements — *le module le plus avancé, mais incomplet*
Fichiers : `pages/etablissement/Caisse.tsx`, `Remboursements.tsx`, `components/Actions.tsx` (`EncaissementModal`)

| Demandé | État |
|---|---|
| Journal des opérations par jour, filtres type et mode | Écran fonctionnel (démo) |
| Encaisser (tranches, solde, espèces / MTN MoMo / Orange Money / banque, référence anti-doublon) | Écran fonctionnel (démo) avec contrôles (montant ≤ reste, référence obligatoire hors espèces) |
| Le paiement apparaît dans l'historique | **Non** (test 9 : 10 lignes avant, 10 après) |
| Paiement partiel, reçu | Écran (reçu affiché) ; impression **simulée** |
| Dettes, impayés, relance | Écran (onglet Impayés) ; relance **simulée** |
| Dépenses avec justificatif | **Simulé** (formulaire + champ fichier, rien n'est enregistré) |
| Clôture de caisse avec calcul de l'écart | Écran fonctionnel (calcul réel) ; enregistrement **simulé** |
| Remboursement : demande → décision admin → exécution | Écran fonctionnel (démo, état local) — conforme au circuit validé |
| Annulation d'un paiement avec conservation de l'historique | **Absent** |
| Recettes journalières / hebdomadaires / mensuelles | Partiel (jour : bandeau ; mois : graphique ; semaine : absent) |
| Rapports financiers PDF | **Simulé** |

### O. Documents administratifs — *absent*
Certificats de scolarité, attestations, listes d'élèves et de classes imprimables, rapports, archives : rien. L'export Excel des élèves est **simulé**.

### P. Communication et annonces — *absent*
Aucune publication d'annonce ni envoi aux parents ou enseignants. La cloche n'affiche que des notifications fixes. Pas de table `annonces` dans l'audit BD.

### Q. Statistiques et rapports — *incomplet*
Graphiques du tableau de bord seulement. Statistiques des enseignants, classes, inscriptions, absences, exports : **absents**.

## 5. Différences actuelles entre secrétaire et administrateur

| Point | Constat |
|---|---|
| Espaces | **Un seul espace partagé** (`AppShell`), la secrétaire voit seulement le libellé « Secrétariat ». Le propriétaire veut deux espaces distincts et proches. |
| Menu | Filtré par permissions pour la secrétaire (test : droits `eleves, caisse, absences` → Tableau de bord, Élèves, Absences, Caisse, Remboursements). |
| Réservé à l'administrateur aujourd'hui | Utilisateurs et droits, Paramètres, approbation des remboursements. |
| Manquant côté administrateur | Éléments supprimés, éléments masqués, archives, journal d'activité filtrable, restauration, identification de l'auteur de chaque opération (seulement affichée dans le journal de caisse, données fixes). |

## 6. Permissions

**Existantes (codes dans `auth.tsx`) :** `eleves`, `classes`, `professeurs`, `notes`, `bulletins`, `caisse`, `remboursements.decider`, `utilisateurs`, `parametres`, `emplois`, `absences`.

**Écran « Utilisateurs et droits » (`Administration.tsx`) :** propose `eleves`, `classes`, `absences`, `notes`, `bulletins`, `caisse`, `depenses`, `remboursements`, `clotures`.

**Incohérences :**
- `depenses`, `remboursements`, `clotures` sont cochables mais **ne contrôlent rien** (aucune page ne les vérifie).
- `professeurs`, `emplois`, `parametres`, `utilisateurs` contrôlent le menu mais **ne sont pas proposés** à l'administrateur.
- Les cases cochées ne sont **pas appliquées** à la secrétaire (enregistrement simulé).

**Manquantes par rapport au prompt :** enseignants (création, affectation), matières, années scolaires, inscriptions/réinscriptions distinctes, discipline, emplois du temps (école), documents, annonces/notifications, masquer, supprimer, restaurer, consulter le journal, exporter, gérer les secrétaires (à interdire explicitement).

**Contrôle :** uniquement par masquage du menu React. **Aucun contrôle des routes, aucun contrôle côté Laravel** (voir test 5).

## 7. Masquage, suppression logique, archivage
**Absents** dans l'interface. Côté modèle de données : la suppression logique (`deleted_at`) et l'archivage sont prévus dans l'audit BD V1 ; **le masquage n'est pas prévu** (il faudra des colonnes du type `masque_par`, `masque_le`, ou une table dédiée) ; la restauration n'a pas d'écran.

## 8. Journal d'activité
**Absent.** Le tableau de bord affiche une liste « Dernières actions » écrite à la main dans les données d'exemple. Aucune opération n'est enregistrée. La table `journal_activites` est prévue dans l'audit BD V1 ; il faudra y ajouter le **rôle** de l'utilisateur et le **motif** pour couvrir tous les champs demandés.

## 9. Résultats des tests (27/11/2026, Playwright, interface locale)

| Test | Résultat | Preuve |
|---|---|---|
| 1 — Création d'une classe | **Échec** | « Nouvelle classe » n'ouvre pas de formulaire ; 8 classes avant, 8 après |
| 2 — Suppression d'une classe | **Absent** | aucun bouton ni page de suppression |
| 3 — Masquage | **Absent** | aucun bouton « Masquer » |
| 4 — Restauration | **Absent** | aucune page des éléments supprimés |
| 5 — Permissions | **Faille** | la secrétaire sans droit ouvre directement `/etablissement/professeurs`, `/utilisateurs`, `/parametres`, `/notes` : les pages s'affichent |
| 6 — Plusieurs secrétaires | **Absent** | un seul compte secrétaire de test, pas de journal |
| 7 — Protection des historiques | **Absent** | pas de journal ; désactivation simulée |
| 8 — Isolation des établissements | **Non testable** | une seule école dans les données, pas de backend |
| 9 — Caisse | **Incomplet** | reçu affiché, mais le paiement n'apparaît pas dans le journal ; pas d'annulation |
| 10 — Anciennes années | **Absent** | aucun choix d'année dans l'espace école |

## 10. Risques de sécurité identifiés

1. **Contournement des permissions par l'adresse** (test 5) : le menu est caché, mais les pages restent accessibles en tapant leur adresse.
2. **Aucun contrôle serveur** : sans backend, toutes les règles sont dans le navigateur, donc contournables.
3. **Connexion de démonstration sans mot de passe** et session modifiable dans le navigateur (`localStorage`) : n'importe qui peut se faire passer pour administrateur. Normal pour une démo, **à remplacer impérativement** par Laravel Sanctum.
4. **Comptes de test visibles sur la page de connexion** : à retirer avant la production (point B11).
5. **Validation des notes accessible à toute personne de l'espace établissement** ayant le droit `notes`, sans distinction claire de qui a le droit de valider.
6. **Pas de journal** : aucune traçabilité des opérations sensibles (caisse, droits, suppressions).
7. **Isolation entre écoles non implémentée** (prévue dans l'audit BD : clés composites + filtre Laravel).
8. **Version de PHP** : le prompt indique PHP 8.4.11 ; l'environnement de développement actuel a PHP 8.3.6. Laravel 13 fonctionne avec les deux, à vérifier sur WampServer.

## 11. Modifications recommandées

**Interfaces (étape actuelle) :**
1. Séparer **« Espace secrétariat »** et **« Espace administration »** (composants partagés, menus distincts).
2. Protéger chaque route par sa permission (pas seulement le menu).
3. Un **catalogue unique de permissions**, identique entre l'écran « Utilisateurs et droits » et les contrôles.
4. Construire les écrans absents : enseignants (création, identifiants, affectations), matières, parents/tuteurs, années scolaires et réinscriptions, discipline, emplois du temps (école), documents administratifs, annonces, **éléments supprimés/masqués avec restauration**, **journal d'activité filtrable**, anciennes années.
5. Faire en sorte que les actions simulées changent l'écran (créer une classe l'ajoute, encaisser ajoute la ligne au journal, annuler un paiement crée une écriture inverse).

**Base de données (avant le backend) :**
6. Ajouter à l'audit BD : discipline (`sanctions_disciplinaires`), annonces (`annonces`, `annonce_destinataires`), masquage (colonnes ou table), documents générés (`documents_generes`), rôle et motif dans `journal_activites`.

**Backend (après validation) :**
7. Middleware de permission sur chaque route, filtre par établissement, journal automatique, transactions SQL pour la caisse.

## 12. Plan de travail proposé par priorité

| Priorité | Travail | Pourquoi |
|---|---|---|
| **P1** | Séparer les espaces secrétaire / administrateur ; protéger les routes ; unifier les permissions | Règle fondamentale du prompt + faille du test 5 |
| **P2** | Éléments supprimés / masqués / restauration + journal d'activité (écrans) | Cœur du contrôle de l'administrateur |
| **P3** | Écrans manquants du quotidien : enseignants, matières, parents, inscriptions/réinscriptions, années scolaires | Gestion quotidienne de l'école |
| **P4** | Caisse : paiement visible dans l'historique, annulation par écriture inverse, rapports | Traçabilité financière |
| **P5** | Discipline, emplois du temps (école), documents administratifs, annonces, statistiques | Compléments |
| **P6** | Compléter et valider l'audit BD (D1 à D9 + tables ci-dessus) | Débloque le backend |
| **P7** | Backend Laravel : permissions serveur, isolation, journal, puis tests 1 à 10 rejoués pour de vrai | Seule façon de garantir les règles |
