import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SequenceRail } from '@/components/kit';
import logoFranck from '@/assets/logo-franck.svg';

/*
 * Mise en page commune aux écrans d'authentification (interface 1) :
 * panneau bleu à gauche sur grand écran, formulaire à droite.
 */
export function CadreAuth({
  titre,
  texte,
  retour = { to: '/', label: 'Retour à l’accueil' },
  children,
}: {
  titre: string;
  texte: string;
  retour?: { to: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1fr_1.05fr]">
      <aside className="seyes relative hidden flex-col justify-between overflow-hidden bg-brand-950 p-12 text-white lg:flex">
        <div aria-hidden className="absolute -right-40 -top-32 size-[560px] rounded-full bg-brand-700/45 blur-[110px]" />
        <Link to="/" className="relative flex items-center gap-4" aria-label="Franck School, retour à l’accueil">
          <img src={logoFranck} alt="" className="size-16 rounded-2xl shadow-[0_0_0_1px_rgb(255_255_255/0.15),0_12px_30px_-10px_rgb(0_0_0/0.5)]" />
          <span className="font-display text-[28px] font-extrabold tracking-[-0.02em]">Franck School</span>
        </Link>
        <div className="relative max-w-md">
          <p className="font-display text-[42px] font-bold leading-[1.03] tracking-[-0.035em]">{titre}</p>
          <p className="mt-4 text-[17px] leading-relaxed text-brand-200">{texte}</p>
          <div className="mt-8">
            <SequenceRail dark />
          </div>
        </div>
        <p className="relative text-sm text-brand-300">Année scolaire 2026-2027 · séquence 2 en cours</p>
      </aside>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          <Link to={retour.to} className="mb-10 inline-flex items-center gap-1.5 text-sm font-semibold text-encre-doux transition-colors hover:text-brand-700">
            <ArrowLeft className="size-4" aria-hidden /> {retour.label}
          </Link>
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden" aria-label="Franck School, accueil">
            <img src={logoFranck} alt="" className="size-14 rounded-2xl" />
            <span className="font-display text-2xl font-extrabold tracking-[-0.02em]">Franck School</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
