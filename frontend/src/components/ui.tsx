import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/* ---------- Bouton ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-800 text-white hover:bg-brand-900 shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
};

export function Button({
  variant = 'primary',
  icon: Icon,
  size = 'md',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: LucideIcon; size?: 'sm' | 'md' }) {
  return (
    <button
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'md' ? 'min-h-11 px-4 text-sm' : 'min-h-9 px-3 text-[13px]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Carte ---------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={clsx('rounded-xl border border-slate-200/80 bg-white shadow-card', className)}>{children}</section>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- En-tête de page ---------- */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Carte statistique ---------- */
const tones = {
  brand: 'bg-brand-50 text-brand-800',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  slate: 'bg-slate-100 text-slate-700',
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'brand',
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={clsx('grid size-10 shrink-0 place-items-center rounded-lg', tones[tone])}>
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
      {hint && <div className="mt-3 text-[13px] text-slate-500">{hint}</div>}
    </Card>
  );
}

/* ---------- Badge ---------- */
const badgeTones = {
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};
export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = 'slate', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset', badgeTones[tone])}>
      {children}
    </span>
  );
}

/* ---------- Avatar (initiales) ---------- */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/^(M\.|Mme)\s+/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return (
    <span aria-hidden className={clsx('grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800', className)}>
      {initials}
    </span>
  );
}

/* ---------- Recherche ---------- */
export function SearchInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field-input pl-9" />
    </label>
  );
}

/* ---------- Select ---------- */
export function Select({ label, value, onChange, options, hideLabel }: { label: string; value: string; onChange: (v: string) => void; options: string[]; hideLabel?: boolean }) {
  return (
    <label className="block">
      <span className={hideLabel ? 'sr-only' : 'field-label'}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field-input cursor-pointer pr-8">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

/* ---------- État vide ---------- */
export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="px-6 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="mt-4 font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

/* ---------- Barre de progression ---------- */
export function Progress({ value, label }: { value: number; label: string }) {
  const tone = value >= 100 ? 'bg-emerald-500' : value >= 50 ? 'bg-brand-600' : value > 0 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
        <div className={clsx('h-full rounded-full', tone)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="w-9 text-right text-xs font-semibold tabular-nums text-slate-600">{value}%</span>
    </div>
  );
}

/* ---------- Tableau ---------- */
export function Table({ head, children, caption }: { head: string[]; children: ReactNode; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
            {head.map((h, i) => (
              <th key={h || i} scope="col" className="whitespace-nowrap px-5 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx('px-5 py-3 align-middle', className)}>{children}</td>;
}
