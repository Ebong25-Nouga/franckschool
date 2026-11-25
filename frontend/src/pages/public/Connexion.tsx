import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accueilParEspace, comptesDemo, useAuth } from '../../auth';
import { Avatar, SequenceRail } from '../../components/kit';

const demo = import.meta.env.DEV || import.meta.env.VITE_DEMO === 'true';

export default function Connexion() {
  const { connexion } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const entrer = (mail: string) => {
    setEnvoi(true);
    setTimeout(() => {
      const s = connexion(mail);
      setEnvoi(false);
      if (!s) {
        setErreur('Identifiant ou mot de passe incorrect. Vérifiez votre saisie, ou cliquez sur « Mot de passe oublié ».');
        return;
      }
      nav(accueilParEspace[s.espace]);
    }, 450);
  };

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    setErreur('');
    if (!email.trim() || !mdp) {
      setErreur('Saisissez votre e-mail ou téléphone, puis votre mot de passe.');
      return;
    }
    entrer(email);
  };

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1fr_1.05fr]">
      <aside className="seyes relative hidden flex-col justify-between overflow-hidden bg-brand-950 p-12 text-white lg:flex">
        <div aria-hidden className="absolute -right-40 -top-32 size-[560px] rounded-full bg-brand-700/45 blur-[110px]" />
        <Link to="/" className="relative flex items-center gap-4" aria-label="Franck School, retour à l’accueil">
          <img src="/logo.svg" alt="" className="size-16 rounded-2xl shadow-[0_0_0_1px_rgb(255_255_255/0.15),0_12px_30px_-10px_rgb(0_0_0/0.5)]" />
          <span className="font-display text-[28px] font-extrabold tracking-[-0.02em]">Franck School</span>
        </Link>
        <div className="relative max-w-md">
          <p className="font-display text-[42px] font-bold leading-[1.03] tracking-[-0.035em]">Votre école, partout avec vous.</p>
          <p className="mt-4 text-[17px] leading-relaxed text-brand-200">Au bureau, en salle des professeurs ou à la maison : connectez-vous et retrouvez votre espace là où vous l’avez laissé.</p>
          <div className="mt-8">
            <SequenceRail dark />
          </div>
        </div>
        <p className="relative text-sm text-brand-300">Année scolaire 2026-2027 · séquence 2 en cours</p>
      </aside>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[400px]">
          <Link to="/" className="mb-10 inline-flex items-center gap-1.5 text-sm font-semibold text-encre-doux transition-colors hover:text-brand-700">
            <ArrowLeft className="size-4" aria-hidden /> Retour à l’accueil
          </Link>
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden" aria-label="Franck School, accueil">
            <img src="/logo.svg" alt="" className="size-14 rounded-2xl" />
            <span className="font-display text-2xl font-extrabold tracking-[-0.02em]">Franck School</span>
          </Link>
          <h1 className="font-display text-[34px] font-bold leading-tight tracking-[-0.03em]">Connexion à votre espace</h1>
          <p className="mt-2 text-encre-doux">Utilisez l’e-mail ou le numéro de téléphone enregistré par votre établissement.</p>

          <form onSubmit={soumettre} className="mt-9 space-y-5" noValidate>
            {erreur && (
              <div role="alert" className="flex gap-2.5 rounded-xl bg-stylo-50 p-3.5 text-sm text-stylo-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {erreur}
              </div>
            )}
            <div>
              <label htmlFor="email" className="field-label">E-mail ou téléphone</label>
              <input id="email" type="text" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" placeholder="nom@ecole.cm ou 6XX XX XX XX" />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="mdp" className="field-label">Mot de passe</label>
                <Link to="/mot-de-passe-oublie" className="text-sm font-semibold text-brand-700 hover:underline">Mot de passe oublié</Link>
              </div>
              <div className="relative">
                <input id="mdp" type={voir ? 'text' : 'password'} autoComplete="current-password" value={mdp} onChange={(e) => setMdp(e.target.value)} className="field-input pr-12" />
                <button type="button" onClick={() => setVoir(!voir)} className="absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center text-encre-pale hover:text-encre" aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  {voir ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={envoi} className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-brand-700 font-semibold text-white shadow-encre transition-colors hover:bg-brand-800 disabled:opacity-60">
              {envoi ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {envoi ? 'Connexion en cours…' : 'Accéder à mon espace'}
            </button>
          </form>

          {demo && (
            <section className="mt-10" aria-labelledby="demo-titre">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-papier-ligne" />
                <h2 id="demo-titre" className="text-[13px] font-semibold text-encre-doux">Comptes de test</h2>
                <span className="h-px flex-1 bg-papier-ligne" />
              </div>
              <ul className="mt-4 grid gap-2">
                {Object.entries(comptesDemo).map(([mail, s]) => (
                  <li key={mail}>
                    <button
                      type="button"
                      disabled={envoi}
                      onClick={() => {
                        setEmail(mail);
                        setMdp('demo');
                        entrer(mail);
                      }}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 ring-inset ring-papier-ligne transition-colors hover:bg-brand-50/50 hover:ring-brand-200"
                    >
                      <Avatar name={s.nom} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{s.fonction}</span>
                        <span className="block truncate text-xs text-encre-doux">{s.nom}</span>
                      </span>
                      <ArrowRight className="size-4 text-encre-pale transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
