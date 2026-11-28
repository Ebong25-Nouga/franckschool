import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, School } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/auth';
import { ecole } from '@/data/demo';
import { CadreAuth } from './CadreAuth';

/**
 * Connexion propre à une école : franckschool.cm/etoiles (décision 022).
 * Le lien indique l'école ; le parent se connecte avec SON téléphone et SON code,
 * reçus en privé (WhatsApp ou en personne). Le serveur cherchera ce numéro
 * uniquement parmi les parents de cette école (backend B23 à B28).
 */
const demo = import.meta.env.DEV || import.meta.env.VITE_DEMO === 'true';
// Démonstration : une seule école connue. Le backend fournira la liste réelle.
const ecoles: Record<string, typeof ecole> = { [ecole.lien]: ecole };

export default function ConnexionEcole() {
  const { ecole: slug = '' } = useParams();
  const e = ecoles[slug.toLowerCase()];
  const { connexion } = useAuth();
  const nav = useNavigate();
  const [etape, setEtape] = useState<'connexion' | 'nouveau'>('connexion');
  const [tel, setTel] = useState('');
  const [mdp, setMdp] = useState('');
  const [voir, setVoir] = useState(false);
  const [nouveau, setNouveau] = useState({ mdp: '', confirmation: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  if (!e)
    return (
      <CadreAuth titre="Votre école, partout avec vous." texte="Chaque établissement a son propre lien de connexion.">
        <span className="grid size-14 place-items-center rounded-2xl bg-stylo-50 text-stylo"><School className="size-7" aria-hidden /></span>
        <h1 className="mt-5 font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">École introuvable</h1>
        <p className="mt-2 text-encre-doux">Le lien « franckschool.cm/{slug} » ne correspond à aucun établissement. Vérifiez le lien reçu dans le groupe de votre école, ou demandez-le au secrétariat.</p>
        <Link to="/connexion" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800">Connexion générale <ArrowRight className="size-4" aria-hidden /></Link>
      </CadreAuth>
    );

  const telOk = /^(\+?237)?6\d{8}$/.test(tel.replace(/\s/g, ''));
  const entrer = () => {
    setEnvoi(true);
    setTimeout(() => {
      setEnvoi(false);
      const s = connexion('parent@etoiles.cm');
      if (s) nav('/parent');
    }, 450);
  };
  const soumettre = (ev: FormEvent) => {
    ev.preventDefault();
    setErreur('');
    if (!telOk) return setErreur('Saisissez le numéro de téléphone enregistré par l’école (6XX XX XX XX).');
    if (!mdp) return setErreur('Saisissez votre mot de passe ou le code reçu du secrétariat.');
    // Un code provisoire (6 chiffres) oblige à choisir son mot de passe
    if (/^\d{6}$/.test(mdp)) return setEtape('nouveau');
    entrer();
  };
  const nouveauOk = nouveau.mdp.length >= 8 && /\d/.test(nouveau.mdp) && /[A-Za-z]/.test(nouveau.mdp);
  const valider = (ev: FormEvent) => {
    ev.preventDefault();
    setErreur('');
    if (!nouveauOk) return setErreur('8 caractères au moins, avec des lettres et des chiffres.');
    if (nouveau.confirmation !== nouveau.mdp) return setErreur('Les deux mots de passe ne correspondent pas.');
    entrer();
  };

  return (
    <CadreAuth titre={`Espace parents · ${e.court}`} texte="Suivez les notes, les absences et les paiements de vos enfants, où que vous soyez." retour={{ to: '/', label: 'Franck School' }}>
      <div className="flex items-center gap-3 rounded-2xl bg-brand-50/70 p-3.5 ring-1 ring-inset ring-brand-100">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-700 font-display text-[15px] font-extrabold text-white">{e.sigle}</span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-semibold">{e.nom}</span>
          <span className="block text-[13px] text-encre-doux">{e.quartier}, {e.ville}</span>
        </span>
      </div>

      {etape === 'connexion' ? (
        <>
          <h1 className="mt-8 font-display text-[32px] font-bold leading-tight tracking-[-0.03em]">Connexion parent</h1>
          <p className="mt-2 text-encre-doux">Utilisez le numéro et le code que le secrétariat vous a remis personnellement.</p>
          <form onSubmit={soumettre} className="mt-8 space-y-5" noValidate>
            {erreur && <p role="alert" className="flex gap-2.5 rounded-xl bg-stylo-50 p-3.5 text-sm text-stylo-700"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />{erreur}</p>}
            <div>
              <label htmlFor="tel" className="field-label">Numéro de téléphone</label>
              <input id="tel" type="tel" inputMode="tel" autoComplete="username" value={tel} onChange={(x) => setTel(x.target.value)} className="field-input" placeholder="6XX XX XX XX" />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="mdp" className="field-label">Mot de passe ou code reçu</label>
                <Link to="/mot-de-passe-oublie" className="text-sm font-semibold text-brand-700 hover:underline">Code perdu ?</Link>
              </div>
              <div className="relative">
                <input id="mdp" type={voir ? 'text' : 'password'} autoComplete="current-password" value={mdp} onChange={(x) => setMdp(x.target.value)} className="field-input pr-12" />
                <button type="button" onClick={() => setVoir(!voir)} className="absolute inset-y-0 right-0 grid w-12 cursor-pointer place-items-center text-encre-pale hover:text-encre" aria-label={voir ? 'Masquer' : 'Afficher'}>
                  {voir ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={envoi} className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-brand-700 font-semibold text-white shadow-encre hover:bg-brand-800 disabled:opacity-60">
              {envoi && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {envoi ? 'Connexion…' : 'Accéder à mon espace'}
            </button>
          </form>
          <p className="mt-6 text-[13px] leading-relaxed text-encre-doux">Pas encore d’identifiants ? Passez au secrétariat de l’école ou demandez-les par WhatsApp : ils vous seront remis personnellement.</p>
        </>
      ) : (
        <>
          <h1 className="mt-8 font-display text-[32px] font-bold leading-tight tracking-[-0.03em]">Choisissez votre mot de passe</h1>
          <p className="mt-2 flex items-start gap-2 text-encre-doux"><CheckCircle2 className="mt-1 size-4 shrink-0 text-valide" aria-hidden />Code accepté. Remplacez-le par un mot de passe que vous seul connaissez.</p>
          <form onSubmit={valider} className="mt-8 space-y-5" noValidate>
            {erreur && <p role="alert" className="flex gap-2.5 rounded-xl bg-stylo-50 p-3.5 text-sm text-stylo-700"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />{erreur}</p>}
            <div>
              <label htmlFor="n1" className="field-label">Nouveau mot de passe</label>
              <input id="n1" type="password" autoComplete="new-password" value={nouveau.mdp} onChange={(x) => setNouveau({ ...nouveau, mdp: x.target.value })} className="field-input" />
              <p className="mt-1.5 text-[13px] text-encre-doux">8 caractères au moins, avec des lettres et des chiffres.</p>
            </div>
            <div>
              <label htmlFor="n2" className="field-label">Confirmer</label>
              <input id="n2" type="password" autoComplete="new-password" value={nouveau.confirmation} onChange={(x) => setNouveau({ ...nouveau, confirmation: x.target.value })} className="field-input" />
            </div>
            <button type="submit" disabled={envoi} className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-brand-700 font-semibold text-white shadow-encre hover:bg-brand-800 disabled:opacity-60">
              {envoi && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Enregistrer et entrer
            </button>
          </form>
        </>
      )}

      {demo && (
        <p className="mt-8 rounded-xl bg-feutre-50 px-4 py-3 text-[13px] leading-relaxed text-feutre-700">
          Démonstration : sans serveur, tout numéro valide ouvre l’espace parent d’exemple. Un code de 6 chiffres (ex. 482915) montre l’étape « Choisissez votre mot de passe ».
        </p>
      )}
    </CadreAuth>
  );
}
