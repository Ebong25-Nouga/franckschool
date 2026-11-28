import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/auth';
import { ecole, type Mode } from '@/data/demo';
import { etatInitial, isoJour, isoMinute, VERSION_DONNEES, type EntreeJournal, type Etat, type Operation, type Parametres } from './donnees';

/**
 * « Magasin » de l'espace secrétariat (démonstration, sans serveur).
 * Règle : toute action qui change une donnée écrit une ligne dans le journal.
 * La secrétaire ne peut ni modifier ni effacer une ligne du journal : aucune fonction ne le permet.
 */
const CLE = 'fs.secretariat';

type AvecId = { id: number };
type Collection = { [K in keyof Etat]: Etat[K] extends AvecId[] ? K : never }[keyof Etat];
type Element<K extends Collection> = Etat[K] extends (infer T)[] ? T : never;
export type Trace = Pick<EntreeJournal, 'module' | 'element' | 'elementId' | 'avant' | 'apres' | 'motif'> & { operation: string };

interface Api {
  etat: Etat;
  utilisateur: string;
  journaliser: (t: Trace) => void;
  ajouter: <K extends Collection>(cle: K, item: Omit<Element<K>, 'id'>, t: Trace) => number;
  modifier: <K extends Collection>(cle: K, id: number, patch: Partial<Element<K>>, t: Trace) => void;
  /** Retrait réel, réservé aux données non historiques (créneaux d'emploi du temps). La trace reste au journal. */
  enlever: (cle: 'creneaux', id: number, t: Trace) => void;
  /** Masquage ou suppression logique : l'élément reste en base, l'administrateur le voit et peut le restaurer. */
  retirer: <K extends Collection>(cle: K, id: number, mode: 'masque' | 'supprime', motif: string, t: Omit<Trace, 'operation' | 'motif'>) => void;
  /** Restauration par l'administrateur d'un élément masqué ou supprimé (motif obligatoire, tracé). */
  restaurer: <K extends Collection>(cle: K, id: number, motif: string, t: Omit<Trace, 'operation' | 'motif'>) => void;
  majParametres: (p: Parametres, t: Trace) => void;
  encaisser: (p: { eleveId: number; libelle: string; montant: number; mode: Mode; reference?: string }) => Operation;
  annulerOperation: (id: number, motif: string) => void;
  depenser: (p: { libelle: string; categorie: string; beneficiaire: string; montant: number; mode: Mode; reference?: string; justificatif: string }) => Operation;
  executerRemboursement: (id: number, mode: Mode) => void;
  /** Générer puis publier les bulletins d'une classe pour une période. */
  etatBulletins: (classe: string, periode: string, statut: 'genere' | 'publie') => void;
  numeroDocument: (prefixe: string) => string;
  reinitialiser: () => void;
}

const Ctx = createContext<Api>(null!);

function charger(): Etat {
  try {
    const v = localStorage.getItem(CLE);
    if (v) {
      const e = JSON.parse(v) as Etat;
      if (e.version === VERSION_DONNEES) return e;
    }
  } catch {
    /* stockage indisponible ou données anciennes : on repart des données d'exemple */
  }
  return etatInitial();
}

const prochainId = (l: AvecId[]) => l.reduce((m, x) => Math.max(m, x.id), 0) + 1;

export function SecretariatProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const utilisateur = session?.nom ?? 'Inconnu';
  const role = session?.espace === 'admin' ? 'Administrateur' : 'Secrétaire';
  const [etat, setEtat] = useState<Etat>(charger);
  // Copie toujours à jour (mise à jour par appliquer), pour calculer un identifiant de façon synchrone
  const ref = useRef(etat);

  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch {
      /* rien : les données restent en mémoire */
    }
  }, [etat]);

  const ligne = useCallback(
    (e: Etat, t: Trace): EntreeJournal => ({ id: prochainId(e.journal), quand: isoMinute(new Date()), utilisateur, role, etablissement: ecole.court, ...t }),
    [utilisateur, role],
  );

  const appliquer = useCallback(
    (f: (e: Etat) => Etat, t?: Trace) => {
      const suivant = f(ref.current);
      const final = t ? { ...suivant, journal: [ligne(suivant, t), ...suivant.journal] } : suivant;
      ref.current = final;
      setEtat(final);
    },
    [ligne],
  );

  const api = useMemo<Api>(() => {
    const numeroOp = (e: Etat) => `TR-${String(470 + prochainId(e.operations)).padStart(6, '0')}`;
    return {
      etat,
      utilisateur,
      journaliser: (t) => appliquer((e) => e, t),
      ajouter: (cle, item, t) => {
        const id = prochainId(ref.current[cle] as AvecId[]);
        appliquer((e) => ({ ...e, [cle]: [{ ...item, id }, ...(e[cle] as AvecId[])] }), { ...t, elementId: id });
        return id;
      },
      modifier: (cle, id, patch, t) => appliquer((e) => ({ ...e, [cle]: (e[cle] as AvecId[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) }), { ...t, elementId: id }),
      enlever: (cle, id, t) => appliquer((e) => ({ ...e, [cle]: e[cle].filter((x) => x.id !== id) }), { ...t, elementId: id }),
      retirer: (cle, id, mode, motif, t) =>
        appliquer(
          (e) => ({ ...e, [cle]: (e[cle] as AvecId[]).map((x) => (x.id === id ? { ...x, etat: mode, motifRetrait: motif, retirePar: utilisateur, retireLe: isoMinute(new Date()) } : x)) }),
          { ...t, elementId: id, motif, operation: mode === 'masque' ? 'Masquage' : 'Suppression' },
        ),
      restaurer: (cle, id, motif, t) =>
        appliquer(
          (e) => ({ ...e, [cle]: (e[cle] as AvecId[]).map((x) => (x.id === id ? { ...x, etat: 'actif', motifRetrait: undefined, retirePar: undefined, retireLe: undefined } : x)) }),
          { ...t, elementId: id, motif, operation: 'Restauration' },
        ),
      majParametres: (p, t) => appliquer((e) => ({ ...e, parametres: p }), t),
      encaisser: ({ eleveId, libelle, montant, mode, reference }) => {
        const e0 = ref.current;
        const el = e0.eleves.find((x) => x.id === eleveId)!;
        const op: Operation = { id: prochainId(e0.operations), numero: numeroOp(e0), date: isoMinute(new Date()), type: 'recette', libelle, eleveId, eleve: `${el.nom} ${el.prenom}`, classe: el.classe, mode, montant, auteur: utilisateur, reference: reference || undefined };
        appliquer(
          (e) => ({ ...e, operations: [op, ...e.operations], eleves: e.eleves.map((x) => (x.id === eleveId ? { ...x, paye: x.paye + montant } : x)) }),
          { operation: 'Encaissement', module: 'Caisse', element: `${op.numero} · ${montant.toLocaleString('fr-FR')} FCFA · ${op.eleve}`, elementId: op.id, apres: `${libelle}, ${mode}${reference ? `, réf. ${reference}` : ''}` },
        );
        return op;
      },
      annulerOperation: (id, motif) => {
        const e0 = ref.current;
        const orig = e0.operations.find((o) => o.id === id)!;
        const inverse: Operation = { ...orig, id: prochainId(e0.operations), numero: numeroOp(e0), date: isoMinute(new Date()), type: 'annulation', libelle: `Annulation de ${orig.numero}`, montant: orig.montant, auteur: utilisateur, origine: orig.numero, annulee: undefined, reference: undefined };
        appliquer(
          (e) => ({
            ...e,
            operations: [inverse, ...e.operations.map((o) => (o.id === id ? { ...o, annulee: { par: utilisateur, le: inverse.date, motif, numero: inverse.numero } } : o))],
            eleves: orig.type === 'recette' && orig.eleveId ? e.eleves.map((x) => (x.id === orig.eleveId ? { ...x, paye: Math.max(0, x.paye - orig.montant) } : x)) : e.eleves,
          }),
          { operation: 'Annulation', module: 'Caisse', element: `${orig.numero} annulée par ${inverse.numero}`, elementId: orig.id, avant: `${orig.libelle}, ${orig.montant.toLocaleString('fr-FR')} FCFA`, apres: 'Écriture inverse enregistrée', motif },
        );
      },
      depenser: (p) => {
        const e0 = ref.current;
        const op: Operation = { id: prochainId(e0.operations), numero: numeroOp(e0), date: isoMinute(new Date()), type: 'depense', auteur: utilisateur, ...p, reference: p.reference || undefined };
        appliquer((e) => ({ ...e, operations: [op, ...e.operations] }), { operation: 'Dépense', module: 'Dépenses', element: `${op.numero} · ${p.montant.toLocaleString('fr-FR')} FCFA · ${p.libelle}`, elementId: op.id, apres: `${p.categorie}, ${p.beneficiaire}, justificatif ${p.justificatif}` });
        return op;
      },
      executerRemboursement: (id, mode) => {
        const e0 = ref.current;
        const d = e0.remboursements.find((x) => x.id === id)!;
        const op: Operation = { id: prochainId(e0.operations), numero: numeroOp(e0), date: isoMinute(new Date()), type: 'remboursement', libelle: `Remboursement : ${d.motif}`, eleveId: d.eleveId, eleve: d.eleve, classe: d.classe, mode, montant: d.montant, auteur: utilisateur, origine: d.paiement };
        appliquer(
          (e) => ({
            ...e,
            operations: [op, ...e.operations],
            remboursements: e.remboursements.map((x) => (x.id === id ? { ...x, statut: 'executee', executeLe: op.date } : x)),
            eleves: e.eleves.map((x) => (x.id === d.eleveId ? { ...x, paye: Math.max(0, x.paye - d.montant) } : x)),
          }),
          { operation: 'Exécution', module: 'Remboursements', element: `${op.numero} · ${d.montant.toLocaleString('fr-FR')} FCFA · ${d.eleve}`, elementId: id, avant: 'Approuvée', apres: `Exécutée (${mode})` },
        );
      },
      etatBulletins: (classe, periode, statut) =>
        appliquer((e) => ({ ...e, bulletins: { ...e.bulletins, [`${classe}|${periode}`]: { statut, le: isoMinute(new Date()), par: utilisateur } } }), {
          operation: statut === 'genere' ? 'Génération' : 'Publication aux parents',
          module: 'Bulletins',
          element: `Bulletins ${classe}, ${periode}`,
        }),
      numeroDocument: (prefixe) => `${prefixe}-${new Date().getFullYear()}-${String(prochainId(ref.current.documents) + 40).padStart(4, '0')}`,
      reinitialiser: () => {
        const e = etatInitial();
        ref.current = e;
        setEtat(e);
      },
    };
  }, [etat, utilisateur, appliquer]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSecretariat = () => useContext(Ctx);

/* ---------- Sélecteurs utiles ---------- */
export const visibles = <T extends { etat: string }>(l: T[]) => l.filter((x) => x.etat === 'actif');
export const aujourdhui = () => isoJour(new Date());
