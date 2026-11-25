import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ArrowRight,
  BellRing,
  BookMarked,
  Check,
  CheckCheck,
  Download,
  ClipboardCheck,
  ClipboardPen,
  Clock,
  Eye,
  Hourglass,
  KeyRound,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Star,
  Users2,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Grade, Modal, Pill, Segmented, useToast } from '@/components/kit';
import { Bloc, Chiffre, Titre } from '@/components/espace';
import { appreciation, ecole, note } from '@/data/demo';
import { demandesCorrection, elevesDe, emploiEnseignant, evaluations, notificationsEnseignant, type DemandeCorrection, type Evaluation, type StatutEval } from '@/data/enseignant';
import { useEnseignant } from './EspaceEnseignant';

const statutEval: Record<StatutEval, { tone: 'neutre' | 'feutre' | 'valide' | 'stylo'; label: string }> = {
  brouillon: { tone: 'neutre', label: 'En saisie' },
  soumise: { tone: 'feutre', label: 'Soumise, en attente' },
  validee: { tone: 'valide', label: 'Validée' },
  renvoyee: { tone: 'stylo', label: 'Renvoyée' },
};

/* ===============================================================
 * Accueil : tableau de bord sur ordinateur, page simple sur téléphone
 * ============================================================= */
export function Accueil() {
  const { profil, cle, titulaire } = useEnseignant();
  const mesEvals = evaluations.filter((e) => e.prof === cle);
  const aFinir = mesEvals.filter((e) => e.statut === 'brouillon' || e.statut === 'renvoyee');
  const enAttente = mesEvals.filter((e) => e.statut === 'soumise');
  const corrections = demandesCorrection.filter((d) => d.prof === cle && d.statut === 'a_traiter');
  const eleves = profil.affectations.reduce((s, a) => s + a.effectif, 0);
  const aujourdhui = emploiEnseignant[cle][0];

  const taches: { icon: LucideIcon; teinte: string; texte: React.ReactNode; to: string; action: string }[] = [
    ...corrections.length ? [{ icon: MessageSquareWarning, teinte: 'bg-stylo-50 text-stylo', texte: <><b className="text-encre">{corrections.length} demande{corrections.length > 1 ? 's' : ''} de correction</b> de l’administration à traiter.</>, to: '/enseignant/corrections', action: 'Corriger' }] : [],
    ...aFinir.map((e) => ({ icon: ClipboardPen, teinte: e.statut === 'renvoyee' ? 'bg-stylo-50 text-stylo' : 'bg-brand-50 text-brand-700', texte: e.statut === 'renvoyee' ? <><b className="text-encre">{e.type}, {e.classe}</b> renvoyée par l’administration.</> : <><b className="text-encre">{e.type}, {e.classe}</b> : {e.saisies} notes saisies sur {e.total}.</>, to: '/enseignant/notes', action: e.statut === 'renvoyee' ? 'Reprendre' : 'Finir la saisie' })),
  ];

  return (
    <>
      {/* ---------- Téléphone : page simple, comme l'espace parent ---------- */}
      <div className="lg:hidden">
        <p className="text-sm font-medium text-encre-doux">Mardi 25 novembre 2026</p>
        <h1 className="mt-1 font-display text-[32px] font-bold leading-[1.08] tracking-[-0.03em]">Bonjour, {profil.civilite === 'M.' ? 'Monsieur' : 'Madame'} {profil.nom.charAt(0) + profil.nom.slice(1).toLowerCase()}.</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-encre-doux">La saisie de la séquence 2 se termine le <b className="text-encre">5 décembre</b>.</p>
        <ul className="mt-7 flex flex-col gap-3">
          {taches.length === 0 && <li className="rounded-[20px] bg-white p-5 text-encre-doux shadow-feuille">Rien à faire pour l’instant. Toutes vos notes sont à jour.</li>}
          {taches.map((t, i) => (
            <li key={i} className="flex flex-col gap-3 rounded-[20px] bg-white p-4 shadow-feuille">
              <div className="flex items-start gap-4">
                <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', t.teinte)}><t.icon className="size-5" aria-hidden /></span>
                <p className="pt-2 text-[16px] leading-relaxed text-encre-doux">{t.texte}</p>
              </div>
              <Link to={t.to} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-papier px-4 text-sm font-semibold text-brand-800">{t.action} <ArrowRight className="size-4" aria-hidden /></Link>
            </li>
          ))}
        </ul>
        <Bloc titre="Aujourd’hui" className="mt-6">
          <ul className="flex flex-col gap-2">
            {aujourdhui.cours.map((c) => (
              <li key={c.debut} className="flex items-center gap-4 rounded-xl bg-papier px-4 py-3">
                <span className="font-display font-bold text-brand-700 chiffres">{c.debut}</span>
                <span className="font-medium">{c.classe}</span>
                <span className="ml-auto text-[13px] text-encre-doux">{c.salle}</span>
              </li>
            ))}
          </ul>
        </Bloc>
      </div>

      {/* ---------- Ordinateur : tableau de bord ---------- */}
      <div className="hidden lg:block">
        <Titre kicker="Mardi 25 novembre 2026" titre={`Bonjour, ${profil.civilite} ${profil.nom.charAt(0) + profil.nom.slice(1).toLowerCase()}`} texte={`${profil.specialite} · ${ecole.nom}`} action={<Link to="/enseignant/notes" className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-700 px-4 text-sm font-semibold text-white shadow-encre hover:bg-brand-800"><ClipboardPen className="size-4" aria-hidden />Saisir des notes</Link>} />
        <div className="grid grid-cols-4 gap-4">
          <Chiffre label="Mes classes" valeur={String(profil.affectations.length)} icone={BookMarked} detail={`${eleves} élèves au total`} />
          <Chiffre label="Évaluations à finir" valeur={String(aFinir.length)} icone={ClipboardPen} ton={aFinir.length ? 'feutre' : 'valide'} detail="Avant le 5 décembre" />
          <Chiffre label="En attente de validation" valeur={String(enAttente.length)} icone={Hourglass} detail="Soumises à l’administration" />
          <Chiffre label="Corrections demandées" valeur={String(corrections.length)} icone={MessageSquareWarning} ton={corrections.length ? 'stylo' : 'valide'} detail={corrections.length ? 'À traiter' : 'Aucune'} />
        </div>
        <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6">
          <Bloc titre="À faire" icone={ClipboardCheck}>
            {taches.length === 0 ? <p className="text-encre-doux">Tout est à jour.</p> : (
              <ul className="divide-y divide-papier-ligne/70">
                {taches.map((t, i) => (
                  <li key={i} className="flex items-center gap-4 py-3.5">
                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', t.teinte)}><t.icon className="size-[18px]" aria-hidden /></span>
                    <p className="flex-1 text-[15px] text-encre-doux">{t.texte}</p>
                    <Link to={t.to} className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">{t.action}</Link>
                  </li>
                ))}
              </ul>
            )}
          </Bloc>
          <Bloc titre="Aujourd’hui" icone={Clock}>
            <ul className="flex flex-col gap-2">
              {aujourdhui.cours.map((c) => (
                <li key={c.debut} className="flex items-center gap-4 rounded-xl bg-papier px-4 py-3">
                  <span className="whitespace-nowrap font-display font-bold text-brand-700 chiffres">{c.debut} – {c.fin}</span>
                  <span className="font-medium">{c.classe}</span>
                  <span className="ml-auto text-[13px] text-encre-doux">{c.salle}</span>
                </li>
              ))}
            </ul>
          </Bloc>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-6">
          <Bloc titre="Mes classes" icone={Users2} action={<Link to="/enseignant/classes" className="text-sm font-semibold text-brand-700 hover:underline">Tout voir</Link>}>
            <ul className="divide-y divide-papier-ligne/70">
              {profil.affectations.map((a) => (
                <li key={a.classe} className="flex items-center gap-4 py-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 font-display text-sm font-bold text-brand-800">{a.classe.split(' ')[0]}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{a.classe} {a.classe === titulaire && <Star className="ml-1 inline size-3.5 text-feutre-700" aria-label="Classe principale" />}</p>
                    <p className="text-[13px] text-encre-doux">{a.matiere} · {a.effectif} élèves</p>
                  </div>
                  {a.moyenne !== null && <Grade value={a.moyenne} />}
                </li>
              ))}
            </ul>
          </Bloc>
          {titulaire ? (
            <Bloc titre={`Ma classe principale : ${titulaire}`} icone={Star} action={<Link to="/enseignant/classe-principale/saisies" className="text-sm font-semibold text-brand-700 hover:underline">Suivi des saisies</Link>}>
              <p className="text-[15px] text-encre-doux">Séquence 2 : <b className="text-encre">3 matières sur 9</b> validées, <b className="text-encre">2</b> soumises, <b className="text-stylo">2 pas encore commencées</b>.</p>
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-papier-2" aria-hidden>
                <span className="bg-valide" style={{ width: '33%' }} />
                <span className="bg-feutre" style={{ width: '22%' }} />
                <span className="bg-brand-400" style={{ width: '22%' }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-encre-doux">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-valide" />Validées</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-feutre" />Soumises</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-400" />En saisie</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-papier-2" />Non commencées</span>
              </div>
            </Bloc>
          ) : (
            <Bloc titre="Rappel" icone={Megaphone}>
              <p className="text-[15px] leading-relaxed text-encre-doux">Les conseils de classe du 1er trimestre auront lieu du <b className="text-encre">8 au 10 décembre</b>. Pensez à soumettre toutes vos notes avant le 5 décembre.</p>
            </Bloc>
          )}
        </div>
      </div>
    </>
  );
}

/* ===============================================================
 * Mon profil
 * ============================================================= */
export function MonProfil() {
  const { profil, titulaire } = useEnseignant();
  const nom = `${profil.civilite} ${profil.nom} ${profil.prenom}`;
  return (
    <>
      <Titre titre="Mon profil" texte="Vos informations dans l’établissement. Pour les modifier, adressez-vous à l’administration." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <section className="seyes relative overflow-hidden rounded-[24px] bg-brand-950 p-6 text-white sm:p-7">
          <Avatar name={nom} size="xl" className="ring-4 ring-white/10" />
          <h2 className="mt-5 font-display text-[26px] font-bold leading-tight tracking-[-0.02em]">{nom}</h2>
          <p className="text-brand-200">{profil.specialite} · {profil.contrat}</p>
          {titulaire && <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-feutre px-3 py-1 text-sm font-bold text-encre"><Star className="size-4" aria-hidden />Titulaire de la {titulaire}</p>}
          <dl className="mt-6 grid gap-3 text-[15px]">
            <div className="flex justify-between gap-4"><dt className="text-brand-300">Matricule</dt><dd className="font-mono font-semibold">{profil.matricule}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-brand-300">Téléphone</dt><dd className="font-semibold">{profil.telephone}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-brand-300">E-mail</dt><dd className="break-all text-right font-semibold">{profil.email}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-brand-300">Dans l’établissement depuis</dt><dd className="font-semibold">{profil.depuis}</dd></div>
          </dl>
        </section>
        <div className="flex flex-col gap-6">
          <Bloc titre="Mes affectations, 2026-2027">
            <ul className="divide-y divide-papier-ligne/70">
              {profil.affectations.map((a) => (
                <li key={a.classe} className="flex items-center gap-4 py-3">
                  <div className="flex-1"><p className="font-semibold">{a.classe} {a.classe === titulaire && <Pill tone="feutre" dot={false}>Classe principale</Pill>}</p><p className="text-[13px] text-encre-doux">{a.matiere}, coef. {a.coef}</p></div>
                  <span className="text-sm text-encre-doux">{a.heures} h / semaine</span>
                </li>
              ))}
            </ul>
          </Bloc>
          <Bloc titre="Historique des classes principales">
            {profil.historiqueTitulaire.length === 0 ? (
              <p className="text-[15px] text-encre-doux">Vous n’avez pas encore été titulaire d’une classe.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {profil.historiqueTitulaire.map((h, i) => (
                  <li key={h.annee} className={cn('flex items-center justify-between rounded-xl px-4 py-3', i === 0 ? 'bg-brand-50' : 'bg-papier')}>
                    <span className="font-semibold chiffres">{h.annee}</span><span>{h.classe}</span>
                  </li>
                ))}
              </ol>
            )}
          </Bloc>
        </div>
      </div>
    </>
  );
}

/* ===============================================================
 * Mes classes
 * ============================================================= */
export function MesClasses() {
  const { profil, titulaire, cle } = useEnseignant();
  return (
    <>
      <Titre titre="Mes classes" texte="Uniquement les classes dans lesquelles vous enseignez cette année." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {profil.affectations.map((a) => {
          const prochaine = evaluations.find((e) => e.prof === cle && e.classe === a.classe && (e.statut === 'brouillon' || e.statut === 'renvoyee'));
          const principale = a.classe === titulaire;
          return (
            <article key={a.classe} className={cn('flex flex-col overflow-hidden rounded-[24px] bg-white shadow-feuille', principale && 'ring-2 ring-feutre')}>
              <div className="seyes relative bg-brand-950 p-6 text-white">
                {principale && <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-feutre px-2.5 py-1 text-xs font-bold text-encre"><Star className="size-3" aria-hidden />Classe principale</span>}
                <h2 className="font-display text-[32px] font-extrabold leading-none tracking-[-0.03em]">{a.classe}</h2>
                <p className="mt-2 text-brand-200">{a.matiere}, coef. {a.coef}</p>
              </div>
              <dl className="grid grid-cols-3 divide-x divide-papier-ligne/70 border-b border-papier-ligne/70 text-center">
                <div className="py-4"><dt className="text-xs text-encre-doux">Élèves</dt><dd className="mt-1 font-display text-lg font-bold">{a.effectif}</dd></div>
                <div className="py-4"><dt className="text-xs text-encre-doux">Heures</dt><dd className="mt-1 font-display text-lg font-bold">{a.heures} h</dd></div>
                <div className="py-4"><dt className="text-xs text-encre-doux">Moy. séq. 1</dt><dd className="mt-1">{a.moyenne !== null ? <Grade value={a.moyenne} size="sm" /> : '—'}</dd></div>
              </dl>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="flex items-center gap-2 text-[14px] text-encre-doux"><MapPin className="size-4" aria-hidden />{a.salle}</p>
                {prochaine ? <p className="text-[14px] text-encre-doux"><b className="text-encre">{prochaine.type}</b> : {prochaine.saisies}/{prochaine.total} notes saisies.</p> : <p className="text-[14px] text-valide">Toutes les notes sont soumises.</p>}
                <div className="mt-auto flex gap-2 pt-2">
                  <Link to={`/enseignant/eleves?classe=${encodeURIComponent(a.classe)}`} className="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-papier text-sm font-semibold text-encre hover:bg-papier-2">Élèves</Link>
                  <Link to={`/enseignant/notes?classe=${encodeURIComponent(a.classe)}`} className="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-brand-700 text-sm font-semibold text-white hover:bg-brand-800">Saisir</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

/* ===============================================================
 * Mes matières
 * ============================================================= */
export function MesMatieres() {
  const { profil, cle } = useEnseignant();
  const matieres = [...new Set(profil.affectations.map((a) => a.matiere))];
  return (
    <>
      <Titre titre="Mes matières" texte="Les matières qui vous sont attribuées, avec leur coefficient dans chaque classe." />
      {matieres.map((m) => {
        const lignes = profil.affectations.filter((a) => a.matiere === m);
        return (
          <Bloc key={m} titre={m} className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[15px]">
                <caption className="sr-only">Classes où vous enseignez {m}</caption>
                <thead><tr className="border-b border-papier-ligne text-xs text-encre-doux"><th className="py-2.5 font-semibold">Classe</th><th className="py-2.5 text-center font-semibold">Coefficient</th><th className="py-2.5 text-center font-semibold">Heures / semaine</th><th className="py-2.5 text-center font-semibold">Évaluations</th><th className="py-2.5 text-right font-semibold">Moyenne séq. 1</th></tr></thead>
                <tbody className="divide-y divide-papier-ligne/70">
                  {lignes.map((a) => (
                    <tr key={a.classe}>
                      <td className="py-3 font-semibold">{a.classe}</td>
                      <td className="py-3 text-center"><span className="rounded-lg bg-brand-50 px-2 py-1 text-sm font-bold text-brand-800">{a.coef}</span></td>
                      <td className="py-3 text-center chiffres">{a.heures}</td>
                      <td className="py-3 text-center chiffres">{evaluations.filter((e) => e.prof === cle && e.classe === a.classe).length}</td>
                      <td className="py-3 text-right">{a.moyenne !== null ? <Grade value={a.moyenne} size="sm" /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Bloc>
        );
      })}
      <p className="text-sm text-encre-doux">Les coefficients sont fixés par l’établissement. Vous ne voyez pas les notes des autres matières.</p>
    </>
  );
}

/* ===============================================================
 * Listes des élèves
 * ============================================================= */
function classeDeLAdresse(defaut: string) {
  const h = window.location.hash || window.location.search;
  const m = /classe=([^&]+)/.exec(h);
  return m ? decodeURIComponent(m[1]) : defaut;
}

export function ListesEleves() {
  const { profil } = useEnseignant();
  const classes = profil.affectations.map((a) => a.classe);
  const [classe, setClasse] = useState(() => {
    const c = classeDeLAdresse(classes[0]);
    return classes.includes(c) ? c : classes[0];
  });
  const [q, setQ] = useState('');
  const liste = elevesDe(classe).filter((e) => `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <Titre titre="Listes des élèves" texte="Les élèves de vos classes, par ordre alphabétique." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Segmented label="Classe" value={classe} onChange={setClasse} options={classes.map((c) => ({ value: c, label: c }))} />
        <label className="relative block sm:ml-auto sm:w-72">
          <span className="sr-only">Rechercher un élève</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-encre-pale" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou matricule" className="field-input pl-10" />
        </label>
      </div>
      <Bloc>
        <p className="mb-3 text-sm text-encre-doux">{liste.length} élève{liste.length > 1 ? 's' : ''} · {classe}</p>
        <ol className="divide-y divide-papier-ligne/70">
          {liste.map((e, i) => (
            <li key={e.id} className="flex items-center gap-3.5 py-3">
              <span className="w-6 text-right text-xs font-semibold text-encre-pale chiffres">{i + 1}</span>
              <Avatar name={`${e.nom} ${e.prenom}`} size="sm" />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{e.nom} {e.prenom}</p><p className="font-mono text-xs text-encre-pale">{e.matricule}</p></div>
              <span className="hidden text-sm text-encre-doux sm:inline">{e.sexe === 'F' ? 'Fille' : 'Garçon'}</span>
              {e.statut !== 'Ancien' && <Pill tone={e.statut === 'Nouveau' ? 'encre' : 'orange'} dot={false}>{e.statut}</Pill>}
            </li>
          ))}
        </ol>
      </Bloc>
    </>
  );
}

/* ===============================================================
 * Saisie des notes
 * ============================================================= */
const valeursInit = ['12', '14,5', '9', '16', '11,25', '8,5', '13', '17,75', '', '', '10,5', 'ABS', '', '6', '15,5', '12,75'];

export function SaisieNotes() {
  const toast = useToast();
  const { profil, cle } = useEnseignant();
  const classes = profil.affectations.map((a) => a.classe);
  const [classe, setClasse] = useState(() => {
    const c = classeDeLAdresse(classes[classes.length - 1]);
    return classes.includes(c) ? c : classes[classes.length - 1];
  });
  const evalsClasse = evaluations.filter((e) => e.prof === cle && e.classe === classe && e.sequence === 2);
  const [evalId, setEvalId] = useState<number | null>(null);
  const evaluation = evalsClasse.find((e) => e.id === evalId) ?? evalsClasse.find((e) => e.statut === 'brouillon' || e.statut === 'renvoyee') ?? evalsClasse[0];
  const verrouillee = evaluation && (evaluation.statut === 'soumise' || evaluation.statut === 'validee');
  const liste = useMemo(() => elevesDe(classe), [classe]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [soumis, setSoumis] = useState<number[]>([]);
  const [nouvelle, setNouvelle] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const val = (id: number, i: number) => notes[id] ?? (evaluation && evaluation.statut !== 'brouillon' ? valeursInit[i % 16] || '13' : i < (evaluation?.saisies ?? 0) ? valeursInit[i % 16] || '13' : '');
  const lire = (v: string) => (v && v.toUpperCase() !== 'ABS' ? Number(v.replace(',', '.')) : null);
  const erreur = (v: string) => {
    if (!v || v.toUpperCase() === 'ABS') return '';
    const n = lire(v)!;
    return Number.isNaN(n) || n < 0 || n > 20 ? 'Entre 0 et 20' : '';
  };
  const vals = liste.map((e, i) => val(e.id, i));
  const nums = vals.filter((v) => !erreur(v)).map(lire).filter((n): n is number => n !== null);
  const moy = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  const manquantes = vals.filter((v) => !v).length;
  const invalides = vals.filter((v) => erreur(v)).length;
  const dejaSoumise = evaluation && soumis.includes(evaluation.id);
  const lectureSeule = verrouillee || dejaSoumise;

  return (
    <>
      <Titre titre="Saisie des notes" texte="Tapez la note puis Entrée pour passer à l’élève suivant. Les notes sont sur 20." action={<Button variant="secondary" icon={Plus} onClick={() => setNouvelle(true)}>Nouvelle évaluation</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <section className="overflow-hidden rounded-[22px] bg-white shadow-feuille">
          <div className="flex flex-col gap-3 p-5">
            <Segmented label="Classe" value={classe} onChange={(c) => { setClasse(c); setEvalId(null); }} options={classes.map((c) => ({ value: c, label: c }))} />
            {evalsClasse.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <select aria-label="Évaluation" value={evaluation?.id} onChange={(e) => setEvalId(Number(e.target.value))} className="field-input min-h-11 w-auto max-w-full text-sm font-semibold">
                  {evalsClasse.map((e) => <option key={e.id} value={e.id}>{e.type} · {e.date}</option>)}
                </select>
                {evaluation && <Pill tone={dejaSoumise ? 'feutre' : statutEval[evaluation.statut].tone}>{dejaSoumise ? 'Soumise, en attente' : statutEval[evaluation.statut].label}</Pill>}
              </div>
            )}
            {evaluation?.statut === 'renvoyee' && !dejaSoumise && <p className="flex gap-2 rounded-xl bg-stylo-50 p-3 text-sm text-stylo-700"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />Renvoyée par l’administration : {evaluation.motifRenvoi}</p>}
            {lectureSeule && <p className="flex gap-2 rounded-xl bg-papier p-3 text-sm text-encre-doux"><Eye className="mt-0.5 size-4 shrink-0" aria-hidden />Notes soumises : elles ne se modifient plus ici. Une correction passe par une demande de l’administration.</p>}
          </div>

          {!evaluation ? (
            <p className="border-t border-papier-ligne/70 p-6 text-encre-doux">Aucune évaluation pour la séquence 2 dans cette classe. Créez-en une avec « Nouvelle évaluation ».</p>
          ) : (
            <ul className="seyes-clair border-t border-papier-ligne/70">
              {liste.map((e, i) => {
                const v = vals[i];
                const err = erreur(v);
                const n = lire(v);
                return (
                  <li key={e.id} className="grid grid-cols-[2rem_1fr_6.5rem] items-center gap-3 border-b border-papier-ligne/50 py-2 pl-3 pr-4 sm:grid-cols-[2.25rem_1fr_7rem_6rem] sm:pl-5">
                    <span className="text-right text-xs font-semibold text-encre-pale chiffres">{i + 1}</span>
                    <label htmlFor={`n-${e.id}`} className="min-w-0 cursor-pointer truncate pl-5 text-[15px] font-medium sm:pl-6">{e.nom} <span className="text-encre-doux">{e.prenom}</span></label>
                    <div>
                      <input
                        ref={(el) => { refs.current[i] = el; }}
                        id={`n-${e.id}`}
                        inputMode="decimal"
                        autoComplete="off"
                        disabled={!!lectureSeule}
                        value={v}
                        onChange={(ev) => setNotes({ ...notes, [e.id]: ev.target.value })}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === 'ArrowDown') { ev.preventDefault(); refs.current[i + 1]?.focus(); refs.current[i + 1]?.select(); }
                          if (ev.key === 'ArrowUp') { ev.preventDefault(); refs.current[i - 1]?.focus(); refs.current[i - 1]?.select(); }
                        }}
                        aria-invalid={!!err}
                        aria-describedby={err ? `err-${e.id}` : undefined}
                        placeholder="—"
                        className={cn('h-11 w-full rounded-lg border bg-white text-center font-display text-[17px] font-bold chiffres focus:outline-none focus:ring-4 disabled:bg-papier disabled:text-encre-doux', err ? 'border-stylo text-stylo focus:ring-stylo/15' : n !== null && n < 10 ? 'border-papier-ligne text-stylo focus:border-brand-600 focus:ring-brand-600/[0.12]' : 'border-papier-ligne text-encre focus:border-brand-600 focus:ring-brand-600/[0.12]')}
                      />
                      {err && <p id={`err-${e.id}`} className="mt-0.5 text-center text-[11px] font-semibold text-stylo">{err}</p>}
                    </div>
                    <span className="hidden text-[13px] text-encre-doux sm:block">{v.toUpperCase() === 'ABS' ? 'Absent' : n !== null && !err ? appreciation(n) : ''}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="px-5 py-3 text-[13px] text-encre-doux">Tapez <kbd className="rounded border border-papier-ligne bg-papier px-1 font-semibold">ABS</kbd> pour un élève absent. La virgule et le point sont acceptés.</p>
        </section>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-8 xl:self-start">
          <Bloc>
            <p className="text-[13px] font-medium text-encre-doux">Moyenne de la classe</p>
            <p className={cn('mt-1 font-display text-[40px] font-extrabold leading-none tracking-[-0.04em] chiffres', moy < 10 ? 'text-stylo' : 'text-encre')}>{note(moy)}</p>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><dt className="text-encre-doux">Notes saisies</dt><dd className="font-bold chiffres">{liste.length - manquantes}/{liste.length}</dd></div>
              <div className="flex justify-between"><dt className="text-encre-doux">Sous la moyenne</dt><dd className="font-bold text-stylo chiffres">{nums.filter((x) => x < 10).length}</dd></div>
              <div className="flex justify-between"><dt className="text-encre-doux">Absents</dt><dd className="font-bold chiffres">{vals.filter((x) => x.toUpperCase() === 'ABS').length}</dd></div>
            </dl>
          </Bloc>
          {!lectureSeule && evaluation && (
            <>
              {(manquantes > 0 || invalides > 0) && <p className="flex gap-2 rounded-xl bg-feutre-50 p-3.5 text-[13px]"><AlertCircle className="mt-0.5 size-4 shrink-0 text-feutre-700" aria-hidden />{invalides ? `${invalides} note(s) à corriger. ` : ''}{manquantes ? `${manquantes} élève(s) sans note.` : ''}</p>}
              <Button variant="secondary" icon={Save} onClick={() => toast('Brouillon enregistré.')}>Enregistrer le brouillon</Button>
              <Button size="lg" icon={Send} disabled={manquantes > 0 || invalides > 0} onClick={() => { setSoumis([...soumis, evaluation.id]); toast(`Notes de ${evaluation.matiere}, ${classe} soumises à l’administration.`); }}>Soumettre à l’administration</Button>
            </>
          )}
          {dejaSoumise && <p className="flex items-center gap-2 rounded-xl bg-valide-50 p-4 text-sm font-semibold text-valide-700"><Check className="size-4" aria-hidden />Notes soumises. L’administration va les vérifier.</p>}
        </aside>
      </div>

      {nouvelle && <NouvelleEvaluation classes={classes} classe={classe} onClose={() => setNouvelle(false)} onCree={(m) => { toast(m); setNouvelle(false); }} />}
    </>
  );
}

function NouvelleEvaluation({ classes, classe, onClose, onCree }: { classes: string[]; classe: string; onClose: () => void; onCree: (msg: string) => void }) {
  const [f, setF] = useState({ classe, type: 'Devoir surveillé', date: '2026-11-28', sur: '20' });
  return (
    <Modal title="Nouvelle évaluation" lead="Séquence 2 · elle apparaîtra dans la saisie des notes." onClose={onClose} width="max-w-md" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={() => onCree(`${f.type} créé pour la ${f.classe}.`)}>Créer l’évaluation</Button></>}>
      <div className="grid gap-4">
        <div><label htmlFor="ev-classe" className="field-label">Classe</label><select id="ev-classe" value={f.classe} onChange={(e) => setF({ ...f, classe: e.target.value })} className="field-input">{classes.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label htmlFor="ev-type" className="field-label">Type</label><select id="ev-type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="field-input">{['Interrogation écrite', 'Devoir surveillé', 'Composition de séquence', 'Travaux pratiques'].map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label htmlFor="ev-date" className="field-label">Date</label><input id="ev-date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className="field-input" /></div>
          <div><label htmlFor="ev-sur" className="field-label">Noté sur</label><input id="ev-sur" inputMode="numeric" value={f.sur} onChange={(e) => setF({ ...f, sur: e.target.value.replace(/\D/g, '') })} className="field-input chiffres" /></div>
        </div>
      </div>
    </Modal>
  );
}

/* ===============================================================
 * Notes soumises
 * ============================================================= */
export function NotesSoumises() {
  const { cle } = useEnseignant();
  const [vue, setVue] = useState<'toutes' | StatutEval>('toutes');
  const [detail, setDetail] = useState<Evaluation | null>(null);
  const mes = evaluations.filter((e) => e.prof === cle && e.statut !== 'brouillon');
  const liste = mes.filter((e) => vue === 'toutes' || e.statut === vue);
  return (
    <>
      <Titre titre="Notes soumises" texte="Les évaluations envoyées à l’administration et leur état de validation." />
      <div className="mb-5">
        <Segmented label="Filtrer" value={vue} onChange={setVue} options={[{ value: 'toutes', label: 'Toutes', count: mes.length }, { value: 'soumise', label: 'En attente', count: mes.filter((e) => e.statut === 'soumise').length }, { value: 'validee', label: 'Validées', count: mes.filter((e) => e.statut === 'validee').length }, { value: 'renvoyee', label: 'Renvoyées', count: mes.filter((e) => e.statut === 'renvoyee').length }]} />
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {liste.map((e) => (
          <li key={e.id} className="flex flex-col rounded-[22px] bg-white p-5 shadow-feuille">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] text-encre-doux">Séquence {e.sequence} · {e.date}</p>
                <h2 className="mt-1 font-display text-lg font-bold leading-tight">{e.type}</h2>
                <p className="text-[15px] text-encre-doux">{e.matiere}, {e.classe}</p>
              </div>
              <Pill tone={statutEval[e.statut].tone}>{statutEval[e.statut].label}</Pill>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-papier px-4 py-3 text-sm">
              <span className="text-encre-doux">Moyenne</span><Grade value={e.moyenne} size="sm" />
              <span className="text-encre-doux">{e.saisies} notes</span>
            </div>
            <p className="mt-3 text-[13px] text-encre-doux">
              {e.statut === 'validee' ? `Soumise le ${e.soumiseLe}, validée le ${e.valideeLe}.` : e.statut === 'renvoyee' ? `Renvoyée : ${e.motifRenvoi}` : `Soumise le ${e.soumiseLe}.`}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              {e.statut === 'renvoyee' && <Link to="/enseignant/notes" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand-700 px-3 text-[13px] font-semibold text-white"><RotateCcw className="size-3.5" aria-hidden />Reprendre</Link>}
              <Button size="sm" variant="ghost" icon={Eye} onClick={() => setDetail(e)}>Voir les notes</Button>
            </div>
          </li>
        ))}
      </ul>
      {detail && (
        <Modal title={`${detail.type}, ${detail.classe}`} lead={`${detail.matiere} · séquence ${detail.sequence} · ${statutEval[detail.statut].label}`} onClose={() => setDetail(null)} width="max-w-lg">
          <ol className="divide-y divide-papier-ligne/70">
            {elevesDe(detail.classe).map((el, i) => {
              const v = valeursInit[i % 16] || '13';
              return (
                <li key={el.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 text-right text-xs text-encre-pale chiffres">{i + 1}</span>
                  <span className="flex-1 truncate text-sm font-medium">{el.nom} {el.prenom}</span>
                  {v === 'ABS' ? <Pill tone="neutre" dot={false}>Absent</Pill> : <Grade value={Number(v.replace(',', '.'))} size="sm" />}
                </li>
              );
            })}
          </ol>
        </Modal>
      )}
    </>
  );
}

/* ===============================================================
 * Demandes de correction
 * ============================================================= */
export function DemandesCorrection() {
  const { cle } = useEnseignant();
  const toast = useToast();
  const [liste, setListe] = useState<DemandeCorrection[]>(demandesCorrection.filter((d) => d.prof === cle));
  const [enCours, setEnCours] = useState<DemandeCorrection | null>(null);
  const statut = { a_traiter: { tone: 'stylo' as const, label: 'À traiter' }, envoyee: { tone: 'feutre' as const, label: 'Correction envoyée' }, acceptee: { tone: 'valide' as const, label: 'Correction validée' } };

  return (
    <>
      <Titre titre="Demandes de correction" texte="L’administration vous demande de corriger une de vos notes. Vous seul pouvez modifier vos notes ; la correction est ensuite validée par l’établissement." />
      {liste.length === 0 ? (
        <Bloc><p className="py-4 text-encre-doux">Aucune demande de correction.</p></Bloc>
      ) : (
        <ul className="flex flex-col gap-4">
          {liste.map((d) => (
            <li key={d.id} className={cn('rounded-[22px] bg-white p-5 shadow-feuille sm:p-6', d.statut === 'a_traiter' && 'ring-2 ring-stylo/30')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={d.eleve} />
                  <div className="min-w-0"><p className="font-semibold">{d.eleve}</p><p className="text-[13px] text-encre-doux">{d.classe} · {d.evaluation}</p></div>
                </div>
                <Pill tone={statut[d.statut].tone}>{statut[d.statut].label}</Pill>
              </div>
              <p className="mt-4 rounded-xl bg-papier px-4 py-3 text-[15px] leading-relaxed">{d.motif}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] text-encre-doux">Demandée par {d.demandeePar}, le {d.date}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm">Note actuelle <b className="font-display text-base text-stylo">{d.noteActuelle}</b>{d.nouvelleNote && <> → <b className="font-display text-base text-valide">{d.nouvelleNote}</b></>}</span>
                  {d.statut === 'a_traiter' && <Button size="sm" icon={ClipboardPen} onClick={() => setEnCours(d)}>Corriger</Button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {enCours && (
        <Correction
          demande={enCours}
          onClose={() => setEnCours(null)}
          onEnvoie={(n) => {
            setListe((l) => l.map((x) => (x.id === enCours.id ? { ...x, statut: 'envoyee', nouvelleNote: n } : x)));
            toast('Correction envoyée à l’administration pour validation.');
            setEnCours(null);
          }}
        />
      )}
    </>
  );
}

function Correction({ demande, onClose, onEnvoie }: { demande: DemandeCorrection; onClose: () => void; onEnvoie: (note: string) => void }) {
  const [n, setN] = useState('');
  const [justif, setJustif] = useState('');
  const [essai, setEssai] = useState(false);
  const v = n.trim().toUpperCase();
  const num = Number(n.replace(',', '.'));
  const erreurNote = !v ? 'Saisissez la nouvelle note, ou ABS.' : v !== 'ABS' && (Number.isNaN(num) || num < 0 || num > 20) ? 'La note doit être entre 0 et 20, ou ABS.' : '';
  const envoyer = (e: FormEvent) => {
    e.preventDefault();
    setEssai(true);
    if (!erreurNote && justif.trim().length >= 5) onEnvoie(v === 'ABS' ? 'ABS' : n.trim());
  };
  return (
    <Modal title="Corriger la note" lead={`${demande.eleve} · ${demande.evaluation}`} onClose={onClose} width="max-w-md" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button icon={Send} onClick={envoyer}>Envoyer la correction</Button></>}>
      <form onSubmit={envoyer} className="grid gap-4" noValidate>
        <p className="rounded-xl bg-papier p-3.5 text-sm"><b>Demande :</b> {demande.motif}</p>
        <div className="grid grid-cols-2 items-end gap-4">
          <div><p className="field-label">Note actuelle</p><p className="flex h-11 items-center rounded-[10px] bg-papier px-3.5 font-display text-lg font-bold text-stylo">{demande.noteActuelle}</p></div>
          <div>
            <label htmlFor="c-note" className="field-label">Nouvelle note</label>
            <input id="c-note" inputMode="decimal" value={n} onChange={(e) => setN(e.target.value)} className={cn('field-input font-display text-lg font-bold', essai && erreurNote && 'border-stylo')} aria-invalid={essai && !!erreurNote} aria-describedby="c-note-aide" autoFocus />
          </div>
        </div>
        <p id="c-note-aide" className={cn('-mt-2 text-[13px]', essai && erreurNote ? 'font-semibold text-stylo' : 'text-encre-doux')}>{essai && erreurNote ? erreurNote : 'Sur 20. Tapez ABS pour un élève absent.'}</p>
        <div>
          <label htmlFor="c-justif" className="field-label">Justification</label>
          <textarea id="c-justif" rows={3} value={justif} onChange={(e) => setJustif(e.target.value)} className={cn('field-input py-2.5', essai && justif.trim().length < 5 && 'border-stylo')} placeholder="Ex. Absence justifiée par certificat médical." aria-invalid={essai && justif.trim().length < 5} />
          <p className={cn('field-hint', essai && justif.trim().length < 5 && 'font-semibold text-stylo')}>Elle est conservée dans l’historique de la note.</p>
        </div>
      </form>
    </Modal>
  );
}

/* ===============================================================
 * Emploi du temps (PROVISOIRE)
 * ============================================================= */
const heures = ['07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30'];
const minutes = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

export function EmploiDuTemps() {
  const { cle, titulaire } = useEnseignant();
  const toast = useToast();
  const semaine = emploiEnseignant[cle];
  const debut = minutes('07:30');
  const fin = minutes('15:30');
  const px = 64 / 60;
  return (
    <>
      <Titre
        titre="Emploi du temps"
        texte="Semaine du 24 au 28 novembre 2026."
        action={<Button icon={Download} onClick={() => toast('Emploi du temps téléchargé en PDF.')}>Télécharger en PDF</Button>}
      />
      <p className="mb-5 flex items-start gap-2 rounded-xl bg-feutre-50 px-4 py-3 text-sm"><AlertCircle className="mt-0.5 size-4 shrink-0 text-feutre-700" aria-hidden />Emploi du temps provisoire, donné à titre d’exemple. Son fonctionnement sera défini plus tard.</p>
      {/* Téléphone : liste par jour */}
      <div className="flex flex-col gap-4 lg:hidden">
        {semaine.map((j, i) => (
          <Bloc key={j.jour} titre={i === 0 ? `${j.jour} (aujourd’hui)` : j.jour}>
            <ul className="flex flex-col gap-2">
              {j.cours.map((c) => (
                <li key={c.debut} className="flex items-center gap-3 rounded-xl bg-papier px-3.5 py-2.5">
                  <span className="font-display font-bold text-brand-700 chiffres">{c.debut}</span>
                  <span className="font-semibold">{c.classe}</span>
                  <span className="ml-auto text-[13px] text-encre-doux">{c.salle}</span>
                </li>
              ))}
            </ul>
          </Bloc>
        ))}
      </div>
      {/* Ordinateur : grille de la semaine */}
      <section className="hidden overflow-hidden rounded-[22px] bg-white shadow-feuille lg:block">
        <div className="grid grid-cols-[4rem_repeat(5,1fr)] pb-4">
          <div />
          {semaine.map((j, i) => <div key={j.jour} className={cn('border-b border-l border-papier-ligne/70 px-3 py-3 text-sm font-semibold', i === 0 && 'bg-brand-50 text-brand-800')}>{j.jour}</div>)}
          <div className="relative" style={{ height: (fin - debut) * px }}>
            {heures.map((h) => <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] font-semibold text-encre-pale chiffres" style={{ top: Math.max(8, (minutes(h) - debut) * px) }}>{h}</span>)}
          </div>
          {semaine.map((j) => (
            <div key={j.jour} className="relative border-l border-papier-ligne/70" style={{ height: (fin - debut) * px }}>
              {heures.map((h) => <span key={h} className="absolute inset-x-0 border-t border-dashed border-papier-ligne/70" style={{ top: (minutes(h) - debut) * px }} aria-hidden />)}
              {j.cours.map((c) => (
                <div key={c.debut} className={cn('absolute inset-x-1.5 overflow-hidden rounded-xl p-2.5 text-xs', c.classe === titulaire ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-900')} style={{ top: (minutes(c.debut) - debut) * px + 2, height: (minutes(c.fin) - minutes(c.debut)) * px - 4 }}>
                  <p className="font-bold">{c.classe}</p>
                  <p className="opacity-80">{c.debut}–{c.fin}</p>
                  <p className="opacity-80">{c.salle}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ===============================================================
 * Notifications
 * ============================================================= */
export function Notifications() {
  const { cle } = useEnseignant();
  const toutes = notificationsEnseignant.filter((n) => n.prof === cle || n.prof === 'tous');
  const [lues, setLues] = useState<number[]>(toutes.filter((n) => n.lu).map((n) => n.id));
  const [filtre, setFiltre] = useState<'toutes' | 'non_lues'>('toutes');
  const liste = toutes.filter((n) => filtre === 'toutes' || !lues.includes(n.id));
  const jours = [...new Set(liste.map((n) => n.jour))];
  const nonLues = toutes.filter((n) => !lues.includes(n.id)).length;
  const icones = { correction: [MessageSquareWarning, 'bg-stylo-50 text-stylo'], validation: [CheckCheck, 'bg-valide-50 text-valide'], renvoi: [RotateCcw, 'bg-orange-50 text-orange'], ecole: [Megaphone, 'bg-feutre-50 text-feutre-700'], rappel: [Clock, 'bg-brand-50 text-brand-700'] } as const;
  return (
    <>
      <Titre titre="Notifications" texte="Demandes de correction, validations et messages de l’établissement." action={nonLues > 0 ? <Button variant="secondary" icon={CheckCheck} onClick={() => setLues(toutes.map((n) => n.id))}>Tout marquer comme lu</Button> : undefined} />
      <div className="mb-5"><Segmented label="Filtrer" value={filtre} onChange={setFiltre} options={[{ value: 'toutes', label: 'Toutes' }, { value: 'non_lues', label: 'Non lues', count: nonLues }]} /></div>
      {liste.length === 0 ? <Bloc><p className="flex items-center gap-3 py-4 text-encre-doux"><BellRing className="size-5" aria-hidden />Vous avez tout lu.</p></Bloc> : jours.map((j) => (
        <section key={j} className="mb-6">
          <h2 className="mb-2.5 text-sm font-semibold text-encre-doux">{j}</h2>
          <ul className="flex flex-col gap-2.5">
            {liste.filter((n) => n.jour === j).map((n) => {
              const [Icone, teinte] = icones[n.type];
              const lu = lues.includes(n.id);
              return (
                <li key={n.id}>
                  <button onClick={() => setLues([...new Set([...lues, n.id])])} className={cn('flex w-full cursor-pointer gap-4 rounded-[20px] bg-white p-4 text-left shadow-feuille sm:p-5', !lu && 'ring-2 ring-brand-200')}>
                    <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', teinte)}><Icone className="size-5" aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><span className="font-semibold">{n.titre}</span>{!lu && <span className="size-2 rounded-full bg-brand-600" aria-label="Non lue" />}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-encre-doux">{n.texte}</span>
                      <span className="mt-1.5 block text-xs text-encre-pale">{n.quand}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}

/* ===============================================================
 * Paramètres
 * ============================================================= */
export function Parametres() {
  const { profil } = useEnseignant();
  const toast = useToast();
  const [prefs, setPrefs] = useState({ corrections: true, validations: true, rappels: true, sms: false });
  const options: { id: keyof typeof prefs; label: string; aide: string }[] = [
    { id: 'corrections', label: 'Demandes de correction', aide: 'Quand l’administration demande de corriger une note.' },
    { id: 'validations', label: 'Validation et renvoi des notes', aide: 'Quand vos notes sont validées ou renvoyées.' },
    { id: 'rappels', label: 'Rappels de fin de saisie', aide: 'Quelques jours avant la date limite.' },
    { id: 'sms', label: 'Recevoir aussi par SMS', aide: 'En plus de la notification dans l’espace.' },
  ];
  return (
    <>
      <Titre titre="Paramètres" texte="Vos coordonnées, votre mot de passe et vos notifications." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Bloc titre="Coordonnées">
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); toast('Coordonnées enregistrées.'); }}>
            <div><label htmlFor="e-tel" className="field-label">Téléphone</label><input id="e-tel" type="tel" defaultValue={profil.telephone} className="field-input" autoComplete="tel" /><p className="field-hint">Sert à vous connecter et à recevoir les codes par SMS.</p></div>
            <div><label htmlFor="e-mail" className="field-label">E-mail</label><input id="e-mail" type="email" defaultValue={profil.email} className="field-input" autoComplete="email" /></div>
            <Button type="submit" className="justify-self-start">Enregistrer</Button>
          </form>
        </Bloc>
        <div className="flex flex-col gap-6">
          <Bloc titre="Notifications">
            <ul className="flex flex-col gap-1">
              {options.map((o) => (
                <li key={o.id}>
                  <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-2">
                    <span><span className="block font-medium">{o.label}</span><span className="block text-[13px] text-encre-doux">{o.aide}</span></span>
                    <span className="relative inline-flex shrink-0">
                      <input type="checkbox" checked={prefs[o.id]} onChange={() => setPrefs({ ...prefs, [o.id]: !prefs[o.id] })} className="peer sr-only" />
                      <span className="h-7 w-12 rounded-full bg-papier-ligne transition-colors peer-checked:bg-brand-700 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2" />
                      <span className="absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </Bloc>
          <Bloc titre="Sécurité">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-3 text-[15px]"><KeyRound className="size-5 text-encre-doux" aria-hidden />Mot de passe modifié il y a 3 mois</p>
              <Link to="/mot-de-passe-oublie" className="inline-flex min-h-10 items-center rounded-xl bg-papier px-4 text-sm font-semibold text-brand-800 hover:bg-brand-50">Changer le mot de passe</Link>
            </div>
          </Bloc>
        </div>
      </div>
    </>
  );
}
