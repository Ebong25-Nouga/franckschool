import { CalendarCheck2, Check, CheckCircle2, ChevronDown, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Chiffre, Titre } from '@/components/espace';
import { Button, EmptyState, IconButton, Modal, Pill, SearchInput, Segmented, Table, Td, useToast } from '@/components/kit';
import { entete, html, imprimer } from '@/lib/imprimer';
import { cn } from '@/lib/utils';
import { BoutonsRetrait, Champ, ChoisirEleve, dateFr, Grille, Liste, ModalMotif, nomEleve, Note, Saisie } from './commun';
import { jours, plages, type Absence, type Creneau, type StatutAbsence } from './donnees';
import { aujourdhui, useSecretariat, visibles } from './store';

const tonAbsence: Record<StatutAbsence, 'stylo' | 'feutre' | 'valide'> = { non_justifiee: 'stylo', en_attente: 'feutre', justifiee: 'valide' };
const libAbsence: Record<StatutAbsence, string> = { non_justifiee: 'Non justifiée', en_attente: 'Justificatif à vérifier', justifiee: 'Justifiée' };

/* =========================================================
 * Absences et retards
 * ======================================================= */
export function Absences() {
  const { etat, modifier, retirer } = useSecretariat();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [nouvelle, setNouvelle] = useState(params.get('nouvelle') === '1');
  const [edition, setEdition] = useState<Absence | null>(null);
  const [justifier, setJustifier] = useState<Absence | null>(null);
  const [type, setType] = useState<'tous' | 'absence' | 'retard'>('tous');
  const [statut, setStatut] = useState('Tous');
  const [classe, setClasse] = useState('Toutes');
  const [q, setQ] = useState('');
  useEffect(() => {
    if (params.get('nouvelle')) setParams({}, { replace: true });
  }, [params, setParams]);

  const el = (id: number) => etat.eleves.find((e) => e.id === id);
  const toutes = visibles(etat.absences);
  const t = q.trim().toLowerCase();
  const liste = toutes
    .filter((a) => type === 'tous' || a.type === type)
    .filter((a) => statut === 'Tous' || libAbsence[a.statut] === statut)
    .filter((a) => classe === 'Toutes' || el(a.eleveId)?.classe === classe)
    .filter((a) => { const e = el(a.eleveId); return !t || (e && `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(t)); })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  const rapport = () =>
    imprimer('Rapport des absences', `${entete('Rapport des absences et retards')}
      <p>Filtre : ${html(classe === 'Toutes' ? 'toutes les classes' : classe)} · ${html(type === 'tous' ? 'absences et retards' : type + 's')} · ${html(statut)}</p>
      <table><tr><th>Date</th><th>Élève</th><th>Classe</th><th>Type</th><th>Créneau</th><th>Statut</th><th>Motif</th></tr>
      ${liste.map((a) => { const e = el(a.eleveId); return `<tr><td>${dateFr(a.date)}</td><td>${html(e ? nomEleve(e) : '')}</td><td>${html(e?.classe ?? '')}</td><td>${a.type === 'retard' ? 'Retard ' + html(a.duree ?? '') : 'Absence'}</td><td>${html(a.creneau)}</td><td>${libAbsence[a.statut]}</td><td>${html(a.motif ?? '')}</td></tr>`; }).join('')}
      </table><p class="gras">Total : ${liste.length} · non justifiées : ${liste.filter((a) => a.statut === 'non_justifiee').length}</p>`);

  return (
    <>
      <Titre titre="Absences et retards" texte="Enregistrez les absences et retards, justifiez-les et imprimez les rapports par classe ou par élève." action={<div className="flex flex-wrap gap-2"><Button variant="secondary" icon={Printer} onClick={rapport}>Rapport</Button><Button icon={Plus} onClick={() => setNouvelle(true)}>Signaler</Button></div>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Chiffre label="Aujourd’hui" valeur={String(toutes.filter((a) => a.date === aujourdhui()).length)} icone={CalendarCheck2} />
        <Chiffre label="Non justifiées" valeur={String(toutes.filter((a) => a.statut === 'non_justifiee').length)} icone={CalendarCheck2} ton="stylo" />
        <Chiffre label="Justificatifs à vérifier" valeur={String(toutes.filter((a) => a.statut === 'en_attente').length)} icone={CalendarCheck2} ton="feutre" />
      </div>
      <section className="rounded-[22px] bg-white shadow-feuille">
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <Segmented label="Type" value={type} onChange={setType} options={[{ value: 'tous', label: 'Tous' }, { value: 'absence', label: 'Absences' }, { value: 'retard', label: 'Retards' }]} />
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
            <SearchInput value={q} onChange={setQ} label="Rechercher un élève" placeholder="Nom ou matricule de l’élève" />
            <Liste aria-label="Classe" value={classe} onChange={(e) => setClasse(e.target.value)} options={['Toutes', ...visibles(etat.classes).map((c) => c.nom)]} />
            <Liste aria-label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)} options={['Tous', ...Object.values(libAbsence)]} />
          </div>
        </div>
        {liste.length === 0 ? <EmptyState icon={CalendarCheck2} title="Aucune absence" text="Rien ne correspond à ces critères." /> : (
          <Table caption="Absences et retards" head={['Date', 'Élève', 'Type', 'Créneau et matière', 'Statut', { label: 'Actions', sr: true }]} minWidth={900}>
            {liste.map((a) => {
              const e = el(a.eleveId);
              return (
                <tr key={a.id}>
                  <Td className="whitespace-nowrap chiffres">{dateFr(a.date)}</Td>
                  <Td><p className="font-semibold">{e && nomEleve(e)}</p><p className="text-xs text-encre-doux">{e?.classe}</p></Td>
                  <Td>{a.type === 'retard' ? <Pill tone="orange">Retard {a.duree}</Pill> : <Pill tone="encre">Absence</Pill>}</Td>
                  <Td><p>{a.creneau}</p><p className="text-xs text-encre-doux">{a.matiere}</p></Td>
                  <Td><Pill tone={tonAbsence[a.statut]}>{libAbsence[a.statut]}</Pill>{a.motif && <p className="mt-1 max-w-56 truncate text-xs text-encre-doux">{a.motif}</p>}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end">
                      {a.statut !== 'justifiee' && <Button size="sm" variant="quiet" icon={CheckCircle2} onClick={() => setJustifier(a)}>Justifier</Button>}
                      <IconButton icon={Pencil} label="Modifier" onClick={() => setEdition(a)} />
                      <BoutonsRetrait quoi="cette absence" onRetirer={(mode, motif) => (retirer('absences', a.id, mode, motif, { module: 'Absences', element: `${e && nomEleve(e)}, ${dateFr(a.date)}` }), toast('Fait. L’administrateur peut restaurer cette absence.'))} />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </section>
      {(nouvelle || edition) && <EditionAbsence a={edition} onClose={() => (setNouvelle(false), setEdition(null))} />}
      {justifier && (
        <ModalMotif
          titre="Justifier l’absence"
          texte="Indiquez le justificatif présenté (certificat médical, mot du parent…)."
          bouton="Justifier"
          rappel={false}
          onValider={(motif) => {
            const e = el(justifier.eleveId);
            modifier('absences', justifier.id, { statut: 'justifiee', motif }, { operation: 'Justification', module: 'Absences', element: `${e && nomEleve(e)}, ${dateFr(justifier.date)}`, avant: libAbsence[justifier.statut], apres: 'Justifiée', motif });
            toast('Absence justifiée.');
          }}
          onClose={() => setJustifier(null)}
        />
      )}
    </>
  );
}

function EditionAbsence({ a, onClose }: { a: Absence | null; onClose: () => void }) {
  const { etat, ajouter, modifier, utilisateur } = useSecretariat();
  const toast = useToast();
  const [f, setF] = useState({ eleveId: a?.eleveId ?? null as number | null, type: a?.type ?? 'absence', date: a?.date ?? aujourdhui(), creneau: a?.creneau ?? '07:30 – 12:00', matiere: a?.matiere ?? '', duree: a?.duree ?? '', statut: a?.statut ?? 'non_justifiee' as StatutAbsence, motif: a?.motif ?? '' });
  const [essai, setEssai] = useState(false);
  const futur = f.date > aujourdhui();
  const ok = f.eleveId && f.date && !futur && f.creneau.trim() && (f.type === 'absence' || f.duree.trim());
  const e = etat.eleves.find((x) => x.id === f.eleveId);
  const enregistrer = () => {
    setEssai(true);
    if (!ok || !e) return;
    const d = { eleveId: e.id, type: f.type as Absence['type'], date: f.date, creneau: f.creneau.trim(), matiere: f.matiere.trim() || '—', duree: f.type === 'retard' ? f.duree.trim() : undefined, statut: f.statut, motif: f.motif.trim() || undefined };
    if (a) {
      modifier('absences', a.id, d, { operation: 'Modification', module: 'Absences', element: `${nomEleve(e)}, ${dateFr(a.date)}`, avant: `${a.type}, ${a.creneau}, ${libAbsence[a.statut]}`, apres: `${d.type}, ${d.creneau}, ${libAbsence[d.statut]}` });
      toast('Absence modifiée.');
    } else {
      ajouter('absences', { ...d, auteur: utilisateur, etat: 'actif' }, { operation: 'Enregistrement', module: 'Absences', element: `${d.type === 'retard' ? 'Retard' : 'Absence'} de ${nomEleve(e)} (${e.classe}), ${dateFr(d.date)}` });
      toast(`${d.type === 'retard' ? 'Retard' : 'Absence'} enregistré(e). Le parent sera prévenu par le serveur.`);
    }
    onClose();
  };
  return (
    <Modal title={a ? 'Modifier' : 'Signaler une absence ou un retard'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={enregistrer}>Enregistrer</Button></>}>
      <div className="space-y-4">
        {a ? <p className="rounded-xl bg-papier px-4 py-3 text-sm font-semibold">{e && `${nomEleve(e)} · ${e.classe}`}</p> : <ChoisirEleve valeur={f.eleveId} onChange={(id) => setF({ ...f, eleveId: id })} />}
        {essai && !f.eleveId && <p className="text-[13px] font-medium text-stylo">Choisissez un élève.</p>}
        <Segmented label="Type" value={f.type} onChange={(v) => setF({ ...f, type: v })} options={[{ value: 'absence', label: 'Absence' }, { value: 'retard', label: 'Retard' }]} />
        <Grille>
          <Champ label="Date" erreur={futur && 'La date ne peut pas être dans le futur.'}><Saisie type="date" max={aujourdhui()} value={f.date} onChange={(x) => setF({ ...f, date: x.target.value })} /></Champ>
          <Champ label={f.type === 'retard' ? 'Heure d’arrivée' : 'Créneau'}><Saisie value={f.creneau} onChange={(x) => setF({ ...f, creneau: x.target.value })} placeholder={f.type === 'retard' ? '07:52' : '07:30 – 12:00 ou Journée'} /></Champ>
          {f.type === 'retard' && <Champ label="Durée du retard" erreur={essai && !f.duree.trim() && 'Indiquez la durée.'}><Saisie value={f.duree} onChange={(x) => setF({ ...f, duree: x.target.value })} placeholder="20 min" /></Champ>}
          <Champ label="Matière(s) manquée(s)"><Saisie value={f.matiere} onChange={(x) => setF({ ...f, matiere: x.target.value })} placeholder="Mathématiques, Anglais" /></Champ>
          <Champ label="Statut"><Liste value={f.statut} onChange={(x) => setF({ ...f, statut: x.target.value as StatutAbsence })} options={Object.entries(libAbsence).map(([value, label]) => ({ value, label }))} /></Champ>
          <Champ label="Motif ou justificatif"><Saisie value={f.motif} onChange={(x) => setF({ ...f, motif: x.target.value })} /></Champ>
        </Grille>
      </div>
    </Modal>
  );
}

/* =========================================================
 * Emplois du temps des classes
 * ======================================================= */
/** Nom court utilisé dans les créneaux (« M. ESSOMBA ») pour un enseignant. */
// eslint-disable-next-line react-refresh/only-export-components
export const cleProf = (e: { civilite: string; nom: string }) => `${e.civilite} ${e.nom}`;
const duProf = (c: Creneau, cle: string) => c.prof === cle || c.prof.startsWith(`${cle} `);
const HEURES_PLAGE = 2;

/** Liste déroulante avec une information à droite de chaque choix (classes ou enseignants). */
function Selecteur({ label, valeur, options, onChange }: { label: string; valeur: string; options: { value: string; label: string; info: string }[]; onChange: (v: string) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const zone = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ouvert) return;
    const fermer = (e: MouseEvent) => !zone.current?.contains(e.target as Node) && setOuvert(false);
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    document.addEventListener('mousedown', fermer);
    document.addEventListener('keydown', echap);
    return () => {
      document.removeEventListener('mousedown', fermer);
      document.removeEventListener('keydown', echap);
    };
  }, [ouvert]);
  const choisi = options.find((o) => o.value === valeur);
  return (
    <div ref={zone} className="relative w-full sm:w-[360px]">
      <span id="sel-edt" className="field-label">{label}</span>
      <button type="button" aria-haspopup="listbox" aria-expanded={ouvert} aria-labelledby="sel-edt" onClick={() => setOuvert(!ouvert)} className={cn('field-input flex cursor-pointer items-center justify-between gap-2 text-left font-semibold', ouvert && 'ring-2 ring-brand-700')}>
        <span className="truncate">{choisi?.label ?? '—'}</span>
        <ChevronDown className={cn('size-4 shrink-0 text-brand-700 transition-transform', ouvert && 'rotate-180')} aria-hidden />
      </button>
      {ouvert && (
        <ul role="listbox" aria-labelledby="sel-edt" className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-leve ring-1 ring-papier-ligne">
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === valeur}>
              <button type="button" onClick={() => (onChange(o.value), setOuvert(false))} className={cn('flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left text-[14.5px] hover:bg-papier', o.value === valeur && 'bg-brand-50 font-bold text-brand-900')}>
                <span className="flex min-w-0 items-center gap-1.5">{o.value === valeur && <Check className="size-4 shrink-0" aria-hidden />}<span className="truncate">{o.label}</span></span>
                <span className="shrink-0 text-[12.5px] font-normal text-encre-doux">{o.info}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Emplois du temps (décision 036).
 * Secrétaire avec l'accès « Création des emplois du temps » : crée la grille de chaque classe.
 * Administrateur (lectureSeule) : consulte et imprime, par classe ou par enseignant.
 * L'emploi du temps d'un enseignant est déduit automatiquement de celui des classes.
 */
export function EmploisDuTemps({ lectureSeule = false }: { lectureSeule?: boolean }) {
  const { etat, ajouter, enlever } = useSecretariat();
  const toast = useToast();
  const [params] = useSearchParams();
  const classes = visibles(etat.classes);
  const profs = visibles(etat.enseignants);
  const [vue, setVue] = useState<'classe' | 'prof'>(params.get('vue') === 'prof' ? 'prof' : 'classe');
  const [classe, setClasse] = useState(() => classes.find((c) => c.nom === 'Tle C')?.nom ?? classes[0]?.nom ?? '');
  const [prof, setProf] = useState(() => {
    const p = profs.find((e) => etat.creneaux.some((c) => duProf(c, cleProf(e)))) ?? profs[0];
    return p ? cleProf(p) : '';
  });
  const [ajout, setAjout] = useState<{ jour: Creneau['jour']; plage: Creneau['plage'] } | null>(null);
  const enseignant = profs.find((e) => cleProf(e) === prof);
  const nomProf = enseignant ? `${enseignant.civilite} ${enseignant.nom} ${enseignant.prenom}` : prof;
  const creneaux = vue === 'classe' ? etat.creneaux.filter((c) => c.classe === classe) : etat.creneaux.filter((c) => duProf(c, prof));
  const cellule = (jour: string, plage: string) => creneaux.find((c) => c.jour === jour && c.plage === plage);
  const modifiable = !lectureSeule && vue === 'classe';
  const titreGrille = vue === 'classe' ? `Emploi du temps de la ${classe}` : `Emploi du temps de ${nomProf}`;
  const ligne1 = (c: Creneau) => (vue === 'classe' ? c.matiere : c.classe);
  const ligne2 = (c: Creneau) => (vue === 'classe' ? c.prof : c.matiere);

  const chiffres: [string, string | number][] =
    vue === 'classe'
      ? [['Heures par semaine', `${creneaux.length * HEURES_PLAGE} h`], ['Matières', new Set(creneaux.map((c) => c.matiere)).size], ['Professeur principal', classes.find((c) => c.nom === classe)?.pp ?? '—']]
      : [['Heures par semaine', `${creneaux.length * HEURES_PLAGE} h`], ['Classes', [...new Set(creneaux.map((c) => c.classe))].join(', ') || '—'], ['Cours par semaine', creneaux.length]];

  const imprimerGrille = () =>
    imprimer(titreGrille, `${entete(titreGrille)}
      <p>${chiffres.map(([k, v]) => `${html(k)} : <b>${html(v)}</b>`).join(' · ')}</p>
      <table><tr><th>Horaire</th>${jours.map((j) => `<th>${j}</th>`).join('')}</tr>
      ${plages.map((p) => `<tr><th>${p}</th>${jours.map((j) => { const c = cellule(j, p); return `<td>${c ? `<b>${html(ligne1(c))}</b><br/>${html(ligne2(c))}<br/><small>${html(c.salle)}</small>` : ''}</td>`; }).join('')}</tr>`).join('')}
      </table>`);

  const retirerCreneau = (c: Creneau) => {
    // Un créneau d'emploi du temps n'est pas une donnée historique : on le retire, la trace reste au journal
    enlever('creneaux', c.id, { operation: 'Retrait de créneau', module: 'Emplois du temps', element: `${c.classe}, ${c.jour} ${c.plage}`, avant: `${c.matiere}, ${c.prof}, ${c.salle}` });
    toast('Créneau retiré.');
  };

  const optionsClasses = classes.map((c) => {
    const n = etat.creneaux.filter((x) => x.classe === c.nom).length;
    return { value: c.nom, label: c.nom, info: n ? `${n} cours` : 'pas encore créé' };
  });
  const optionsProfs = profs.map((e) => {
    const n = etat.creneaux.filter((x) => duProf(x, cleProf(e))).length;
    return { value: cleProf(e), label: `${e.civilite} ${e.nom} ${e.prenom}`, info: n ? `${n * HEURES_PLAGE} h / semaine` : 'aucun cours' };
  });

  return (
    <>
      <Titre
        titre="Emplois du temps"
        texte={lectureSeule ? 'Consultez l’emploi du temps de chaque classe et de chaque enseignant. Ils sont créés par les secrétaires qui ont l’accès.' : 'Construisez l’emploi du temps de chaque classe. Celui de chaque enseignant se remplit tout seul. Les conflits d’enseignant et de salle sont détectés automatiquement.'}
      />
      {lectureSeule && (
        <div className="mb-5">
          <Note><b>Consultation seule.</b> Pour créer ou modifier, donnez l’accès « Création des emplois du temps » à une secrétaire dans <Link to="/direction/secretaires" className="font-semibold underline">Secrétaires</Link>.</Note>
        </div>
      )}
      <section className="mb-5 flex flex-col gap-5 rounded-[22px] bg-white p-5 shadow-feuille sm:flex-row sm:items-end sm:p-6">
        <div>
          <p className="field-label">1. Voir</p>
          <Segmented label="Voir" value={vue} onChange={setVue} options={[{ value: 'classe', label: 'Par classe' }, { value: 'prof', label: 'Par enseignant' }]} />
        </div>
        {vue === 'classe' ? (
          <Selecteur key="classe" label="2. Choisir une classe" valeur={classe} options={optionsClasses} onChange={setClasse} />
        ) : (
          <Selecteur key="prof" label="2. Choisir un enseignant" valeur={prof} options={optionsProfs} onChange={setProf} />
        )}
      </section>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[21px] font-bold">{titreGrille}</h2>
        <Button variant="secondary" icon={Printer} onClick={imprimerGrille} disabled={!creneaux.length}>Imprimer</Button>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {chiffres.map(([k, v]) => (
          <div key={k} className="min-w-0 rounded-2xl bg-white px-5 py-4 shadow-feuille">
            <p className="text-[13px] text-encre-doux">{k}</p>
            <p className="truncate font-display text-[22px] font-extrabold">{v}</p>
          </div>
        ))}
      </div>

      <section className="overflow-x-auto rounded-[22px] bg-white p-4 shadow-feuille sm:p-5">
        <div className="grid min-w-[820px] grid-cols-[110px_repeat(5,1fr)] gap-2">
          <span />
          {jours.map((j) => <p key={j} className="px-2 py-1 text-center text-sm font-bold">{j}</p>)}
          {plages.map((p) => (
            <div key={p} className="contents">
              <p className="flex items-center px-2 text-[13px] font-semibold text-encre-doux chiffres">{p}</p>
              {jours.map((j) => {
                const c = cellule(j, p);
                if (c)
                  return (
                    <div key={j} className="group relative min-h-24 rounded-xl bg-brand-50 p-3 shadow-[inset_3px_0_0] shadow-brand-700 ring-1 ring-inset ring-brand-100">
                      <p className="pr-6 text-[14px] font-bold leading-snug text-brand-900">{ligne1(c)}</p>
                      <p className="mt-1 text-xs text-brand-800">{ligne2(c)}</p>
                      <p className="text-xs text-encre-doux">{c.salle}</p>
                      {modifiable && <button onClick={() => retirerCreneau(c)} className="absolute right-1.5 top-1.5 grid size-8 cursor-pointer place-items-center rounded-lg text-encre-pale opacity-0 transition-opacity hover:bg-white hover:text-stylo focus:opacity-100 group-hover:opacity-100" aria-label={`Retirer ${c.matiere}, ${j} ${p}`}><Trash2 className="size-4" /></button>}
                    </div>
                  );
                return modifiable ? (
                  <button key={j} onClick={() => setAjout({ jour: j, plage: p })} className="grid min-h-24 cursor-pointer place-items-center rounded-xl border border-dashed border-papier-ligne text-encre-pale transition-colors hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700" aria-label={`Ajouter un cours le ${j}, ${p}`}>
                    <Plus className="size-5" />
                  </button>
                ) : (
                  <div key={j} className="grid min-h-24 place-items-center rounded-xl bg-[repeating-linear-gradient(135deg,var(--color-papier)_0_8px,white_8px_16px)] text-xs text-encre-pale ring-1 ring-inset ring-papier-ligne/60">Libre</div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      {creneaux.length === 0 && (
        <div className="mt-4">
          <Note>{vue === 'classe' ? `La ${classe} n’a pas encore d’emploi du temps.${modifiable ? ' Cliquez sur une case pour ajouter un cours.' : ''}` : `${nomProf} n’a encore aucun cours dans les emplois du temps des classes.`}</Note>
        </div>
      )}
      {!lectureSeule && vue === 'prof' && creneaux.length > 0 && <p className="mt-3 text-[13px] text-encre-doux">Cette vue se remplit toute seule à partir des emplois du temps des classes. Pour changer un cours, passez par « Par classe ».</p>}
      {ajout && (
        <AjoutCreneau
          classe={classe}
          {...ajout}
          onClose={() => setAjout(null)}
          onAjout={(c) => {
            ajouter('creneaux', c, { operation: 'Ajout de créneau', module: 'Emplois du temps', element: `${c.classe}, ${c.jour} ${c.plage}`, apres: `${c.matiere}, ${c.prof}, ${c.salle}` });
            toast('Cours ajouté à l’emploi du temps.');
          }}
        />
      )}
    </>
  );
}

function AjoutCreneau({ classe, jour, plage, onClose, onAjout }: { classe: string; jour: Creneau['jour']; plage: Creneau['plage']; onClose: () => void; onAjout: (c: Omit<Creneau, 'id'>) => void }) {
  const { etat } = useSecretariat();
  const matieres = visibles(etat.matieres).filter((m) => m.classe === classe);
  const [matiere, setMatiere] = useState(matieres[0]?.nom ?? '');
  const m = matieres.find((x) => x.nom === matiere);
  const [salle, setSalle] = useState(visibles(etat.classes).find((c) => c.nom === classe)?.salle ?? '');
  const prof = m?.prof ?? '';
  const conflitProf = prof && etat.creneaux.find((c) => c.jour === jour && c.plage === plage && c.prof === prof);
  const conflitSalle = salle && etat.creneaux.find((c) => c.jour === jour && c.plage === plage && c.salle === salle && c.classe !== classe);
  const ok = m && prof && !conflitProf && !conflitSalle;
  return (
    <Modal title="Ajouter un cours" lead={`${classe} · ${jour}, ${plage}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button disabled={!ok} onClick={() => (onAjout({ classe, jour, plage, matiere, prof, salle: salle.trim() || '—' }), onClose())}>Ajouter</Button></>}>
      {matieres.length === 0 ? <Note ton="feutre">Cette classe n’a pas de matière. Ajoutez d’abord ses matières.</Note> : (
        <div className="space-y-4">
          <Champ label="Matière"><Liste value={matiere} onChange={(e) => setMatiere(e.target.value)} options={matieres.map((x) => x.nom)} /></Champ>
          <Champ label="Enseignant" aide="L’enseignant de la matière dans cette classe."><Saisie value={prof || 'À attribuer dans « Matières »'} readOnly className="bg-papier" /></Champ>
          <Champ label="Salle"><Saisie value={salle} onChange={(e) => setSalle(e.target.value)} /></Champ>
          {conflitProf && <Note ton="feutre">Conflit : {prof} a déjà cours en {conflitProf.classe} à ce moment ({conflitProf.matiere}).</Note>}
          {conflitSalle && <Note ton="feutre">Conflit : la {salle} est occupée par la {conflitSalle.classe} à ce moment.</Note>}
          {!prof && <Note ton="feutre">Attribuez d’abord un enseignant à cette matière.</Note>}
        </div>
      )}
    </Modal>
  );
}

