import { Activity, Building2, CreditCard, GraduationCap, MoreHorizontal, Plus, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge, Button, Card, CardHeader, PageHeader, StatCard, Table, Td } from '../../components/ui';
import { etablissements } from '../../data/demo';

const statutTone = { actif: 'green', essai: 'brand', suspendu: 'red' } as const;

export function TableauPlateforme() {
  const totalEleves = etablissements.reduce((s, e) => s + e.eleves, 0);
  return (
    <>
      <PageHeader title="Administration centrale" subtitle="Vue d’ensemble de tous les établissements clients" actions={<Button icon={Plus}>Nouvel établissement</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Établissements" value={String(etablissements.length)} icon={Building2} hint="3 actifs · 1 en essai · 1 suspendu" />
        <StatCard label="Élèves gérés" value={totalEleves.toLocaleString('fr-FR')} icon={GraduationCap} tone="slate" />
        <StatCard label="Utilisateurs" value={String(etablissements.reduce((s, e) => s + e.utilisateurs, 0))} icon={Users} tone="slate" />
        <StatCard label="Activité (24 h)" value="1 284" icon={Activity} tone="green" hint="actions enregistrées" />
      </div>
      <Card className="mt-6">
        <CardHeader title="Élèves par établissement" />
        <div className="h-64 px-2 py-4" role="img" aria-label="Graphique du nombre d’élèves par établissement">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={etablissements.map((e) => ({ nom: e.nom.split(' ').slice(-2).join(' '), eleves: e.eleves }))}>
              <CartesianGrid vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="nom" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} interval={0} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} width={40} />
              <Tooltip cursor={{ fill: 'rgb(var(--brand-50))' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="eleves" name="Élèves" fill="rgb(var(--brand-700))" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <ListeEtablissements />
    </>
  );
}

export function ListeEtablissements() {
  return (
    <Card className="mt-6">
      <CardHeader title="Établissements clients" subtitle="Les données de chaque école restent isolées" />
      <Table caption="Établissements clients" head={['Établissement', 'Ville', 'Élèves', 'Utilisateurs', 'Abonnement', 'Statut', '']}>
        {etablissements.map((e) => (
          <tr key={e.id} className="hover:bg-slate-50/80">
            <Td>
              <div className="flex items-center gap-3">
                <span className="size-3 shrink-0 rounded-full ring-2 ring-white" style={{ background: e.couleur }} aria-hidden />
                <span className="font-semibold text-slate-900">{e.nom}</span>
              </div>
            </Td>
            <Td>{e.ville}</Td>
            <Td className="tabular-nums">{e.eleves.toLocaleString('fr-FR')}</Td>
            <Td className="tabular-nums">{e.utilisateurs}</Td>
            <Td><span className="flex items-center gap-1.5"><CreditCard className="size-4 text-slate-400" aria-hidden />{e.abonnement}</span></Td>
            <Td><Badge tone={statutTone[e.statut as keyof typeof statutTone]}>{e.statut[0].toUpperCase() + e.statut.slice(1)}</Badge></Td>
            <Td className="text-right">
              <button className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={`Actions pour ${e.nom}`}>
                <MoreHorizontal className="size-4" />
              </button>
            </Td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}
