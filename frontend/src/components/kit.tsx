import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Search, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { note as fmtNote, sequences } from '../data/demo';
import { placementFenetre } from '../lib/fenetre';

/* =========================================================
 * Boutons
 * ======================================================= */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'quiet';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white shadow-encre hover:bg-brand-800 active:bg-brand-900',
  secondary: 'bg-white text-encre ring-1 ring-inset ring-papier-ligne hover:ring-brand-300 hover:bg-brand-50/40',
  ghost: 'text-encre-doux hover:bg-papier-2 hover:text-encre',
  quiet: 'bg-papier-2 text-encre hover:bg-brand-100/60',
  danger: 'bg-stylo text-white hover:bg-stylo-700',
  success: 'bg-valide text-white hover:bg-valide-700',
};

export function Button({
  variant = 'primary',
  icon: Icon,
  iconRight: IconRight,
  size = 'md',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: LucideIcon; iconRight?: LucideIcon; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <button
      className={clsx(
        'inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-semibold transition-[background-color,box-shadow,color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
        size === 'lg' && 'min-h-12 px-5 text-[15px]',
        size === 'md' && 'min-h-11 px-4 text-sm',
        size === 'sm' && 'min-h-9 px-3 text-[13px]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className={clsx('shrink-0', size === 'sm' ? 'size-3.5' : 'size-4')} strokeWidth={2.2} aria-hidden />}
      {children}
      {IconRight && <IconRight className="size-4 shrink-0" strokeWidth={2.2} aria-hidden />}
    </button>
  );
}

export function IconButton({ icon: Icon, label, onClick, tone = 'neutre', className }: { icon: LucideIcon; label: string; onClick?: () => void; tone?: 'neutre' | 'encre' | 'stylo'; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx(
        'grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg transition-colors duration-150',
        tone === 'neutre' && 'text-encre-doux hover:bg-papier-2 hover:text-encre',
        tone === 'encre' && 'text-brand-700 hover:bg-brand-50',
        tone === 'stylo' && 'text-encre-doux hover:bg-stylo-50 hover:text-stylo',
        className,
      )}
    >
      <Icon className="size-[18px]" aria-hidden />
    </button>
  );
}

/* =========================================================
 * Surfaces
 * ======================================================= */
export function Panel({ className, children, as: As = 'section' }: { className?: string; children: ReactNode; as?: 'section' | 'div' | 'article' }) {
  return <As className={clsx('rounded-xl2 bg-white shadow-feuille', className)}>{children}</As>;
}

export function PanelHead({ title, hint, action, icon: Icon }: { title: string; hint?: ReactNode; action?: ReactNode; icon?: LucideIcon }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 pb-3 pt-5 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="size-4" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-encre">{title}</h2>
          {hint && <p className="mt-0.5 text-[13px] text-encre-doux">{hint}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}

/* =========================================================
 * En-tête de page
 * ======================================================= */
export function PageHeader({ title, lead, actions, kicker }: { title: ReactNode; lead?: ReactNode; actions?: ReactNode; kicker?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 max-w-3xl">
        {kicker && <div className="mb-2 text-sm font-medium text-encre-doux">{kicker}</div>}
        <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-encre sm:text-[34px]">{title}</h1>
        {lead && <p className="mt-2 text-[15px] leading-relaxed text-encre-doux">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* =========================================================
 * Chiffre clé
 * ======================================================= */
export function Figure({ label, value, unit, detail, tone = 'encre', icon: Icon }: { label: string; value: string; unit?: string; detail?: ReactNode; tone?: 'encre' | 'stylo' | 'valide' | 'neutre'; icon?: LucideIcon }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-encre-doux">
        {Icon && <Icon className="size-3.5" aria-hidden />}
        {label}
      </p>
      <p className={clsx('mt-1.5 flex items-baseline gap-1.5 font-display font-bold tracking-[-0.03em] chiffres', tone === 'stylo' ? 'text-stylo' : tone === 'valide' ? 'text-valide' : 'text-encre')}>
        <span className="text-[30px] leading-none">{value}</span>
        {unit && <span className="text-sm font-semibold tracking-normal text-encre-doux">{unit}</span>}
      </p>
      {detail && <div className="mt-2 text-[13px] leading-snug text-encre-doux">{detail}</div>}
    </div>
  );
}

/* =========================================================
 * Pastilles d'état
 * ======================================================= */
const pillTones = {
  encre: 'bg-brand-50 text-brand-800',
  valide: 'bg-valide-50 text-valide-700',
  feutre: 'bg-feutre-50 text-feutre-700',
  stylo: 'bg-stylo-50 text-stylo-700',
  neutre: 'bg-papier-2 text-encre-doux',
  orange: 'bg-orange-50 text-orange',
};
export type PillTone = keyof typeof pillTones;

export function Pill({ tone = 'neutre', children, dot = true }: { tone?: PillTone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none', pillTones[tone])}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden />}
      {children}
    </span>
  );
}

/* Note sur 20, couleur du stylo du correcteur */
export function Grade({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const tone = value < 10 ? 'text-stylo' : value >= 14 ? 'text-valide' : 'text-encre';
  return (
    <span className={clsx('font-display font-bold chiffres', tone, size === 'md' ? 'text-[15px]' : 'text-sm')}>
      {fmtNote(value)}
      <span className="ml-0.5 text-[0.75em] font-semibold text-encre-pale">/20</span>
    </span>
  );
}

/* =========================================================
 * Avatar à initiales (teinte stable par personne)
 * ======================================================= */
const teintes = ['bg-brand-100 text-brand-800', 'bg-[#E3F1EC] text-[#0A6646]', 'bg-[#FCEBDD] text-[#9A4A0B]', 'bg-[#EFE6FB] text-[#5B2FA0]', 'bg-[#FBE4EA] text-[#A3173A]', 'bg-[#E2F0F8] text-[#0B5B85]'];
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const clean = name.replace(/^(M\.|Mme)\s+/, '');
  const initials = clean.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  let h = 0;
  for (const c of clean) h = (h * 31 + c.charCodeAt(0)) % 997;
  return (
    <span
      aria-hidden
      className={clsx(
        'grid shrink-0 place-items-center rounded-full font-bold tracking-tight',
        teintes[h % teintes.length],
        size === 'sm' && 'size-7 text-[11px]',
        size === 'md' && 'size-9 text-xs',
        size === 'lg' && 'size-12 text-sm',
        size === 'xl' && 'size-16 text-lg',
        className,
      )}
    >
      {initials}
    </span>
  );
}

/* =========================================================
 * Champs
 * ======================================================= */
export function SearchInput({ value, onChange, placeholder, label, className }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; className?: string }) {
  return (
    <label className={clsx('relative block w-full', className)}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-encre-pale" aria-hidden />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field-input pl-10" />
    </label>
  );
}

export function Select({ label, value, onChange, options, hideLabel, className }: { label: string; value: string; onChange: (v: string) => void; options: string[]; hideLabel?: boolean; className?: string }) {
  return (
    <label className={clsx('block min-w-0', className)}>
      <span className={hideLabel ? 'sr-only' : 'field-label'}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field-input">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

/* Contrôle segmenté (onglets compacts) */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex min-w-0 max-w-full self-start overflow-x-auto rounded-[11px] bg-papier-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            'inline-flex min-h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold transition-colors duration-150',
            value === o.value ? 'bg-white text-encre shadow-feuille' : 'text-encre-doux hover:text-encre',
          )}
        >
          {o.label}
          {o.count !== undefined && <span className={clsx('rounded-full px-1.5 text-[11px] chiffres', value === o.value ? 'bg-brand-50 text-brand-700' : 'bg-white/70')}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* =========================================================
 * Jauge de paiement / avancement
 * ======================================================= */
export function Gauge({ value, label, showValue = true, className }: { value: number; label: string; showValue?: boolean; className?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone = v >= 100 ? 'bg-valide' : v >= 50 ? 'bg-brand-600' : v > 0 ? 'bg-orange' : 'bg-stylo';
  return (
    <div className={clsx('flex items-center gap-2.5', className)} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-[6px] min-w-16 flex-1 overflow-hidden rounded-full bg-papier-2">
        <div className={clsx('h-full rounded-full transition-[width] duration-500', tone)} style={{ width: `${Math.max(v, 3)}%` }} />
      </div>
      {showValue && <span className="w-10 text-right text-xs font-bold text-encre chiffres">{v} %</span>}
    </div>
  );
}

/* =========================================================
 * Tableau
 * ======================================================= */
export function Table({ head, children, caption, minWidth = 720 }: { head: (string | { label: string; align?: 'right' | 'center'; sr?: boolean })[]; children: ReactNode; caption: string; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        {head.length > 0 && <thead>
          <tr className="border-y border-papier-ligne/80 bg-papier/60">
            {head.map((h, i) => {
              const c = typeof h === 'string' ? { label: h } : h;
              return (
                <th key={c.label + i} scope="col" className={clsx('whitespace-nowrap px-5 py-2.5 text-xs font-semibold text-encre-doux first:pl-6 last:pr-6', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center')}>
                  {c.sr ? <span className="sr-only">{c.label}</span> : c.label}
                </th>
              );
            })}
          </tr>
        </thead>}
        <tbody className="divide-y divide-papier-ligne/70">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className, ...rest }: { children?: ReactNode; className?: string; colSpan?: number }) {
  return (
    <td className={clsx('px-5 py-3.5 align-middle first:pl-6 last:pr-6', className)} {...rest}>
      {children}
    </td>
  );
}

/* =========================================================
 * Vide
 * ======================================================= */
export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-papier-2 text-encre-doux">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-encre">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-encre-doux">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* =========================================================
 * Fenêtres : modale et tiroir latéral
 * ======================================================= */
function useEscape(onClose: () => void) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', f);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
}

export function Modal({ title, lead, onClose, children, footer, width = 'max-w-xl' }: { title: string; lead?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: string }) {
  useEscape(onClose);
  // Calculé une seule fois, à l'ouverture
  const [place] = useState(placementFenetre);
  const ancree = place.haut !== null;
  // Rendue directement dans <body> : un parent animé (transform) décalerait la fenêtre
  return createPortal(
    <div className={clsx('fixed inset-0 z-50', !ancree && 'flex items-center justify-center p-4 sm:p-6')} role="dialog" aria-modal="true" aria-labelledby="modal-titre">
      <button className="absolute inset-0 cursor-default bg-encre/45 backdrop-blur-[2px]" aria-label="Fermer" tabIndex={-1} onClick={onClose} />
      <div
        className={clsx('relative flex w-full animate-pop flex-col overflow-hidden rounded-2xl bg-white shadow-leve', width, ancree && 'absolute left-1/2 w-[calc(100%-2rem)] -translate-x-1/2')}
        style={{ maxHeight: place.hauteurMax, ...(ancree ? { top: place.haut! } : {}) }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-papier-ligne/70 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2 id="modal-titre" className="text-xl font-bold tracking-[-0.02em]">{title}</h2>
            {lead && <p className="mt-1 text-sm text-encre-doux">{lead}</p>}
          </div>
          <IconButton icon={X} label="Fermer" onClick={onClose} />
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-papier-ligne/70 bg-papier/60 px-5 py-4 sm:px-6">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  useEscape(onClose);
  const [place] = useState(placementFenetre);
  const ancree = place.haut !== null;
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
      <button className="absolute inset-0 cursor-default bg-encre/40 backdrop-blur-[2px]" aria-label="Fermer" tabIndex={-1} onClick={onClose} />
      <div
        className={clsx('absolute right-0 flex w-full max-w-[480px] animate-glisse flex-col bg-white shadow-leve', ancree ? 'rounded-l-2xl' : 'inset-y-0')}
        style={ancree ? { top: place.haut!, height: place.hauteurMax } : undefined}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* =========================================================
 * Messages de confirmation (toasts)
 * ======================================================= */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const id = useRef(0);
  const push = useCallback((msg: string) => {
    const n = ++id.current;
    setItems((x) => [...x, { id: n, msg }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== n)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex max-w-md animate-pop items-start gap-3 rounded-xl bg-encre px-4 py-3 text-sm text-white shadow-leve">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#6EE7B7]" aria-hidden />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastCtx);

/* =========================================================
 * Frise de l'année scolaire : l'élément signature
 * 3 trimestres, 6 séquences, position du jour
 * ======================================================= */
export function SequenceRail({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <div className={clsx('grid grid-cols-3 gap-2', compact ? 'gap-1.5' : 'sm:gap-3')} aria-label="Avancement de l'année scolaire">
      {[1, 2, 3].map((t) => (
        <div key={t} className="min-w-0">
          {!compact && <p className={clsx('mb-1.5 text-xs font-semibold', dark ? 'text-brand-200' : 'text-encre-doux')}>{t === 1 ? '1er' : `${t}e`} trimestre</p>}
          <div className="grid grid-cols-2 gap-1">
            {sequences
              .filter((s) => s.trimestre === t)
              .map((s) => (
                <div
                  key={s.n}
                  title={`Séquence ${s.n} : ${s.debut} au ${s.fin}`}
                  className={clsx(
                    'relative overflow-hidden rounded-md',
                    compact ? 'h-1.5' : 'px-2.5 py-2',
                    s.etat === 'cloturee' && (dark ? 'bg-white/90 text-brand-900' : 'bg-brand-700 text-white'),
                    s.etat === 'en_cours' && (dark ? 'bg-white/15 text-white ring-1 ring-inset ring-white/40' : 'bg-brand-50 text-brand-900 ring-1 ring-inset ring-brand-300'),
                    s.etat === 'a_venir' && (dark ? 'bg-white/[0.06] text-brand-300' : 'bg-papier-2 text-encre-pale'),
                  )}
                >
                  {s.etat === 'en_cours' && <span className="absolute bottom-0 left-0 h-[3px] rounded-full bg-feutre" style={{ width: `${s.saisie}%` }} aria-hidden />}
                  {!compact && (
                    <span className="relative block">
                      <span className="block text-[13px] font-bold leading-none"><span className="sm:hidden">S{s.n}</span><span className="hidden sm:inline">Séq. {s.n}</span></span>
                      <span className="mt-1 hidden truncate text-[11px] font-medium opacity-80 sm:block">{s.etat === 'en_cours' ? `${s.saisie} % saisi` : s.etat === 'cloturee' ? 'Clôturée' : s.debut}</span>
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
