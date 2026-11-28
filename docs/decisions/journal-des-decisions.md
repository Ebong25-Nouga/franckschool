# Journal des décisions — FRANCK SCHOOL

Chaque décision est datée, motivée et porte un statut : **Validée** (accord explicite du propriétaire), **Proposée** (en attente de validation) ou **Remplacée**.

| N° | Date | Décision | Motif | Statut | Source |
|---|---|---|---|---|---|
| 001 | 22/11/2026 | Frontend React + Vite + TypeScript + Tailwind ; backend Laravel (API) | Choix du propriétaire | Validée | Échange du 22/11 |
| 002 | 22/11/2026 | Base de données MySQL | Choix du propriétaire | Validée | Échange du 22/11 |
| 003 | 22/11/2026 | Système scolaire camerounais (séquences, trimestres, notes sur 20) | Choix du propriétaire | Validée | Échange du 22/11 |
| 004 | — | Plateforme SaaS multi-établissements, 5 interfaces principales | Document maître | Validée | Document maître V1 |
| 005 | — | La caisse est conçue et n'est pas rouverte | Document maître | Validée | Document maître V1, § 5.10 |
| 006 | — | Matières rattachées directement à la classe | Choix de conception | Validée | Documentation BD V1 |
| 007 | 24/11/2026 | Tables `emplois_temps` et `absences_retards` incluses | Réponse du propriétaire | Validée | Échange du 24/11 |
| 008 | 24/11/2026 | Pas de réductions sur les frais | Réponse du propriétaire | Validée | Échange du 24/11 |
| 009 | 24/11/2026 | Couleur principale de l'interface : bleu (couleur de l'école) | Demande du propriétaire | Validée | Échange du 24/11 |
| 010 | 24/11/2026 | Documentation dans Git (`docs/`) plutôt qu'en base | Audit BD § 6 | Proposée | Audit BD V1 |
| D1–D9 | 24/11/2026 | Corrections du modèle de données (isolation, permissions, versions…) | Audit BD § 8 | Proposée | Audit BD V1 |
| 011 | 25/11/2026 | Formulaire « Demander une démonstration » : pas de stockage en base ; la demande sera envoyée sur le WhatsApp du propriétaire (lien avec message prérempli) | Demande du propriétaire | Validée, à mettre en place plus tard | Échange du 25/11 |
| 012 | 25/11/2026 | Page d'accueil validée (11 sections, vidéo Remotion, tarifs provisoires) | Validation du propriétaire | Validée | Échange du 25/11 |
| 013 | 25/11/2026 | Espace parent : structure en 8 parties (Accueil, Mes enfants, Informations scolaires, Notes et bulletins, Paiements et historique, Reçus, Notifications, Paramètres du compte), sans tableau de bord ; « Communication » retirée | Demande du propriétaire | Validée | Échange du 25/11 |
| 014 | 25/11/2026 | Les parents voient les notes et téléchargent les bulletins (point à confirmer du document maître § 3.6) | Structure fournie par le propriétaire | Validée | Échange du 25/11 |
| 015 | 25/11/2026 | Paiement en ligne depuis l'espace parent (MTN MoMo, Orange Money) ; agrégateur de paiement à choisir lors du backend | Demande du propriétaire | Validée, interface faite | Échange du 25/11 |
| 016 | 25/11/2026 | Espace enseignant unique : professeur simple et professeur titulaire, différenciés par les permissions ; menu commun (Accueil, Mon profil, Mes classes, Mes matières, Listes des élèves, Saisie des notes, Notes soumises, Demandes de correction, Emploi du temps, Notifications, Paramètres) et rubrique « Ma classe principale » pour le titulaire (consultation seule) | Spécification du propriétaire | Validée | Échange du 25/11 |
| 017 | 25/11/2026 | Accueil enseignant : tableau de bord sur ordinateur, page simple sur téléphone ; emploi du temps provisoire | Demande du propriétaire | Validée | Échange du 25/11 |
| 018 | 27/11/2026 | Espace enseignant validé en l'état ; les points ouverts sont gardés pour plus tard (voir docs/decisions/points-ouverts.md) | Validation du propriétaire | Validée | Échange du 27/11 |
| 019 | 27/11/2026 | Secrétaire et administrateur ont deux espaces séparés. Le secrétariat est fait en premier (`/secretariat`), l'administration sera refaite ensuite | Demande du propriétaire après l'audit | Validée | Échange du 27/11 |
| 020 | 27/11/2026 | Catalogue unique de droits (`frontend/src/lib/permissions.ts`) : il sert au menu, à la protection de chaque page et, plus tard, à l'écran de l'administrateur et aux permissions Laravel | Audit secrétaire/admin, faille du test 5 | Proposée | Audit V1 § 11 |
| 021 | 27/11/2026 | Masquer et Supprimer demandent un motif ; la suppression est logique, l'administrateur voit et restaure ; une opération de caisse ne s'efface pas, elle s'annule par une écriture inverse ; le journal ne peut être ni modifié ni effacé | Prompt d'audit du propriétaire | Proposée | Audit V1 § 7 et 8 |
| 022 | 28/11/2026 | Chaque école a son propre lien (`franckschool.cm/etoiles`) ; la secrétaire le partage dans le groupe WhatsApp des parents, **sans aucun identifiant dedans** | Demande du propriétaire | Validée | Échange du 28/11 |
| 023 | 28/11/2026 | Identifiants du parent (téléphone + code provisoire) remis individuellement par la secrétaire : **en message WhatsApp privé ou en personne**, pas de fiche imprimée ; le parent change le code à la première connexion | Demande du propriétaire | Validée | Échange du 28/11 |
| 024 | 28/11/2026 | Un parent qui a des enfants dans deux écoles a **un compte par école** (il se connecte par le lien de chaque école) | Conséquence du lien par école | Proposée | Échange du 28/11 |
| 025 | 28/11/2026 | Liste des élèves : colonne Actions (Modifier, et menu : dossier, changer de classe, départ, masquer, supprimer selon les droits) | Demande du propriétaire | Validée | Échange du 28/11 |
