import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, EyeOff, Info, MoreHorizontal, Search, Trash2, type LucideIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ecole } from '@/data/demo';
import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { useAuth } from '@/auth';
import { Button, IconButton, Modal } from '@/components/kit';
import { useSecretariat, visibles } from './store';
import type { EleveS } from './donnees';

/* ---------- Droits ---------- */
// eslint-disable-next-line react-refresh/only-export-components
export function useDroit() {
  const { session } = useAuth();
  return (code: string) => !!session && (session.espace === 'admin' || session.permissions.includes(code));
}

/* ---------- Dates ---------- */
// eslint-disable-next-line react-refresh/only-export-components
export const dateFr = (iso: string) => {
  const [a, m, j] = iso.slice(0, 10).split('-');
  return `${j}/${m}/${a}`;
};
// eslint-disable-next-line react-refresh/only-export-components
export const dateHeureFr = (iso: string) => `${dateFr(iso)} à ${iso.slice(11, 16).replace(':', ' h ')}`;
// eslint-disable-next-line react-refresh/only-export-components
export const montant = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
// eslint-disable-next-line react-refresh/only-export-components
export const nombre = (n: number) => n.toLocaleString('fr-FR');
// eslint-disable-next-line react-refresh/only-export-components
export const nomEleve = (e: Pick<EleveS, 'nom' | 'prenom'>) => `${e.nom} ${e.prenom}`;

/* ---------- Champs de formulaire ---------- */
export function Champ({ label, children, aide, erreur, className }: { label: string; children: ReactNode; aide?: string; erreur?: string | boolean | null; className?: string }) {
  return (
    <label className={cn('block min-w-0', className)}>
      <span className="field-label">{label}</span>
      {children}
      {typeof erreur === 'string' && erreur ? <span className="mt-1.5 block text-[13px] font-medium text-stylo">{erreur}</span> : aide ? <span className="mt-1.5 block text-[13px] text-encre-doux">{aide}</span> : null}
    </label>
  );
}
export const Saisie = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn('field-input', p.className)} />;
export const Zone = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={3} {...p} className={cn('field-input min-h-24 py-2.5', p.className)} />;
export function Liste({ options, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { options: (string | { value: string; label: string })[] }) {
  return (
    <select {...p} className={cn('field-input', p.className)}>
      {options.map((o) => (typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

/* ---------- Motif obligatoire (masquer, supprimer, annuler…) ---------- */
export function ModalMotif({ titre, texte, bouton, danger, onValider, onClose, rappel = 'Rien n’est effacé définitivement : l’administrateur voit toujours cet élément et peut le restaurer.' }: { titre: string; texte: string; bouton: string; danger?: boolean; onValider: (motif: string) => void; onClose: () => void; rappel?: string | false }) {
  const [motif, setMotif] = useState('');
  const [essai, setEssai] = useState(false);
  const ok = motif.trim().length >= 5;
  return (
    <Modal
      title={titre}
      lead={texte}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => (ok ? (onValider(motif.trim()), onClose()) : setEssai(true))}>{bouton}</Button>
        </>
      }
    >
      <Champ label="Motif (obligatoire)" erreur={essai && !ok && 'Écrivez un motif d’au moins 5 caractères.'} aide="Le motif est enregistré dans le journal avec votre nom, la date et l’heure.">
        <Zone value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Exemple : doublon créé par erreur le 24/11" />
      </Champ>
      {rappel && (
        <p className="mt-4 flex gap-2.5 rounded-xl bg-papier px-3.5 py-3 text-[13px] leading-relaxed text-encre-doux">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
          {rappel}
        </p>
      )}
    </Modal>
  );
}

/** Boutons « Masquer » et « Supprimer », affichés seulement si la secrétaire a le droit. */
export function BoutonsRetrait({ quoi, onRetirer }: { quoi: string; onRetirer: (mode: 'masque' | 'supprime', motif: string) => void }) {
  const peut = useDroit();
  const [mode, setMode] = useState<'masque' | 'supprime' | null>(null);
  if (!peut('masquer') && !peut('supprimer')) return null;
  return (
    <>
      {peut('masquer') && <IconButton icon={EyeOff} label={`Masquer ${quoi}`} onClick={() => setMode('masque')} />}
      {peut('supprimer') && <IconButton icon={Trash2} tone="stylo" label={`Supprimer ${quoi}`} onClick={() => setMode('supprime')} />}
      {mode && (
        <ModalMotif
          titre={mode === 'masque' ? `Masquer ${quoi}` : `Supprimer ${quoi}`}
          texte={mode === 'masque' ? 'L’élément disparaît de vos listes, mais reste visible pour l’administrateur.' : 'Suppression logique : l’élément est placé dans la corbeille de l’administrateur.'}
          bouton={mode === 'masque' ? 'Masquer' : 'Supprimer'}
          danger={mode === 'supprime'}
          onValider={(m) => onRetirer(mode, m)}
          onClose={() => setMode(null)}
        />
      )}
    </>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, total, parPage, onPage, quoi = 'éléments' }: { page: number; total: number; parPage: number; onPage: (p: number) => void; quoi?: string }) {
  const pages = Math.max(1, Math.ceil(total / parPage));
  if (total === 0) return null;
  const debut = (page - 1) * parPage + 1;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-papier-ligne/70 px-5 py-3.5 text-sm text-encre-doux sm:px-6">
      <p className="chiffres">
        {debut} à {Math.min(total, page * parPage)} sur {total} {quoi}
      </p>
      <div className="flex items-center gap-1">
        <IconButton icon={ChevronLeft} label="Page précédente" onClick={() => page > 1 && onPage(page - 1)} className={page <= 1 ? 'pointer-events-none opacity-40' : ''} />
        <span className="px-2 font-semibold text-encre chiffres">{page} / {pages}</span>
        <IconButton icon={ChevronRight} label="Page suivante" onClick={() => page < pages && onPage(page + 1)} className={page >= pages ? 'pointer-events-none opacity-40' : ''} />
      </div>
    </div>
  );
}

/* ---------- Choisir un élève (recherche par nom ou matricule) ---------- */
export function ChoisirEleve({ valeur, onChange, label = 'Élève' }: { valeur: number | null; onChange: (id: number | null) => void; label?: string }) {
  const { etat } = useSecretariat();
  const [q, setQ] = useState('');
  const choisi = etat.eleves.find((e) => e.id === valeur);
  const t = q.trim().toLowerCase();
  const res = t ? visibles(etat.eleves).filter((e) => e.situation === 'inscrit' && `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(t)).slice(0, 6) : [];
  if (choisi)
    return (
      <div>
        <span className="field-label">{label}</span>
        <div className="flex items-center justify-between gap-3 rounded-[10px] bg-brand-50/60 px-3.5 py-2.5 ring-1 ring-inset ring-brand-200">
          <span className="min-w-0">
            <span className="block truncate font-semibold">{nomEleve(choisi)}</span>
            <span className="block text-[13px] text-encre-doux">{choisi.matricule} · {choisi.classe}</span>
          </span>
          <button type="button" onClick={() => onChange(null)} className="cursor-pointer text-[13px] font-semibold text-brand-700 hover:underline">Changer</button>
        </div>
      </div>
    );
  return (
    <div className="relative">
      <label className="block">
        <span className="field-label">{label}</span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-encre-pale" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, prénom ou matricule" className="field-input pl-10" />
        </span>
      </label>
      {t && (
        <ul className="mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-white p-1 shadow-leve ring-1 ring-papier-ligne">
          {res.length === 0 && <li className="px-3 py-2.5 text-sm text-encre-doux">Aucun élève trouvé.</li>}
          {res.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => (onChange(e.id), setQ(''))} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-papier">
                <span className="truncate font-medium">{nomEleve(e)}</span>
                <span className="shrink-0 text-xs text-encre-doux">{e.matricule} · {e.classe}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Bandeau d'information ---------- */
export function Note({ children, ton = 'encre' }: { children: ReactNode; ton?: 'encre' | 'feutre' }) {
  return (
    <p className={cn('flex gap-2.5 rounded-xl px-4 py-3 text-[13.5px] leading-relaxed', ton === 'encre' ? 'bg-brand-50/70 text-brand-900' : 'bg-feutre-50 text-feutre-700')}>
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Grille de formulaire à deux colonnes. */
export const Grille = ({ children }: { children: ReactNode }) => <div className="grid gap-4 sm:grid-cols-2">{children}</div>;

/* ---------- Lien de l'école et WhatsApp ---------- */
// eslint-disable-next-line react-refresh/only-export-components
export const lienEcole = `franckschool.cm/${ecole.lien}`;
/** Lien WhatsApp avec message prérempli (vers un numéro, ou au choix de la personne si aucun numéro). */
// eslint-disable-next-line react-refresh/only-export-components
export function lienWhatsApp(texte: string, telephone?: string) {
  let n = (telephone ?? '').replace(/\D/g, '');
  if (n.length === 9) n = '237' + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(texte)}`;
}

/* ---------- Menu d'actions « ⋯ » d'une ligne de tableau ---------- */
export interface ActionMenu {
  label: string;
  icone: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}
export function MenuActions({ label, actions }: { label: string; actions: ActionMenu[] }) {
  const [pos, setPos] = useState<{ haut: number; droite: number } | null>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pos) return;
    const fermer = (e: Event) => {
      if (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Escape') return;
      if (e.type === 'mousedown' && (menu.current?.contains(e.target as Node) || bouton.current?.contains(e.target as Node))) return;
      setPos(null);
    };
    document.addEventListener('mousedown', fermer);
    document.addEventListener('keydown', fermer);
    window.addEventListener('scroll', fermer, true);
    window.addEventListener('resize', fermer);
    return () => {
      document.removeEventListener('mousedown', fermer);
      document.removeEventListener('keydown', fermer);
      window.removeEventListener('scroll', fermer, true);
      window.removeEventListener('resize', fermer);
    };
  }, [pos]);
  if (!actions.length) return null;
  return (
    <>
      <button
        ref={bouton}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        title={label}
        onClick={(e) => {
          e.stopPropagation();
          const r = e.currentTarget.getBoundingClientRect();
          const bas = window.innerHeight - r.bottom < actions.length * 44 + 24;
          setPos(pos ? null : { haut: bas ? r.top - actions.length * 44 - 14 : r.bottom + 6, droite: window.innerWidth - r.right });
        }}
        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-encre-doux transition-colors hover:bg-papier-2 hover:text-encre"
      >
        <MoreHorizontal className="size-[18px]" aria-hidden />
      </button>
      {pos &&
        createPortal(
          <div ref={menu} role="menu" style={{ top: pos.haut, right: pos.droite }} className="fixed z-50 w-60 animate-pop rounded-xl bg-white p-1.5 shadow-leve ring-1 ring-papier-ligne/70" onClick={(e) => e.stopPropagation()}>
            {actions.map((a) => (
              <button
                key={a.label}
                role="menuitem"
                type="button"
                onClick={() => {
                  setPos(null);
                  a.onClick();
                }}
                className={cn('flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium', a.danger ? 'text-stylo hover:bg-stylo-50' : 'text-encre hover:bg-papier')}
              >
                <a.icone className={cn('size-4', a.danger ? 'text-stylo' : 'text-encre-doux')} aria-hidden />
                {a.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

/* ---------- Espace courant : les pages communes servent au secrétariat ET à la direction ---------- */
/** « /secretariat » ou « /direction », selon l'adresse en cours (fonctionne aussi en mode « #/… »). */
// eslint-disable-next-line react-refresh/only-export-components
export function espaceCourant() {
  const adresse = window.location.hash ? window.location.hash.slice(1) : window.location.pathname;
  return adresse.startsWith('/direction') ? '/direction' : '/secretariat';
}
/** Adresse d'une page dans l'espace courant, ex. chemin('/caisse'). */
// eslint-disable-next-line react-refresh/only-export-components
export const chemin = (page = '') => espaceCourant() + page;
