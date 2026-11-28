/*
 * Aperçus du produit utilisés sur la page d'accueil.
 * Ce sont de vrais morceaux d'interface (pas des images) : ils restent nets
 * sur tous les écrans et suivent la couleur de l'école.
 */
import { cn } from '@/lib/utils';
import { ArrowDownLeft, Banknote, Check, ClipboardCheck, Lock, Smartphone, Undo2 } from 'lucide-react';
import logoFranck from '@/assets/logo-franck.svg';

export function FenetreApp({ children, titre, className }: { children: React.ReactNode; titre: string; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-[18px] bg-white shadow-[0_50px_100px_-30px_rgb(0_0_0/0.55),0_0_0_1px_rgb(255_255_255/0.08)]', className)}>
      <div className="flex items-center gap-3 border-b border-papier-ligne bg-papier px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </span>
        <span className="mx-auto max-w-[60%] truncate rounded-md bg-white px-3 py-0.5 text-center text-[11px] text-encre-doux ring-1 ring-papier-ligne">{titre}</span>
        <span className="w-10" aria-hidden />
      </div>
      {children}
    </div>
  );
}

/* Tableau de bord miniature de l'administration */
export function MiniTableau() {
  const barres = [62, 78, 54, 88, 70, 45, 92, 66];
  return (
    <div className="grid text-[11px] text-encre sm:grid-cols-[132px_1fr]">
      <div className="seyes hidden flex-col gap-1 bg-brand-950 p-3 text-brand-100 sm:flex">
        <div className="mb-2 flex items-center gap-1.5">
          <img src={logoFranck} alt="" className="size-5 rounded" />
          <span className="font-display text-[11px] font-bold text-white">Franck School</span>
        </div>
        {['Tableau de bord', 'Élèves', 'Notes', 'Bulletins', 'Caisse', 'Remboursements'].map((m, i) => (
          <span key={m} className={cn('rounded-md px-2 py-1.5', i === 0 ? 'bg-white font-semibold text-brand-900' : 'opacity-80')}>{m}</span>
        ))}
      </div>
      <div className="flex flex-col gap-2.5 bg-papier p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-display text-[15px] font-bold">Bonjour, Jean-Pierre</span>
          <span className="rounded-md bg-brand-700 px-2 py-1 text-[10px] font-semibold text-white">+ Encaisser</span>
        </div>
        <div className="seyes rounded-xl bg-brand-950 p-3 text-white">
          <p className="text-[10px] text-brand-200">Année 2026-2027</p>
          <p className="font-display text-[13px] font-bold">Séquence 2, 64 % des notes saisies</p>
          <div className="mt-2 grid grid-cols-6 gap-1">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <span key={s} className={cn('relative h-5 overflow-hidden rounded', s === 1 ? 'bg-white' : s === 2 ? 'bg-white/15 ring-1 ring-white/40' : 'bg-white/[0.06]')}>
                {s === 2 && <span className="absolute bottom-0 left-0 h-[3px] w-[64%] bg-feutre" />}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[['Élèves', '842', ''], ['Recouvré', '78 %', ''], ['Reste dû', '27,4 M', 'text-stylo']].map(([l, v, c]) => (
            <div key={l} className="rounded-lg bg-white p-2 shadow-feuille">
              <p className="text-[9px] text-encre-doux">{l}</p>
              <p className={cn('font-display text-[15px] font-bold', c)}>{v}</p>
            </div>
          ))}
        </div>
        <div className="flex h-16 items-end gap-1.5 rounded-lg bg-white p-2 shadow-feuille">
          {barres.map((h, i) => (
            <span key={i} className="flex-1 rounded-t-sm bg-brand-600/85" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Bulletin au format camerounais */
const lignes = [
  { m: 'Français', c: 4, n: 14.5 },
  { m: 'Anglais', c: 3, n: 16 },
  { m: 'Mathématiques', c: 5, n: 12.25 },
  { m: 'Physique-Chimie', c: 4, n: 9.5 },
  { m: 'SVT', c: 2, n: 15 },
];
export function MiniBulletin({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-white p-4 text-encre shadow-[0_30px_60px_-24px_rgb(0_0_0/0.5)]', className)}>
      <div className="flex items-start justify-between border-b-2 border-encre pb-2">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-encre-doux">République du Cameroun</p>
          <p className="font-display text-[12px] font-bold">Bulletin, 1er trimestre</p>
        </div>
        <img src={logoFranck} alt="" className="size-6" />
      </div>
      <p className="mt-2 text-[10px]"><b>MBARGA</b> Marie-Claire · 4ème A</p>
      <table className="mt-1.5 w-full text-[10px]">
        <tbody>
          {lignes.map((l) => (
            <tr key={l.m} className="border-t border-papier-ligne">
              <td className="py-1">{l.m}</td>
              <td className="py-1 text-center text-encre-doux">{l.c}</td>
              <td className={cn('py-1 text-right font-bold chiffres', l.n < 10 && 'text-stylo')}>{l.n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2.5 flex items-end justify-between rounded-lg bg-brand-50 px-3 py-2">
        <div>
          <p className="text-[9px] text-encre-doux">Moyenne</p>
          <p className="font-display text-xl font-extrabold leading-none text-brand-800 chiffres">13,05</p>
        </div>
        <p className="font-display text-sm font-bold">7<sup className="text-[8px]">e</sup><span className="text-[10px] text-encre-doux">/44</span></p>
      </div>
      <p className="mt-2 -rotate-2 font-display text-[11px] font-semibold text-stylo">Peut mieux faire en physique !</p>
    </div>
  );
}

/* Reçu de paiement Mobile Money */
export function MiniRecu({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 text-encre shadow-[0_24px_48px_-20px_rgb(0_0_0/0.55)]', className)}>
      <span className="grid size-10 place-items-center rounded-xl bg-[#FFF4C2] text-[#7A5B00]">
        <Smartphone className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold chiffres">+ 50 000 FCFA</p>
        <p className="truncate text-[11px] text-encre-doux">MTN MoMo · reçu n° 000482</p>
      </div>
    </div>
  );
}

/* Aperçus par espace (onglets « Qui fait quoi ») */
export function ApercuDirection() {
  return (
    <div className="flex flex-col gap-2.5 p-5 text-sm">
      <p className="font-display text-base font-bold">À traiter aujourd’hui</p>
      {[
        [Undo2, '2 demandes de remboursement', '40 000 FCFA attendent votre décision'],
        [ClipboardCheck, '2 évaluations à valider', 'Mathématiques 3ème A, Anglais 4ème A'],
        [Lock, 'Caisse à clôturer', 'Dernière clôture le 21 novembre'],
      ].map(([Icone, t, d]) => {
        const I = Icone as typeof Undo2;
        return (
          <div key={t as string} className="flex items-center gap-3 rounded-xl bg-papier p-3">
            <span className="grid size-9 place-items-center rounded-lg bg-feutre text-encre"><I className="size-4" aria-hidden /></span>
            <span className="min-w-0"><span className="block font-semibold">{t as string}</span><span className="block truncate text-xs text-encre-doux">{d as string}</span></span>
          </div>
        );
      })}
    </div>
  );
}

export function ApercuSecretariat() {
  return (
    <div className="flex flex-col gap-3 p-5 text-sm">
      <p className="font-display text-base font-bold">Encaisser un paiement</p>
      <div className="flex items-center gap-3 rounded-xl bg-papier p-3">
        <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">FI</span>
        <span className="flex-1"><b>FOTSO Ibrahim</b><span className="block text-xs text-encre-doux">3ème A · reste <b className="text-stylo">60 000 FCFA</b></span></span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-[11px] font-semibold">
        {['Espèces', 'MTN MoMo', 'Orange Money', 'Banque'].map((m, i) => (
          <span key={m} className={cn('rounded-lg p-2 text-center ring-1', i === 1 ? 'bg-brand-50 ring-2 ring-brand-600' : 'ring-papier-ligne')}>{m}</span>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl bg-brand-700 px-4 py-3 text-white">
        <span className="font-semibold">Enregistrer</span>
        <span className="font-display text-lg font-bold chiffres">50 000 FCFA</span>
      </div>
    </div>
  );
}

export function ApercuEnseignant() {
  const notes: [string, string][] = [['MANGA Ornella', '12'], ['SIMO Franck', '14,5'], ['NDJOCK Nadège', '9'], ['EYENGA Ulrich', '16'], ['MBARGA Marie-Claire', '']];
  return (
    <div className="seyes-clair flex flex-col p-5 text-sm">
      <p className="mb-2 font-display text-base font-bold">Mathématiques, Tle C · séquence 2</p>
      {notes.map(([n, v], i) => (
        <div key={n} className="grid grid-cols-[1.5rem_1fr_4.5rem] items-center gap-2 border-b border-papier-ligne/60 py-1.5">
          <span className="text-xs text-encre-pale">{i + 1}</span>
          <span className="truncate pl-4">{n}</span>
          <span className={cn('rounded-md border bg-white py-1 text-center font-display font-bold', i === 4 ? 'border-brand-600 ring-4 ring-brand-600/15' : 'border-papier-ligne', v && Number(v.replace(',', '.')) < 10 && 'text-stylo')}>{v || '|'}</span>
        </div>
      ))}
    </div>
  );
}

export function ApercuParent() {
  return (
    <div className="flex flex-col gap-3 p-5 text-sm">
      <div className="seyes rounded-xl bg-brand-950 p-4 text-white">
        <p className="text-xs text-brand-200">Reste à payer pour Marie-Claire</p>
        <p className="font-display text-3xl font-extrabold chiffres">25 000 <span className="text-sm font-semibold">FCFA</span></p>
        <p className="mt-1 text-xs text-brand-200">3e tranche avant le 15/01/2027</p>
      </div>
      {[['Scolarité, 2e tranche', '50 000'], ['Scolarité, 1re tranche', '50 000']].map(([l, m]) => (
        <div key={l} className="flex items-center gap-3 rounded-xl bg-papier p-3">
          <span className="grid size-8 place-items-center rounded-lg bg-valide-50 text-valide"><Check className="size-4" aria-hidden /></span>
          <span className="flex-1 font-medium">{l}</span>
          <span className="font-semibold chiffres">{m} FCFA</span>
        </div>
      ))}
    </div>
  );
}

/* Journal de caisse miniature */
export function MiniJournal() {
  return (
    <div className="divide-y divide-papier-ligne/70 text-sm">
      {[
        ['Scolarité, 2e tranche', 'MBARGA Marie-Claire · MTN MoMo', '+ 50 000', 'text-valide', ArrowDownLeft, 'bg-valide-50'],
        ["Frais d'examen", 'FOTSO Ibrahim · Espèces', '+ 15 000', 'text-valide', ArrowDownLeft, 'bg-valide-50'],
        ['Remboursement approuvé', 'KAMGA Arnaud · Espèces', '− 10 000', 'text-orange', Undo2, 'bg-orange-50'],
        ['Inscription', 'ESSOMBA Grâce · Banque', '+ 25 000', 'text-valide', Banknote, 'bg-valide-50'],
      ].map(([t, d, m, c, Icone, bg]) => {
        const I = Icone as typeof Undo2;
        return (
          <div key={t as string} className="flex items-center gap-3 px-5 py-3">
            <span className={cn('grid size-9 place-items-center rounded-xl', bg as string, c as string)}><I className="size-4" aria-hidden /></span>
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{t as string}</span><span className="block truncate text-xs text-encre-doux">{d as string}</span></span>
            <span className={cn('font-display font-bold chiffres', c as string)}>{m as string}</span>
          </div>
        );
      })}
    </div>
  );
}
