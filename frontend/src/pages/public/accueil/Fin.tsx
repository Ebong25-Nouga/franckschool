import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { versSection } from '@/lib/defiler';
import logoFranck from '@/assets/logo-franck.svg';

/* =========================================================
 * « Prêt pour la rentrée » : une page de cahier.
 * Les 4 étapes sont un vrai déroulé, d'où la numérotation.
 * ======================================================= */
const etapes = [
  { titre: 'La démonstration', texte: 'Nous vous montrons Franck School avec vos classes et vos frais.', duree: '45 min' },
  { titre: 'Le paramétrage', texte: 'Année scolaire, classes, matières, coefficients, tranches de paiement.', duree: '1 jour' },
  { titre: 'La reprise de vos élèves', texte: 'Vos listes Excel importées : élèves, tuteurs, classes.', duree: '1 à 2 jours' },
  { titre: 'La formation', texte: 'Secrétaires et professeurs prennent leurs comptes en main.', duree: '1 demi-journée' },
];

export function PretRentree({ onDemo }: { onDemo: () => void }) {
  return (
    <section aria-labelledby="rentree-titre" className="bg-papier py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-40px_rgb(14_21_51/0.35),0_0_0_1px_rgb(14_21_51/0.06)]">
          {/* Lignes du cahier et marge rouge */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(var(--brand-600)/0.08)_1px,transparent_1px)] bg-[size:100%_32px]" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 w-[2px] bg-stylo/35 sm:left-14" />

          <div className="relative grid gap-14 py-14 pl-12 pr-6 sm:py-16 sm:pl-24 sm:pr-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div className="flex flex-col">
              <p className="font-display text-[17px] font-semibold text-stylo [rotate:-1.5deg]">Rentrée 2027-2028</p>
              <h2 id="rentree-titre" className="mt-3 font-display text-[38px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[52px]">
                Prêt pour la rentrée en <span className="surligne">moins d’une semaine</span>.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-encre-doux">
                Nous préparons Franck School avec vous, pour que les inscriptions de septembre se fassent directement dans la plateforme.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button onClick={onDemo} className="h-12 gap-2 px-6 text-[15px] font-semibold shadow-encre">
                  Demander une démonstration
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button asChild variant="outline" className="h-12 bg-white px-6 text-[15px] font-semibold">
                  <a href="#tarifs" onClick={(e) => versSection(e, 'tarifs')}>Voir les tarifs</a>
                </Button>
              </div>
              <ul className="mt-auto flex flex-col gap-2.5 pt-10 text-[15px] text-encre-doux">
                {['Sans frais d’installation', 'Vos données importées depuis Excel', 'Accompagnement jusqu’à la rentrée'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <Check className="size-4 text-valide" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <ol className="relative flex flex-col gap-3" aria-label="Les étapes avant la rentrée">
              {etapes.map((e, i) => (
                <li key={e.titre} className="relative flex gap-5 rounded-2xl bg-white/90 p-5 ring-1 ring-papier-ligne backdrop-blur-[1px]">
                  <span className="font-display text-[44px] font-extrabold leading-[0.85] tracking-[-0.04em] text-brand-200 chiffres">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="font-display text-[19px] font-bold tracking-[-0.015em]">{e.titre}</h3>
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-semibold text-brand-800">{e.duree}</span>
                    </div>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-encre-doux">{e.texte}</p>
                  </div>
                </li>
              ))}
              <li className="flex items-center gap-3 rounded-2xl bg-valide px-5 py-4 font-semibold text-white">
                <Check className="size-5" aria-hidden />
                Septembre : vous inscrivez vos élèves dans Franck School.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
 * Pied de page
 * ======================================================= */
const colonnes = [
  {
    titre: 'Découvrir',
    liens: [
      { label: 'L’année scolaire', href: '#annee' },
      { label: 'Les espaces', href: '#espaces' },
      { label: 'La caisse', href: '#caisse' },
      { label: 'Sécurité', href: '#securite' },
    ],
  },
  {
    titre: 'Pour qui',
    liens: [
      { label: 'Direction', href: '#espaces' },
      { label: 'Secrétariat', href: '#espaces' },
      { label: 'Enseignants', href: '#espaces' },
      { label: 'Parents', href: '#espaces' },
    ],
  },
  {
    titre: 'Commencer',
    liens: [
      { label: 'Tarifs', href: '#tarifs' },
      { label: 'Questions fréquentes', href: '#questions' },
    ],
  },
];

export function PiedDePage({ onDemo }: { onDemo: () => void }) {
  return (
    <footer className="seyes relative overflow-hidden bg-brand-950 text-brand-100">
      <div aria-hidden className="absolute -bottom-64 -right-40 size-[620px] rounded-full bg-brand-700/35 blur-[130px]" />

      <div className="relative mx-auto max-w-[1200px] px-5 pt-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-3 text-white" aria-label="Franck School, accueil">
              <img src={logoFranck} alt="" className="size-11 rounded-xl shadow-[0_0_0_1px_rgb(255_255_255/0.15)]" />
              <span className="font-display text-[22px] font-extrabold tracking-[-0.02em]">Franck School</span>
            </Link>
            <p className="mt-5 text-[15px] leading-relaxed text-brand-200">
              La plateforme de gestion scolaire des établissements privés du Cameroun : élèves, notes, bulletins, caisse et parents.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button onClick={onDemo} className="h-11 bg-feutre px-5 text-[14px] font-semibold text-encre hover:bg-[#FFD93A]">
                Demander une démonstration
              </Button>
              <Button asChild variant="outline" className="h-11 border-white/20 bg-transparent px-5 text-[14px] font-semibold text-white hover:bg-white/10 hover:text-white">
                <Link to="/connexion">Se connecter</Link>
              </Button>
            </div>
          </div>

          <nav aria-label="Plan du site" className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {colonnes.map((c) => (
              <div key={c.titre}>
                <p className="font-display text-[15px] font-bold text-white">{c.titre}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {c.liens.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} onClick={(e) => versSection(e, l.href.slice(1))} className="text-[15px] text-brand-200 transition-colors hover:text-white">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="font-display text-[15px] font-bold text-white">Mon compte</p>
              <ul className="mt-4 flex flex-col gap-3">
                <li><Link to="/connexion" className="text-[15px] text-brand-200 transition-colors hover:text-white">Se connecter</Link></li>
                <li><Link to="/mot-de-passe-oublie" className="text-[15px] text-brand-200 transition-colors hover:text-white">Mot de passe oublié</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Signature typographique */}
        <p aria-hidden className="mt-20 select-none whitespace-nowrap font-display text-[clamp(56px,13vw,176px)] font-extrabold leading-[0.8] tracking-[-0.06em] text-white/[0.06]">
          Franck School
        </p>

        <Separator className="bg-white/10" />
        <div className="flex flex-col gap-3 py-7 text-[13px] text-brand-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Franck School. Gestion scolaire conçue au Cameroun.</p>
          <a href="#" onClick={(e) => versSection(e, '')} className="inline-flex items-center gap-1.5 font-medium text-brand-200 transition-colors hover:text-white">
            Haut de page <ArrowUpRight className="size-3.5 -rotate-45" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
