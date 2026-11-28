/**
 * Données d'exemple utilisées tant que l'API Laravel n'est pas branchée.
 * Elles suivent le modèle de l'audit BD V1 (docs/base-de-donnees/audit-bd-v1.md).
 */

export const ecole = {
  nom: 'Collège Bilingue Les Étoiles',
  court: 'Les Étoiles',
  sigle: 'CBE',
  ville: 'Yaoundé',
  quartier: 'Bastos',
  telephone: '+237 222 20 30 40',
  email: 'contact@etoiles.cm',
  annee: '2026-2027',
  devise: 'Travail · Discipline · Réussite',
  /** Nom court unique : le lien de l'école est franckschool.cm/etoiles */
  lien: 'etoiles',
};

/* ---------- Calendrier camerounais : 3 trimestres, 6 séquences ---------- */
export type EtatSequence = 'cloturee' | 'en_cours' | 'a_venir';
export const sequences: { n: number; trimestre: number; debut: string; fin: string; etat: EtatSequence; saisie?: number }[] = [
  { n: 1, trimestre: 1, debut: '08 sept.', fin: '10 oct.', etat: 'cloturee', saisie: 100 },
  { n: 2, trimestre: 1, debut: '13 oct.', fin: '05 déc.', etat: 'en_cours', saisie: 64 },
  { n: 3, trimestre: 2, debut: '05 janv.', fin: '13 févr.', etat: 'a_venir' },
  { n: 4, trimestre: 2, debut: '16 févr.', fin: '27 mars', etat: 'a_venir' },
  { n: 5, trimestre: 3, debut: '13 avr.', fin: '15 mai', etat: 'a_venir' },
  { n: 6, trimestre: 3, debut: '18 mai', fin: '12 juin', etat: 'a_venir' },
];

/* ---------- Élèves ---------- */
export type StatutEleve = 'nouveau' | 'ancien' | 'redoublant';
export interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  lieuNaissance: string;
  classe: string;
  statut: StatutEleve;
  tuteur: string;
  lien: string;
  telephone: string;
  du: number;
  paye: number;
  moyenne: number;
  absences: number;
}

const noms = ['Mbarga', 'Nkoulou', 'Fotso', 'Tchoumi', 'Ngo Bassa', 'Abena', 'Kamga', 'Essomba', 'Djoumessi', 'Owona', 'Atangana', 'Nana', 'Ekotto', 'Biyong', 'Mvondo', 'Tagne', 'Manga', 'Simo', 'Ndjock', 'Eyenga'];
const prenomsF = ['Marie-Claire', 'Grâce', 'Aïcha', 'Brenda', 'Linda', 'Christelle', 'Ornella', 'Sandrine', 'Nadège', 'Princesse'];
const prenomsM = ['Junior', 'Arnaud', 'Ibrahim', 'Stève', 'Boris', 'Cédric', 'Yannick', 'Franck', 'Loïc', 'Ulrich'];
const lieux = ['Yaoundé', 'Douala', 'Bafoussam', 'Ebolowa', 'Bertoua', 'Kribi'];
export const classes = ['6ème A', '6ème B', '5ème A', '4ème A', '3ème A', '2nde C', '1ère D', 'Tle C'];
const statuts: StatutEleve[] = ['ancien', 'ancien', 'nouveau', 'ancien', 'redoublant'];
const moyennes = [15.42, 12.08, 9.35, 13.7, 11.15, 8.6, 16.25, 10.4, 14.05, 7.9, 12.85, 10.95];

export const eleves: Eleve[] = Array.from({ length: 40 }, (_, i) => {
  const f = i % 2 === 0;
  const nom = noms[i % noms.length];
  const classe = classes[i % classes.length];
  const du = classe.startsWith('Tle') || classe.startsWith('1ère') ? 185000 : 150000;
  const paye = [du, du, Math.round(du * 0.6), Math.round(du * 0.3), du, 0, Math.round(du * 0.8)][i % 7];
  return {
    id: i + 1,
    matricule: `CBE26-${String(i + 1).padStart(4, '0')}`,
    nom: nom.toUpperCase(),
    prenom: f ? prenomsF[i % prenomsF.length] : prenomsM[i % prenomsM.length],
    sexe: f ? 'F' : 'M',
    dateNaissance: `${2009 + (i % 6)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
    lieuNaissance: lieux[i % lieux.length],
    classe,
    statut: statuts[i % statuts.length],
    tuteur: `${i % 3 ? 'M.' : 'Mme'} ${nom} ${['Odile', 'Martin', 'Pauline', 'Jacques', 'Hélène'][i % 5]}`,
    lien: i % 3 ? 'Père' : 'Mère',
    telephone: `+237 6${70 + (i % 29)} ${String(100 + i * 7).slice(-3)} ${String(200 + i * 13).slice(-3)}`,
    du,
    paye,
    moyenne: moyennes[i % moyennes.length],
    absences: [0, 2, 0, 5, 1, 0, 8, 3][i % 8],
  };
});

export const effectifs: Record<string, number> = { '6ème A': 48, '6ème B': 46, '5ème A': 51, '4ème A': 44, '3ème A': 42, '2nde C': 39, '1ère D': 37, 'Tle C': 35 };

/* ---------- Professeurs ---------- */
export const professeurs = [
  { id: 1, nom: 'M. ESSOMBA Paul', specialite: 'Mathématiques', classes: ['3ème A', 'Tle C'], principal: 'Tle C', contrat: 'Permanent', heures: 18, telephone: '+237 677 12 45 90' },
  { id: 2, nom: 'Mme NGO BASSA Rose', specialite: 'Français', classes: ['6ème A', '6ème B', '5ème A'], principal: '6ème A', contrat: 'Permanent', heures: 20, telephone: '+237 699 30 11 02' },
  { id: 3, nom: 'M. FOTSO Alain', specialite: 'Physique-Chimie', classes: ['2nde C', '1ère D', 'Tle C'], principal: null, contrat: 'Vacataire', heures: 12, telephone: '+237 655 78 21 44' },
  { id: 4, nom: 'Mme ABENA Lucie', specialite: 'Anglais', classes: ['4ème A', '3ème A'], principal: '4ème A', contrat: 'Permanent', heures: 16, telephone: '+237 691 05 66 13' },
  { id: 5, nom: 'M. KAMGA Hervé', specialite: 'Histoire-Géographie', classes: ['5ème A', '4ème A', '3ème A'], principal: null, contrat: 'Vacataire', heures: 9, telephone: '+237 674 90 32 18' },
  { id: 6, nom: 'Mme OWONA Sylvie', specialite: 'SVT', classes: ['2nde C', '1ère D'], principal: '1ère D', contrat: 'Permanent', heures: 14, telephone: '+237 682 44 07 51' },
  { id: 7, nom: 'M. TAGNE Serge', specialite: 'Informatique', classes: ['2nde C', '1ère D', 'Tle C'], principal: null, contrat: 'Vacataire', heures: 6, telephone: '+237 650 19 88 30' },
  { id: 8, nom: 'Mme EYENGA Rachel', specialite: 'EPS', classes: ['6ème A', '6ème B', '5ème A', '4ème A'], principal: '6ème B', contrat: 'Permanent', heures: 16, telephone: '+237 696 23 40 77' },
];

export const matieresClasse = [
  { code: 'FRAN', nom: 'Français', coef: 4, groupe: 1, prof: 'Mme NGO BASSA' },
  { code: 'ANG', nom: 'Anglais', coef: 3, groupe: 1, prof: 'Mme ABENA' },
  { code: 'HG', nom: 'Histoire-Géographie', coef: 2, groupe: 1, prof: 'M. KAMGA' },
  { code: 'MATH', nom: 'Mathématiques', coef: 5, groupe: 2, prof: 'M. ESSOMBA' },
  { code: 'PC', nom: 'Physique-Chimie', coef: 4, groupe: 2, prof: 'M. FOTSO' },
  { code: 'SVT', nom: 'SVT', coef: 2, groupe: 2, prof: 'Mme OWONA' },
  { code: 'INFO', nom: 'Informatique', coef: 1, groupe: 2, prof: 'M. TAGNE' },
  { code: 'ECM', nom: 'Éducation civique', coef: 1, groupe: 3, prof: 'M. KAMGA' },
  { code: 'EPS', nom: 'EPS', coef: 1, groupe: 3, prof: 'Mme EYENGA' },
];

/* ---------- Notes à valider ---------- */
export const evaluationsAValider = [
  { id: 1, classe: '3ème A', matiere: 'Mathématiques', prof: 'M. ESSOMBA Paul', type: 'Devoir surveillé', soumise: 'il y a 40 min', notes: 42, moyenne: 11.84, sousLaMoyenne: 15, min: 3.5, max: 18.75, statut: 'soumise' },
  { id: 2, classe: '4ème A', matiere: 'Anglais', prof: 'Mme ABENA Lucie', type: 'Composition', soumise: 'il y a 3 h', notes: 44, moyenne: 12.6, sousLaMoyenne: 11, min: 6, max: 19, statut: 'soumise' },
  { id: 3, classe: '6ème A', matiere: 'Français', prof: 'Mme NGO BASSA Rose', type: 'Composition', soumise: 'hier', notes: 48, moyenne: 10.92, sousLaMoyenne: 21, min: 4, max: 17.5, statut: 'validee' },
  { id: 4, classe: 'Tle C', matiere: 'Physique-Chimie', prof: 'M. FOTSO Alain', type: 'Interrogation', soumise: '—', notes: 21, moyenne: 9.7, sousLaMoyenne: 12, min: 2, max: 16, statut: 'brouillon' },
  { id: 5, classe: '1ère D', matiere: 'SVT', prof: 'Mme OWONA Sylvie', type: 'Composition', soumise: 'il y a 2 j', notes: 37, moyenne: 13.15, sousLaMoyenne: 6, min: 7.5, max: 18, statut: 'validee' },
];

export const avancementSaisie = [
  { classe: '6ème A', fait: 9, total: 9 },
  { classe: '6ème B', fait: 7, total: 9 },
  { classe: '5ème A', fait: 6, total: 9 },
  { classe: '4ème A', fait: 5, total: 9 },
  { classe: '3ème A', fait: 6, total: 9 },
  { classe: '2nde C', fait: 4, total: 10 },
  { classe: '1ère D', fait: 6, total: 10 },
  { classe: 'Tle C', fait: 3, total: 10 },
];

/* ---------- Caisse ---------- */
export type TypeTransaction = 'recette' | 'depense' | 'remboursement';
export type Mode = 'Espèces' | 'MTN MoMo' | 'Orange Money' | 'Banque';
export interface Transaction {
  id: number;
  numero: string;
  date: string;
  type: TypeTransaction;
  libelle: string;
  eleve?: string;
  classe?: string;
  mode: Mode;
  montant: number;
  auteur: string;
  reference?: string;
}

export const transactions: Transaction[] = [
  { id: 1, numero: 'TR-000482', date: '2026-11-24T09:12', type: 'recette', libelle: 'Scolarité, 2e tranche', eleve: 'MBARGA Marie-Claire', classe: '4ème A', mode: 'MTN MoMo', montant: 50000, auteur: 'Nadine E.', reference: 'MP261124.0912.A83' },
  { id: 2, numero: 'TR-000481', date: '2026-11-24T08:47', type: 'recette', libelle: "Frais d'examen", eleve: 'FOTSO Ibrahim', classe: '3ème A', mode: 'Espèces', montant: 15000, auteur: 'Nadine E.' },
  { id: 3, numero: 'TR-000480', date: '2026-11-23T16:30', type: 'depense', libelle: 'Craies, marqueurs et registres', mode: 'Espèces', montant: 18500, auteur: 'J.-P. Manga' },
  { id: 4, numero: 'TR-000479', date: '2026-11-23T11:05', type: 'recette', libelle: 'Scolarité, 1re tranche', eleve: 'TCHOUMI Brenda', classe: '2nde C', mode: 'Orange Money', montant: 75000, auteur: 'Paul B.', reference: 'OM2311.1105.77Q' },
  { id: 5, numero: 'TR-000478', date: '2026-11-22T14:20', type: 'remboursement', libelle: 'Trop-perçu scolarité', eleve: 'KAMGA Arnaud', classe: '6ème B', mode: 'Espèces', montant: 10000, auteur: 'Nadine E.' },
  { id: 6, numero: 'TR-000477', date: '2026-11-22T10:02', type: 'recette', libelle: 'Inscription', eleve: 'ESSOMBA Grâce', classe: '6ème A', mode: 'Banque', montant: 25000, auteur: 'Paul B.', reference: 'AFB-VIR-55120' },
  { id: 7, numero: 'TR-000476', date: '2026-11-21T15:44', type: 'depense', libelle: 'Facture ENEO, électricité', mode: 'MTN MoMo', montant: 64300, auteur: 'J.-P. Manga', reference: 'MP2111.1544.K02' },
  { id: 8, numero: 'TR-000475', date: '2026-11-21T09:18', type: 'recette', libelle: 'APE', eleve: 'OWONA Stève', classe: '1ère D', mode: 'Espèces', montant: 10000, auteur: 'Nadine E.' },
  { id: 9, numero: 'TR-000474', date: '2026-11-20T13:40', type: 'recette', libelle: 'Scolarité, 2e tranche', eleve: 'ATANGANA Christelle', classe: 'Tle C', mode: 'MTN MoMo', montant: 60000, auteur: 'Paul B.', reference: 'MP2011.1340.Z19' },
  { id: 10, numero: 'TR-000473', date: '2026-11-20T08:15', type: 'depense', libelle: 'Réparation photocopieuse', mode: 'Espèces', montant: 35000, auteur: 'J.-P. Manga' },
];

export const encaissementsMensuels = [
  { mois: 'Sept.', recettes: 18.4, depenses: 4.1 },
  { mois: 'Oct.', recettes: 11.8, depenses: 4.6 },
  { mois: 'Nov.', recettes: 7.9, depenses: 3.2 },
];

export const repartitionModes = [
  { mode: 'Espèces', part: 46, couleur: '#1C32A5' },
  { mode: 'MTN MoMo', part: 31, couleur: '#F2C200' },
  { mode: 'Orange Money', part: 17, couleur: '#E8761E' },
  { mode: 'Banque', part: 6, couleur: '#8790AD' },
];

export const tranches = [
  { libelle: 'Inscription', montant: 25000, limite: '05/09/2026' },
  { libelle: '1re tranche', montant: 50000, limite: '30/09/2026' },
  { libelle: '2e tranche', montant: 50000, limite: '30/11/2026' },
  { libelle: '3e tranche', montant: 25000, limite: '15/01/2027' },
];

export const demandesRemboursement = [
  { id: 1, eleve: 'NANA Linda', classe: '4ème A', montant: 25000, motif: "Départ de l'établissement en novembre (mutation des parents à Garoua).", demandeur: 'Nadine Ekotto', date: '24/11/2026', statut: 'en_attente' as const, paiement: 'TR-000402' },
  { id: 2, eleve: 'BIYONG Cédric', classe: '2nde C', montant: 15000, motif: "Frais d'examen payés deux fois (espèces puis MTN MoMo).", demandeur: 'Paul Biyong', date: '23/11/2026', statut: 'en_attente' as const, paiement: 'TR-000455' },
  { id: 3, eleve: 'KAMGA Arnaud', classe: '6ème B', montant: 10000, motif: 'Trop-perçu sur la 2e tranche.', demandeur: 'Nadine Ekotto', date: '20/11/2026', statut: 'executee' as const, paiement: 'TR-000431' },
  { id: 4, eleve: 'SIMO Ornella', classe: '1ère D', montant: 50000, motif: 'Erreur de tranche signalée par le parent.', demandeur: 'Paul Biyong', date: '18/11/2026', statut: 'refusee' as const, paiement: 'TR-000398', decision: 'Pas d’erreur : la 2e tranche était bien due.' },
];

/* ---------- Vie scolaire ---------- */
export const absences = [
  { id: 1, eleve: 'NDJOCK Ulrich', classe: '3ème A', type: 'absence', date: '24/11/2026', creneau: '07:30 – 12:30', matiere: 'Mathématiques, Anglais', statut: 'non_justifiee' },
  { id: 2, eleve: 'ABENA Cédric', classe: '6ème B', type: 'retard', date: '24/11/2026', creneau: '07:52', matiere: 'Français', statut: 'non_justifiee', duree: '22 min' },
  { id: 3, eleve: 'EYENGA Princesse', classe: 'Tle C', type: 'absence', date: '23/11/2026', creneau: 'Journée', matiere: '—', statut: 'justifiee', motif: 'Certificat médical' },
  { id: 4, eleve: 'MVONDO Boris', classe: '1ère D', type: 'absence', date: '23/11/2026', creneau: '13:00 – 15:00', matiere: 'SVT', statut: 'en_attente', motif: 'Mot du parent à vérifier' },
  { id: 5, eleve: 'SIMO Ornella', classe: '1ère D', type: 'retard', date: '21/11/2026', creneau: '07:45', matiere: 'Philosophie', statut: 'justifiee', duree: '15 min', motif: 'Embouteillage signalé' },
  { id: 6, eleve: 'TAGNE Yannick', classe: '5ème A', type: 'absence', date: '20/11/2026', creneau: '07:30 – 10:30', matiere: 'SVT, Histoire', statut: 'non_justifiee' },
];

/* ---------- Journal et notifications ---------- */
export const activites = [
  { qui: 'Nadine Ekotto', quoi: 'a encaissé 50 000 FCFA (MTN MoMo) pour MBARGA Marie-Claire', quand: '09:12', type: 'caisse' },
  { qui: 'M. ESSOMBA Paul', quoi: 'a soumis les notes de Mathématiques, 3ème A', quand: '08:55', type: 'notes' },
  { qui: 'Paul Biyong', quoi: 'a inscrit TAGNE Yannick en 5ème A', quand: '08:20', type: 'eleves' },
  { qui: 'Nadine Ekotto', quoi: 'a demandé un remboursement de 25 000 FCFA', quand: 'Hier, 17:40', type: 'remboursement' },
  { qui: 'Jean-Pierre Manga', quoi: 'a validé les notes de Français, 6ème A', quand: 'Hier, 15:02', type: 'notes' },
  { qui: 'Jean-Pierre Manga', quoi: 'a retiré la permission « Bulletins » à Carine Tagne', quand: 'Hier, 11:30', type: 'droits' },
];

export const notifications = [
  { id: 1, titre: 'Remboursement à décider', texte: 'Nadine Ekotto demande 25 000 FCFA pour NANA Linda.', quand: 'il y a 2 h', lu: false, type: 'remboursement' },
  { id: 2, titre: 'Notes soumises', texte: 'M. ESSOMBA a soumis les notes de Mathématiques, 3ème A.', quand: 'il y a 40 min', lu: false, type: 'notes' },
  { id: 3, titre: 'Clôture de caisse', texte: 'La caisse n’a pas été clôturée depuis 3 jours.', quand: 'ce matin', lu: false, type: 'caisse' },
  { id: 4, titre: 'Nouvel élève', texte: 'TAGNE Yannick a été inscrit en 5ème A.', quand: 'ce matin', lu: true, type: 'eleves' },
];

export const etablissements = [
  { id: 1, nom: 'Collège Bilingue Les Étoiles', ville: 'Yaoundé', region: 'Centre', eleves: 842, utilisateurs: 46, statut: 'actif', abonnement: 'Standard', couleur: '#1C32A5', depuis: 'sept. 2026', recouvrement: 78 },
  { id: 2, nom: 'Institut Saint-Joseph', ville: 'Douala', region: 'Littoral', eleves: 1290, utilisateurs: 71, statut: 'actif', abonnement: 'Premium', couleur: '#0F766E', depuis: 'août 2026', recouvrement: 84 },
  { id: 3, nom: 'Complexe Scolaire La Réussite', ville: 'Bafoussam', region: 'Ouest', eleves: 516, utilisateurs: 29, statut: 'actif', abonnement: 'Standard', couleur: '#9A3412', depuis: 'sept. 2026', recouvrement: 69 },
  { id: 4, nom: 'Lycée Privé Excellence', ville: 'Garoua', region: 'Nord', eleves: 388, utilisateurs: 22, statut: 'essai', abonnement: 'Essai 30 j', couleur: '#4338CA', depuis: 'nov. 2026', recouvrement: 52 },
  { id: 5, nom: 'École Les Bourgeons', ville: 'Bamenda', region: 'Nord-Ouest', eleves: 214, utilisateurs: 14, statut: 'suspendu', abonnement: 'Basique', couleur: '#BE185D', depuis: 'janv. 2026', recouvrement: 41 },
];

export const journalPlateforme = [
  { quand: '24/11 09:12', ecole: 'Les Étoiles', qui: 'Nadine Ekotto', action: 'Encaissement', detail: '50 000 FCFA · MTN MoMo · TR-000482' },
  { quand: '24/11 08:59', ecole: 'Saint-Joseph', qui: 'Admin S.-J.', action: 'Clôture de caisse', detail: 'Écart espèces : 0 FCFA' },
  { quand: '24/11 08:55', ecole: 'Les Étoiles', qui: 'M. ESSOMBA', action: 'Notes soumises', detail: 'Mathématiques · 3ème A · Séquence 2' },
  { quand: '24/11 08:31', ecole: 'La Réussite', qui: 'Secrétaire R.', action: 'Désactivation', detail: 'Compte « Secrétaire 3 » désactivé' },
  { quand: '23/11 18:02', ecole: 'Excellence', qui: 'Super Admin', action: 'Création', detail: 'Établissement créé, essai 30 jours' },
  { quand: '23/11 17:40', ecole: 'Les Étoiles', qui: 'Nadine Ekotto', action: 'Demande de remboursement', detail: '25 000 FCFA · NANA Linda' },
];

export const emploiDuTemps = [
  { jour: 'Lundi', creneaux: [{ debut: '07:30', fin: '09:30', m: 'Mathématiques', c: '3ème A', s: 'Salle 12' }, { debut: '10:30', fin: '12:30', m: 'Mathématiques', c: 'Tle C', s: 'Salle 4' }] },
  { jour: 'Mardi', creneaux: [{ debut: '07:30', fin: '09:30', m: 'Mathématiques', c: 'Tle C', s: 'Salle 4' }, { debut: '13:00', fin: '14:00', m: 'Vie de classe', c: 'Tle C', s: 'Salle 4' }] },
  { jour: 'Mercredi', creneaux: [{ debut: '08:30', fin: '10:30', m: 'Mathématiques', c: '3ème A', s: 'Salle 12' }] },
  { jour: 'Jeudi', creneaux: [{ debut: '10:30', fin: '12:30', m: 'Mathématiques', c: 'Tle C', s: 'Salle 4' }, { debut: '13:00', fin: '15:00', m: 'Mathématiques', c: '3ème A', s: 'Salle 12' }] },
  { jour: 'Vendredi', creneaux: [{ debut: '07:30', fin: '09:30', m: 'Mathématiques', c: 'Tle C', s: 'Salle 4' }] },
];

/* ---------- Utilitaires ---------- */
export const fcfa = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
export const fcfaCourt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M` : new Intl.NumberFormat('fr-FR').format(n));
export const note = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const appreciation = (n: number) => (n >= 18 ? 'Excellent' : n >= 16 ? 'Très bien' : n >= 14 ? 'Bien' : n >= 12 ? 'Assez bien' : n >= 10 ? 'Passable' : n >= 8 ? 'Insuffisant' : 'Faible');
