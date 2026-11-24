import { AlertCircle, CalendarDays, CheckCircle2, ClipboardList, Clock, Layers, Save, Send, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardHeader, PageHeader, Select, StatCard } from '../../components/ui';
import { eleves, emploiDuTemps } from '../../data/demo';

const mesClasses = [
  { classe: '3ème A', matiere: 'Mathématiques', effectif: 42, etat: 'soumise' },
  { classe: 'Tle C', matiere: 'Mathématiques', effectif: 35, etat: 'brouillon' },
];

export function TableauEnseignant() {
  return (
    <>
      <PageHeader title="Bonjour, M. Essomba" subtitle="Séquence 2 en cours · date limite de saisie : 5 décembre 2026" actions={<Link to="/enseignant/notes" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-900"><ClipboardList className="size-4" aria-hidden />Saisir des notes</Link>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Classes affectées" value="2" icon={Layers} />
        <StatCard label="Élèves suivis" value="77" icon={Star} tone="slate" />
        <StatCard label="Évaluations à finir" value="1" icon={Clock} tone="amber" hint="Tle C · Composition" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Mes classes" />
          <ul className="divide-y divide-slate-100">
            {mesClasses.map((c) => (
              <li key={c.classe} className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold text-slate-900">{c.classe} · {c.matiere}</p>
                  <p className="text-xs text-slate-500">{c.effectif} élèves</p>
                </div>
                {c.etat === 'soumise' ? <Badge tone="amber">Notes soumises</Badge> : <Badge tone="slate">Saisie en cours</Badge>}
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-5 py-3 text-sm text-amber-800">
            <Star className="mr-1.5 inline size-4" aria-hidden />Vous êtes professeur principal de la <strong>Tle C</strong>.
          </div>
        </Card>
        <EmploiDuTemps />
      </div>
    </>
  );
}

export function EmploiDuTemps() {
  return (
    <Card>
      <CardHeader title="Emploi du temps" subtitle="Semaine en cours" action={<CalendarDays className="size-5 text-slate-400" aria-hidden />} />
      <div className="divide-y divide-slate-100">
        {emploiDuTemps.map((j) => (
          <div key={j.jour} className="flex gap-4 px-5 py-3">
            <p className="w-20 shrink-0 pt-1 text-sm font-semibold text-slate-700">{j.jour}</p>
            <ul className="flex flex-1 flex-wrap gap-2">
              {j.creneaux.map((c) => (
                <li key={c.h} className="rounded-lg border-l-4 border-brand-600 bg-brand-50/60 px-3 py-2 text-xs">
                  <p className="font-bold tabular-nums text-brand-900">{c.h}</p>
                  <p className="text-slate-600">{c.m} · {c.s}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SaisieNotes() {
  const [classe, setClasse] = useState('3ème A');
  const [evaluation, setEvaluation] = useState('Devoir surveillé n° 1');
  const liste = useMemo(() => (classe === '3ème A' ? eleves.slice(0, 10) : eleves.slice(10, 20)), [classe]);
  const [notes, setNotes] = useState<Record<number, string>>(() => Object.fromEntries(liste.map((e, i) => [e.id, i < 7 ? String([12, 14.5, 9, 16, 11.25, 8.5, 13][i]) : ''])));
  const [message, setMessage] = useState('');

  const erreur = (v: string) => {
    if (v === '' || v.toUpperCase() === 'ABS') return '';
    const n = Number(v.replace(',', '.'));
    return Number.isNaN(n) || n < 0 || n > 20 ? 'Note entre 0 et 20' : '';
  };
  const valeurs = Object.values(notes).filter((v) => v && v.toUpperCase() !== 'ABS' && !erreur(v)).map((v) => Number(v.replace(',', '.')));
  const moyenne = valeurs.length ? valeurs.reduce((a, b) => a + b, 0) / valeurs.length : 0;
  const manquantes = liste.length - Object.values(notes).filter(Boolean).length;
  const invalides = Object.values(notes).some((v) => erreur(v));

  return (
    <>
      <PageHeader title="Saisie des notes" subtitle="Mathématiques · Séquence 2 · notes sur 20" />
      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
          <Select label="Classe" value={classe} onChange={setClasse} options={['3ème A', 'Tle C']} />
          <Select label="Évaluation" value={evaluation} onChange={setEvaluation} options={['Devoir surveillé n° 1', 'Composition de séquence']} />
          <div className="flex items-end gap-4 rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
            <div><p className="text-xs text-slate-500">Moyenne</p><p className="font-bold tabular-nums text-slate-900">{moyenne.toFixed(2).replace('.', ',')}</p></div>
            <div><p className="text-xs text-slate-500">Non saisies</p><p className={`font-bold tabular-nums ${manquantes ? 'text-amber-700' : 'text-emerald-700'}`}>{manquantes}</p></div>
            <Badge tone="slate">Brouillon</Badge>
          </div>
        </div>

        <ul className="divide-y divide-slate-100">
          {liste.map((e, i) => {
            const v = notes[e.id] ?? '';
            const err = erreur(v);
            return (
              <li key={e.id} className="grid grid-cols-[2rem_1fr_7rem] items-center gap-3 px-5 py-2.5 sm:grid-cols-[2rem_1fr_8rem_5rem]">
                <span className="text-xs tabular-nums text-slate-400">{i + 1}</span>
                <label htmlFor={`n${e.id}`} className="min-w-0 truncate text-sm font-medium text-slate-900">{e.nom} {e.prenom}</label>
                <div>
                  <input
                    id={`n${e.id}`}
                    inputMode="decimal"
                    value={v}
                    onChange={(ev) => setNotes({ ...notes, [e.id]: ev.target.value })}
                    aria-invalid={!!err}
                    aria-describedby={err ? `err${e.id}` : undefined}
                    placeholder="— / 20"
                    className={`field-input text-center font-semibold tabular-nums ${err ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  />
                  {err && <p id={`err${e.id}`} className="mt-1 text-xs text-red-600">{err}</p>}
                </div>
                <span className="hidden text-xs text-slate-500 sm:block">{v.toUpperCase() === 'ABS' ? 'Absent' : ''}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
          <p className="text-xs text-slate-500">Tapez <strong>ABS</strong> pour un élève absent. Après soumission, les notes sont vérifiées par l’administration.</p>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Save} onClick={() => setMessage('Brouillon enregistré.')}>Enregistrer</Button>
            <Button icon={Send} disabled={invalides} onClick={() => setMessage(manquantes ? `Il reste ${manquantes} note(s) à saisir avant de soumettre.` : 'Notes soumises pour validation.')}>Soumettre</Button>
          </div>
        </div>
        {message && (
          <div role="status" className={`flex items-center gap-2 border-t px-5 py-3 text-sm ${message.startsWith('Il reste') ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
            {message.startsWith('Il reste') ? <AlertCircle className="size-4" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />} {message}
          </div>
        )}
      </Card>
    </>
  );
}
