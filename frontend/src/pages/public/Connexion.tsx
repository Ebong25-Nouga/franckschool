import { AlertCircle, Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accueilParEspace, comptesDemo, useAuth } from '../../auth';

export default function Connexion() {
  const { connexion } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    setErreur('');
    if (!email || !mdp) {
      setErreur('Renseignez votre identifiant et votre mot de passe.');
      return;
    }
    setEnvoi(true);
    setTimeout(() => {
      const s = connexion(email);
      setEnvoi(false);
      if (!s) {
        // Message volontairement neutre : ne révèle pas si le compte existe
        setErreur('Identifiant ou mot de passe incorrect.');
        return;
      }
      nav(accueilParEspace[s.espace]);
    }, 450);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-950 p-12 text-white lg:flex">
        <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-800/40 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3">
          <img src="/logo.svg" alt="" className="size-10 rounded-lg ring-1 ring-white/10" />
          <span className="text-lg font-extrabold tracking-wide">FRANCK SCHOOL</span>
        </Link>
        <div className="relative">
          <p className="text-3xl font-bold leading-snug [text-wrap:balance]">« Une école bien gérée, c’est plus de temps pour faire réussir les élèves. »</p>
          <p className="mt-4 text-brand-300">Notes, bulletins, caisse et suivi des parents, réunis sur une seule plateforme.</p>
        </div>
        <p className="relative text-sm text-brand-300">© 2026 FRANCK SCHOOL</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="/logo.svg" alt="" className="size-9" />
            <span className="text-lg font-extrabold tracking-wide text-brand-950">FRANCK SCHOOL</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Connexion</h1>
          <p className="mt-1.5 text-sm text-slate-500">Accédez à votre espace avec les identifiants fournis par votre établissement.</p>

          <form onSubmit={soumettre} className="mt-8 space-y-5" noValidate>
            {erreur && (
              <div role="alert" className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {erreur}
              </div>
            )}
            <div>
              <label htmlFor="email" className="field-label">Adresse e-mail ou téléphone</label>
              <input id="email" type="text" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" placeholder="nom@ecole.cm" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="mdp" className="field-label">Mot de passe</label>
                <Link to="/mot-de-passe-oublie" className="mb-1.5 text-sm font-medium text-brand-800 hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <input id="mdp" type={voir ? 'text' : 'password'} autoComplete="current-password" value={mdp} onChange={(e) => setMdp(e.target.value)} className="field-input pr-11" />
                <button type="button" onClick={() => setVoir(!voir)} className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-slate-500 hover:text-slate-800" aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  {voir ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={envoi} className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-800 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900 disabled:opacity-60">
              {envoi && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {envoi ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {(import.meta.env.DEV || import.meta.env.VITE_DEMO === 'true') && (
            <div className="mt-8 rounded-lg border border-dashed border-brand-300 bg-brand-50/60 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-brand-900">
                <Info className="size-4" aria-hidden /> Comptes de démonstration
              </p>
              <p className="mt-1 text-xs text-slate-600">Version de démonstration : cliquez sur un compte, puis sur « Se connecter ». N’importe quel mot de passe.</p>
              <ul className="mt-3 space-y-1">
                {Object.entries(comptesDemo).map(([mail, s]) => (
                  <li key={mail}>
                    <button type="button" onClick={() => { setEmail(mail); setMdp('demo'); }} className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white">
                      <span className="font-medium text-slate-800">{s.fonction}</span>
                      <span className="block text-xs text-slate-500">{mail}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
