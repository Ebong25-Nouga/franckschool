/**
 * Données d'exemple de l'espace parent (Mme Mbarga Odile, 2 enfants).
 * Remplacées par l'API Laravel lors du branchement du backend.
 */

export interface Enfant {
  id: number;
  prenom: string;
  nom: string;
  sexe: 'F' | 'M';
  classe: string;
  matricule: string;
  naissance: string;
  lieu: string;
  statut: string;
  salle: string;
  pp: { nom: string; matiere: string };
  lien: string;
  du: number;
  paye: number;
}

export const enfants: Enfant[] = [
  { id: 1, prenom: 'Marie-Claire', nom: 'MBARGA', sexe: 'F', classe: '4ème A', matricule: 'CBE26-0001', naissance: '12 mars 2012', lieu: 'Yaoundé', statut: 'Ancienne élève', salle: 'Salle 7, bâtiment B', pp: { nom: 'Mme ABENA Lucie', matiere: 'Anglais' }, lien: 'Mère', du: 150000, paye: 125000 },
  { id: 2, prenom: 'Junior', nom: 'MBARGA', sexe: 'M', classe: '6ème B', matricule: 'CBE26-0044', naissance: '4 août 2014', lieu: 'Yaoundé', statut: 'Nouvel élève', salle: 'Salle 2, bâtiment A', pp: { nom: 'Mme EYENGA Rachel', matiere: 'EPS' }, lien: 'Mère', du: 150000, paye: 150000 },
];

export const parent = { nom: 'Mme Mbarga Odile', prenom: 'Odile', telephone: '+237 677 12 45 90', email: 'odile.mbarga@gmail.com', profession: 'Commerçante', adresse: 'Mvog-Mbi, Yaoundé' };

/* ---------- Matières, professeurs et notes ---------- */
export interface LigneNote {
  matiere: string;
  coef: number;
  prof: string;
  s1: number;
  s2: number | null;
  groupe: 1 | 2 | 3;
}

export const notesParEnfant: Record<number, LigneNote[]> = {
  1: [
    { matiere: 'Français', coef: 4, prof: 'Mme NGO BASSA Rose', s1: 14.5, s2: 13, groupe: 1 },
    { matiere: 'Anglais', coef: 3, prof: 'Mme ABENA Lucie', s1: 16, s2: 17.5, groupe: 1 },
    { matiere: 'Histoire-Géographie', coef: 2, prof: 'M. KAMGA Hervé', s1: 13, s2: 12, groupe: 1 },
    { matiere: 'Mathématiques', coef: 5, prof: 'M. ESSOMBA Paul', s1: 12.25, s2: 14, groupe: 2 },
    { matiere: 'Physique-Chimie', coef: 4, prof: 'M. FOTSO Alain', s1: 9.5, s2: 11.5, groupe: 2 },
    { matiere: 'SVT', coef: 2, prof: 'Mme OWONA Sylvie', s1: 15, s2: null, groupe: 2 },
    { matiere: 'Éducation civique', coef: 1, prof: 'M. KAMGA Hervé', s1: 16, s2: 15, groupe: 3 },
    { matiere: 'EPS', coef: 1, prof: 'Mme EYENGA Rachel', s1: 17, s2: 16, groupe: 3 },
  ],
  2: [
    { matiere: 'Français', coef: 4, prof: 'Mme NGO BASSA Rose', s1: 11, s2: 12.5, groupe: 1 },
    { matiere: 'Anglais', coef: 3, prof: 'Mme ABENA Lucie', s1: 13.5, s2: 12, groupe: 1 },
    { matiere: 'Histoire-Géographie', coef: 2, prof: 'M. KAMGA Hervé', s1: 10, s2: 11, groupe: 1 },
    { matiere: 'Mathématiques', coef: 4, prof: 'M. TAGNE Serge', s1: 8.5, s2: 10.25, groupe: 2 },
    { matiere: 'Sciences', coef: 2, prof: 'Mme OWONA Sylvie', s1: 12, s2: null, groupe: 2 },
    { matiere: 'Éducation civique', coef: 1, prof: 'M. KAMGA Hervé', s1: 14, s2: 13, groupe: 3 },
    { matiere: 'EPS', coef: 1, prof: 'Mme EYENGA Rachel', s1: 18, s2: 17, groupe: 3 },
  ],
};

export const rangs: Record<number, { s1: [number, number]; moyClasse: number }> = {
  1: { s1: [7, 44], moyClasse: 10.92 },
  2: { s1: [18, 46], moyClasse: 11.3 },
};

export const bulletins = [
  { id: 1, enfant: 1, periode: '1er trimestre', annee: '2026-2027', etat: 'a_venir' as const, date: 'Disponible vers le 12 décembre' },
  { id: 2, enfant: 1, periode: '3e trimestre', annee: '2025-2026', etat: 'publie' as const, date: 'Publié le 26 juin 2026', moyenne: 12.84, rang: '9e/42' },
  { id: 3, enfant: 1, periode: '2e trimestre', annee: '2025-2026', etat: 'publie' as const, date: 'Publié le 3 avril 2026', moyenne: 12.1, rang: '11e/42' },
  { id: 4, enfant: 2, periode: '1er trimestre', annee: '2026-2027', etat: 'a_venir' as const, date: 'Disponible vers le 12 décembre' },
];

/* ---------- Paiements ---------- */
export const echeancier: Record<number, { libelle: string; montant: number; limite: string; paye: number }[]> = {
  1: [
    { libelle: 'Inscription', montant: 25000, limite: '05/09/2026', paye: 25000 },
    { libelle: '1re tranche', montant: 50000, limite: '30/09/2026', paye: 50000 },
    { libelle: '2e tranche', montant: 50000, limite: '30/11/2026', paye: 50000 },
    { libelle: '3e tranche', montant: 25000, limite: '15/01/2027', paye: 0 },
  ],
  2: [
    { libelle: 'Inscription', montant: 25000, limite: '05/09/2026', paye: 25000 },
    { libelle: '1re tranche', montant: 50000, limite: '30/09/2026', paye: 50000 },
    { libelle: '2e tranche', montant: 50000, limite: '30/11/2026', paye: 50000 },
    { libelle: '3e tranche', montant: 25000, limite: '15/01/2027', paye: 25000 },
  ],
};

export interface Paiement {
  id: number;
  enfant: number;
  date: string;
  libelle: string;
  mode: 'Espèces' | 'MTN MoMo' | 'Orange Money' | 'Banque';
  montant: number;
  recu: string;
  reference?: string;
  caissier: string;
}

export const paiements: Paiement[] = [
  { id: 1, enfant: 1, date: '24/11/2026', libelle: 'Scolarité, 2e tranche', mode: 'MTN MoMo', montant: 50000, recu: 'REC-000482', reference: 'MP261124.0912.A83', caissier: 'Nadine Ekotto' },
  { id: 2, enfant: 2, date: '02/10/2026', libelle: 'Scolarité, 2e et 3e tranches', mode: 'Espèces', montant: 75000, recu: 'REC-000311', caissier: 'Paul Biyong' },
  { id: 3, enfant: 1, date: '28/09/2026', libelle: 'Scolarité, 1re tranche', mode: 'Orange Money', montant: 50000, recu: 'REC-000187', reference: 'OM2809.1432.K71', caissier: 'Nadine Ekotto' },
  { id: 4, enfant: 2, date: '05/09/2026', libelle: 'Inscription et 1re tranche', mode: 'Espèces', montant: 75000, recu: 'REC-000108', caissier: 'Paul Biyong' },
  { id: 5, enfant: 1, date: '05/09/2026', libelle: 'Inscription', mode: 'Espèces', montant: 25000, recu: 'REC-000107', caissier: 'Paul Biyong' },
];

/* ---------- Notifications ---------- */
export type TypeNotif = 'paiement' | 'note' | 'bulletin' | 'absence' | 'ecole';
export const notificationsParent: { id: number; enfant: number | null; type: TypeNotif; titre: string; texte: string; quand: string; jour: string; lu: boolean }[] = [
  { id: 1, enfant: 1, type: 'paiement', titre: 'Paiement reçu', texte: '50 000 FCFA reçus par MTN MoMo pour la 2e tranche de Marie-Claire. Reçu REC-000482.', quand: '09:12', jour: 'Aujourd’hui', lu: false },
  { id: 2, enfant: 1, type: 'note', titre: 'Nouvelles notes', texte: 'Les notes d’Anglais et de Mathématiques de la séquence 2 sont disponibles.', quand: '08:40', jour: 'Aujourd’hui', lu: false },
  { id: 3, enfant: null, type: 'ecole', titre: 'Réunion des parents', texte: 'Réunion parents-professeurs le samedi 6 décembre à 9 h, dans la grande salle.', quand: '17:05', jour: 'Hier', lu: false },
  { id: 4, enfant: 2, type: 'absence', titre: 'Retard signalé', texte: 'Junior est arrivé à 7 h 52 (22 min de retard) au cours de Français.', quand: '08:01', jour: 'Hier', lu: true },
  { id: 5, enfant: 1, type: 'paiement', titre: 'Rappel d’échéance', texte: 'La 3e tranche de Marie-Claire (25 000 FCFA) est due avant le 15 janvier 2027.', quand: '10:00', jour: '20 nov.', lu: true },
  { id: 6, enfant: null, type: 'ecole', titre: 'Compositions de la séquence 2', texte: 'Les compositions se déroulent du 1er au 5 décembre. Les cours se terminent à 12 h 30.', quand: '14:20', jour: '18 nov.', lu: true },
  { id: 7, enfant: 2, type: 'note', titre: 'Nouvelles notes', texte: 'Les notes de Mathématiques de la séquence 2 sont disponibles.', quand: '16:45', jour: '15 nov.', lu: true },
];

/* ---------- Informations scolaires ---------- */
export const calendrier = [
  { date: '1er – 5 déc.', titre: 'Compositions de la séquence 2' },
  { date: '6 déc.', titre: 'Réunion parents-professeurs, 9 h' },
  { date: '12 déc.', titre: 'Remise des bulletins du 1er trimestre' },
  { date: '19 déc.', titre: 'Début des congés de Noël' },
  { date: '5 janv.', titre: 'Rentrée, début de la séquence 3' },
  { date: '15 janv.', titre: 'Date limite de la 3e tranche' },
];

export const emploiParClasse: Record<number, { jour: string; cours: { h: string; m: string }[] }[]> = {
  1: [
    { jour: 'Lundi', cours: [{ h: '07:30', m: 'Mathématiques' }, { h: '09:30', m: 'Français' }, { h: '13:00', m: 'Anglais' }] },
    { jour: 'Mardi', cours: [{ h: '07:30', m: 'Physique-Chimie' }, { h: '10:30', m: 'Histoire-Géographie' }] },
    { jour: 'Mercredi', cours: [{ h: '07:30', m: 'Français' }, { h: '10:30', m: 'EPS' }] },
    { jour: 'Jeudi', cours: [{ h: '07:30', m: 'Mathématiques' }, { h: '10:30', m: 'SVT' }, { h: '13:00', m: 'Éducation civique' }] },
    { jour: 'Vendredi', cours: [{ h: '07:30', m: 'Anglais' }, { h: '09:30', m: 'Physique-Chimie' }] },
  ],
  2: [
    { jour: 'Lundi', cours: [{ h: '07:30', m: 'Français' }, { h: '09:30', m: 'Mathématiques' }] },
    { jour: 'Mardi', cours: [{ h: '07:30', m: 'Anglais' }, { h: '10:30', m: 'Sciences' }] },
    { jour: 'Mercredi', cours: [{ h: '07:30', m: 'Mathématiques' }, { h: '10:30', m: 'EPS' }] },
    { jour: 'Jeudi', cours: [{ h: '07:30', m: 'Histoire-Géographie' }, { h: '10:30', m: 'Français' }] },
    { jour: 'Vendredi', cours: [{ h: '07:30', m: 'Anglais' }, { h: '09:30', m: 'Éducation civique' }] },
  ],
};

export const moyenne = (lignes: LigneNote[], seq: 's1' | 's2') => {
  const l = lignes.filter((x) => x[seq] !== null);
  const total = l.reduce((s, x) => s + (x[seq] as number) * x.coef, 0);
  const coefs = l.reduce((s, x) => s + x.coef, 0);
  return coefs ? total / coefs : 0;
};
