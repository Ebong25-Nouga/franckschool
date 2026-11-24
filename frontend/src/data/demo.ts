/**
 * Données d'exemple utilisées tant que l'API Laravel n'est pas branchée.
 * Elles suivent le modèle de l'audit BD V1 (docs/base-de-donnees/audit-bd-v1.md).
 */

export const ecole = {
  nom: 'Collège Bilingue Les Étoiles',
  sigle: 'CBE',
  ville: 'Yaoundé',
  annee: '2026-2027',
  periodeCourante: 'Séquence 2',
};

export type StatutEleve = 'nouveau' | 'ancien' | 'redoublant';

export interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  classe: string;
  statut: StatutEleve;
  tuteur: string;
  telephone: string;
  du: number;
  paye: number;
}

const noms = ['Mbarga', 'Nkoulou', 'Fotso', 'Tchoumi', 'Ngo Bassa', 'Abena', 'Kamga', 'Essomba', 'Djoumessi', 'Owona', 'Atangana', 'Nana', 'Ekotto', 'Biyong', 'Mvondo', 'Tagne', 'Manga', 'Simo'];
const prenomsF = ['Marie-Claire', 'Grâce', 'Aïcha', 'Brenda', 'Linda', 'Christelle', 'Ornella', 'Sandrine', 'Nadège'];
const prenomsM = ['Junior', 'Arnaud', 'Ibrahim', 'Stève', 'Boris', 'Cédric', 'Yannick', 'Franck', 'Loïc'];
export const classes = ['6ème A', '6ème B', '5ème A', '4ème A', '3ème A', '2nde C', '1ère D', 'Tle C'];
const statuts: StatutEleve[] = ['ancien', 'ancien', 'nouveau', 'ancien', 'redoublant'];

export const eleves: Eleve[] = Array.from({ length: 36 }, (_, i) => {
  const f = i % 2 === 0;
  const nom = noms[i % noms.length];
  const classe = classes[i % classes.length];
  const du = classe.startsWith('Tle') || classe.startsWith('1ère') ? 185000 : 150000;
  const paye = [du, du, Math.round(du * 0.6), Math.round(du * 0.3), du, 0][i % 6];
  return {
    id: i + 1,
    matricule: `CBE26-${String(i + 1).padStart(4, '0')}`,
    nom: nom.toUpperCase(),
    prenom: f ? prenomsF[i % prenomsF.length] : prenomsM[i % prenomsM.length],
    sexe: f ? 'F' : 'M',
    dateNaissance: `${2008 + (i % 6)}-0${(i % 9) + 1}-1${i % 9}`,
    classe,
    statut: statuts[i % statuts.length],
    tuteur: `${f ? 'M.' : 'Mme'} ${nom}`,
    telephone: `+237 6${(70 + (i % 29)).toString()} ${String(100 + i * 7).slice(-3)} ${String(200 + i * 13).slice(-3)}`,
    du,
    paye,
  };
});

export const professeurs = [
  { id: 1, nom: 'M. ESSOMBA Paul', specialite: 'Mathématiques', classes: ['3ème A', 'Tle C'], principal: 'Tle C', contrat: 'Permanent' },
  { id: 2, nom: 'Mme NGO BASSA Rose', specialite: 'Français', classes: ['6ème A', '6ème B', '5ème A'], principal: '6ème A', contrat: 'Permanent' },
  { id: 3, nom: 'M. FOTSO Alain', specialite: 'Physique-Chimie', classes: ['2nde C', '1ère D', 'Tle C'], principal: null, contrat: 'Vacataire' },
  { id: 4, nom: 'Mme ABENA Lucie', specialite: 'Anglais', classes: ['4ème A', '3ème A'], principal: '4ème A', contrat: 'Permanent' },
  { id: 5, nom: 'M. KAMGA Hervé', specialite: 'Histoire-Géographie', classes: ['5ème A', '4ème A', '3ème A'], principal: null, contrat: 'Vacataire' },
  { id: 6, nom: 'Mme OWONA Sylvie', specialite: 'SVT', classes: ['2nde C', '1ère D'], principal: '1ère D', contrat: 'Permanent' },
];

export const matieresClasse = [
  { code: 'FRAN', nom: 'Français', coef: 4, groupe: 1 },
  { code: 'ANG', nom: 'Anglais', coef: 3, groupe: 1 },
  { code: 'MATH', nom: 'Mathématiques', coef: 5, groupe: 2 },
  { code: 'PC', nom: 'Physique-Chimie', coef: 4, groupe: 2 },
  { code: 'SVT', nom: 'SVT', coef: 2, groupe: 2 },
  { code: 'HG', nom: 'Histoire-Géographie', coef: 2, groupe: 1 },
  { code: 'ECM', nom: 'Éducation civique', coef: 1, groupe: 3 },
  { code: 'EPS', nom: 'EPS', coef: 1, groupe: 3 },
];

export type TypeTransaction = 'recette' | 'depense' | 'remboursement';
export interface Transaction {
  id: number;
  numero: string;
  date: string;
  type: TypeTransaction;
  libelle: string;
  eleve?: string;
  mode: 'Espèces' | 'MTN MoMo' | 'Orange Money' | 'Banque';
  montant: number;
  auteur: string;
}

export const transactions: Transaction[] = [
  { id: 1, numero: 'TR-000482', date: '2026-11-24 09:12', type: 'recette', libelle: 'Scolarité — 2e tranche', eleve: 'MBARGA Marie-Claire', mode: 'MTN MoMo', montant: 50000, auteur: 'Secrétaire Nadine' },
  { id: 2, numero: 'TR-000481', date: '2026-11-24 08:47', type: 'recette', libelle: "Frais d'examen", eleve: 'FOTSO Ibrahim', mode: 'Espèces', montant: 15000, auteur: 'Secrétaire Nadine' },
  { id: 3, numero: 'TR-000480', date: '2026-11-23 16:30', type: 'depense', libelle: 'Achat craies et marqueurs', mode: 'Espèces', montant: 18500, auteur: 'Administrateur' },
  { id: 4, numero: 'TR-000479', date: '2026-11-23 11:05', type: 'recette', libelle: 'Scolarité — 1re tranche', eleve: 'TCHOUMI Brenda', mode: 'Orange Money', montant: 75000, auteur: 'Secrétaire Paul' },
  { id: 5, numero: 'TR-000478', date: '2026-11-22 14:20', type: 'remboursement', libelle: 'Trop-perçu scolarité', eleve: 'KAMGA Arnaud', mode: 'Espèces', montant: 10000, auteur: 'Secrétaire Nadine' },
  { id: 6, numero: 'TR-000477', date: '2026-11-22 10:02', type: 'recette', libelle: 'Inscription', eleve: 'ESSOMBA Grâce', mode: 'Banque', montant: 25000, auteur: 'Secrétaire Paul' },
  { id: 7, numero: 'TR-000476', date: '2026-11-21 15:44', type: 'depense', libelle: 'Facture ENEO (électricité)', mode: 'MTN MoMo', montant: 64300, auteur: 'Administrateur' },
  { id: 8, numero: 'TR-000475', date: '2026-11-21 09:18', type: 'recette', libelle: 'APE', eleve: 'OWONA Stève', mode: 'Espèces', montant: 10000, auteur: 'Secrétaire Nadine' },
];

export const encaissementsMensuels = [
  { mois: 'Sept.', recettes: 6.4, depenses: 2.1 },
  { mois: 'Oct.', recettes: 4.8, depenses: 2.6 },
  { mois: 'Nov.', recettes: 3.9, depenses: 1.8 },
  { mois: 'Déc.', recettes: 0, depenses: 0 },
];

export const demandesRemboursement = [
  { id: 1, eleve: 'NANA Linda', classe: '4ème A', montant: 25000, motif: 'Départ de l’établissement en novembre', demandeur: 'Secrétaire Nadine', date: '2026-11-24', statut: 'en_attente' as const },
  { id: 2, eleve: 'BIYONG Cédric', classe: '2nde C', montant: 15000, motif: "Frais d'examen payés deux fois", demandeur: 'Secrétaire Paul', date: '2026-11-23', statut: 'en_attente' as const },
  { id: 3, eleve: 'KAMGA Arnaud', classe: '6ème B', montant: 10000, motif: 'Trop-perçu scolarité', demandeur: 'Secrétaire Nadine', date: '2026-11-20', statut: 'executee' as const },
  { id: 4, eleve: 'SIMO Ornella', classe: '1ère D', montant: 50000, motif: 'Erreur de tranche', demandeur: 'Secrétaire Paul', date: '2026-11-18', statut: 'refusee' as const },
];

export const activites = [
  { qui: 'Secrétaire Nadine', quoi: 'a encaissé 50 000 FCFA (MTN MoMo) pour MBARGA Marie-Claire', quand: 'il y a 12 min', type: 'caisse' },
  { qui: 'M. ESSOMBA Paul', quoi: 'a soumis les notes de Mathématiques — 3ème A, Séquence 2', quand: 'il y a 40 min', type: 'notes' },
  { qui: 'Secrétaire Paul', quoi: 'a inscrit TAGNE Yannick en 5ème A', quand: 'il y a 2 h', type: 'eleves' },
  { qui: 'Secrétaire Nadine', quoi: 'a envoyé une demande de remboursement (25 000 FCFA)', quand: 'il y a 3 h', type: 'remboursement' },
  { qui: 'Administrateur', quoi: 'a validé les notes de Français — 6ème A, Séquence 2', quand: 'hier', type: 'notes' },
];

export const etablissements = [
  { id: 1, nom: 'Collège Bilingue Les Étoiles', ville: 'Yaoundé', eleves: 842, utilisateurs: 46, statut: 'actif', abonnement: 'Standard', couleur: '#1E3A8A' },
  { id: 2, nom: 'Institut Saint-Joseph', ville: 'Douala', eleves: 1290, utilisateurs: 71, statut: 'actif', abonnement: 'Premium', couleur: '#0F766E' },
  { id: 3, nom: 'Complexe Scolaire La Réussite', ville: 'Bafoussam', eleves: 516, utilisateurs: 29, statut: 'actif', abonnement: 'Standard', couleur: '#7C2D12' },
  { id: 4, nom: 'Lycée Privé Excellence', ville: 'Garoua', eleves: 388, utilisateurs: 22, statut: 'essai', abonnement: 'Essai', couleur: '#4338CA' },
  { id: 5, nom: 'École Les Bourgeons', ville: 'Bamenda', eleves: 214, utilisateurs: 14, statut: 'suspendu', abonnement: 'Basique', couleur: '#BE185D' },
];

export const emploiDuTemps = [
  { jour: 'Lundi', creneaux: [{ h: '07:30', m: 'Mathématiques', s: 'Salle 12' }, { h: '09:30', m: 'Physique-Chimie', s: 'Labo' }, { h: '13:00', m: 'Mathématiques', s: 'Salle 12' }] },
  { jour: 'Mardi', creneaux: [{ h: '07:30', m: 'Mathématiques', s: 'Salle 8' }, { h: '10:30', m: 'Mathématiques', s: 'Salle 12' }] },
  { jour: 'Mercredi', creneaux: [{ h: '08:30', m: 'Mathématiques', s: 'Salle 12' }] },
];

export const fcfa = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
