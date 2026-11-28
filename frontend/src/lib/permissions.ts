/**
 * Catalogue unique des droits d'une secrétaire.
 *
 * Le même catalogue sert :
 *  - à l'écran « Utilisateurs et droits » de l'administrateur (cases à cocher) ;
 *  - au menu de l'espace secrétariat ;
 *  - à la protection de chaque page (une page sans droit affiche « Accès refusé »).
 *
 * Côté Laravel, chaque code deviendra une permission spatie vérifiée par un middleware.
 * Ici, on ne fait qu'afficher : la vraie sécurité sera côté serveur.
 */
export interface Droit {
  code: string;
  libelle: string;
  detail: string;
}
export interface GroupeDroits {
  titre: string;
  droits: Droit[];
}

export const DROITS_SECRETAIRE: GroupeDroits[] = [
  {
    titre: 'Scolarité',
    droits: [
      { code: 'eleves', libelle: 'Élèves', detail: 'Consulter, modifier, changer de classe, enregistrer un départ' },
      { code: 'inscriptions', libelle: 'Inscriptions et réinscriptions', detail: 'Inscrire un nouvel élève, réinscrire un ancien' },
      { code: 'parents', libelle: 'Parents et tuteurs', detail: 'Ajouter, modifier, lier à un élève' },
      { code: 'enseignants', libelle: 'Enseignants', detail: 'Ajouter, modifier, attribuer classes et matières' },
      { code: 'classes', libelle: 'Classes', detail: 'Créer, modifier, capacité, professeur principal' },
      { code: 'matieres', libelle: 'Matières', detail: 'Ajouter, modifier, coefficients' },
      { code: 'archives', libelle: 'Anciennes années', detail: 'Consulter les années scolaires passées (lecture seule)' },
    ],
  },
  {
    titre: 'Vie scolaire',
    droits: [
      { code: 'absences', libelle: 'Absences et retards', detail: 'Enregistrer, justifier, rapports' },
      { code: 'emplois', libelle: 'Emplois du temps', detail: 'Créer et modifier les emplois du temps des classes' },
    ],
  },
  {
    titre: 'Évaluations',
    droits: [
      { code: 'notes', libelle: 'Suivi des notes', detail: 'Voir l’avancement des notes et relancer les enseignants (la validation reste à l’administrateur)' },
      { code: 'bulletins', libelle: 'Bulletins', detail: 'Consulter et imprimer les bulletins (générés automatiquement ; la publication est faite par l’administrateur)' },
    ],
  },
  {
    titre: 'Finances',
    droits: [
      { code: 'caisse', libelle: 'Caisse', detail: 'Encaisser, reçus, impayés, annuler un paiement avec motif' },
      { code: 'depenses', libelle: 'Dépenses', detail: 'Enregistrer une dépense avec justificatif' },
      { code: 'remboursements', libelle: 'Remboursements', detail: 'Demander un remboursement, l’exécuter une fois approuvé' },
      { code: 'clotures', libelle: 'Clôture de caisse', detail: 'Compter la caisse et enregistrer la clôture du jour' },
    ],
  },
  {
    titre: 'Documents et communication',
    droits: [
      { code: 'documents', libelle: 'Documents administratifs', detail: 'Certificats, attestations, listes imprimables' },
      { code: 'annonces', libelle: 'Annonces', detail: 'Publier une annonce aux parents, enseignants ou au personnel' },
      { code: 'statistiques', libelle: 'Statistiques', detail: 'Consulter et exporter les statistiques' },
    ],
  },
  {
    titre: 'Actions sensibles',
    droits: [
      { code: 'masquer', libelle: 'Masquer', detail: 'Masquer un élément avec un motif (l’administrateur le voit toujours)' },
      { code: 'supprimer', libelle: 'Supprimer', detail: 'Supprimer un élément avec un motif (suppression logique, restaurable par l’administrateur)' },
    ],
  },
];

export const TOUS_DROITS_SECRETAIRE = DROITS_SECRETAIRE.flatMap((g) => g.droits.map((d) => d.code));

/** Réservé à l'administrateur : jamais attribuable à une secrétaire. */
export const DROITS_ADMIN_SEULEMENT = [
  'Créer, modifier et désactiver les secrétaires',
  'Attribuer ou retirer des droits',
  'Valider les notes',
  'Approuver ou refuser un remboursement',
  'Publier les bulletins aux parents',
  'Voir le journal complet de l’établissement',
  'Voir et restaurer les éléments masqués ou supprimés',
  'Créer et clôturer une année scolaire',
  'Paramètres de l’établissement',
];

export const libelleDroit = (code: string) => DROITS_SECRETAIRE.flatMap((g) => g.droits).find((d) => d.code === code)?.libelle ?? code;
