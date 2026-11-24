import { ArrowRight, Banknote, Check, ClipboardPen, FileBadge2, ShieldCheck, Smartphone, Undo2, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const bulletin = [
  { m: 'Français', c: 4, n: 14.5 },
  { m: 'Anglais', c: 3, n: 16 },
  { m: 'Mathématiques', c: 5, n: 12.25 },
  { m: 'Physique-Chimie', c: 4, n: 9.5 },
  { m: 'SVT', c: 2, n: 15 },
  { m: 'Histoire-Géo', c: 2, n: 13 },
];

const espaces = [
  { icon: ShieldCheck, titre: 'La direction', texte: 'Pilote l’établissement, valide les notes, décide des remboursements et attribue les droits de chaque secrétaire.' },
  { icon: Banknote, titre: 'Le secrétariat', texte: 'Inscrit les élèves, encaisse en espèces, MTN MoMo ou Orange Money, imprime les reçus. Chaque geste est signé.' },
  { icon: ClipboardPen, titre: 'Les enseignants', texte: 'Saisissent les notes depuis la maison, séquence après séquence, et suivent leurs classes.' },
  { icon: Users2, titre: 'Les parents', texte: 'Voient ce qui reste à payer, téléchargent leurs reçus et reçoivent les informations de l’école.' },
];

export default function Accueil() {
  return (
    <div className="min-h-dvh bg-white text-encre">
      {/* Bandeau d'en-tête sur fond encre */}
      <div className="seyes relative overflow-hidden bg-brand-950 text-white">
        <div aria-hidden className="absolute -left-40 -top-40 size-[640px] rounded-full bg-brand-700/40 blur-[120px]" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Franck School, accueil">
            <img src="/logo.svg" alt="" className="size-9 rounded-lg shadow-[0_0_0_1px_rgb(255_255_255/0.15)]" />
            <span className="font-display text-lg font-extrabold tracking-[-0.01em]">Franck School</span>
          </Link>
          <Link to="/connexion" className="inline-flex min-h-11 items-center rounded-[10px] bg-white px-4 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50">
            Se connecter
          </Link>
        </header>

        <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-16">
          <div>
            <h1 className="font-display text-[44px] font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-[64px]">
              De l’inscription
              <br />
              au bulletin,
              <br />
              <span className="text-brand-300">sans cahier perdu.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-brand-100/90">
              Franck School réunit les élèves, les notes des six séquences, les bulletins et la caisse de votre établissement. Sur ordinateur comme sur téléphone, partout au Cameroun.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/connexion" className="group inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-feutre px-5 font-semibold text-encre transition-colors hover:bg-[#FFD93A]">
                Ouvrir mon espace
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <a href="#espaces" className="inline-flex min-h-12 items-center rounded-[10px] px-5 font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/10">
                Voir qui fait quoi
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-200">
              {['Notes sur 20, coefficients et rangs', 'Espèces, MTN MoMo, Orange Money', 'Données de chaque école isolées'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-feutre" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Le bulletin : l'objet que tout le monde reconnaît */}
          <div aria-hidden className="relative mx-auto w-full max-w-[440px] lg:mr-0">
            <div className="rotate-[1.5deg] rounded-[18px] bg-white p-6 text-encre shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]">
              <div className="flex items-start justify-between border-b-2 border-encre pb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-encre-doux">République du Cameroun</p>
                  <p className="font-display text-[15px] font-bold">Bulletin de notes, 1er trimestre</p>
                </div>
                <img src="/logo.svg" alt="" className="size-8" />
              </div>
              <div className="mt-3 flex justify-between text-[12px]">
                <span><b>MBARGA</b> Marie-Claire</span>
                <span className="text-encre-doux">4ème A, 44 élèves</span>
              </div>
              <table className="mt-3 w-full text-[12px]">
                <thead>
                  <tr className="text-left text-encre-doux">
                    <th className="pb-1 font-medium">Matière</th>
                    <th className="pb-1 text-center font-medium">Coef.</th>
                    <th className="pb-1 text-right font-medium">Moy.</th>
                  </tr>
                </thead>
                <tbody>
                  {bulletin.map((l) => (
                    <tr key={l.m} className="border-t border-papier-ligne">
                      <td className="py-1.5">{l.m}</td>
                      <td className="py-1.5 text-center chiffres">{l.c}</td>
                      <td className={`py-1.5 text-right font-bold chiffres ${l.n < 10 ? 'text-stylo' : ''}`}>{l.n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-end justify-between rounded-xl bg-brand-50 px-4 py-3">
                <div>
                  <p className="text-[11px] font-medium text-encre-doux">Moyenne générale</p>
                  <p className="font-display text-[28px] font-extrabold leading-none tracking-[-0.03em] text-brand-800 chiffres">13,05</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-medium text-encre-doux">Rang</p>
                  <p className="font-display text-xl font-bold leading-none">7<sup className="text-[11px]">e</sup><span className="text-sm font-semibold text-encre-doux">/44</span></p>
                </div>
              </div>
              <p className="mb-10 mt-3 -rotate-2 font-display text-[15px] font-semibold text-stylo sm:mb-0">Assez bien. Peut mieux faire en physique !</p>
            </div>

            <div className="absolute -bottom-12 -left-4 flex w-[250px] -rotate-[3deg] items-center gap-3 rounded-2xl bg-white p-3.5 text-encre shadow-[0_24px_48px_-20px_rgb(0_0_0/0.55)] sm:-bottom-14 sm:-left-12">
              <span className="grid size-10 place-items-center rounded-xl bg-[#FFF4C2] text-[#7A5B00]">
                <Smartphone className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold chiffres">+ 50 000 FCFA</p>
                <p className="truncate text-xs text-encre-doux">MTN MoMo, reçu n° 000482</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Les espaces */}
      <section id="espaces" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-[34px] font-bold leading-tight tracking-[-0.03em] sm:text-[42px]">Chacun son espace, une seule école.</h2>
          <p className="mt-4 text-lg leading-relaxed text-encre-doux">L’administrateur décide de ce que chaque secrétaire peut faire. Les enseignants et les parents ne voient que ce qui les concerne.</p>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {espaces.map((e) => (
            <div key={e.titre} className="flex gap-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <e.icon className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl font-bold tracking-[-0.02em]">{e.titre}</h3>
                <p className="mt-2 leading-relaxed text-encre-doux">{e.texte}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Le circuit du remboursement : un vrai processus en étapes */}
      <section className="border-y border-papier-ligne bg-papier">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-brand-700 shadow-feuille">
              <Undo2 className="size-6" aria-hidden />
            </span>
            <h2 className="mt-6 font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">Pas un franc ne sort sans accord.</h2>
            <p className="mt-4 leading-relaxed text-encre-doux">Un paiement confirmé ne disparaît jamais. Un remboursement suit toujours le même circuit, et chaque étape reste dans l’historique.</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ['La secrétaire prépare la demande', 'Élève, montant et motif.'],
              ['L’administrateur décide', 'Un refus ne crée aucun mouvement.'],
              ['La secrétaire rembourse', 'L’opération est tracée dans la caisse.'],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl bg-white p-5 shadow-feuille">
                <span className="font-display text-[40px] font-extrabold leading-none text-brand-200">{i + 1}</span>
                <p className="mt-3 font-semibold leading-snug">{t}</p>
                <p className="mt-1.5 text-sm text-encre-doux">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8">
        <FileBadge2 className="mx-auto size-8 text-brand-700" aria-hidden />
        <h2 className="mx-auto mt-5 max-w-xl font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">Prêt pour la séquence 2 ?</h2>
        <Link to="/connexion" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-brand-700 px-6 font-semibold text-white shadow-encre transition-colors hover:bg-brand-800">
          Ouvrir mon espace <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>

      <footer className="border-t border-papier-ligne py-8 text-center text-sm text-encre-doux">Franck School, gestion scolaire pour les établissements du Cameroun.</footer>
    </div>
  );
}
