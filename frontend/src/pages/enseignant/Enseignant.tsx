import clsx from 'clsx';
import { AlertCircle, ArrowRight, Check, CheckCheck, Clock, MapPin, Send, Star } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Grade, PageHeader, Panel, PanelHead, Pill, Segmented, SequenceRail, Table, Td, useToast } from '../../components/kit';
import { appreciation, eleves, emploiDuTemps, note } from '../../data/demo';

const mesClasses = [
  { classe: '3ème A', matiere: 'Mathématiques', effectif: 42, moyenne: 11.84, etat: 'soumise' as const, evals: 2, principal: false },
  { classe: 'Tle C', matiere: 'Mathématiques', effectif: 35, moyenne: 10.37, etat: 'brouillon' as const, evals: 1, principal: true },
];

/* =========================================================
 * Ma journée
 * ======================================================= */
export function TableauEnseignant() {
  const aujourdhui = emploiDuTemps[0].creneaux;
  return (
    <>
      <PageHeader kicker="Lundi 24 novembre 2026" title="Bonjour, Monsieur Essomba" lead="Il vous reste une évaluation à compléter avant le 5 décembre." actions={<Link to="/enseignant/notes" className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-700 px-4 text-sm font-semibold text-white shadow-encre hover:bg-brand-800">Saisir des notes <ArrowRight className="size-4" aria-hidden /></Link>} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <section className="seyes relative overflow-hidden rounded-[22px] bg-brand-950 p-6 text-white shadow-leve sm:p-7">
          <p className="text-sm font-medium text-brand-200">Aujourd’hui</p>
          <ol className="mt-4 space-y-3">
            {aujourdhui.map((c, i) => (
              <li key={c.debut} className={clsx('flex gap-4 rounded-2xl p-4', i === 0 ? 'bg-white text-encre' : 'bg-white/[0.07] ring-1 ring-inset ring-white/10')}>
                <div className="w-14 shrink-0 text-center">
                  <p className="font-display text-lg font-bold leading-none chiffres">{c.debut}</p>
                  <p className={clsx('mt-1 text-xs chiffres', i === 0 ? 'text-encre-doux' : 'text-brand-300')}>{c.fin}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.m}, {c.c}</p>
                  <p className={clsx('mt-0.5 flex items-center gap-1 text-sm', i === 0 ? 'text-encre-doux' : 'text-brand-200')}><MapPin className="size-3.5" aria-hidden />{c.s}</p>
                </div>
                {i === 0 && <Pill tone="valide">En cours</Pill>}
              </li>
            ))}
          </ol>
          <div className="mt-6 border-t border-white/10 pt-5"><SequenceRail dark compact /></div>
          <p className="mt-2 text-xs text-brand-300">Séquence 2, saisie ouverte jusqu’au 5 décembre</p>
        </section>

        <div className="space-y-6">
          {mesClasses.map((c) => (
            <Panel key={c.classe} as="article" className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-[-0.02em]">{c.classe}{c.principal && <span className="flex items-center gap-1 rounded-md bg-feutre px-2 py-0.5 font-sans text-xs font-bold text-encre"><Star className="size-3" aria-hidden />Prof. principal</span>}</h2>
                  <p className="text-sm text-encre-doux">{c.matiere}, {c.effectif} élèves</p>
                </div>
                {c.etat === 'soumise' ? <Pill tone="feutre">Notes en validation</Pill> : <Pill tone="stylo">1 évaluation à finir</Pill>}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-papier p-3"><p className="text-xs text-encre-doux">Moyenne séq. 1</p><p className="mt-1"><Grade value={c.moyenne} /></p></div>
                <div className="rounded-xl bg-papier p-3"><p className="text-xs text-encre-doux">Évaluations</p><p className="mt-1 font-display text-[15px] font-bold">{c.evals}</p></div>
                <div className="rounded-xl bg-papier p-3"><p className="text-xs text-encre-doux">Réussite</p><p className="mt-1 font-display text-[15px] font-bold">{c.moyenne > 11 ? '64 %' : '51 %'}</p></div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link to="/enseignant/notes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">{c.etat === 'brouillon' ? 'Finir la saisie' : 'Voir les notes'} <ArrowRight className="size-4" aria-hidden /></Link>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </>
  );
}

/* =========================================================
 * Saisie des notes : une grille rapide au clavier
 * ======================================================= */
const valeursInit = [12, 14.5, 9, 16, 11.25, 8.5, 13, 17.75, '', '', 10.5, 'ABS', '', 6, 15.5, 12.75];

export function SaisieNotes() {
  const toast = useToast();
  const [classe, setClasse] = useState<'3ème A' | 'Tle C'>('Tle C');
  const liste = useMemo(() => (classe === '3ème A' ? eleves.slice(0, 16) : eleves.slice(16, 32)), [classe]);
  const [notes, setNotes] = useState<Record<number, string>>(() => Object.fromEntries(eleves.slice(0, 32).map((e, i) => [e.id, String(valeursInit[i % 16]).replace('.', ',')])));
  const [soumis, setSoumis] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const lire = (v: string) => (v && v.toUpperCase() !== 'ABS' ? Number(v.replace(',', '.')) : null);
  const erreur = (v: string) => {
    if (!v || v.toUpperCase() === 'ABS') return '';
    const n = lire(v)!;
    return Number.isNaN(n) || n < 0 || n > 20 ? 'Entre 0 et 20' : '';
  };
  const vals = liste.map((e) => notes[e.id] ?? '');
  const nums = vals.filter((v) => !erreur(v)).map(lire).filter((n): n is number => n !== null);
  const moy = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  const manquantes = vals.filter((v) => !v).length;
  const invalides = vals.filter((v) => erreur(v)).length;
  const tranches = [0, 5, 10, 15].map((min) => nums.filter((n) => n >= min && (min === 15 ? n <= 20 : n < min + 5)).length);
  const maxT = Math.max(...tranches, 1);

  return (
    <>
      <PageHeader title="Saisie des notes" lead="Mathématiques, séquence 2. Tapez la note puis Entrée pour passer à l’élève suivant." />

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Panel>
          <div className="flex flex-wrap items-center gap-3 p-5">
            <Segmented label="Classe" value={classe} onChange={setClasse} options={[{ value: 'Tle C', label: 'Tle C' }, { value: '3ème A', label: '3ème A' }]} />
            <select aria-label="Évaluation" className="field-input min-h-10 w-auto py-0 text-sm font-semibold">
              <option>Composition de séquence, sur 20</option>
              <option>Devoir surveillé n° 1, sur 20</option>
            </select>
            <span className="ml-auto flex items-center gap-1.5 text-[13px] font-medium text-valide"><CheckCheck className="size-4" aria-hidden />Brouillon enregistré</span>
          </div>

          <div className="seyes-clair border-t border-papier-ligne/70">
            <ul>
              {liste.map((e, i) => {
                const v = notes[e.id] ?? '';
                const err = erreur(v);
                const n = lire(v);
                return (
                  <li key={e.id} className="grid grid-cols-[2.25rem_1fr_6.5rem] items-center gap-3 border-b border-papier-ligne/50 py-2 pl-4 pr-5 sm:grid-cols-[2.25rem_1fr_7rem_7rem] sm:pl-6">
                    <span className="text-right text-xs font-semibold text-encre-pale chiffres">{i + 1}</span>
                    <label htmlFor={`n-${e.id}`} className="min-w-0 cursor-pointer truncate pl-6 text-[15px] font-medium">{e.nom} <span className="text-encre-doux">{e.prenom}</span></label>
                    <div>
                      <input
                        ref={(el) => { refs.current[i] = el; }}
                        id={`n-${e.id}`}
                        inputMode="decimal"
                        autoComplete="off"
                        disabled={soumis}
                        value={v}
                        onChange={(ev) => setNotes({ ...notes, [e.id]: ev.target.value })}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === 'ArrowDown') { ev.preventDefault(); refs.current[i + 1]?.focus(); refs.current[i + 1]?.select(); }
                          if (ev.key === 'ArrowUp') { ev.preventDefault(); refs.current[i - 1]?.focus(); refs.current[i - 1]?.select(); }
                        }}
                        aria-invalid={!!err}
                        aria-describedby={err ? `err-${e.id}` : undefined}
                        placeholder="—"
                        className={clsx(
                          'h-10 w-full rounded-lg border bg-white text-center font-display text-[17px] font-bold chiffres transition-colors focus:outline-none focus:ring-4 disabled:bg-papier',
                          err ? 'border-stylo text-stylo focus:ring-stylo/15' : n !== null && n < 10 ? 'border-papier-ligne text-stylo focus:border-brand-600 focus:ring-brand-600/[0.12]' : 'border-papier-ligne text-encre focus:border-brand-600 focus:ring-brand-600/[0.12]',
                        )}
                      />
                      {err && <p id={`err-${e.id}`} className="mt-0.5 text-center text-[11px] font-semibold text-stylo">{err}</p>}
                    </div>
                    <span className="hidden text-[13px] text-encre-doux sm:block">{v.toUpperCase() === 'ABS' ? 'Absent' : n !== null && !err ? appreciation(n) : ''}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="px-6 py-3 text-[13px] text-encre-doux">Tapez <kbd className="rounded border border-papier-ligne bg-papier px-1 font-semibold">ABS</kbd> pour un élève absent. La virgule et le point sont acceptés.</p>
        </Panel>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Panel className="p-5">
            <p className="text-[13px] font-medium text-encre-doux">Moyenne de la classe</p>
            <p className={clsx('mt-1 font-display text-[40px] font-extrabold leading-none tracking-[-0.04em] chiffres', moy < 10 ? 'text-stylo' : 'text-encre')}>{note(moy)}</p>
            <div className="mt-5 flex h-20 items-end gap-2" role="img" aria-label={`Répartition : ${tranches[0]} notes de 0 à 5, ${tranches[1]} de 5 à 10, ${tranches[2]} de 10 à 15, ${tranches[3]} de 15 à 20`}>
              {tranches.map((t, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[11px] font-bold chiffres">{t}</span>
                  <div className={clsx('w-full rounded-t-md', i < 2 ? 'bg-stylo/80' : 'bg-brand-600')} style={{ height: `${(t / maxT) * 52 + 4}px` }} />
                </div>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-4 text-center text-[10px] text-encre-pale chiffres"><span>0–5</span><span>5–10</span><span>10–15</span><span>15–20</span></div>
          </Panel>
          <Panel className="space-y-2.5 p-5 text-sm">
            <p className="flex justify-between"><span className="text-encre-doux">Notes saisies</span><b className="chiffres">{liste.length - manquantes}/{liste.length}</b></p>
            <p className="flex justify-between"><span className="text-encre-doux">Sous la moyenne</span><b className="text-stylo chiffres">{nums.filter((n) => n < 10).length}</b></p>
            <p className="flex justify-between"><span className="text-encre-doux">Absents</span><b className="chiffres">{vals.filter((v) => v.toUpperCase() === 'ABS').length}</b></p>
          </Panel>
          {soumis ? (
            <p className="flex items-center gap-2 rounded-xl bg-valide-50 p-4 text-sm font-semibold text-valide-700"><Check className="size-4" aria-hidden />Notes soumises. L’administration va les vérifier.</p>
          ) : (
            <>
              {(manquantes > 0 || invalides > 0) && (
                <p className="flex gap-2 rounded-xl bg-feutre-50 p-3.5 text-[13px] text-encre"><AlertCircle className="mt-0.5 size-4 shrink-0 text-feutre-700" aria-hidden />{invalides ? `${invalides} note(s) à corriger. ` : ''}{manquantes ? `${manquantes} élève(s) sans note.` : ''}</p>
              )}
              <Button size="lg" icon={Send} className="w-full" disabled={manquantes > 0 || invalides > 0} onClick={() => { setSoumis(true); toast(`Notes de Mathématiques, ${classe} soumises pour validation.`); }}>
                Soumettre les notes
              </Button>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

/* =========================================================
 * Mes classes
 * ======================================================= */
export function MesClasses() {
  const [classe, setClasse] = useState<'3ème A' | 'Tle C'>('Tle C');
  const liste = (classe === '3ème A' ? eleves.slice(0, 16) : eleves.slice(16, 32)).slice().sort((a, b) => b.moyenne - a.moyenne);
  return (
    <>
      <PageHeader title="Mes classes" lead="Classement de la séquence 1 en mathématiques." actions={<Segmented label="Classe" value={classe} onChange={setClasse} options={[{ value: 'Tle C', label: 'Tle C' }, { value: '3ème A', label: '3ème A' }]} />} />
      <Panel>
        <PanelHead title={`${classe}, ${liste.length} élèves`} hint={classe === 'Tle C' ? 'Vous êtes professeur principal de cette classe.' : undefined} />
        <Table caption={`Élèves de la ${classe}`} head={[{ label: 'Rang', align: 'center' }, 'Élève', { label: 'Moyenne', align: 'right' }, 'Appréciation', { label: 'Absences', align: 'right' }]} minWidth={560}>
          {liste.map((e, i) => (
            <tr key={e.id}>
              <Td className="text-center font-display font-bold chiffres">{i + 1}</Td>
              <Td><span className="flex items-center gap-3"><Avatar name={`${e.nom} ${e.prenom}`} size="sm" /><span className="font-semibold">{e.nom} {e.prenom}</span></span></Td>
              <Td className="text-right"><Grade value={e.moyenne} /></Td>
              <Td className="text-encre-doux">{appreciation(e.moyenne)}</Td>
              <Td className="text-right chiffres">{e.absences} h</Td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}

/* =========================================================
 * Emploi du temps (semaine)
 * ======================================================= */
const heures = ['07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30'];
const minutes = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

export function EmploiDuTemps() {
  const debut = minutes('07:30');
  const fin = minutes('15:30');
  const px = 64 / 60;
  return (
    <>
      <PageHeader title="Emploi du temps" lead="Semaine du 24 au 28 novembre 2026" />
      <Panel className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-[4rem_repeat(5,1fr)] pb-4">
          <div />
          {emploiDuTemps.map((j, i) => (
            <div key={j.jour} className={clsx('border-b border-l border-papier-ligne/70 px-3 py-3 text-sm font-semibold', i === 0 && 'bg-brand-50 text-brand-800')}>{j.jour}{i === 0 && <span className="ml-1.5 text-xs font-medium">aujourd’hui</span>}</div>
          ))}
          <div className="relative" style={{ height: (fin - debut) * px }}>
            {heures.map((h) => <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] font-semibold text-encre-pale chiffres" style={{ top: Math.max(8, (minutes(h) - debut) * px) }}>{h}</span>)}
          </div>
          {emploiDuTemps.map((j) => (
            <div key={j.jour} className="relative border-l border-papier-ligne/70" style={{ height: (fin - debut) * px }}>
              {heures.map((h) => <span key={h} className="absolute inset-x-0 border-t border-dashed border-papier-ligne/70" style={{ top: (minutes(h) - debut) * px }} aria-hidden />)}
              {j.creneaux.map((c) => (
                <div key={c.debut} className={clsx('absolute inset-x-1.5 overflow-hidden rounded-xl p-2.5 text-xs', c.c === 'Tle C' ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-900')} style={{ top: (minutes(c.debut) - debut) * px + 2, height: (minutes(c.fin) - minutes(c.debut)) * px - 4 }}>
                  <p className="font-bold">{c.c}</p>
                  <p className="truncate opacity-90">{c.m}</p>
                  <p className="mt-0.5 flex items-center gap-1 opacity-75"><Clock className="size-3" aria-hidden />{c.debut}–{c.fin} · {c.s}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
