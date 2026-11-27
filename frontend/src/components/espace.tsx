import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/* Éléments de mise en page partagés par les espaces enseignant et parent. */

export function Titre({ titre, texte, action, kicker }: { titre: string; texte?: ReactNode; action?: ReactNode; kicker?: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && <p className="mb-1 text-sm font-medium text-encre-doux">{kicker}</p>}
        <h1 className="font-display text-[30px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">{titre}</h1>
        {texte && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-encre-doux">{texte}</p>}
      </div>
      {action}
    </div>
  );
}

export function Bloc({ titre, children, action, className, icone: Icone }: { titre?: string; children: ReactNode; action?: ReactNode; className?: string; icone?: LucideIcon }) {
  return (
    <section className={cn('rounded-[22px] bg-white p-5 shadow-feuille sm:p-6', className)}>
      {titre && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 font-display text-[19px] font-bold tracking-[-0.015em]">
            {Icone && <Icone className="size-5 text-brand-700" aria-hidden />}
            {titre}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Chiffre clé (tableau de bord sur ordinateur). */
export function Chiffre({ label, valeur, unite, detail, icone: Icone, ton = 'encre' }: { label: string; valeur: string; unite?: string; detail?: ReactNode; icone: LucideIcon; ton?: 'encre' | 'stylo' | 'valide' | 'feutre' }) {
  const teinte = { encre: 'bg-brand-50 text-brand-700', stylo: 'bg-stylo-50 text-stylo', valide: 'bg-valide-50 text-valide', feutre: 'bg-feutre-50 text-feutre-700' }[ton];
  return (
    <div className="rounded-[22px] bg-white p-5 shadow-feuille">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-encre-doux">{label}</p>
        <span className={cn('grid size-9 place-items-center rounded-xl', teinte)}><Icone className="size-[18px]" aria-hidden /></span>
      </div>
      <p className={cn('mt-2 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em] chiffres', ton === 'stylo' && 'text-stylo')}>
        {valeur}
        {unite && <span className="ml-1.5 font-sans text-[15px] font-semibold tracking-normal text-encre-doux">{unite}</span>}
      </p>
      {detail && <p className="mt-2 text-[13px] text-encre-doux">{detail}</p>}
    </div>
  );
}
