import { Building2, CreditCard, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Figure, Gauge, IconButton, PageHeader, Panel, PanelHead, Pill, Segmented, Table, Td } from '../../components/kit';
import { etablissements, journalPlateforme } from '../../data/demo';

const statutTone = { actif: 'valide', essai: 'encre', suspendu: 'stylo' } as const;
const totalEleves = etablissements.reduce((s, e) => s + e.eleves, 0);

export function TableauPlateforme() {
  return (
    <>
      <PageHeader kicker="Lundi 24 novembre 2026" title="Toutes les écoles" actions={<Button icon={Plus}>Nouvel établissement</Button>} />
      <section className="seyes relative overflow-hidden rounded-[22px] bg-brand-950 p-6 text-white shadow-leve sm:p-8">
        <div aria-hidden className="absolute -right-20 -top-24 size-96 rounded-full bg-brand-600/35 blur-[90px]" />
        <div className="relative grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Établissements', '5', '3 actifs, 1 en essai, 1 suspendu'],
            ['Élèves gérés', totalEleves.toLocaleString('fr-FR'), 'Dans 4 régions du Cameroun'],
            ['Utilisateurs', String(etablissements.reduce((s, e) => s + e.utilisateurs, 0)), '72 secrétaires et admins'],
            ['Revenus du mois', '1,24 M', 'FCFA d’abonnements'],
          ].map(([l, v, d]) => (
            <div key={l}>
              <p className="text-sm font-medium text-brand-200">{l}</p>
              <p className="mt-2 font-display text-[40px] font-extrabold leading-none tracking-[-0.04em] chiffres">{v}</p>
              <p className="mt-2 text-[13px] text-brand-300">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <ListeEtablissements />
      <Panel className="mt-6">
        <PanelHead title="Activité récente sur la plateforme" />
        <JournalTable />
      </Panel>
    </>
  );
}

export function ListeEtablissements({ page = false }: { page?: boolean }) {
  const [vue, setVue] = useState<'tous' | 'actif' | 'essai' | 'suspendu'>('tous');
  const liste = etablissements.filter((e) => vue === 'tous' || e.statut === vue);
  const contenu = (
    <Panel className={page ? '' : 'mt-6'}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <h2 className="font-display text-[17px] font-semibold">Établissements clients</h2>
        <Segmented label="Statut" value={vue} onChange={setVue} options={[{ value: 'tous', label: 'Tous' }, { value: 'actif', label: 'Actifs' }, { value: 'essai', label: 'Essai' }, { value: 'suspendu', label: 'Suspendus' }]} />
      </div>
      <Table caption="Établissements clients" head={['Établissement', 'Région', { label: 'Élèves', align: 'right' }, 'Recouvrement', 'Abonnement', 'Statut', { label: 'Actions', sr: true }]} minWidth={900}>
        {liste.map((e) => (
          <tr key={e.id} className="hover:bg-papier/60">
            <Td>
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: e.couleur }}><Building2 className="size-5" aria-hidden /></span>
                <div><p className="font-semibold">{e.nom}</p><p className="text-xs text-encre-doux">Client depuis {e.depuis}</p></div>
              </div>
            </Td>
            <Td>{e.ville}<span className="block text-xs text-encre-doux">{e.region}</span></Td>
            <Td className="text-right font-semibold chiffres">{e.eleves.toLocaleString('fr-FR')}</Td>
            <Td className="w-[180px]"><Gauge value={e.recouvrement} label={`Recouvrement ${e.nom}`} /></Td>
            <Td><span className="flex items-center gap-1.5"><CreditCard className="size-4 text-encre-pale" aria-hidden />{e.abonnement}</span></Td>
            <Td><Pill tone={statutTone[e.statut as keyof typeof statutTone]}>{e.statut[0].toUpperCase() + e.statut.slice(1)}</Pill></Td>
            <Td className="text-right"><IconButton icon={MoreHorizontal} label={`Actions pour ${e.nom}`} /></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
  return page ? (
    <>
      <PageHeader title="Établissements" lead="Les données de chaque école restent isolées. Vous seul voyez l’ensemble." actions={<Button icon={Plus}>Nouvel établissement</Button>} />
      {contenu}
    </>
  ) : (
    contenu
  );
}

function JournalTable() {
  return (
    <Table caption="Journal d’activités" head={['Date', 'École', 'Auteur', 'Action', 'Détail']} minWidth={760}>
      {journalPlateforme.map((j, i) => (
        <tr key={i}>
          <Td className="whitespace-nowrap font-mono text-xs text-encre-doux">{j.quand}</Td>
          <Td className="font-semibold">{j.ecole}</Td>
          <Td>{j.qui}</Td>
          <Td><Pill tone={j.action.includes('remboursement') ? 'feutre' : j.action === 'Désactivation' ? 'stylo' : 'encre'} dot={false}>{j.action}</Pill></Td>
          <Td className="text-encre-doux">{j.detail}</Td>
        </tr>
      ))}
    </Table>
  );
}

export function Journal() {
  return (
    <>
      <PageHeader title="Journal d’activités" lead="Chaque action importante, dans toutes les écoles. Rien ne s’efface de ce journal." />
      <Panel><JournalTable /></Panel>
    </>
  );
}

export function Statistiques() {
  const data = etablissements.map((e) => ({ nom: e.nom.replace(/^(Collège Bilingue|Institut|Complexe Scolaire|Lycée Privé|École) /, ''), eleves: e.eleves, couleur: e.couleur }));
  return (
    <>
      <PageHeader title="Statistiques" lead="Comparaison des établissements, année 2026-2027." />
      <Panel className="mb-6 grid divide-y divide-papier-ligne/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-6"><Figure label="Recouvrement moyen" value="65" unit="%" /></div>
        <div className="p-6"><Figure label="Notes saisies, séquence 2" value="58" unit="%" /></div>
        <div className="p-6"><Figure label="Encaissé via Mobile Money" value="49" unit="%" /></div>
      </Panel>
      <Panel>
        <PanelHead title="Élèves par établissement" />
        <div className="h-72 px-3 pb-5" role="img" aria-label={data.map((d) => `${d.nom} ${d.eleves} élèves`).join(', ')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E4E9F3" strokeDasharray="3 4" />
              <XAxis dataKey="nom" tickLine={false} axisLine={false} tick={{ fill: '#4A5578', fontSize: 12 }} interval={0} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8790AD', fontSize: 12 }} width={40} />
              <Tooltip cursor={{ fill: 'rgb(var(--brand-50))' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 32px -12px rgba(14,21,51,.3)' }} />
              <Bar dataKey="eleves" name="Élèves" fill="rgb(var(--brand-700))" radius={[6, 6, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </>
  );
}

export function Abonnements() {
  const plans = [
    { nom: 'Basique', prix: '25 000', eleves: 'jusqu’à 300 élèves', ecoles: 1 },
    { nom: 'Standard', prix: '60 000', eleves: 'jusqu’à 1 000 élèves', ecoles: 2 },
    { nom: 'Premium', prix: '120 000', eleves: 'élèves illimités', ecoles: 1 },
  ];
  return (
    <>
      <PageHeader title="Abonnements" lead="Les offres seront activées avec le module commercial. Les tarifs ci-dessous sont des exemples." />
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p, i) => (
          <Panel key={p.nom} className={i === 1 ? 'p-6 ring-2 ring-brand-600' : 'p-6'}>
            <p className="font-display text-xl font-bold">{p.nom}</p>
            <p className="mt-3 font-display text-[34px] font-extrabold tracking-[-0.03em] chiffres">{p.prix}<span className="text-sm font-semibold text-encre-doux"> FCFA/mois</span></p>
            <p className="mt-2 text-sm text-encre-doux">{p.eleves}</p>
            <p className="mt-5 border-t border-papier-ligne/70 pt-4 text-sm"><b>{p.ecoles}</b> établissement{p.ecoles > 1 ? 's' : ''} sur cette offre</p>
          </Panel>
        ))}
      </div>
    </>
  );
}
