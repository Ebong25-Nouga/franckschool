/**
 * Données de démonstration de l'espace secrétariat.
 * Elles suivent l'audit BD V1. Elles vivent dans le navigateur (localStorage)
 * tant que l'API Laravel n'est pas branchée : chaque action change vraiment l'écran
 * et laisse une trace dans le journal, mais rien n'est envoyé à un serveur.
 */
import { TOUS_DROITS_SECRETAIRE } from '@/lib/permissions';
import { classes as nomsClasses, eleves as elevesDemo, matieresClasse, professeurs, type Eleve, type Mode } from '@/data/demo';

/* ---------------- Masquage et suppression logique ---------------- */
export type EtatElement = 'actif' | 'masque' | 'supprime';
export interface Trace {
  etat: EtatElement;
  motifRetrait?: string;
  retirePar?: string;
  retireLe?: string;
}

/* ---------------- Types ---------------- */
export type TypeDepart = 'Transfert' | 'Abandon' | 'Exclusion' | 'Autre';
export interface EleveS extends Eleve, Trace {
  situation: 'inscrit' | 'parti';
  depart?: { type: TypeDepart; date: string; motif: string; destination?: string };
  parentIds: number[];
  inscritLe: string;
  inscritPar: string;
  adresse: string;
  /** Matricule de l'année passée, pour un élève réinscrit */
  ancienMatricule?: string;
}
export interface Parent extends Trace {
  id: number;
  nom: string;
  lien: string;
  telephone: string;
  telephone2?: string;
  email?: string;
  profession?: string;
  adresse?: string;
  /** Accès à l'espace parent : remise des identifiants (jamais le code lui-même) */
  acces?: { remisLe: string; par: string; canal: 'WhatsApp' | 'En personne'; connecteLe?: string };
}
export interface Enseignant extends Trace {
  id: number;
  civilite: 'M.' | 'Mme';
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  email: string;
  contrat: 'Permanent' | 'Vacataire';
  classes: string[];
  matieres: string[];
  actif: boolean;
  heures: number;
}
export interface Classe extends Trace {
  id: number;
  nom: string;
  niveau: string;
  capacite: number;
  salle: string;
  pp: string | null;
}
export interface Matiere extends Trace {
  id: number;
  classe: string;
  code: string;
  nom: string;
  coef: number;
  groupe: 1 | 2 | 3;
  prof: string;
}
export type StatutAbsence = 'non_justifiee' | 'en_attente' | 'justifiee';
export interface Absence extends Trace {
  id: number;
  eleveId: number;
  type: 'absence' | 'retard';
  date: string;
  creneau: string;
  matiere: string;
  duree?: string;
  statut: StatutAbsence;
  motif?: string;
  auteur: string;
}
export const typesSanction = ['Observation', 'Avertissement', 'Blâme', 'Retenue', 'Convocation des parents', 'Exclusion temporaire'] as const;
export type TypeSanction = (typeof typesSanction)[number];
export interface Incident extends Trace {
  id: number;
  eleveId: number;
  date: string;
  type: TypeSanction;
  motif: string;
  duree?: string;
  decidePar: string;
  statut: 'en_cours' | 'levee';
  auteur: string;
}
export const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as const;
export const plages = ['07:30 – 09:30', '10:00 – 12:00', '13:00 – 15:00'] as const;
export interface Creneau {
  id: number;
  classe: string;
  jour: (typeof jours)[number];
  plage: (typeof plages)[number];
  matiere: string;
  prof: string;
  salle: string;
}
export type TypeOperation = 'recette' | 'depense' | 'remboursement' | 'annulation';
export interface Operation {
  id: number;
  numero: string;
  date: string;
  type: TypeOperation;
  libelle: string;
  eleveId?: number;
  eleve?: string;
  classe?: string;
  mode: Mode;
  montant: number;
  auteur: string;
  reference?: string;
  categorie?: string;
  beneficiaire?: string;
  justificatif?: string;
  annulee?: { par: string; le: string; motif: string; numero: string };
  origine?: string;
}
export type StatutRemboursement = 'en_attente' | 'approuvee' | 'refusee' | 'executee';
export interface DemandeRemboursement {
  id: number;
  eleveId: number;
  eleve: string;
  classe: string;
  montant: number;
  motif: string;
  paiement: string;
  demandeur: string;
  date: string;
  statut: StatutRemboursement;
  decision?: string;
  executeLe?: string;
}
export interface Cloture {
  id: number;
  date: string;
  heure: string;
  attendu: number;
  compte: number;
  ecart: number;
  observation: string;
  auteur: string;
  /** Prise de connaissance d'un écart par l'administrateur */
  vu?: { par: string; le: string; commentaire: string };
}
export interface Annonce extends Trace {
  id: number;
  titre: string;
  message: string;
  destinataires: string;
  auteur: string;
  date: string;
}
export interface DocumentGenere {
  id: number;
  numero: string;
  type: string;
  cible: string;
  auteur: string;
  date: string;
}
export interface EntreeJournal {
  id: number;
  quand: string;
  utilisateur: string;
  role: string;
  etablissement: string;
  operation: string;
  module: string;
  element: string;
  elementId?: number | string;
  avant?: string;
  apres?: string;
  motif?: string;
}
export interface AncienEleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  classe: string;
  moyenne: number;
  decision: 'Admis' | 'Redouble' | 'Exclu';
  tuteur: string;
  telephone: string;
}
export interface AnneePassee {
  annee: string;
  effectif: number;
  reussite: number;
  recettes: number;
  eleves: AncienEleve[];
}
/** Saisie des notes d'une matière, dans une classe, pour une séquence (1 à 6). */
export type StatutReleve = 'non_commencee' | 'brouillon' | 'correction' | 'soumise' | 'validee';
export interface EtapeValidation {
  quand: string;
  action: 'Soumission' | 'Validation' | 'Correction demandée' | 'Nouvelle soumission';
  par: string;
  commentaire?: string;
}
export interface Releve {
  id: number;
  classe: string;
  matiere: string;
  prof: string;
  sequence: number;
  evaluations: string[];
  statut: StatutReleve;
  notes: number;
  attendu: number;
  relance?: string;
  /** Circuit de validation : soumission, correction demandée, nouvelle soumission, validation */
  historique: EtapeValidation[];
}
/** État des bulletins d'une classe pour une période (clé « classe|période »). */
export interface EtatBulletin {
  statut: 'genere' | 'publie';
  le: string;
  par: string;
}

/** Compte d'une secrétaire, géré par l'administrateur (droits du catalogue unique). */
export interface CompteSecretaire {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  actif: boolean;
  droits: string[];
  creeLe: string;
  derniereConnexion?: string;
}
export interface AnneeScolaire {
  id: number;
  annee: string;
  statut: 'active' | 'preparation' | 'archivee';
  sequences: { n: number; debut: string; fin: string }[];
}
export interface Parametres {
  nom: string;
  sigle: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  devise: string;
  couleur: string;
  logo?: string;
  signataire: string;
  titreSignataire: string;
  autorisation: string;
  mentions: { min: number; libelle: string }[];
  frais: { niveau: string; montant: number }[];
  tranches: { libelle: string; part: number; limite: string }[];
}
export interface Connexion {
  id: number;
  quand: string;
  appareil: string;
  lieu: string;
  resultat: 'Réussie' | 'Échouée';
}

export interface Etat {
  version: number;
  eleves: EleveS[];
  parents: Parent[];
  enseignants: Enseignant[];
  classes: Classe[];
  matieres: Matiere[];
  absences: Absence[];
  incidents: Incident[];
  creneaux: Creneau[];
  operations: Operation[];
  remboursements: DemandeRemboursement[];
  clotures: Cloture[];
  annonces: Annonce[];
  documents: DocumentGenere[];
  journal: EntreeJournal[];
  releves: Releve[];
  bulletins: Record<string, EtatBulletin>;
  annees: AnneePassee[];
  comptes: CompteSecretaire[];
  anneesScolaires: AnneeScolaire[];
  parametres: Parametres;
  connexions: Connexion[];
}

/* ---------------- Dates ---------------- */
export const VERSION_DONNEES = 5;
const pad = (n: number, l = 2) => String(n).padStart(l, '0');
export const isoJour = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const isoMinute = (d: Date) => `${isoJour(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const ilYa = (jours: number, h = 9, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - jours);
  d.setHours(h, m, 0, 0);
  return d;
};

/* ---------------- Construction de l'état de départ ---------------- */
const niveaux: Record<string, string> = { '6ème': 'Premier cycle', '5ème': 'Premier cycle', '4ème': 'Premier cycle', '3ème': 'Premier cycle', '2nde': 'Second cycle', '1ère': 'Second cycle', Tle: 'Second cycle' };
const quartiers = ['Bastos', 'Mvog-Mbi', 'Essos', 'Biyem-Assi', 'Nkolbisson', 'Emana', 'Mimboman'];
const professions = ['Enseignant', 'Commerçante', 'Fonctionnaire', 'Infirmière', 'Chauffeur', 'Comptable', 'Agricultrice', 'Ingénieur'];

function decouperNom(complet: string) {
  const civ = complet.startsWith('Mme') ? 'Mme' : 'M.';
  const reste = complet.replace(/^(M\.|Mme)\s+/, '');
  const morceaux = reste.split(' ');
  const prenom = morceaux.pop() ?? '';
  return { civilite: civ as 'M.' | 'Mme', nom: morceaux.join(' '), prenom };
}

export function etatInitial(): Etat {
  const eleves: EleveS[] = elevesDemo.map((e, i) => ({
    ...e,
    etat: 'actif',
    situation: 'inscrit',
    parentIds: [e.id],
    inscritLe: `2026-09-${pad((i % 20) + 1)}`,
    inscritPar: i % 3 ? 'Nadine Ekotto' : 'Paul Biyong',
    adresse: `${quartiers[i % quartiers.length]}, Yaoundé`,
  }));
  const parents: Parent[] = elevesDemo.map((e, i) => ({
    id: e.id,
    nom: e.tuteur,
    lien: e.lien,
    telephone: e.telephone,
    profession: professions[i % professions.length],
    adresse: `${quartiers[i % quartiers.length]}, Yaoundé`,
    email: i % 4 === 0 ? `${e.nom.toLowerCase().replace(/\s/g, '')}.${e.id}@gmail.com` : undefined,
    etat: 'actif',
    // Une partie des parents a déjà reçu son accès ; certains se sont déjà connectés
    acces: i % 3 === 2 ? undefined : { remisLe: isoMinute(ilYa(20 - (i % 15), 10, 15)), par: i % 2 ? 'Nadine Ekotto' : 'Paul Biyong', canal: i % 4 === 0 ? 'En personne' : 'WhatsApp', connecteLe: i % 5 === 1 ? undefined : isoMinute(ilYa(10 - (i % 9), 19, 30)) },
  }));

  const enseignants: Enseignant[] = professeurs.map((p) => {
    const n = decouperNom(p.nom);
    return {
      id: p.id,
      ...n,
      specialite: p.specialite,
      telephone: p.telephone,
      email: `${n.prenom.toLowerCase()}.${n.nom.toLowerCase().replace(/\s/g, '')}@etoiles.cm`,
      contrat: p.contrat as 'Permanent' | 'Vacataire',
      classes: p.classes,
      matieres: [p.specialite],
      actif: true,
      heures: p.heures,
      etat: 'actif',
    };
  });

  const classes: Classe[] = nomsClasses.map((nom, i) => {
    const pp = professeurs.find((p) => p.principal === nom);
    return { id: i + 1, nom, niveau: niveaux[nom.split(' ')[0]] ?? 'Premier cycle', capacite: nom.startsWith('Tle') || nom.startsWith('1ère') ? 45 : 55, salle: `Salle ${[1, 2, 3, 5, 12, 7, 9, 4][i]}`, pp: pp?.nom ?? null, etat: 'actif' };
  });

  let idMat = 1;
  const matieres: Matiere[] = nomsClasses.flatMap((classe) =>
    matieresClasse.map((m) => ({ id: idMat++, classe, code: m.code, nom: m.nom, coef: classe.startsWith('6') || classe.startsWith('5') ? Math.max(1, m.coef - 1) : m.coef, groupe: m.groupe as 1 | 2 | 3, prof: m.prof, etat: 'actif' as const })),
  );

  const absences: Absence[] = [
    { id: 1, eleveId: 5, type: 'absence', date: isoJour(ilYa(0)), creneau: '07:30 – 12:00', matiere: 'Mathématiques, Anglais', statut: 'non_justifiee', auteur: 'Nadine Ekotto', etat: 'actif' },
    { id: 2, eleveId: 10, type: 'retard', date: isoJour(ilYa(0)), creneau: '07:52', matiere: 'Français', duree: '22 min', statut: 'non_justifiee', auteur: 'Nadine Ekotto', etat: 'actif' },
    { id: 3, eleveId: 8, type: 'absence', date: isoJour(ilYa(1)), creneau: 'Journée', matiere: '—', statut: 'justifiee', motif: 'Certificat médical', auteur: 'Paul Biyong', etat: 'actif' },
    { id: 4, eleveId: 15, type: 'absence', date: isoJour(ilYa(1)), creneau: '13:00 – 15:00', matiere: 'SVT', statut: 'en_attente', motif: 'Mot du parent à vérifier', auteur: 'Nadine Ekotto', etat: 'actif' },
    { id: 5, eleveId: 22, type: 'retard', date: isoJour(ilYa(3)), creneau: '07:45', matiere: 'Philosophie', duree: '15 min', statut: 'justifiee', motif: 'Embouteillage signalé', auteur: 'Nadine Ekotto', etat: 'actif' },
    { id: 6, eleveId: 3, type: 'absence', date: isoJour(ilYa(4)), creneau: '07:30 – 09:30', matiere: 'SVT', statut: 'non_justifiee', auteur: 'Paul Biyong', etat: 'actif' },
    { id: 7, eleveId: 31, type: 'absence', date: isoJour(ilYa(6)), creneau: 'Journée', matiere: '—', statut: 'non_justifiee', auteur: 'Nadine Ekotto', etat: 'actif' },
  ];

  const incidents: Incident[] = [
    { id: 1, eleveId: 7, date: isoJour(ilYa(2)), type: 'Avertissement', motif: 'Bavardages répétés en cours de Mathématiques.', decidePar: 'M. ESSOMBA Paul', statut: 'en_cours', auteur: 'Nadine Ekotto', etat: 'actif' },
    { id: 2, eleveId: 12, date: isoJour(ilYa(5)), type: 'Retenue', motif: 'Devoir non rendu trois fois.', duree: '2 heures, samedi', decidePar: 'Surveillant général', statut: 'levee', auteur: 'Nadine Ekotto', etat: 'actif' },
    { id: 3, eleveId: 23, date: isoJour(ilYa(8)), type: 'Convocation des parents', motif: 'Absences non justifiées répétées (8 en novembre).', decidePar: 'Le Principal', statut: 'en_cours', auteur: 'Paul Biyong', etat: 'actif' },
  ];

  // Emplois du temps de départ : deux classes remplies, les autres à créer
  const creneaux: Creneau[] = [];
  let idCr = 1;
  const remplir = (classe: string, decalage: number) => {
    const ms = matieres.filter((m) => m.classe === classe);
    const salle = classes.find((c) => c.nom === classe)!.salle;
    jours.forEach((jour, j) =>
      plages.forEach((plage, p) => {
        const m = ms[(j * plages.length + p + decalage) % ms.length];
        creneaux.push({ id: idCr++, classe, jour, plage, matiere: m.nom, prof: m.prof, salle });
      }),
    );
  };
  remplir('Tle C', 0);
  remplir('3ème A', 3);

  const el = (id: number) => eleves.find((e) => e.id === id)!;
  const opEleve = (id: number, n: number, d: Date, libelle: string, mode: Mode, montant: number, auteur: string, reference?: string): Operation => {
    const e = el(id);
    return { id: n, numero: `TR-${pad(n + 470, 6)}`, date: isoMinute(d), type: 'recette', libelle, eleveId: e.id, eleve: `${e.nom} ${e.prenom}`, classe: e.classe, mode, montant, auteur, reference };
  };
  const operations: Operation[] = [
    opEleve(1, 1, ilYa(7, 8, 15), 'Scolarité, 1re tranche', 'Espèces', 50000, 'Paul Biyong'),
    { id: 2, numero: 'TR-000472', date: isoMinute(ilYa(6, 13, 40)), type: 'depense', libelle: 'Réparation photocopieuse', categorie: 'Entretien', beneficiaire: 'Bureautique Services', mode: 'Espèces', montant: 35000, auteur: 'Nadine Ekotto', justificatif: 'facture-0412.pdf' },
    opEleve(9, 3, ilYa(5, 9, 18), 'APE', 'Espèces', 10000, 'Nadine Ekotto'),
    opEleve(14, 4, ilYa(4, 11, 5), 'Scolarité, 2e tranche', 'Orange Money', 50000, 'Paul Biyong', 'OM2311.1105.77Q'),
    opEleve(17, 5, ilYa(3, 10, 2), 'Inscription', 'Banque', 25000, 'Paul Biyong', 'AFB-VIR-55120'),
    { id: 6, numero: 'TR-000476', date: isoMinute(ilYa(3, 15, 44)), type: 'depense', libelle: 'Facture ENEO, électricité', categorie: 'Électricité et eau', beneficiaire: 'ENEO', mode: 'MTN MoMo', montant: 64300, auteur: 'Nadine Ekotto', reference: 'MP2111.1544.K02', justificatif: 'eneo-novembre.jpg' },
    opEleve(25, 7, ilYa(2, 14, 20), 'Scolarité, 2e tranche', 'MTN MoMo', 60000, 'Nadine Ekotto', 'MP2011.1340.Z19'),
    opEleve(2, 8, ilYa(1, 8, 47), "Frais d'examen", 'Espèces', 15000, 'Nadine Ekotto'),
    opEleve(18, 9, ilYa(0, 8, 5), 'Scolarité, 2e tranche', 'Espèces', 50000, 'Nadine Ekotto'),
    opEleve(30, 10, ilYa(0, 8, 41), 'Scolarité, 2e tranche', 'MTN MoMo', 45000, 'Paul Biyong', 'MP2611.0841.B57'),
    { id: 11, numero: 'TR-000481', date: isoMinute(ilYa(0, 9, 3)), type: 'depense', libelle: 'Craies, marqueurs et registres', categorie: 'Fournitures', beneficiaire: 'Librairie Saint-Paul', mode: 'Espèces', montant: 18500, auteur: 'Nadine Ekotto', justificatif: 'ticket-0927.jpg' },
  ];

  const remboursements: DemandeRemboursement[] = [
    { id: 1, eleveId: 6, eleve: `${el(6).nom} ${el(6).prenom}`, classe: el(6).classe, montant: 25000, motif: "Départ de l'établissement (mutation des parents à Garoua).", paiement: 'TR-000402', demandeur: 'Nadine Ekotto', date: isoJour(ilYa(2)), statut: 'en_attente' },
    { id: 2, eleveId: 11, eleve: `${el(11).nom} ${el(11).prenom}`, classe: el(11).classe, montant: 15000, motif: "Frais d'examen payés deux fois (espèces puis MTN MoMo).", paiement: 'TR-000455', demandeur: 'Nadine Ekotto', date: isoJour(ilYa(4)), statut: 'approuvee', decision: 'Approuvé par Jean-Pierre Manga : doublon confirmé.' },
    { id: 3, eleveId: 20, eleve: `${el(20).nom} ${el(20).prenom}`, classe: el(20).classe, montant: 50000, motif: 'Erreur de tranche signalée par le parent.', paiement: 'TR-000398', demandeur: 'Paul Biyong', date: isoJour(ilYa(9)), statut: 'refusee', decision: 'Refusé : la 2e tranche était bien due.' },
  ];

  const clotures: Cloture[] = [
    { id: 1, date: isoJour(ilYa(2)), heure: '17:20', attendu: 412500, compte: 412500, ecart: 0, observation: '', auteur: 'Nadine Ekotto' },
    { id: 2, date: isoJour(ilYa(1)), heure: '17:05', attendu: 427500, compte: 426500, ecart: -1000, observation: 'Pièce de 1 000 FCFA manquante, signalée à l’administrateur.', auteur: 'Nadine Ekotto' },
  ];

  const annonces: Annonce[] = [
    { id: 1, titre: 'Réunion des parents, 1er trimestre', message: 'La réunion des parents d’élèves aura lieu le samedi 6 décembre à 9 h dans la grande salle. Présence vivement souhaitée.', destinataires: 'Tous les parents', auteur: 'Nadine Ekotto', date: isoMinute(ilYa(3, 10, 0)), etat: 'actif' },
    { id: 2, titre: 'Dépôt des notes de la séquence 2', message: 'Les enseignants sont priés de soumettre toutes les notes de la séquence 2 au plus tard le vendredi 5 décembre.', destinataires: 'Tous les enseignants', auteur: 'Paul Biyong', date: isoMinute(ilYa(1, 15, 30)), etat: 'actif' },
  ];

  const documents: DocumentGenere[] = [
    { id: 1, numero: 'CS-2026-0041', type: 'Certificat de scolarité', cible: `${el(4).nom} ${el(4).prenom}`, auteur: 'Nadine Ekotto', date: isoMinute(ilYa(2, 11, 12)) },
    { id: 2, numero: 'LC-2026-0012', type: 'Liste de classe', cible: '3ème A', auteur: 'Paul Biyong', date: isoMinute(ilYa(5, 9, 40)) },
  ];

  // Séquence 1 : tout est validé. Séquence 2 : en cours (6ème A, 5ème A et 4ème A déjà complètes).
  let idRel = 1;
  const releves: Releve[] = nomsClasses.flatMap((classe, ci) =>
    matieres
      .filter((m) => m.classe === classe)
      .flatMap((m, mi) => {
        const attendu = eleves.filter((e) => e.classe === classe).length;
        const k = (ci * 3 + mi) % 7;
        const complete = ['6ème A', '5ème A', '4ème A'].includes(classe);
        const s2: StatutReleve = complete ? 'validee' : k === 0 ? 'non_commencee' : k === 1 ? 'brouillon' : k === 2 ? 'soumise' : 'validee';
        const evals = mi % 2 ? ['Devoir surveillé', 'Composition'] : ['Composition'];
        return [
          { id: idRel++, classe, matiere: m.nom, prof: m.prof, sequence: 1, evaluations: evals, statut: 'validee' as StatutReleve, notes: attendu, attendu, historique: [{ quand: isoMinute(ilYa(48, 17, 10)), action: 'Soumission' as const, par: m.prof }, { quand: isoMinute(ilYa(46, 9, 30)), action: 'Validation' as const, par: 'Jean-Pierre Manga' }] },
          { id: idRel++, classe, matiere: m.nom, prof: m.prof, sequence: 2, evaluations: s2 === 'non_commencee' ? [] : evals, statut: s2, notes: s2 === 'non_commencee' ? 0 : s2 === 'brouillon' ? Math.ceil(attendu / 2) : attendu, attendu, historique: [] },
        ];
      }),
  );
  // Historique de la séquence 2 : soumissions, validations, une correction demandée, une nouvelle soumission
  const s2 = releves.filter((r) => r.sequence === 2);
  // Tle C : toutes les notes sont soumises, il ne manque que la validation de la direction (démonstration de la génération automatique)
  s2.filter((r) => r.classe === 'Tle C' && (r.statut === 'brouillon' || r.statut === 'non_commencee')).forEach((r) => Object.assign(r, { statut: 'soumise', notes: r.attendu, evaluations: r.evaluations.length ? r.evaluations : ['Composition'] }));
  s2.forEach((r, i) => {
    if (r.statut === 'soumise') r.historique = [{ quand: isoMinute(ilYa(i % 3, 8 + (i % 8), 15)), action: 'Soumission', par: r.prof }];
    if (r.statut === 'validee') r.historique = [{ quand: isoMinute(ilYa(6, 17, 0)), action: 'Soumission', par: r.prof }, { quand: isoMinute(ilYa(5, 10, 20)), action: 'Validation', par: 'Jean-Pierre Manga' }];
  });
  const aCorriger = s2.find((r) => r.statut === 'brouillon' && r.classe === '1ère D') ?? s2.find((r) => r.statut === 'brouillon');
  if (aCorriger) {
    aCorriger.statut = 'correction';
    aCorriger.notes = aCorriger.attendu;
    aCorriger.historique = [
      { quand: isoMinute(ilYa(3, 16, 40)), action: 'Soumission', par: aCorriger.prof },
      { quand: isoMinute(ilYa(2, 9, 5)), action: 'Correction demandée', par: 'Jean-Pierre Manga', commentaire: 'Deux notes semblent inversées (lignes 7 et 8). Merci de vérifier avec les copies.' },
    ];
  }
  const resoumise = s2.find((r) => r.statut === 'soumise' && r.classe === 'Tle C') ?? s2.find((r) => r.statut === 'soumise');
  if (resoumise)
    resoumise.historique = [
      { quand: isoMinute(ilYa(4, 15, 0)), action: 'Soumission', par: resoumise.prof },
      { quand: isoMinute(ilYa(3, 11, 30)), action: 'Correction demandée', par: 'Jean-Pierre Manga', commentaire: 'Un élève absent a reçu 0 au lieu de ABS.' },
      { quand: isoMinute(ilYa(1, 18, 10)), action: 'Nouvelle soumission', par: resoumise.prof, commentaire: 'Corrigé : ABS pour l’élève absent.' },
    ];

  const comptes: CompteSecretaire[] = [
    { id: 1, nom: 'Nadine Ekotto', email: 'secretaire@etoiles.cm', telephone: '+237 677 41 22 90', actif: true, droits: TOUS_DROITS_SECRETAIRE.filter((d) => d !== 'supprimer'), creeLe: '2026-08-25', derniereConnexion: isoMinute(ilYa(0, 7, 52)) },
    { id: 2, nom: 'Paul Biyong', email: 'paul.b@etoiles.cm', telephone: '+237 690 15 63 07', actif: true, droits: ['eleves', 'classes', 'bulletins', 'caisse'], creeLe: '2026-09-01', derniereConnexion: isoMinute(ilYa(0, 8, 30)) },
    { id: 3, nom: 'Carine Tagne', email: 'carine.t@etoiles.cm', telephone: '+237 655 70 48 12', actif: false, droits: ['eleves'], creeLe: '2026-09-01', derniereConnexion: isoMinute(ilYa(23, 16, 0)) },
  ];
  const anneesScolaires: AnneeScolaire[] = [
    { id: 1, annee: '2026-2027', statut: 'active', sequences: [['2026-09-08', '2026-10-10'], ['2026-10-13', '2026-12-05'], ['2027-01-05', '2027-02-13'], ['2027-02-16', '2027-03-27'], ['2027-04-13', '2027-05-15'], ['2027-05-18', '2027-06-12']].map(([debut, fin], i) => ({ n: i + 1, debut, fin })) },
    { id: 2, annee: '2025-2026', statut: 'archivee', sequences: [] },
    { id: 3, annee: '2024-2025', statut: 'archivee', sequences: [] },
  ];
  const parametres: Parametres = {
    nom: 'Collège Bilingue Les Étoiles', sigle: 'CBE', adresse: 'Rue 1.234, Bastos', ville: 'Yaoundé', telephone: '+237 222 20 30 40', email: 'contact@etoiles.cm', devise: 'Travail · Discipline · Réussite', couleur: '#1C32A5',
    signataire: 'Jean-Pierre Manga', titreSignataire: 'Le Principal', autorisation: 'Arrêté n° 2014/0457/MINESEC',
    mentions: [{ min: 18, libelle: 'Excellent' }, { min: 16, libelle: 'Très bien' }, { min: 14, libelle: 'Bien' }, { min: 12, libelle: 'Assez bien' }, { min: 10, libelle: 'Passable' }, { min: 8, libelle: 'Insuffisant' }, { min: 0, libelle: 'Faible' }],
    frais: [{ niveau: 'Premier cycle (6ème à 3ème)', montant: 150000 }, { niveau: 'Second cycle (2nde à Tle)', montant: 185000 }],
    tranches: [{ libelle: 'Inscription', part: 17, limite: '2026-09-05' }, { libelle: '1re tranche', part: 33, limite: '2026-09-30' }, { libelle: '2e tranche', part: 33, limite: '2026-11-30' }, { libelle: '3e tranche', part: 17, limite: '2027-01-15' }],
  };
  const connexions: Connexion[] = [
    { id: 1, quand: isoMinute(ilYa(0, 7, 40)), appareil: 'Chrome · Windows', lieu: 'Yaoundé', resultat: 'Réussie' },
    { id: 2, quand: isoMinute(ilYa(1, 21, 12)), appareil: 'Application · Android', lieu: 'Yaoundé', resultat: 'Réussie' },
    { id: 3, quand: isoMinute(ilYa(2, 6, 58)), appareil: 'Chrome · Android', lieu: 'Douala', resultat: 'Échouée' },
    { id: 4, quand: isoMinute(ilYa(2, 7, 1)), appareil: 'Chrome · Android', lieu: 'Douala', resultat: 'Réussie' },
    { id: 5, quand: isoMinute(ilYa(4, 18, 30)), appareil: 'Chrome · Windows', lieu: 'Yaoundé', resultat: 'Réussie' },
  ];

  const bulletins: Record<string, EtatBulletin> = Object.fromEntries([
    ...nomsClasses.map((c) => [`${c}|Séquence 1`, { statut: 'publie', le: isoMinute(ilYa(40, 15, 0)), par: 'Nadine Ekotto' }]),
    ['5ème A|Séquence 2', { statut: 'genere', le: isoMinute(ilYa(1, 16, 20)), par: 'Paul Biyong' }],
    ['4ème A|Séquence 2', { statut: 'publie', le: isoMinute(ilYa(2, 11, 5)), par: 'Nadine Ekotto' }],
  ]);

  const anciens: AncienEleve[] = Array.from({ length: 14 }, (_, i) => {
    const f = i % 2 === 1;
    const noms = ['NJOYA', 'EBOUA', 'MOUKOURI', 'BELLA', 'NDONGO', 'FOUDA', 'ESSAMA', 'MEKONGO', 'ZANGA', 'AMOUGOU', 'NGONO', 'ONANA', 'TSALA', 'ELOUNDOU'];
    const anciennes = ['6ème A', '6ème B', '5ème A', '4ème A', '3ème A', '2nde C', '1ère D'];
    const moyenne = [12.4, 9.1, 14.7, 10.2, 8.3, 11.9, 15.6, 13.1, 7.8, 10.6, 12.9, 9.6, 16.2, 11.3][i];
    return {
      id: i + 1,
      matricule: `CBE25-${pad(300 + i, 4)}`,
      nom: noms[i],
      prenom: f ? ['Sandrine', 'Laure', 'Mireille', 'Carole', 'Estelle', 'Rita', 'Diane'][i % 7] : ['Kevin', 'Hervé', 'Patrick', 'Désiré', 'Arnold', 'Rodrigue', 'Samuel'][i % 7],
      sexe: f ? 'F' : 'M',
      classe: anciennes[i % anciennes.length],
      moyenne,
      decision: moyenne >= 10 ? 'Admis' : i === 8 ? 'Exclu' : 'Redouble',
      tuteur: `${f ? 'Mme' : 'M.'} ${noms[i]} ${['Jeanne', 'Robert', 'Claire', 'Thomas'][i % 4]}`,
      telephone: `+237 6${77 - i} ${pad(110 + i * 9, 3)} ${pad(400 + i * 11, 3)}`,
    };
  });
  const annees: AnneePassee[] = [
    { annee: '2025-2026', effectif: 796, reussite: 81, recettes: 98_400_000, eleves: anciens },
    {
      annee: '2024-2025',
      effectif: 731,
      reussite: 77,
      recettes: 87_150_000,
      eleves: anciens.slice(0, 6).map((a, i) => ({ ...a, id: 100 + i, matricule: a.matricule.replace('CBE25', 'CBE24'), classe: ['6ème A', '6ème B', '5ème A', '4ème A', '3ème A', '2nde C'][i], moyenne: Math.max(7, a.moyenne - 1.2), decision: a.moyenne - 1.2 >= 10 ? 'Admis' : 'Redouble' })),
    },
  ];

  const journal: EntreeJournal[] = [
    { id: 1, quand: isoMinute(ilYa(0, 8, 5)), utilisateur: 'Nadine Ekotto', role: 'Secrétaire', etablissement: 'Les Étoiles', operation: 'Encaissement', module: 'Caisse', element: `TR-000479 · 50 000 FCFA · ${el(18).nom} ${el(18).prenom}` },
    { id: 2, quand: isoMinute(ilYa(0, 8, 41)), utilisateur: 'Paul Biyong', role: 'Secrétaire', etablissement: 'Les Étoiles', operation: 'Encaissement', module: 'Caisse', element: `TR-000480 · 45 000 FCFA · ${el(30).nom} ${el(30).prenom}` },
    { id: 3, quand: isoMinute(ilYa(0, 9, 3)), utilisateur: 'Nadine Ekotto', role: 'Secrétaire', etablissement: 'Les Étoiles', operation: 'Dépense', module: 'Dépenses', element: 'TR-000481 · 18 500 FCFA · Craies, marqueurs et registres' },
    { id: 4, quand: isoMinute(ilYa(1, 17, 5)), utilisateur: 'Nadine Ekotto', role: 'Secrétaire', etablissement: 'Les Étoiles', operation: 'Clôture', module: 'Clôture de caisse', element: 'Écart : −1 000 FCFA', motif: 'Pièce de 1 000 FCFA manquante, signalée à l’administrateur.' },
    { id: 5, quand: isoMinute(ilYa(2, 11, 12)), utilisateur: 'Nadine Ekotto', role: 'Secrétaire', etablissement: 'Les Étoiles', operation: 'Impression', module: 'Documents', element: `CS-2026-0041 · Certificat de scolarité · ${el(4).nom} ${el(4).prenom}` },
    { id: 6, quand: isoMinute(ilYa(2, 15, 30)), utilisateur: 'Nadine Ekotto', role: 'Secrétaire', etablissement: 'Les Étoiles', operation: 'Demande', module: 'Remboursements', element: `25 000 FCFA · ${el(6).nom} ${el(6).prenom}`, motif: "Départ de l'établissement (mutation des parents à Garoua)." },
  ];

  // Quelques éléments déjà retirés par les secrétaires (visibles dans l'historique de l'administrateur)
  const retirer = <T extends Trace>(x: T | undefined, etat: 'masque' | 'supprime', par: string, motif: string, jours: number) => x && Object.assign(x, { etat, retirePar: par, motifRetrait: motif, retireLe: isoMinute(ilYa(jours, 11, 20)) });
  retirer(parents.find((p) => p.id === 33), 'supprime', 'Paul Biyong', 'Doublon créé par erreur', 1);
  retirer(absences.find((a) => a.id === 7), 'masque', 'Nadine Ekotto', 'Absence saisie deux fois', 2);
  journal.push(
    { id: 7, quand: isoMinute(ilYa(1, 11, 20)), utilisateur: 'Paul Biyong', role: 'Secrétaire', etablissement: 'Les Étoiles', operation: 'Suppression', module: 'Parents et tuteurs', element: parents.find((p) => p.id === 33)?.nom ?? 'Parent', elementId: 33, motif: 'Doublon créé par erreur' },
    { id: 8, quand: isoMinute(ilYa(2, 11, 20)), utilisateur: 'Nadine Ekotto', role: 'Secrétaire', etablissement: 'Les Étoiles', operation: 'Masquage', module: 'Absences', element: 'Absence du ' + absences[6].date, elementId: 7, motif: 'Absence saisie deux fois' },
    { id: 9, quand: isoMinute(ilYa(5, 10, 20)), utilisateur: 'Jean-Pierre Manga', role: 'Administrateur', etablissement: 'Les Étoiles', operation: 'Validation', module: 'Notes', element: 'Notes de la 6ème A, séquence 2' },
    { id: 10, quand: isoMinute(ilYa(3, 9, 0)), utilisateur: 'M. ESSOMBA Paul', role: 'Enseignant', etablissement: 'Les Étoiles', operation: 'Soumission', module: 'Notes', element: 'Mathématiques, 3ème A, séquence 2' },
  );

  return { version: VERSION_DONNEES, eleves, parents, enseignants, classes, matieres, absences, incidents, creneaux, operations, remboursements, clotures, annonces, documents, journal, releves, bulletins, annees, comptes, anneesScolaires, parametres, connexions };
}
