/**
 * Données d'exemple de l'espace enseignant.
 * Deux profils de test : M. ESSOMBA (titulaire de la Tle C) et M. FOTSO (professeur simple).
 * Remplacées par l'API Laravel lors du branchement du backend.
 */

export interface Affectation {
  classe: string;
  matiere: string;
  coef: number;
  effectif: number;
  heures: number;
  salle: string;
  moyenne: number | null;
}

export interface ProfilEnseignant {
  id: number;
  nom: string;
  prenom: string;
  civilite: string;
  matricule: string;
  specialite: string;
  contrat: 'Permanent' | 'Vacataire';
  telephone: string;
  email: string;
  depuis: string;
  classePrincipale: string | null;
  affectations: Affectation[];
  historiqueTitulaire: { annee: string; classe: string }[];
}

export const profils: Record<string, ProfilEnseignant> = {
  essomba: {
    id: 1,
    nom: 'ESSOMBA',
    prenom: 'Paul',
    civilite: 'M.',
    matricule: 'ENS-0012',
    specialite: 'Mathématiques',
    contrat: 'Permanent',
    telephone: '+237 677 12 45 90',
    email: 'paul.essomba@etoiles.cm',
    depuis: 'septembre 2019',
    classePrincipale: 'Tle C',
    affectations: [
      { classe: '3ème A', matiere: 'Mathématiques', coef: 4, effectif: 42, heures: 6, salle: 'Salle 12', moyenne: 11.84 },
      { classe: 'Tle C', matiere: 'Mathématiques', coef: 5, effectif: 35, heures: 7, salle: 'Salle 4', moyenne: 10.37 },
    ],
    historiqueTitulaire: [
      { annee: '2026-2027', classe: 'Tle C' },
      { annee: '2025-2026', classe: '1ère C' },
      { annee: '2024-2025', classe: '3ème B' },
    ],
  },
  fotso: {
    id: 3,
    nom: 'FOTSO',
    prenom: 'Alain',
    civilite: 'M.',
    matricule: 'ENS-0031',
    specialite: 'Physique-Chimie',
    contrat: 'Vacataire',
    telephone: '+237 655 78 21 44',
    email: 'alain.fotso@etoiles.cm',
    depuis: 'septembre 2024',
    classePrincipale: null,
    affectations: [
      { classe: '2nde C', matiere: 'Physique-Chimie', coef: 4, effectif: 39, heures: 4, salle: 'Laboratoire', moyenne: 11.2 },
      { classe: '1ère D', matiere: 'Physique-Chimie', coef: 4, effectif: 37, heures: 4, salle: 'Laboratoire', moyenne: 12.05 },
      { classe: 'Tle C', matiere: 'Physique-Chimie', coef: 5, effectif: 35, heures: 5, salle: 'Laboratoire', moyenne: 9.7 },
    ],
    historiqueTitulaire: [],
  },
};

/* ---------- Élèves par classe ---------- */
const NOMS = ['ABENA', 'ATANGANA', 'BIYONG', 'DJOUMESSI', 'EKOTTO', 'ESSOMBA', 'EYENGA', 'FOTSO', 'KAMGA', 'MANGA', 'MBARGA', 'MVONDO', 'NANA', 'NDJOCK', 'NGO BASSA', 'NKOULOU', 'OWONA', 'SIMO', 'TAGNE', 'TCHOUMI'];
const PF = ['Marie-Claire', 'Grâce', 'Aïcha', 'Brenda', 'Linda', 'Christelle', 'Ornella', 'Sandrine', 'Nadège', 'Princesse'];
const PM = ['Junior', 'Arnaud', 'Ibrahim', 'Stève', 'Boris', 'Cédric', 'Yannick', 'Franck', 'Loïc', 'Ulrich'];

export interface EleveClasse {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: 'F' | 'M';
  statut: 'Nouveau' | 'Ancien' | 'Redoublant';
}

const graines: Record<string, number> = { '3ème A': 1, 'Tle C': 7, '2nde C': 13, '1ère D': 19 };
export function elevesDe(classe: string, nombre = 16): EleveClasse[] {
  const g = graines[classe] ?? 3;
  return Array.from({ length: nombre }, (_, i): EleveClasse => {
    const f = (i + g) % 2 === 0;
    return {
      id: g * 100 + i,
      matricule: `CBE26-${String(g * 37 + i).padStart(4, '0')}`,
      nom: NOMS[(i * 3 + g) % NOMS.length],
      prenom: f ? PF[(i + g) % PF.length] : PM[(i + g) % PM.length],
      sexe: f ? 'F' : 'M',
      statut: (['Ancien', 'Ancien', 'Nouveau', 'Ancien', 'Redoublant'] as const)[(i + g) % 5],
    };
  }).sort((a, b) => a.nom.localeCompare(b.nom));
}

/* ---------- Évaluations de l'enseignant ---------- */
export type StatutEval = 'brouillon' | 'soumise' | 'validee' | 'renvoyee';
export interface Evaluation {
  id: number;
  prof: 'essomba' | 'fotso';
  classe: string;
  matiere: string;
  sequence: number;
  type: string;
  date: string;
  statut: StatutEval;
  saisies: number;
  total: number;
  moyenne: number;
  soumiseLe?: string;
  valideeLe?: string;
  motifRenvoi?: string;
}

export const evaluations: Evaluation[] = [
  { id: 1, prof: 'essomba', classe: 'Tle C', matiere: 'Mathématiques', sequence: 2, type: 'Composition de séquence', date: '02/12/2026', statut: 'brouillon', saisies: 13, total: 16, moyenne: 12.23 },
  { id: 2, prof: 'essomba', classe: '3ème A', matiere: 'Mathématiques', sequence: 2, type: 'Devoir surveillé n° 1', date: '18/11/2026', statut: 'soumise', saisies: 16, total: 16, moyenne: 11.84, soumiseLe: '24/11/2026 à 08:55' },
  { id: 3, prof: 'essomba', classe: 'Tle C', matiere: 'Mathématiques', sequence: 1, type: 'Composition de séquence', date: '08/10/2026', statut: 'validee', saisies: 16, total: 16, moyenne: 10.37, soumiseLe: '10/10/2026', valideeLe: '12/10/2026' },
  { id: 4, prof: 'essomba', classe: '3ème A', matiere: 'Mathématiques', sequence: 1, type: 'Composition de séquence', date: '07/10/2026', statut: 'validee', saisies: 16, total: 16, moyenne: 12.6, soumiseLe: '09/10/2026', valideeLe: '12/10/2026' },
  { id: 5, prof: 'essomba', classe: 'Tle C', matiere: 'Mathématiques', sequence: 2, type: 'Interrogation écrite', date: '06/11/2026', statut: 'renvoyee', saisies: 16, total: 16, moyenne: 9.95, soumiseLe: '07/11/2026', motifRenvoi: 'Deux élèves absents notés 0 au lieu de ABS.' },
  { id: 6, prof: 'fotso', classe: 'Tle C', matiere: 'Physique-Chimie', sequence: 2, type: 'Interrogation écrite', date: '20/11/2026', statut: 'brouillon', saisies: 9, total: 16, moyenne: 9.7 },
  { id: 7, prof: 'fotso', classe: '1ère D', matiere: 'Physique-Chimie', sequence: 2, type: 'Devoir surveillé n° 1', date: '14/11/2026', statut: 'soumise', saisies: 16, total: 16, moyenne: 12.05, soumiseLe: '21/11/2026 à 17:10' },
  { id: 8, prof: 'fotso', classe: '2nde C', matiere: 'Physique-Chimie', sequence: 1, type: 'Composition de séquence', date: '06/10/2026', statut: 'validee', saisies: 16, total: 16, moyenne: 11.2, soumiseLe: '08/10/2026', valideeLe: '12/10/2026' },
];

/* ---------- Demandes de correction (envoyées par l'administration) ---------- */
export type StatutCorrection = 'a_traiter' | 'envoyee' | 'acceptee';
export interface DemandeCorrection {
  id: number;
  prof: 'essomba' | 'fotso';
  eleve: string;
  classe: string;
  evaluation: string;
  noteActuelle: string;
  motif: string;
  demandeePar: string;
  date: string;
  statut: StatutCorrection;
  nouvelleNote?: string;
}

export const demandesCorrection: DemandeCorrection[] = [
  { id: 1, prof: 'essomba', eleve: 'MANGA Ornella', classe: 'Tle C', evaluation: 'Interrogation écrite, séquence 2', noteActuelle: '0', motif: 'L’élève était absente avec un certificat médical : mettre ABS.', demandeePar: 'Jean-Pierre Manga (administrateur)', date: '24/11/2026', statut: 'a_traiter' },
  { id: 2, prof: 'essomba', eleve: 'SIMO Franck', classe: 'Tle C', evaluation: 'Interrogation écrite, séquence 2', noteActuelle: '0', motif: 'Absent ce jour-là (voyage scolaire) : mettre ABS.', demandeePar: 'Jean-Pierre Manga (administrateur)', date: '24/11/2026', statut: 'a_traiter' },
  { id: 3, prof: 'essomba', eleve: 'NKOULOU Arnaud', classe: '3ème A', evaluation: 'Composition, séquence 1', noteActuelle: '8,5', motif: 'Le parent signale une erreur de report : la copie porte 12,5.', demandeePar: 'Nadine Ekotto (secrétaire)', date: '15/10/2026', statut: 'acceptee', nouvelleNote: '12,5' },
  { id: 4, prof: 'fotso', eleve: 'EYENGA Princesse', classe: 'Tle C', evaluation: 'Interrogation écrite, séquence 2', noteActuelle: '4', motif: 'Note saisie dans la mauvaise ligne (inversée avec EYENGA Ulrich).', demandeePar: 'Jean-Pierre Manga (administrateur)', date: '22/11/2026', statut: 'a_traiter' },
];

/* ---------- Notifications ---------- */
export const notificationsEnseignant: { id: number; prof: 'essomba' | 'fotso' | 'tous'; type: 'correction' | 'validation' | 'renvoi' | 'ecole' | 'rappel'; titre: string; texte: string; jour: string; quand: string; lu: boolean }[] = [
  { id: 1, prof: 'essomba', type: 'correction', titre: '2 demandes de correction', texte: 'L’administration demande de corriger 2 notes de l’interrogation de Tle C.', jour: 'Aujourd’hui', quand: '09:40', lu: false },
  { id: 2, prof: 'essomba', type: 'renvoi', titre: 'Notes renvoyées', texte: 'Interrogation écrite de Tle C renvoyée : deux élèves absents notés 0 au lieu de ABS.', jour: 'Hier', quand: '16:20', lu: false },
  { id: 3, prof: 'tous', type: 'rappel', titre: 'Fin de saisie le 5 décembre', texte: 'La saisie des notes de la séquence 2 se termine le vendredi 5 décembre à 18 h.', jour: 'Hier', quand: '08:00', lu: true },
  { id: 4, prof: 'essomba', type: 'validation', titre: 'Notes validées', texte: 'La composition de la séquence 1 de 3ème A a été validée.', jour: '12 oct.', quand: '11:15', lu: true },
  { id: 5, prof: 'tous', type: 'ecole', titre: 'Conseil de classe', texte: 'Les conseils de classe du 1er trimestre auront lieu du 8 au 10 décembre.', jour: '18 nov.', quand: '14:00', lu: true },
  { id: 6, prof: 'fotso', type: 'correction', titre: '1 demande de correction', texte: 'Une note de l’interrogation de Tle C est à corriger.', jour: 'Il y a 3 jours', quand: '10:05', lu: false },
];

/* ---------- Emploi du temps (PROVISOIRE, données aléatoires) ---------- */
export const emploiEnseignant: Record<'essomba' | 'fotso', { jour: string; cours: { debut: string; fin: string; classe: string; salle: string }[] }[]> = {
  essomba: [
    { jour: 'Lundi', cours: [{ debut: '07:30', fin: '09:30', classe: '3ème A', salle: 'Salle 12' }, { debut: '10:30', fin: '12:30', classe: 'Tle C', salle: 'Salle 4' }] },
    { jour: 'Mardi', cours: [{ debut: '07:30', fin: '09:30', classe: 'Tle C', salle: 'Salle 4' }, { debut: '13:00', fin: '14:00', classe: 'Tle C', salle: 'Vie de classe' }] },
    { jour: 'Mercredi', cours: [{ debut: '08:30', fin: '10:30', classe: '3ème A', salle: 'Salle 12' }] },
    { jour: 'Jeudi', cours: [{ debut: '10:30', fin: '12:30', classe: 'Tle C', salle: 'Salle 4' }, { debut: '13:00', fin: '15:00', classe: '3ème A', salle: 'Salle 12' }] },
    { jour: 'Vendredi', cours: [{ debut: '07:30', fin: '09:30', classe: 'Tle C', salle: 'Salle 4' }] },
  ],
  fotso: [
    { jour: 'Lundi', cours: [{ debut: '13:00', fin: '15:00', classe: '1ère D', salle: 'Laboratoire' }] },
    { jour: 'Mardi', cours: [{ debut: '10:30', fin: '12:30', classe: 'Tle C', salle: 'Laboratoire' }] },
    { jour: 'Mercredi', cours: [{ debut: '07:30', fin: '09:30', classe: '2nde C', salle: 'Laboratoire' }] },
    { jour: 'Jeudi', cours: [{ debut: '07:30', fin: '10:30', classe: 'Tle C', salle: 'Laboratoire' }] },
    { jour: 'Vendredi', cours: [{ debut: '10:30', fin: '12:30', classe: '2nde C', salle: 'Laboratoire' }, { debut: '13:00', fin: '15:00', classe: '1ère D', salle: 'Laboratoire' }] },
  ],
};

/* ---------- Classe principale : Tle C (visible par le titulaire uniquement) ---------- */
export type EtatSaisie = 'non_commencee' | 'en_saisie' | 'soumise' | 'validee';
export const matieresClassePrincipale: { matiere: string; coef: number; prof: string; etat: EtatSaisie; saisies: number; total: number; moyenne: number | null; reussite: number | null; derniere: string }[] = [
  { matiere: 'Mathématiques', coef: 5, prof: 'M. ESSOMBA Paul', etat: 'en_saisie', saisies: 13, total: 16, moyenne: 12.23, reussite: 69, derniere: 'Aujourd’hui' },
  { matiere: 'Physique-Chimie', coef: 5, prof: 'M. FOTSO Alain', etat: 'en_saisie', saisies: 9, total: 16, moyenne: 9.7, reussite: 44, derniere: 'Il y a 5 jours' },
  { matiere: 'SVT', coef: 2, prof: 'Mme OWONA Sylvie', etat: 'soumise', saisies: 16, total: 16, moyenne: 13.15, reussite: 81, derniere: '22/11/2026' },
  { matiere: 'Français', coef: 3, prof: 'Mme NGO BASSA Rose', etat: 'validee', saisies: 16, total: 16, moyenne: 11.4, reussite: 63, derniere: '20/11/2026' },
  { matiere: 'Anglais', coef: 2, prof: 'Mme ABENA Lucie', etat: 'soumise', saisies: 16, total: 16, moyenne: 12.8, reussite: 75, derniere: '23/11/2026' },
  { matiere: 'Philosophie', coef: 2, prof: 'M. NANA Joseph', etat: 'non_commencee', saisies: 0, total: 16, moyenne: null, reussite: null, derniere: '—' },
  { matiere: 'Histoire-Géographie', coef: 2, prof: 'M. KAMGA Hervé', etat: 'validee', saisies: 16, total: 16, moyenne: 10.9, reussite: 56, derniere: '19/11/2026' },
  { matiere: 'Informatique', coef: 1, prof: 'M. TAGNE Serge', etat: 'non_commencee', saisies: 0, total: 16, moyenne: null, reussite: null, derniere: '—' },
  { matiere: 'EPS', coef: 1, prof: 'Mme EYENGA Rachel', etat: 'validee', saisies: 16, total: 16, moyenne: 15.6, reussite: 100, derniere: '15/11/2026' },
];

const moyennesEleves = [15.42, 14.1, 13.65, 13.05, 12.8, 12.35, 11.9, 11.62, 11.2, 10.75, 10.4, 9.85, 9.1, 8.6, 7.95, 7.2];
export function resultatsClassePrincipale() {
  return elevesDe('Tle C').map((e, i) => {
    const moyenne = moyennesEleves[(i * 7) % moyennesEleves.length];
    return { ...e, moyenne, s1: Math.max(5, Math.min(18, moyenne + [-0.8, 0.6, -0.3, 1.1, -1.4, 0.2][i % 6])), absences: [0, 2, 0, 5, 1, 0, 8, 3][i % 8] };
  }).sort((a, b) => b.moyenne - a.moyenne);
}
