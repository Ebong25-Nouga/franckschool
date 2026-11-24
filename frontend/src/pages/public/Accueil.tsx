import { ArrowRight, Banknote, Building2, ClipboardList, FileText, GraduationCap, ShieldCheck, Smartphone, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';

const fonctions = [
  { icon: GraduationCap, titre: 'Élèves et inscriptions', texte: 'Dossiers complets, tuteurs, historique des classes et des années scolaires.' },
  { icon: ClipboardList, titre: 'Notes par séquence', texte: 'Saisie par les professeurs, circuit de validation, 6 séquences et 3 trimestres.' },
  { icon: FileText, titre: 'Bulletins PDF', texte: 'Moyennes, rangs et appréciations calculés selon les usages camerounais.' },
  { icon: Banknote, titre: 'Caisse et paiements', texte: 'Espèces, MTN Mobile Money, Orange Money. Reçus, impayés et clôtures.' },
  { icon: UserCog, titre: 'Rôles et permissions', texte: 'Plusieurs secrétaires, chacune avec ses droits. Chaque action est tracée.' },
  { icon: Building2, titre: 'Multi-établissements', texte: 'Chaque école a son espace, ses utilisateurs et ses données isolées.' },
];

export default function Accueil() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="FRANCK SCHOOL, accueil">
          <img src="/logo.svg" alt="" className="size-9" />
          <span className="text-lg font-extrabold tracking-wide text-brand-950">FRANCK SCHOOL</span>
        </Link>
        <Link to="/connexion" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900">
          Se connecter
        </Link>
      </header>

      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_70%_-10%,rgb(var(--brand-100)),transparent)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
              <ShieldCheck className="size-3.5" aria-hidden /> Conçu pour les écoles du Cameroun
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 [text-wrap:balance] sm:text-5xl">
              La gestion scolaire claire, <span className="text-brand-800">traçable</span> et simple.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Élèves, notes, bulletins, caisse et parents : toute la vie de votre établissement sur une seule plateforme, sur ordinateur comme sur téléphone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/connexion" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand-800 px-5 font-semibold text-white shadow-sm transition-colors hover:bg-brand-900">
                Accéder à mon espace <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href="#fonctions" className="inline-flex min-h-12 items-center rounded-lg border border-slate-300 px-5 font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                Découvrir les fonctions
              </a>
            </div>
          </div>

          {/* Aperçu du tableau de bord */}
          <div aria-hidden className="relative">
            <div className="rounded-2xl bg-brand-950 p-3 shadow-pop">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-3 w-32 rounded bg-slate-300" />
                  <div className="h-7 w-24 rounded-md bg-brand-800" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[['842', 'Élèves'], ['38', 'Professeurs'], ['78 %', 'Recouvrement']].map(([v, l]) => (
                    <div key={l} className="rounded-lg bg-white p-3 shadow-card">
                      <p className="text-[11px] text-slate-500">{l}</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex h-32 items-end gap-2 rounded-lg bg-white p-3 shadow-card">
                  {[60, 85, 45, 70, 92, 55, 78, 66].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-brand-600/80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-xl bg-white p-3 pr-4 shadow-pop ring-1 ring-slate-200 sm:flex">
              <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Smartphone className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">50 000 FCFA reçus</p>
                <p className="text-xs text-slate-500">MTN Mobile Money · reçu n° 000482</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fonctions" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tout ce dont votre école a besoin</h2>
          <p className="mt-2 max-w-2xl text-slate-600">Cinq espaces adaptés à chaque utilisateur : direction, secrétariat, enseignants et parents.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fonctions.map((f) => (
              <div key={f.titre} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <span className="grid size-11 place-items-center rounded-lg bg-brand-50 text-brand-800">
                  <f.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{f.titre}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        FRANCK SCHOOL — Construire une gestion scolaire claire, traçable et adaptée aux établissements du Cameroun.
      </footer>
    </div>
  );
}
