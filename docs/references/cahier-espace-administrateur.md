# FRANCK SCHOOL — Cahier des fonctionnalités : espace administrateur d'établissement

> Texte fourni par le propriétaire le 28/11/2026. Document de référence pour l'interface 3b (administration).

## 1. Présentation générale

L'administrateur est le responsable principal d'un établissement scolaire inscrit sur la plateforme FRANCK SCHOOL. Il dispose des droits de gestion et de contrôle sur l'ensemble des activités de son établissement : élèves, enseignants, secrétaires, classes, matières, parents, finances, années scolaires et paramètres. Il travaille avec une secrétaire qui dispose également de droits de gestion étendus, mais qui reste sous son autorité.

Important :
- L'administrateur ne peut gérer que son propre établissement.
- Il ne peut pas accéder aux données des autres établissements.
- Il dispose de droits supérieurs à ceux de la secrétaire.
- Toutes les opérations importantes doivent être traçables.
- Les données des anciennes années scolaires doivent être conservées.

## 2. Tableau de bord général

Nombre total d'élèves, d'enseignants, de secrétaires, de classes ; effectifs par classe ; statistiques financières ; nombre d'élèves inscrits, d'anciens élèves, de nouveaux élèves, de redoublants ; notifications récentes ; activités récentes ; alertes importantes ; informations sur l'année scolaire active.

## 3. Gestion des élèves

Ajouter un élève ; modifier ses informations ; consulter sa fiche ; l'affecter à une classe ; le changer de classe ; gérer les inscriptions et réinscriptions ; identifier les nouveaux, anciens et redoublants ; enregistrer les informations du tuteur ; consulter les informations des parents ; consulter les historiques scolaires ; gérer les départs ; retrouver les anciens élèves ; consulter les élèves par classe ; consulter les informations de scolarité.

## 4. Gestion des enseignants

Ajouter, modifier, consulter la fiche ; activer ou désactiver le compte ; supprimer le compte selon les règles de conservation ; affecter à une ou plusieurs classes ; attribuer une ou plusieurs matières ; définir les responsabilités pédagogiques ; consulter les classes et matières ; consulter les activités pédagogiques ; suivre les notes soumises ; consulter les corrections demandées ; suivre les soumissions et validations des notes.

Catégories : professeur simple, professeur titulaire, professeur principal (selon l'organisation pédagogique retenue).

## 5. Gestion des secrétaires

Créer plusieurs comptes secrétaires ; modifier leurs informations ; activer ou désactiver leurs comptes ; consulter leurs profils, activités, opérations, modifications, éléments supprimés de leur interface, historique d'activité ; contrôler leurs opérations.

La secrétaire gère une grande partie des opérations quotidiennes ; l'administrateur conserve le contrôle général. Une suppression par la secrétaire n'efface jamais définitivement les données : les éléments supprimés restent consultables par l'administrateur.

## 6. Gestion des classes

Créer, modifier, supprimer ou archiver ; consulter ; affecter les élèves et les enseignants ; désigner un professeur titulaire ou principal ; définir la salle ; consulter les effectifs, les matières associées et les résultats.

Règle de conception : les matières sont directement associées aux classes par `classe_id`.

## 7. Gestion des matières

Créer, modifier, supprimer ou archiver ; associer à une classe ; définir les coefficients ; affecter les enseignants responsables ; consulter les matières par classe et les enseignants associés.

## 8. Gestion des notes et validation

Consulter les notes soumises, par élève, par matière, par classe, par séquence ; vérifier ; valider ; rejeter une soumission ; demander une correction avec commentaire ; suivre les corrections ; consulter l'historique des validations.

Circuit : 1. l'enseignant saisit ; 2. il soumet ; 3. l'administrateur consulte ; 4. il vérifie ; 5. il valide ou demande une correction ; 6. l'enseignant corrige ; 7. il soumet à nouveau ; 8. l'administrateur valide définitivement.

## 9. Calculs et gestion automatisée des bulletins

**L'administrateur ne gère pas manuellement les bulletins.** Après validation des notes, la plateforme calcule automatiquement : moyennes par matière, moyennes générales, moyennes après chaque séquence, agrégation trimestrielle, rangs, mentions selon les règles configurées, moyennes minimale et maximale de la classe ; elle prépare les bulletins trimestriels, les génère en PDF et conserve les anciens bulletins.

Contenu des bulletins : informations de l'établissement et de l'élève, classe, matières, notes, coefficients, moyennes, rangs, moyenne générale, mentions, appréciations pédagogiques, professeur principal ou titulaire.

Rôle de l'administrateur : valider les notes, consulter les résultats calculés et les bulletins générés, suivre leur disponibilité.

## 10. Gestion des parents

Créer des comptes parents ; modifier ; consulter les profils ; associer un parent à un ou plusieurs enfants ; générer et transmettre les liens d'accès ; activer ou désactiver un accès ; consulter les comptes ; suivre les communications.

Les élèves n'ont pas de compte indépendant : ils utilisent le compte parent.

## 11. Gestion financière et caisse

Enregistrer et consulter les paiements ; suivre les frais à payer et les soldes ; opérations de caisse ; paiements manuels ; suivi MTN Mobile Money et Orange Money ; reçus PDF ; historique ; impayés ; statistiques financières ; encaissements. L'administrateur supervise les opérations financières.

## 12. Gestion des années scolaires

Créer une année ; modifier ses paramètres ; définir l'année active ; consulter les anciennes années, classes, élèves, notes, résultats et bulletins ; conserver les historiques ; préparer le passage à une nouvelle année. Le changement d'année ne supprime jamais les données précédentes.

## 13. Communication et notifications

Consulter les notifications ; envoyer des informations aux parents (paiements, résultats) ; suivre les communications ; communiquer avec les enseignants ; envoyer des annonces importantes ; consulter les alertes de la plateforme. Bulletins et informations transmis notamment par e-mail et dans l'application.

## 14. Paramètres de l'établissement

Nom, coordonnées, adresse, logo ; informations administratives ; informations affichées sur les bulletins ; paramètres scolaires ; informations de l'année scolaire.

## 15. Historique et traçabilité

Actions des secrétaires et des enseignants ; modifications ; auteur, date et heure de chaque opération ; éléments supprimés de l'interface ; anciennes et nouvelles valeurs ; validations des notes ; historiques de paiement ; opérations sensibles. Les journaux ne sont ni modifiables ni supprimables par les utilisateurs ordinaires.

## 16. Compte administrateur

Profil ; informations personnelles autorisées ; mot de passe ; informations de connexion ; historique de connexion ; notifications de sécurité ; déconnexion.

## 17. Organisation du menu

1. Tableau de bord · 2. Élèves · 3. Enseignants · 4. Secrétaires · 5. Classes · 6. Matières · 7. Notes et validation · 8. Résultats et bulletins (consultation) · 9. Parents · 10. Caisse · 11. Années scolaires · 12. Notifications · 13. Historique des activités · 14. Paramètres de l'établissement · 15. Mon profil

## 18. Règles fondamentales

1. L'administrateur contrôle uniquement son établissement.
2. Il dispose de droits supérieurs à ceux de la secrétaire.
3. Il peut créer plusieurs comptes secrétaires.
4. La secrétaire gère les opérations quotidiennes autorisées.
5. Les opérations importantes sont enregistrées dans les journaux d'activité.
6. Les suppressions respectent les règles de conservation des données.
7. Les enseignants saisissent et soumettent les notes.
8. L'administrateur vérifie et valide les notes.
9. Les calculs scolaires et la génération des bulletins sont automatisés.
10. L'administrateur ne gère pas manuellement les bulletins.
11. Les données des anciennes années scolaires sont conservées.
12. Les parents utilisent leurs propres comptes pour consulter les informations de leurs enfants.
13. Les données d'un établissement restent isolées de celles des autres établissements.
