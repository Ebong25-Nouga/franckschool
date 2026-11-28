import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCheck,
  Clock,
  Download,
  Eye,
  FileBadge2,
  KeyRound,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Receipt,
  TimerReset,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Gauge, Grade, Modal, Pill, Segmented, useToast } from '@/components/kit';
import { ecole, fcfa, note } from '@/data/demo';
import { bulletins, calendrier, echeancier, emploiParClasse, enfants, moyenne, notesParEnfant, notificationsParent, paiements, parent, rangs, type Paiement, type TypeNotif } from '@/data/parent';
import { useEnfant } from './EspaceParent';
import { PaiementEnLigne } from './PaiementEnLigne';
import logoFranck from '@/assets/logo-franck.svg';

/* ---------------------------------------------------------------
 * Éléments communs
 * ------------------------------------------------------------- */
function Titre({ titre, texte, action }: { titre: string; texte?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[30px] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">{titre}</h1>
        {texte && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-encre-doux">{texte}</p>}
      </div>
      {action}
    </div>
  );
}

function Bloc({ titre, children, action, className }: { titre?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-[22px] bg-white p-5 shadow-feuille sm:p-6', className)}>
      {titre && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-[19px] font-bold tracking-[-0.015em]">{titre}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const iconeNotif: Record<TypeNotif, { icon: LucideIcon; teinte: string }> = {
  paiement: { icon: Wallet, teinte: 'bg-valide-50 text-valide' },
  note: { icon: BookOpen, teinte: 'bg-brand-50 text-brand-700' },
  bulletin: { icon: FileBadge2, teinte: 'bg-brand-50 text-brand-700' },
  absence: { icon: TimerReset, teinte: 'bg-orange-50 text-orange' },
  ecole: { icon: Megaphone, teinte: 'bg-feutre-50 text-feutre-700' },
};

/* ===============================================================
 * 1. Accueil
 * ============================================================= */
export function Accueil() {
  const { enfant } = useEnfant();
  const reste = enfant.du - enfant.paye;
  const prochaine = echeancier[enfant.id].find((t) => t.paye < t.montant);
  const lignes = notesParEnfant[enfant.id];
  const aujourdhui = emploiParClasse[enfant.id][0];
  const fil = notificationsParent.filter((n) => n.enfant === enfant.id || n.enfant === null).slice(0, 4);
  const nouvellesNotes = notificationsParent.some((n) => n.enfant === enfant.id && n.type === 'note' && !n.lu);

  return (
    <>
      <p className="text-sm font-medium text-encre-doux">Mardi 25 novembre 2026</p>
      <h1 className="mt-1 font-display text-[32px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-[40px]">Bonjour, Madame Mbarga.</h1>
      <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-encre-doux">
        Voici ce qu’il faut savoir pour <b className="text-encre">{enfant.prenom}</b>, en {enfant.classe}.
      </p>

      {/* Ce qu'il faut savoir : des phrases, pas des chiffres en tuiles */}
      <ul className="mt-8 flex flex-col gap-3">
        {reste > 0 && prochaine ? (
          <A_Savoir icon={CalendarClock} teinte="bg-stylo-50 text-stylo" to="/parent/paiements" action="Voir comment payer">
            Il reste <b className="text-encre chiffres">{fcfa(reste)}</b> à payer. La {prochaine.libelle} est due avant le <b className="text-encre">{prochaine.limite}</b>.
          </A_Savoir>
        ) : (
          <A_Savoir icon={Check} teinte="bg-valide-50 text-valide" to="/parent/recus" action="Voir les reçus">
            La scolarité de {enfant.prenom} est <b className="text-valide">entièrement réglée</b> pour cette année. Merci.
          </A_Savoir>
        )}
        {nouvellesNotes && (
          <A_Savoir icon={BookOpen} teinte="bg-brand-50 text-brand-700" to="/parent/notes" action="Voir les notes">
            De <b className="text-encre">nouvelles notes</b> de la séquence 2 sont disponibles.
          </A_Savoir>
        )}
        <A_Savoir icon={Megaphone} teinte="bg-feutre-50 text-feutre-700" to="/parent/notifications" action="Lire le message">
          <b className="text-encre">Réunion des parents</b> le samedi 6 décembre à 9 h, dans la grande salle.
        </A_Savoir>
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Bloc titre="Le carnet" action={<Link to="/parent/notifications" className="text-sm font-semibold text-brand-700 hover:underline">Tout voir</Link>}>
          <ol className="relative">
            {fil.map((n, i) => {
              const ic = iconeNotif[n.type];
              return (
                <li key={n.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < fil.length - 1 && <span className="absolute left-[19px] top-11 h-[calc(100%-36px)] w-px bg-papier-ligne" aria-hidden />}
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', ic.teinte)}><ic.icon className="size-[18px]" aria-hidden /></span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-semibold">{n.titre}</p>
                      <time className="text-xs text-encre-pale">{n.jour}, {n.quand}</time>
                    </div>
                    <p className="mt-0.5 text-[15px] leading-relaxed text-encre-doux">{n.texte}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Bloc>

        <div className="flex flex-col gap-6">
          <Bloc titre={`Aujourd’hui en ${enfant.classe}`}>
            <ul className="flex flex-col gap-2">
              {aujourdhui.cours.map((c) => (
                <li key={c.h} className="flex items-center gap-4 rounded-xl bg-papier px-4 py-3">
                  <span className="w-12 font-display font-bold text-brand-700 chiffres">{c.h}</span>
                  <span className="font-medium">{c.m}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-encre-doux">Emploi du temps du lundi, à titre d’exemple.</p>
          </Bloc>
          <Bloc>
            <p className="text-sm text-encre-doux">Moyenne de {enfant.prenom} à la séquence 1</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <Grade value={moyenne(lignes, 's1')} />
              <span className="text-sm text-encre-doux">Rang <b className="text-encre">{rangs[enfant.id].s1[0]}e</b> sur {rangs[enfant.id].s1[1]}</span>
            </div>
            <Link to="/parent/notes" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">Notes et bulletins <ArrowRight className="size-4" aria-hidden /></Link>
          </Bloc>
        </div>
      </div>
    </>
  );
}

function A_Savoir({ icon: Icon, teinte, children, to, action }: { icon: LucideIcon; teinte: string; children: ReactNode; to: string; action: string }) {
  return (
    <li className="flex flex-col gap-3 rounded-[20px] bg-white p-4 shadow-feuille sm:flex-row sm:items-center sm:p-5">
      <div className="flex flex-1 items-start gap-4">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', teinte)}><Icon className="size-5" aria-hidden /></span>
        <p className="pt-2 text-[16px] leading-relaxed text-encre-doux sm:pt-2.5">{children}</p>
      </div>
      <Link to={to} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-papier px-4 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 sm:ml-2">
        {action} <ArrowRight className="size-4" aria-hidden />
      </Link>
    </li>
  );
}

/* ===============================================================
 * 2. Mes enfants
 * ============================================================= */
export function MesEnfants() {
  const { enfant, choisir } = useEnfant();
  return (
    <>
      <Titre titre="Mes enfants" texte={`${enfants.length} enfants inscrits au ${ecole.nom}. Touchez un enfant pour afficher ses informations dans tout l’espace.`} />
      <div className="grid gap-5 md:grid-cols-2">
        {enfants.map((e) => {
          const actif = e.id === enfant.id;
          return (
            <article key={e.id} className={cn('overflow-hidden rounded-[24px] bg-white shadow-feuille', actif && 'ring-2 ring-brand-600')}>
              <div className="seyes relative flex items-center gap-4 bg-brand-950 p-6 text-white">
                <Avatar name={`${e.prenom} ${e.nom}`} size="xl" className="ring-4 ring-white/10" />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-[24px] font-bold tracking-[-0.02em]">{e.prenom} {e.nom}</h2>
                  <p className="text-brand-200">{e.classe} · {e.statut}</p>
                </div>
                {actif && <span className="absolute right-4 top-4 rounded-full bg-feutre px-2.5 py-1 text-xs font-bold text-encre">Affiché</span>}
              </div>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-4 p-6 text-[15px]">
                <div><dt className="text-[13px] text-encre-doux">Matricule</dt><dd className="mt-0.5 font-mono font-semibold">{e.matricule}</dd></div>
                <div><dt className="text-[13px] text-encre-doux">Né{e.sexe === 'F' ? 'e' : ''} le</dt><dd className="mt-0.5 font-semibold">{e.naissance}</dd></div>
                <div><dt className="text-[13px] text-encre-doux">Lieu de naissance</dt><dd className="mt-0.5 font-semibold">{e.lieu}</dd></div>
                <div><dt className="text-[13px] text-encre-doux">Votre lien</dt><dd className="mt-0.5 font-semibold">{e.lien}</dd></div>
                <div className="col-span-2"><dt className="text-[13px] text-encre-doux">Professeur principal</dt><dd className="mt-1 flex items-center gap-2.5 font-semibold"><Avatar name={e.pp.nom} size="sm" />{e.pp.nom}</dd></div>
                <div className="col-span-2">
                  <dt className="text-[13px] text-encre-doux">Scolarité payée</dt>
                  <dd className="mt-1.5"><Gauge value={(e.paye / e.du) * 100} label={`Scolarité de ${e.prenom}`} /></dd>
                </div>
              </dl>
              <div className="border-t border-papier-ligne/70 p-4">
                <Button variant={actif ? 'quiet' : 'primary'} className="w-full" onClick={() => choisir(e.id)} disabled={actif}>
                  {actif ? `${e.prenom} est affiché${e.sexe === 'F' ? 'e' : ''}` : `Afficher ${e.prenom}`}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-encre-doux">Un enfant manque ? Le secrétariat de l’établissement peut le rattacher à votre compte.</p>
    </>
  );
}

/* ===============================================================
 * 3. Informations scolaires
 * ============================================================= */
export function InformationsScolaires() {
  const { enfant } = useEnfant();
  const [vue, setVue] = useState<'classe' | 'emploi' | 'calendrier' | 'ecole'>('classe');
  const lignes = notesParEnfant[enfant.id];
  return (
    <>
      <Titre titre="Informations scolaires" texte={`La classe de ${enfant.prenom}, ses professeurs, son emploi du temps et les dates à retenir.`} />
      <div className="mb-5">
        <Segmented
          label="Rubrique"
          value={vue}
          onChange={setVue}
          options={[{ value: 'classe', label: 'Classe et professeurs' }, { value: 'emploi', label: 'Emploi du temps' }, { value: 'calendrier', label: 'Calendrier' }, { value: 'ecole', label: 'L’établissement' }]}
        />
      </div>

      {vue === 'classe' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Bloc titre={enfant.classe}>
            <dl className="flex flex-col gap-4 text-[15px]">
              <div className="flex items-center gap-3"><Avatar name={enfant.pp.nom} /><div><dt className="text-[13px] text-encre-doux">Professeur principal</dt><dd className="font-semibold">{enfant.pp.nom}, {enfant.pp.matiere}</dd></div></div>
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-papier-2 text-encre-doux"><MapPin className="size-4" aria-hidden /></span><div><dt className="text-[13px] text-encre-doux">Salle</dt><dd className="font-semibold">{enfant.salle}</dd></div></div>
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-papier-2 text-encre-doux"><CalendarDays className="size-4" aria-hidden /></span><div><dt className="text-[13px] text-encre-doux">Année scolaire</dt><dd className="font-semibold">{ecole.annee}, séquence 2 en cours</dd></div></div>
            </dl>
          </Bloc>
          <Bloc titre="Matières et professeurs">
            <ul className="divide-y divide-papier-ligne/70">
              {lignes.map((l) => (
                <li key={l.matiere} className="flex items-center gap-3 py-3">
                  <Avatar name={l.prof} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{l.matiere}</p>
                    <p className="truncate text-[13px] text-encre-doux">{l.prof}</p>
                  </div>
                  <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-800" title="Coefficient">coef. {l.coef}</span>
                </li>
              ))}
            </ul>
          </Bloc>
        </div>
      )}

      {vue === 'emploi' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {emploiParClasse[enfant.id].map((j) => (
            <Bloc key={j.jour} titre={j.jour}>
              <ul className="flex flex-col gap-2">
                {j.cours.map((c) => (
                  <li key={c.h} className="flex items-center gap-3 rounded-xl bg-papier px-3.5 py-2.5">
                    <Clock className="size-4 text-brand-600" aria-hidden />
                    <span className="w-12 font-semibold chiffres">{c.h}</span>
                    <span>{c.m}</span>
                  </li>
                ))}
              </ul>
            </Bloc>
          ))}
        </div>
      )}

      {vue === 'calendrier' && (
        <Bloc titre="Dates à retenir">
          <ol className="flex flex-col">
            {calendrier.map((c, i) => (
              <li key={c.titre} className="relative flex gap-5 pb-5 last:pb-0">
                {i < calendrier.length - 1 && <span className="absolute left-[7px] top-5 h-full w-[2px] bg-papier-2" aria-hidden />}
                <span className={cn('relative mt-1.5 size-4 shrink-0 rounded-full ring-4', i === 0 ? 'bg-brand-600 ring-brand-100' : 'bg-white ring-papier-2')} aria-hidden />
                <div>
                  <p className="font-display text-[15px] font-bold text-brand-700">{c.date}</p>
                  <p className="text-[16px]">{c.titre}</p>
                </div>
              </li>
            ))}
          </ol>
        </Bloc>
      )}

      {vue === 'ecole' && (
        <section className="seyes relative overflow-hidden rounded-[24px] bg-brand-950 p-7 text-white">
          <div className="flex items-center gap-4">
            <img src={logoFranck} alt="" className="size-14 rounded-2xl" />
            <div>
              <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em]">{ecole.nom}</h2>
              <p className="text-brand-200">{ecole.devise}</p>
            </div>
          </div>
          <ul className="mt-7 grid gap-4 text-[15px] sm:grid-cols-3">
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 text-brand-300" aria-hidden /><span>Quartier {ecole.quartier}<br />{ecole.ville}</span></li>
            <li className="flex items-start gap-3"><Phone className="mt-0.5 size-5 text-brand-300" aria-hidden /><span className="select-all">{ecole.telephone}</span></li>
            <li className="flex items-start gap-3"><Mail className="mt-0.5 size-5 text-brand-300" aria-hidden /><span className="select-all break-all">{ecole.email}</span></li>
          </ul>
          <p className="mt-6 text-sm text-brand-200">Secrétariat ouvert du lundi au vendredi, de 7 h 30 à 16 h, et le samedi de 8 h à 12 h.</p>
        </section>
      )}
    </>
  );
}

/* ===============================================================
 * 4. Notes et bulletins
 * ============================================================= */
export function NotesBulletins() {
  const { enfant } = useEnfant();
  const toast = useToast();
  const [seq, setSeq] = useState<'s1' | 's2'>('s2');
  const lignes = notesParEnfant[enfant.id];
  const moy = moyenne(lignes, seq);
  const enAttente = lignes.filter((l) => l[seq] === null).length;
  const liste = bulletins.filter((b) => b.enfant === enfant.id);
  const groupes: [1 | 2 | 3, string][] = [[1, '1er groupe'], [2, '2e groupe'], [3, '3e groupe']];

  return (
    <>
      <Titre titre="Notes et bulletins" texte={`Les notes de ${enfant.prenom} sont publiées après validation par l’établissement.`} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Bloc>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[19px] font-bold">1er trimestre</h2>
            <Segmented label="Séquence" value={seq} onChange={setSeq} options={[{ value: 's1', label: 'Séquence 1' }, { value: 's2', label: 'Séquence 2' }]} />
          </div>

          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-brand-50 px-5 py-4">
            <div>
              <p className="text-sm text-encre-doux">Moyenne {seq === 's2' && enAttente ? 'provisoire' : 'de la séquence'}</p>
              <p className="font-display text-[36px] font-extrabold leading-none tracking-[-0.03em] text-brand-800 chiffres">{note(moy)}<span className="text-base font-semibold text-encre-doux">/20</span></p>
            </div>
            {seq === 's1' ? (
              <p className="text-sm text-encre-doux">Rang <b className="text-encre">{rangs[enfant.id].s1[0]}e sur {rangs[enfant.id].s1[1]}</b><br />Moyenne de la classe {note(rangs[enfant.id].moyClasse)}</p>
            ) : (
              <p className="text-sm text-encre-doux">{enAttente ? `${enAttente} matière${enAttente > 1 ? 's' : ''} en attente de notes` : 'Toutes les notes sont publiées'}</p>
            )}
          </div>

          {groupes.map(([g, label]) => (
            <div key={g} className="mb-3 last:mb-0">
              <p className="mb-1 text-[13px] font-semibold text-encre-doux">{label}</p>
              <ul className="divide-y divide-papier-ligne/70">
                {lignes.filter((l) => l.groupe === g).map((l) => {
                  const v = l[seq];
                  return (
                    <li key={l.matiere} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{l.matiere} <span className="text-xs font-medium text-encre-pale">coef. {l.coef}</span></p>
                        <p className="truncate text-[13px] text-encre-doux">{l.prof}</p>
                      </div>
                      {v === null ? <Pill tone="neutre" dot={false}>À venir</Pill> : <Grade value={v} />}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Bloc>

        <Bloc titre="Bulletins">
          <ul className="flex flex-col gap-3">
            {liste.map((b) => (
              <li key={b.id} className="rounded-2xl bg-papier p-4">
                <div className="flex items-start gap-3">
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', b.etat === 'publie' ? 'bg-white text-brand-700' : 'bg-white text-encre-pale')}><FileBadge2 className="size-5" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{b.periode}, {b.annee}</p>
                    <p className="text-[13px] text-encre-doux">{b.date}</p>
                    {b.etat === 'publie' && <p className="mt-1 text-[13px]">Moyenne <b className="chiffres">{note(b.moyenne!)}</b> · rang <b>{b.rang}</b></p>}
                  </div>
                </div>
                {b.etat === 'publie' && (
                  <Button size="sm" variant="secondary" icon={Download} className="mt-3 w-full" onClick={() => toast(`Bulletin du ${b.periode} ${b.annee} téléchargé (PDF).`)}>
                    Télécharger le bulletin
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-encre-doux">Un bulletin publié ne change plus. En cas de correction, une nouvelle version est publiée et vous êtes prévenu.</p>
        </Bloc>
      </div>
    </>
  );
}

/* ===============================================================
 * 5. Paiements et historique
 * ============================================================= */
export function PaiementsHistorique() {
  const { enfant } = useEnfant();
  const [payer, setPayer] = useState(false);
  // Paiements faits en ligne pendant la visite (démonstration)
  const [enLigne, setEnLigne] = useState<Paiement[]>([]);
  const payeTotal = enfant.paye + enLigne.reduce((s, p) => s + p.montant, 0);
  const reste = enfant.du - payeTotal;

  // Répartit le total payé sur les tranches, dans l'ordre
  let disponible = payeTotal;
  const tranches = echeancier[enfant.id].map((t) => {
    const paye = Math.min(t.montant, disponible);
    disponible -= paye;
    return { ...t, paye };
  });
  const prochaine = tranches.find((t) => t.paye < t.montant);
  const historique = [...enLigne, ...paiements.filter((p) => p.enfant === enfant.id)];

  return (
    <>
      <Titre titre="Paiements et historique" texte={`Scolarité de ${enfant.prenom} en ${enfant.classe} : ${fcfa(enfant.du)} pour l’année.`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <section className={cn('relative overflow-hidden rounded-[24px] p-6 text-white shadow-leve sm:p-7', reste ? 'seyes bg-brand-950' : 'bg-valide')}>
          <p className="text-sm opacity-80">Reste à payer</p>
          <p className="mt-2 font-display text-[44px] font-extrabold leading-none tracking-[-0.04em] chiffres">{fcfa(reste).replace(' FCFA', '')}<span className="ml-2 text-lg font-semibold tracking-normal opacity-80">FCFA</span></p>
          <Gauge value={(payeTotal / enfant.du) * 100} label="Scolarité payée" className="mt-5 [&_span]:text-white" />
          {reste > 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-5 text-encre">
              <p className="font-display text-lg font-bold">Payer sans vous déplacer</p>
              <p className="mt-1 text-[14px] leading-relaxed text-encre-doux">Payez en ligne par MTN Mobile Money ou Orange Money. Vous confirmez sur votre téléphone et le reçu arrive tout de suite.</p>
              <div className="mt-4 flex items-center gap-2" aria-hidden>
                <span className="grid h-7 place-items-center rounded-md bg-[#FFCC00] px-2 text-[11px] font-black text-encre">MoMo</span>
                <span className="grid h-7 place-items-center rounded-md bg-[#FF7900] px-2 text-[11px] font-black text-white">Orange</span>
              </div>
              <Button size="lg" icon={Wallet} className="mt-4 w-full" onClick={() => setPayer(true)}>
                Payer maintenant{prochaine ? ` · ${fcfa(Math.min(prochaine.montant - prochaine.paye, reste))}` : ''}
              </Button>
              <p className="mt-3 text-center text-[13px] text-encre-doux">Vous pouvez aussi payer en espèces au secrétariat.</p>
            </div>
          ) : (
            <p className="mt-6 flex items-center gap-2 text-[15px]"><CheckCheck className="size-5" aria-hidden />Toutes les tranches sont réglées. Merci.</p>
          )}
        </section>

        <Bloc titre="Échéancier">
          <ol className="flex flex-col">
            {tranches.map((t, i) => {
              const ok = t.paye >= t.montant;
              const partiel = !ok && t.paye > 0;
              return (
                <li key={t.libelle} className="relative flex items-center gap-4 pb-5 last:pb-0">
                  {i < tranches.length - 1 && <span className={cn('absolute left-[13px] top-8 h-[calc(100%-20px)] w-[2px]', ok ? 'bg-valide' : 'bg-papier-2')} aria-hidden />}
                  <span className={cn('relative grid size-7 shrink-0 place-items-center rounded-full', ok ? 'bg-valide text-white' : 'bg-white ring-2 ring-stylo/40')}>
                    {ok ? <Check className="size-4" aria-hidden /> : <span className="size-2 rounded-full bg-stylo" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{t.libelle}</p>
                    <p className="text-[13px] text-encre-doux">{ok ? 'Payée' : partiel ? `${fcfa(t.paye)} payés, reste ${fcfa(t.montant - t.paye)}` : `À payer avant le ${t.limite}`}</p>
                  </div>
                  <span className={cn('font-display font-bold chiffres', !ok && 'text-stylo')}>{fcfa(t.montant)}</span>
                </li>
              );
            })}
          </ol>
        </Bloc>
      </div>

      <Bloc titre="Historique des paiements" className="mt-6">
        <ul className="divide-y divide-papier-ligne/70">
          {historique.map((p) => (
            <li key={p.recu} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5">
              <span className="grid size-10 place-items-center rounded-xl bg-valide-50 text-valide"><Wallet className="size-[18px]" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.libelle}</p>
                <p className="text-[13px] text-encre-doux">{p.date} · {p.mode}{p.caissier === 'Paiement en ligne' ? ' · en ligne' : ''}</p>
              </div>
              <span className="font-display font-bold text-valide chiffres">+ {fcfa(p.montant)}</span>
              <Link to="/parent/recus" className="w-full text-right text-[13px] font-semibold text-brand-700 hover:underline sm:w-auto">Reçu {p.recu}</Link>
            </li>
          ))}
        </ul>
      </Bloc>

      {payer && (
        <PaiementEnLigne
          enfant={enfant}
          reste={reste}
          prochaine={prochaine ? { libelle: prochaine.libelle, montant: prochaine.montant - prochaine.paye } : undefined}
          onClose={() => setPayer(false)}
          onPaye={(montant, operateur, recu) =>
            setEnLigne((l) => [
              { id: Date.now(), enfant: enfant.id, date: '25/11/2026', libelle: prochaine ? `Scolarité, ${prochaine.libelle}` : 'Scolarité', mode: operateur.startsWith('MTN') ? 'MTN MoMo' : 'Orange Money', montant, recu, caissier: 'Paiement en ligne' },
              ...l,
            ])
          }
        />
      )}
    </>
  );
}

/* ===============================================================
 * 6. Reçus
 * ============================================================= */
export function Recus() {
  const { enfant } = useEnfant();
  const toast = useToast();
  const [tous, setTous] = useState(false);
  const [vu, setVu] = useState<Paiement | null>(null);
  const liste = paiements.filter((p) => tous || p.enfant === enfant.id);
  const nomEnfant = (id: number) => enfants.find((e) => e.id === id)!;

  return (
    <>
      <Titre
        titre="Reçus"
        texte="Chaque paiement confirmé par l’école donne un reçu numéroté. Vous pouvez l’afficher ou le télécharger à tout moment."
        action={<Segmented label="Afficher" value={tous ? 'tous' : 'un'} onChange={(v) => setTous(v === 'tous')} options={[{ value: 'un', label: enfant.prenom }, { value: 'tous', label: 'Tous mes enfants' }]} />}
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {liste.map((p) => {
          const e = nomEnfant(p.enfant);
          return (
            <li key={p.id} className="relative overflow-hidden rounded-[22px] bg-white shadow-feuille">
              <div className="flex items-start justify-between gap-3 border-b border-dashed border-papier-ligne p-5">
                <div className="min-w-0">
                  <p className="font-mono text-[13px] font-semibold text-encre-doux">{p.recu}</p>
                  <p className="mt-1 font-semibold">{p.libelle}</p>
                  <p className="text-[13px] text-encre-doux">{e.prenom}, {e.classe}</p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-valide-50 text-valide"><Receipt className="size-5" aria-hidden /></span>
              </div>
              <div className="flex items-end justify-between gap-3 p-5">
                <div>
                  <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.03em] chiffres">{fcfa(p.montant)}</p>
                  <p className="mt-1.5 text-[13px] text-encre-doux">{p.date} · {p.mode}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" icon={Eye} onClick={() => setVu(p)} aria-label={`Afficher le reçu ${p.recu}`}>Voir</Button>
                  <Button size="sm" variant="secondary" icon={Download} onClick={() => toast(`Reçu ${p.recu} téléchargé (PDF).`)} aria-label={`Télécharger le reçu ${p.recu}`}>PDF</Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {vu && (
        <Modal title={`Reçu ${vu.recu}`} onClose={() => setVu(null)} width="max-w-md" footer={<><Button variant="secondary" onClick={() => setVu(null)}>Fermer</Button><Button icon={Download} onClick={() => toast(`Reçu ${vu.recu} téléchargé (PDF).`)}>Télécharger</Button></>}>
          <div className="rounded-2xl border border-papier-ligne p-5">
            <div className="flex items-center justify-between border-b-2 border-encre pb-3">
              <div>
                <p className="font-display font-bold">{ecole.nom}</p>
                <p className="text-xs text-encre-doux">{ecole.ville} · {ecole.telephone}</p>
              </div>
              <img src={logoFranck} alt="" className="size-9" />
            </div>
            <dl className="mt-3 divide-y divide-papier-ligne/70 text-sm">
              {[
                ['Élève', `${nomEnfant(vu.enfant).nom} ${nomEnfant(vu.enfant).prenom}`],
                ['Classe', nomEnfant(vu.enfant).classe],
                ['Matricule', nomEnfant(vu.enfant).matricule],
                ['Objet', vu.libelle],
                ['Date', vu.date],
                ['Mode', vu.mode],
                ...(vu.reference ? [['Référence', vu.reference]] : []),
                ['Encaissé par', vu.caissier],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2"><dt className="text-encre-doux">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-valide-50 px-4 py-3">
              <span className="font-semibold text-valide-700">Montant payé</span>
              <span className="font-display text-xl font-extrabold text-valide-700 chiffres">{fcfa(vu.montant)}</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ===============================================================
 * 7. Notifications
 * ============================================================= */
export function Notifications() {
  const [lues, setLues] = useState<number[]>(notificationsParent.filter((n) => n.lu).map((n) => n.id));
  const [filtre, setFiltre] = useState<'toutes' | 'non_lues'>('toutes');
  const liste = notificationsParent.filter((n) => filtre === 'toutes' || !lues.includes(n.id));
  const jours = [...new Set(liste.map((n) => n.jour))];
  const nonLues = notificationsParent.filter((n) => !lues.includes(n.id)).length;

  return (
    <>
      <Titre
        titre="Notifications"
        texte="Paiements, notes, retards et messages de l’établissement concernant vos enfants."
        action={nonLues > 0 ? <Button variant="secondary" icon={CheckCheck} onClick={() => setLues(notificationsParent.map((n) => n.id))}>Tout marquer comme lu</Button> : undefined}
      />
      <div className="mb-5">
        <Segmented label="Filtrer" value={filtre} onChange={setFiltre} options={[{ value: 'toutes', label: 'Toutes' }, { value: 'non_lues', label: 'Non lues', count: nonLues }]} />
      </div>
      {liste.length === 0 ? (
        <Bloc><p className="flex items-center gap-3 py-6 text-encre-doux"><BellRing className="size-5" aria-hidden />Vous avez tout lu. Les prochaines notifications apparaîtront ici.</p></Bloc>
      ) : (
        jours.map((j) => (
          <section key={j} className="mb-6">
            <h2 className="mb-2.5 text-sm font-semibold text-encre-doux">{j}</h2>
            <ul className="flex flex-col gap-2.5">
              {liste.filter((n) => n.jour === j).map((n) => {
                const ic = iconeNotif[n.type];
                const lu = lues.includes(n.id);
                const e = n.enfant ? enfants.find((x) => x.id === n.enfant) : null;
                return (
                  <li key={n.id}>
                    <button onClick={() => setLues([...new Set([...lues, n.id])])} className={cn('flex w-full cursor-pointer gap-4 rounded-[20px] p-4 text-left transition-colors sm:p-5', lu ? 'bg-white shadow-feuille' : 'bg-white shadow-feuille ring-2 ring-brand-200')}>
                      <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', ic.teinte)}><ic.icon className="size-5" aria-hidden /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="font-semibold text-encre">{n.titre}</span>
                          {e ? <Pill tone="neutre" dot={false}>{e.prenom}</Pill> : <Pill tone="feutre" dot={false}>Établissement</Pill>}
                          {!lu && <span className="size-2 rounded-full bg-brand-600" aria-label="Non lue" />}
                        </span>
                        <span className="mt-1 block text-[15px] leading-relaxed text-encre-doux">{n.texte}</span>
                        <span className="mt-1.5 block text-xs text-encre-pale">{n.quand}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

/* ===============================================================
 * 8. Paramètres du compte
 * ============================================================= */
export function ParametresCompte() {
  const toast = useToast();
  const [prefs, setPrefs] = useState({ paiements: true, notes: true, absences: true, ecole: true, sms: true });
  const options: { id: keyof typeof prefs; label: string; aide: string }[] = [
    { id: 'paiements', label: 'Paiements et rappels d’échéance', aide: 'Paiement reçu, tranche à venir.' },
    { id: 'notes', label: 'Notes et bulletins', aide: 'Nouvelles notes, bulletin disponible.' },
    { id: 'absences', label: 'Absences et retards', aide: 'Dès qu’ils sont signalés par l’école.' },
    { id: 'ecole', label: 'Messages de l’établissement', aide: 'Réunions, calendrier, informations.' },
    { id: 'sms', label: 'Recevoir aussi par SMS', aide: 'En plus de la notification dans l’espace.' },
  ];

  return (
    <>
      <Titre titre="Paramètres du compte" texte="Vos informations, votre mot de passe et ce que vous souhaitez recevoir." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Bloc titre="Mes informations">
          <div className="mb-5 flex items-center gap-4">
            <Avatar name={parent.nom} size="xl" />
            <div>
              <p className="font-display text-xl font-bold">{parent.nom}</p>
              <p className="text-sm text-encre-doux">Parent de {enfants.map((e) => e.prenom).join(' et ')}</p>
            </div>
          </div>
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); toast('Vos informations sont enregistrées.'); }}>
            <div><label htmlFor="p-tel" className="field-label">Téléphone</label><input id="p-tel" type="tel" defaultValue={parent.telephone} className="field-input" autoComplete="tel" /><p className="field-hint">Sert à vous connecter et à recevoir les codes par SMS.</p></div>
            <div><label htmlFor="p-mail" className="field-label">E-mail (facultatif)</label><input id="p-mail" type="email" defaultValue={parent.email} className="field-input" autoComplete="email" /></div>
            <div><label htmlFor="p-adr" className="field-label">Adresse</label><input id="p-adr" defaultValue={parent.adresse} className="field-input" autoComplete="street-address" /></div>
            <Button type="submit" className="justify-self-start">Enregistrer</Button>
          </form>
        </Bloc>

        <div className="flex flex-col gap-6">
          <Bloc titre="Notifications">
            <ul className="flex flex-col gap-2">
              {options.map((o) => (
                <li key={o.id}>
                  <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl px-1 py-2">
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
              <p className="flex items-center gap-3 text-[15px]"><KeyRound className="size-5 text-encre-doux" aria-hidden />Mot de passe modifié il y a 2 mois</p>
              <Link to="/mot-de-passe-oublie" className="inline-flex min-h-10 items-center rounded-xl bg-papier px-4 text-sm font-semibold text-brand-800 hover:bg-brand-50">Changer le mot de passe</Link>
            </div>
          </Bloc>
        </div>
      </div>
    </>
  );
}
