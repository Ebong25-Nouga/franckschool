import { ArrowLeft, MailCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export default function MotDePasseOublie() {
  const [envoye, setEnvoye] = useState(false);
  const [email, setEmail] = useState('');
  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    if (email) setEnvoye(true);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <img src="/logo.svg" alt="" className="size-10" />
        {envoye ? (
          <div role="status" className="mt-6">
            <MailCheck className="size-8 text-emerald-600" aria-hidden />
            <h1 className="mt-3 text-xl font-bold text-slate-900">Vérifiez votre messagerie</h1>
            {/* Même message que le compte existe ou non */}
            <p className="mt-2 text-sm text-slate-600">Si un compte correspond à cet identifiant, vous recevrez un lien pour choisir un nouveau mot de passe.</p>
          </div>
        ) : (
          <form onSubmit={soumettre} className="mt-6">
            <h1 className="text-xl font-bold text-slate-900">Mot de passe oublié</h1>
            <p className="mt-1.5 text-sm text-slate-500">Indiquez votre e-mail ou votre téléphone. Nous vous enverrons un lien de réinitialisation.</p>
            <label htmlFor="id" className="field-label mt-6">Adresse e-mail ou téléphone</label>
            <input id="id" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" autoComplete="username" required />
            <button className="mt-5 min-h-11 w-full cursor-pointer rounded-lg bg-brand-800 text-sm font-semibold text-white transition-colors hover:bg-brand-900">Envoyer le lien</button>
          </form>
        )}
        <Link to="/connexion" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
