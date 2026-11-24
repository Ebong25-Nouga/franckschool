import { AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, ClipboardCheck, GraduationCap, Layers, Plus, Receipt, UserCheck, UserPlus } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { peut, useAuth } from '../../auth';
import { Badge, Card, CardHeader, PageHeader, StatCard } from '../../components/ui';
import { activites, demandesRemboursement, encaissementsMensuels, fcfa } from '../../data/demo';

const saisies = [
  { classe: '6ème A', matiere: 'Français', prof: 'Mme NGO BASSA', etat: 'validee' },
  { classe: '3ème A', matiere: 'Mathématiques', prof: 'M. ESSOMBA', etat: 'soumise' },
  { classe: 'Tle C', matiere: 'Physique-Chimie', prof: 'M. FOTSO', etat: 'brouillon' },
  { classe: '4ème A', matiere: 'Anglais', prof: 'Mme ABENA', etat: 'soumise' },
];
const etatNote = { validee: ['green', 'Validée'], soumise: ['amber', 'À valider'], brouillon: ['slate', 'En saisie'] } as const;

export default function TableauDeBord() {
  const { session } = useAuth();
  const admin = session?.espace === 'admin';
  const enAttente = demandesRemboursement.filter((d) => d.statut === 'en_attente');

  return (
    <>
      <PageHeader
        title={`Bonjour, ${session?.nom.split(' ')[0]}`}
        subtitle="Voici la situation de l’établissement aujourd’hui."
        actions={
          <>
            {peut(session, 'eleves') && (
              <Link to="/etablissement/eleves" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <UserPlus className="size-4" aria-hidden /> Inscrire un élève
              </Link>
            )}
            {peut(session, 'caisse') && (
              <Link to="/etablissement/caisse" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-900">
                <Plus className="size-4" aria-hidden /> Encaisser un paiement
              </Link>
            )}
          </>
        }
      />

      {admin && enAttente.length > 0 && (
        <Link to="/etablissement/remboursements" className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 transition-colors hover:bg-amber-100">
          <AlertTriangle className="size-5 shrink-0 text-amber-600" aria-hidden />
          <span className="flex-1">
            <strong>{enAttente.length} demandes de remboursement</strong> attendent votre décision ({fcfa(enAttente.reduce((s, d) => s + d.montant, 0))}).
          </span>
          <span className="font-semibold underline-offset-2 hover:underline">Examiner</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Élèves inscrits" value="842" icon={GraduationCap} hint={<span><span className="font-semibold text-emerald-700">+37</span> nouveaux cette année</span>} />
        <StatCard label="Professeurs" value="38" icon={UserCheck} tone="slate" hint="24 permanents · 14 vacataires" />
        <StatCard label="Classes" value="22" icon={Layers} tone="slate" hint="Taux de remplissage : 91 %" />
        <StatCard label="Recouvrement scolarité" value="78 %" icon={Banknote} tone="green" hint={<span>Reste à percevoir : <strong className="text-slate-700">{fcfa(27_450_000)}</strong></span>} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Recettes et dépenses"
            subtitle="En millions de FCFA, année 2026-2027"
            action={
              <div className="flex gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-700" /> Recettes</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-amber-400" /> Dépenses</span>
              </div>
            }
          />
          <div className="h-72 px-2 py-4" role="img" aria-label="Graphique : recettes 6,4 M en septembre, 4,8 M en octobre, 3,9 M en novembre ; dépenses 2,1 M, 2,6 M et 1,8 M.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={encaissementsMensuels} barGap={6}>
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mois" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} width={32} />
                <Tooltip cursor={{ fill: 'rgb(var(--brand-50))' }} formatter={(v: number) => `${v.toLocaleString('fr-FR')} M FCFA`} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="recettes" name="Recettes" fill="rgb(var(--brand-700))" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="depenses" name="Dépenses" fill="#FBBF24" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Caisse du jour" subtitle="Lundi 24 novembre 2026" />
          <dl className="divide-y divide-slate-100 px-5">
            {[
              ['Entrées espèces', 25000, true],
              ['Entrées Mobile Money', 50000, true],
              ['Sorties', 0, false],
            ].map(([l, v, plus]) => (
              <div key={l as string} className="flex items-center justify-between py-3.5 text-sm">
                <dt className="flex items-center gap-2 text-slate-600">
                  {plus ? <ArrowUpRight className="size-4 text-emerald-600" aria-hidden /> : <ArrowDownRight className="size-4 text-red-500" aria-hidden />}
                  {l}
                </dt>
                <dd className="font-semibold tabular-nums text-slate-900">{fcfa(v as number)}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between py-4">
              <dt className="text-sm font-semibold text-slate-900">Solde du jour</dt>
              <dd className="text-lg font-bold tabular-nums text-brand-800">{fcfa(75000)}</dd>
            </div>
          </dl>
          <div className="border-t border-slate-100 p-4">
            <Link to="/etablissement/caisse" className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              <Receipt className="size-4" aria-hidden /> Voir le journal de caisse
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Saisie des notes — Séquence 2" subtitle="Avancement par classe et matière" action={<ClipboardCheck className="size-5 text-slate-400" aria-hidden />} />
          <ul className="divide-y divide-slate-100">
            {saisies.map((s) => {
              const [tone, label] = etatNote[s.etat as keyof typeof etatNote];
              return (
                <li key={s.classe + s.matiere} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{s.classe} · {s.matiere}</p>
                    <p className="text-xs text-slate-500">{s.prof}</p>
                  </div>
                  <Badge tone={tone}>{label}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Activités récentes" subtitle="Journal des actions importantes" />
          <ol className="space-y-0 px-5 py-2">
            {activites.map((a, i) => (
              <li key={i} className="relative flex gap-3 py-3">
                <span className="relative mt-1.5 flex size-2.5 shrink-0 rounded-full bg-brand-600 ring-4 ring-brand-50" aria-hidden />
                <div className="min-w-0 text-sm">
                  <p className="text-slate-700"><strong className="font-semibold text-slate-900">{a.qui}</strong> {a.quoi}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{a.quand}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
