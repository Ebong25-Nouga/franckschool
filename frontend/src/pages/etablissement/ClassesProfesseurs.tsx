import clsx from 'clsx';
import { Clock, Phone, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Button, Gauge, PageHeader, Panel, Pill, Segmented, Table, Td, useToast } from '../../components/kit';
import { classes, effectifs, matieresClasse, professeurs } from '../../data/demo';

export function Classes() {
  const toast = useToast();
  const [active, setActive] = useState('4ème A');
  const total = matieresClasse.reduce((s, m) => s + m.coef, 0);
  const pp = professeurs.find((p) => p.principal === active);
  const groupes = [1, 2, 3];

  return (
    <>
      <PageHeader title="Classes et matières" lead="Chaque classe a ses propres matières et coefficients pour l’année 2026-2027." actions={<Button icon={Plus} onClick={() => toast('Formulaire de nouvelle classe ouvert.')}>Nouvelle classe</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {classes.map((c) => (
          <button key={c} onClick={() => setActive(c)} aria-pressed={active === c} className={clsx('cursor-pointer rounded-2xl p-4 text-left transition-[background-color,box-shadow] duration-150', active === c ? 'bg-brand-700 text-white shadow-encre' : 'bg-white shadow-feuille hover:ring-1 hover:ring-brand-200')}>
            <span className="block font-display text-lg font-bold tracking-[-0.02em]">{c}</span>
            <span className={clsx('mt-1 block text-xs', active === c ? 'text-brand-100' : 'text-encre-doux')}>{effectifs[c]} élèves</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Panel>
          <div className="flex flex-wrap items-end justify-between gap-3 px-6 pb-4 pt-6">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{active}</h2>
              <p className="text-sm text-encre-doux">{matieresClasse.length} matières, total des coefficients : <b className="text-encre">{total}</b></p>
            </div>
            <Button size="sm" variant="secondary" icon={Plus}>Ajouter une matière</Button>
          </div>
          {groupes.map((g) => (
            <div key={g}>
              <p className="border-y border-papier-ligne/70 bg-papier/70 px-6 py-2 text-[13px] font-semibold text-encre-doux">{g === 1 ? '1er' : `${g}e`} groupe</p>
              <Table caption={`Matières du groupe ${g}`} head={[]} minWidth={520}>
                {matieresClasse.filter((m) => m.groupe === g).map((m) => (
                  <tr key={m.code}>
                    <Td className="w-1/2 font-semibold">{m.nom} <span className="ml-1 font-mono text-[11px] font-normal text-encre-pale">{m.code}</span></Td>
                    <Td><span className="flex items-center gap-2 text-encre-doux"><Avatar name={m.prof} size="sm" />{m.prof}</span></Td>
                    <Td className="text-right"><span className="inline-grid size-8 place-items-center rounded-lg bg-brand-50 font-display font-bold text-brand-800 chiffres" title="Coefficient">{m.coef}</span></Td>
                  </tr>
                ))}
              </Table>
            </div>
          ))}
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <p className="text-[13px] font-medium text-encre-doux">Professeur principal</p>
            {pp ? (
              <div className="mt-3 flex items-center gap-3"><Avatar name={pp.nom} size="lg" /><div><p className="font-semibold">{pp.nom}</p><p className="text-sm text-encre-doux">{pp.specialite}</p></div></div>
            ) : (
              <Button className="mt-3 w-full" variant="quiet">Désigner un professeur principal</Button>
            )}
          </Panel>
          <Panel className="p-6">
            <p className="text-[13px] font-medium text-encre-doux">Remplissage</p>
            <p className="mt-1.5 font-display text-[28px] font-bold leading-none chiffres">{effectifs[active]}<span className="text-base text-encre-doux">/50</span></p>
            <Gauge value={(effectifs[active] / 50) * 100} label="Remplissage de la classe" className="mt-3" />
            <p className="mt-4 text-[13px] text-encre-doux">Salle 12, bâtiment B</p>
          </Panel>
        </div>
      </div>
    </>
  );
}

export function Professeurs() {
  const [vue, setVue] = useState<'tous' | 'Permanent' | 'Vacataire'>('tous');
  const liste = professeurs.filter((p) => vue === 'tous' || p.contrat === vue);
  return (
    <>
      <PageHeader title="Professeurs" lead="38 enseignants. Chacun se connecte à son espace pour saisir les notes de ses classes." actions={<Button icon={Plus}>Ajouter un professeur</Button>} />
      <div className="mb-5"><Segmented label="Contrat" value={vue} onChange={setVue} options={[{ value: 'tous', label: 'Tous' }, { value: 'Permanent', label: 'Permanents' }, { value: 'Vacataire', label: 'Vacataires' }]} /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {liste.map((p) => (
          <Panel key={p.id} as="article" className="flex flex-col p-5">
            <div className="flex items-start justify-between">
              <Avatar name={p.nom} size="lg" />
              <Pill tone={p.contrat === 'Permanent' ? 'encre' : 'neutre'} dot={false}>{p.contrat}</Pill>
            </div>
            <h2 className="mt-4 font-display text-[17px] font-bold leading-tight">{p.nom}</h2>
            <p className="text-sm text-encre-doux">{p.specialite}</p>
            <div className="mb-4 mt-4 flex flex-wrap gap-1.5">
              {p.classes.map((c) => <span key={c} className={clsx('rounded-md px-2 py-1 text-xs font-semibold', c === p.principal ? 'bg-feutre text-encre' : 'bg-papier-2 text-encre-doux')}>{c}</span>)}
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-papier-ligne/70 pt-3.5 text-[13px] text-encre-doux">
              <span className="flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden />{p.heures} h/semaine</span>
              {p.principal ? <span className="flex items-center gap-1 font-semibold text-encre"><Star className="size-3.5 text-feutre-700" aria-hidden />PP {p.principal}</span> : <span className="flex items-center gap-1"><Phone className="size-3.5" aria-hidden />{p.telephone.slice(-6)}</span>}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
