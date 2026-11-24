import { ArrowRight, Banknote, CalendarX2, ClipboardCheck, GraduationCap, Lock, Plus, UserPlus, Undo2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { peut, useAuth } from '../../auth';
import { EncaissementModal, InscriptionModal } from '../../components/Actions';
import { Avatar, Button, Figure, Gauge, PageHeader, Panel, PanelHead, SequenceRail } from '../../components/kit';
import { activites, avancementSaisie, encaissementsMensuels, repartitionModes } from '../../data/demo';

export default function TableauDeBord() {
  const { session } = useAuth();
  const admin = session?.espace === 'admin';
  const [modal, setModal] = useState<'paiement' | 'inscription' | null>(null);

  const aTraiter = [
    admin && { to: '/etablissement/remboursements', icon: Undo2, titre: '2 demandes de remboursement', detail: '40 000 FCFA attendent votre décision' },
    peut(session, 'notes') && { to: '/etablissement/notes', icon: ClipboardCheck, titre: '2 évaluations à valider', detail: 'Mathématiques 3ème A, Anglais 4ème A' },
    peut(session, 'caisse') && { to: '/etablissement/caisse', icon: Lock, titre: 'Caisse non clôturée depuis 3 jours', detail: 'Dernière clôture le 21 novembre' },
    peut(session, 'absences') && { to: '/etablissement/absences', icon: CalendarX2, titre: '3 absences à traiter', detail: 'Dont 1 justificatif à vérifier' },
  ].filter(Boolean) as { to: string; icon: typeof Undo2; titre: string; detail: string }[];

  return (
    <>
      <PageHeader
        kicker="Lundi 24 novembre 2026"
        title={`Bonjour, ${session?.nom.split(' ')[0]}`}
        actions={
          <>
            {peut(session, 'eleves') && <Button variant="secondary" icon={UserPlus} onClick={() => setModal('inscription')}>Inscrire un élève</Button>}
            {peut(session, 'caisse') && <Button icon={Plus} onClick={() => setModal('paiement')}>Encaisser un paiement</Button>}
          </>
        }
      />

      {/* Bandeau signature : l'année scolaire et ce qui attend une action */}
      <section className="seyes relative overflow-hidden rounded-[22px] bg-brand-950 text-white shadow-leve">
        <div aria-hidden className="absolute -right-24 -top-24 size-[420px] rounded-full bg-brand-600/35 blur-[90px]" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div>
            <p className="text-sm font-medium text-brand-200">Année scolaire 2026-2027</p>
            <h2 className="mt-1 font-display text-[28px] font-bold leading-tight tracking-[-0.03em]">Séquence 2, encore 11 jours de saisie</h2>
            <p className="mt-2 max-w-md text-sm text-brand-200">64 % des notes de la séquence sont saisies. Les bulletins du 1er trimestre pourront être générés après le 5 décembre.</p>
            <div className="mt-6">
              <SequenceRail dark />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">À traiter</p>
            <ul className="mt-3 space-y-2">
              {aTraiter.map((t) => (
                <li key={t.to}>
                  <Link to={t.to} className="group flex items-center gap-3 rounded-xl bg-white/[0.07] px-3.5 py-3 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.12]">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-feutre text-encre">
                      <t.icon className="size-[18px]" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{t.titre}</span>
                      <span className="block truncate text-xs text-brand-200">{t.detail}</span>
                    </span>
                    <ArrowRight className="size-4 text-brand-300 transition-transform group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Chiffres clés, dans une seule bande */}
      <Panel className="mt-6 grid divide-y divide-papier-ligne/70 sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x">
        <div className="p-6"><Figure icon={GraduationCap} label="Élèves inscrits" value="842" detail={<><b className="text-valide">+37</b> nouveaux, 19 redoublants</>} /></div>
        <div className="border-papier-ligne/70 p-6 sm:border-l xl:border-l-0">
          <Figure icon={Wallet} label="Scolarité recouvrée" value="78" unit="%" detail={<Gauge value={78} label="Taux de recouvrement" showValue={false} className="mt-1" />} />
        </div>
        <div className="p-6"><Figure icon={Banknote} label="Encaissé en novembre" value="7,9" unit="M FCFA" detail="Dont 31 % par MTN MoMo" /></div>
        <div className="border-papier-ligne/70 p-6 sm:border-l xl:border-l-0"><Figure icon={Banknote} label="Reste à percevoir" value="27,4" unit="M FCFA" tone="stylo" detail="186 élèves concernés" /></div>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelHead
            title="Recettes et dépenses"
            hint="En millions de FCFA, depuis la rentrée"
            action={
              <div className="flex gap-4 text-xs font-medium text-encre-doux">
                <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-600" /> Recettes</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-stylo" /> Dépenses</span>
              </div>
            }
          />
          <div className="h-[260px] px-3 pb-4" role="img" aria-label="Recettes : 18,4 M en septembre, 11,8 M en octobre, 7,9 M en novembre. Dépenses : 4,1 M, 4,6 M, 3,2 M.">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={encaissementsMensuels} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgb(var(--brand-600))" stopOpacity={0.28} /><stop offset="100%" stopColor="rgb(var(--brand-600))" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D0263A" stopOpacity={0.16} /><stop offset="100%" stopColor="#D0263A" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E4E9F3" strokeDasharray="3 4" />
                <XAxis dataKey="mois" tickLine={false} axisLine={false} tick={{ fill: '#4A5578', fontSize: 12 }} dy={6} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8790AD', fontSize: 12 }} width={30} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} M FCFA`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 12px 32px -12px rgba(14,21,51,.3)', fontSize: 13 }} />
                <Area type="monotone" dataKey="recettes" name="Recettes" stroke="rgb(var(--brand-600))" strokeWidth={2.5} fill="url(#gRec)" dot={{ r: 3.5, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls={false} />
                <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#D0263A" strokeWidth={2} fill="url(#gDep)" dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Comment les parents paient" hint="Part des encaissements, novembre" />
          <div className="flex items-center gap-6 px-6 pb-6">
            <div className="relative size-[150px] shrink-0" role="img" aria-label="Espèces 46 %, MTN MoMo 31 %, Orange Money 17 %, Banque 6 %">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={repartitionModes} dataKey="part" nameKey="mode" innerRadius={50} outerRadius={72} paddingAngle={2} stroke="none" startAngle={90} endAngle={-270}>
                    {repartitionModes.map((m) => <Cell key={m.mode} fill={m.couleur} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div><p className="font-display text-xl font-bold leading-none">54 %</p><p className="mt-1 text-[11px] text-encre-doux">électronique</p></div>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-2.5">
              {repartitionModes.map((m) => (
                <li key={m.mode} className="flex items-center gap-2.5 text-sm">
                  <span className="size-2.5 shrink-0 rounded-sm" style={{ background: m.couleur }} aria-hidden />
                  <span className="flex-1 truncate text-encre-doux">{m.mode}</span>
                  <span className="font-semibold chiffres">{m.part} %</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel>
          <PanelHead title="Saisie des notes, séquence 2" hint="Matières dont les notes sont soumises, par classe" action={<Link to="/etablissement/notes" className="text-sm font-semibold text-brand-700 hover:underline">Valider</Link>} />
          <ul className="space-y-3.5 px-6 pb-6 pt-1">
            {avancementSaisie.map((c) => (
              <li key={c.classe} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-sm">
                <span className="font-semibold">{c.classe}</span>
                <Gauge value={(c.fait / c.total) * 100} label={`Saisie ${c.classe}`} showValue={false} />
                <span className="text-right text-xs font-semibold text-encre-doux chiffres">{c.fait}/{c.total}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHead title="Dernières actions" hint="Qui a fait quoi, aujourd’hui et hier" />
          <ol className="px-6 pb-5">
            {activites.map((a, i) => (
              <li key={i} className="flex gap-3 border-t border-papier-ligne/60 py-3 first:border-t-0 first:pt-1">
                <Avatar name={a.qui} size="sm" />
                <p className="min-w-0 flex-1 text-sm leading-snug text-encre-doux">
                  <b className="font-semibold text-encre">{a.qui}</b> {a.quoi}
                </p>
                <time className="shrink-0 text-xs text-encre-pale">{a.quand}</time>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {modal === 'paiement' && <EncaissementModal onClose={() => setModal(null)} />}
      {modal === 'inscription' && <InscriptionModal onClose={() => setModal(null)} />}
    </>
  );
}
