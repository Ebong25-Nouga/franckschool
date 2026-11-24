import clsx from 'clsx';
import { ArrowDownLeft, ArrowUpRight, Banknote, FileDown, Lock, Minus, Plus, Printer, Smartphone, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { EncaissementModal } from '../../components/Actions';
import { Avatar, Button, Gauge, IconButton, Modal, PageHeader, Panel, Pill, Segmented, Select, Table, Td, useToast } from '../../components/kit';
import { eleves, fcfa, transactions, type Transaction } from '../../data/demo';

const typeInfo = {
  recette: { tone: 'valide', label: 'Recette', icon: ArrowDownLeft, couleur: 'text-valide', signe: '+' },
  depense: { tone: 'stylo', label: 'Dépense', icon: ArrowUpRight, couleur: 'text-stylo', signe: '−' },
  remboursement: { tone: 'orange', label: 'Remboursement', icon: Undo2, couleur: 'text-orange', signe: '−' },
} as const;

type Vue = 'journal' | 'impayes' | 'clotures';

function jour(d: string) {
  const dt = new Date(d);
  const label = dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return label[0].toUpperCase() + label.slice(1);
}

export default function Caisse() {
  const toast = useToast();
  const [vue, setVue] = useState<Vue>('journal');
  const [type, setType] = useState('Tous les types');
  const [mode, setMode] = useState('Tous les modes');
  const [modal, setModal] = useState<'recette' | 'depense' | 'cloture' | null>(null);

  const liste = transactions.filter((t) => (type === 'Tous les types' || typeInfo[t.type].label === type) && (mode === 'Tous les modes' || t.mode === mode));
  const parJour = liste.reduce<Record<string, Transaction[]>>((acc, t) => ((acc[t.date.slice(0, 10)] ??= []).push(t), acc), {});
  const impayes = eleves.filter((e) => e.paye < e.du).sort((a, b) => b.du - b.paye - (a.du - a.paye));

  return (
    <>
      <PageHeader
        title="Caisse"
        lead="Chaque opération est signée et numérotée. Une opération confirmée ne se supprime pas : elle s’annule par une écriture inverse."
        actions={
          <>
            <Button variant="secondary" icon={FileDown} onClick={() => toast('Rapport financier de novembre généré (PDF).')}>Rapport PDF</Button>
            <Button variant="secondary" icon={Lock} onClick={() => setModal('cloture')}>Clôturer</Button>
            <Button variant="secondary" icon={Minus} onClick={() => setModal('depense')}>Dépense</Button>
            <Button icon={Plus} onClick={() => setModal('recette')}>Encaisser</Button>
          </>
        }
      />

      {/* Soldes : espèces et électronique sont suivis séparément */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <section className="seyes relative overflow-hidden rounded-[22px] bg-brand-950 p-6 text-white shadow-leve">
          <div aria-hidden className="absolute -right-16 -top-20 size-64 rounded-full bg-brand-600/40 blur-[70px]" />
          <p className="relative text-sm font-medium text-brand-200">Solde total de la caisse</p>
          <p className="relative mt-2 font-display text-[42px] font-extrabold leading-none tracking-[-0.04em] chiffres">4 215 400<span className="ml-2 text-base font-semibold tracking-normal text-brand-200">FCFA</span></p>
          <p className="relative mt-4 text-sm text-brand-200">Aujourd’hui : <b className="text-white">+ 65 000</b> encaissés, aucune sortie.</p>
        </section>
        <Panel className="p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-encre-doux"><span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700"><Banknote className="size-4" aria-hidden /></span>Espèces en caisse</p>
          <p className="mt-3 font-display text-[28px] font-bold tracking-[-0.03em] chiffres">1 382 000 <span className="text-sm font-semibold text-encre-doux">FCFA</span></p>
          <p className="mt-2 text-[13px] text-stylo">Non clôturée depuis le 21 novembre</p>
        </Panel>
        <Panel className="p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-encre-doux"><span className="grid size-7 place-items-center rounded-lg bg-[#FFF4C2] text-[#7A5B00]"><Smartphone className="size-4" aria-hidden /></span>Mobile Money et banque</p>
          <p className="mt-3 font-display text-[28px] font-bold tracking-[-0.03em] chiffres">2 833 400 <span className="text-sm font-semibold text-encre-doux">FCFA</span></p>
          <p className="mt-2 text-[13px] text-encre-doux">MTN MoMo 1,9 M · Orange Money 0,7 M · Banque 0,2 M</p>
        </Panel>
      </div>

      <Panel className="mt-6">
        <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center">
          <Segmented label="Vue de la caisse" value={vue} onChange={setVue} options={[{ value: 'journal', label: 'Journal' }, { value: 'impayes', label: 'Impayés', count: 186 }, { value: 'clotures', label: 'Clôtures' }]} />
          {vue === 'journal' && (
            <div className="grid grid-cols-2 gap-2 lg:ml-auto lg:w-[420px]">
              <Select hideLabel label="Type d’opération" value={type} onChange={setType} options={['Tous les types', 'Recette', 'Dépense', 'Remboursement']} />
              <Select hideLabel label="Mode de paiement" value={mode} onChange={setMode} options={['Tous les modes', 'Espèces', 'MTN MoMo', 'Orange Money', 'Banque']} />
            </div>
          )}
        </div>

        {vue === 'journal' && (
          <div className="pb-2">
            {Object.entries(parJour).map(([d, ops]) => {
              const net = ops.reduce((s, t) => s + (t.type === 'recette' ? t.montant : -t.montant), 0);
              return (
                <div key={d}>
                  <div className="flex items-center justify-between border-y border-papier-ligne/70 bg-papier/70 px-6 py-2 text-[13px]">
                    <span className="font-semibold">{jour(d)}</span>
                    <span className={clsx('font-semibold chiffres', net >= 0 ? 'text-valide' : 'text-stylo')}>{net >= 0 ? '+' : '−'} {fcfa(Math.abs(net))}</span>
                  </div>
                  <ul>
                    {ops.map((t) => {
                      const info = typeInfo[t.type];
                      return (
                        <li key={t.id} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-papier-ligne/50 px-6 py-3.5 last:border-b-0 sm:grid-cols-[2.5rem_1fr_9rem_8rem_auto]">
                          <span className={clsx('grid size-10 place-items-center rounded-xl', t.type === 'recette' ? 'bg-valide-50' : t.type === 'depense' ? 'bg-stylo-50' : 'bg-orange-50', info.couleur)}>
                            <info.icon className="size-[18px]" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{t.libelle}</p>
                            <p className="truncate text-[13px] text-encre-doux">{t.eleve ? `${t.eleve}, ${t.classe}` : 'Fonctionnement'} · <span className="font-mono text-xs">{t.numero}</span></p>
                          </div>
                          <p className={clsx('text-right font-display text-[17px] font-bold chiffres sm:order-last', info.couleur)}>{info.signe} {fcfa(t.montant)}</p>
                          <div className="col-start-2 text-[13px] text-encre-doux sm:col-start-auto">
                            <p className="font-medium text-encre">{t.mode}</p>
                            {t.reference && <p className="truncate font-mono text-[11px]">{t.reference}</p>}
                          </div>
                          <p className="hidden items-center gap-2 text-[13px] text-encre-doux sm:flex">
                            <Avatar name={t.auteur} size="sm" /> {t.auteur} · {t.date.slice(11)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {vue === 'impayes' && (
          <Table caption="Élèves avec un reste à payer" head={['Élève', 'Classe', 'Payé', { label: 'Reste à payer', align: 'right' }, { label: 'Action', sr: true }]}>
            {impayes.map((e) => (
              <tr key={e.id} className="hover:bg-papier/60">
                <Td><div className="flex items-center gap-3"><Avatar name={`${e.nom} ${e.prenom}`} size="sm" /><span className="font-semibold">{e.nom} {e.prenom}</span></div></Td>
                <Td>{e.classe}</Td>
                <Td className="w-[200px]"><Gauge value={(e.paye / e.du) * 100} label={`Payé par ${e.nom}`} /></Td>
                <Td className="text-right font-display font-bold text-stylo chiffres">{fcfa(e.du - e.paye)}</Td>
                <Td className="text-right"><Button size="sm" variant="secondary" onClick={() => toast(`Rappel SMS envoyé au tuteur de ${e.prenom} ${e.nom}.`)}>Relancer</Button></Td>
              </tr>
            ))}
          </Table>
        )}

        {vue === 'clotures' && (
          <Table caption="Historique des clôtures" head={['Période', 'Clôturée par', { label: 'Théorique', align: 'right' }, { label: 'Compté', align: 'right' }, { label: 'Écart', align: 'right' }, 'Statut', { label: 'Imprimer', sr: true }]}>
            {[
              ['18 → 21 nov.', 'Nadine E.', 1_247_500, 1_247_500],
              ['14 → 17 nov.', 'Paul B.', 986_000, 981_000],
              ['10 → 13 nov.', 'Nadine E.', 1_402_300, 1_402_300],
            ].map(([p, a, t, r]) => (
              <tr key={p as string}>
                <Td className="font-semibold">{p}</Td>
                <Td>{a}</Td>
                <Td className="text-right chiffres">{fcfa(t as number)}</Td>
                <Td className="text-right chiffres">{fcfa(r as number)}</Td>
                <Td className={clsx('text-right font-semibold chiffres', t === r ? 'text-valide' : 'text-stylo')}>{t === r ? '0' : `− ${fcfa((t as number) - (r as number))}`}</Td>
                <Td><Pill tone="valide">Validée</Pill></Td>
                <Td className="text-right"><IconButton icon={Printer} label={`Imprimer la clôture ${p}`} /></Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      {modal === 'recette' && <EncaissementModal onClose={() => setModal(null)} />}
      {modal === 'depense' && <DepenseModal onClose={() => setModal(null)} />}
      {modal === 'cloture' && <ClotureModal onClose={() => setModal(null)} />}
    </>
  );
}

function DepenseModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');
  return (
    <Modal
      title="Enregistrer une dépense"
      lead="La dépense sort de la caisse à votre nom. Joignez le justificatif si vous l’avez."
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button variant="danger" disabled={!montant || !motif} onClick={() => { toast(`Dépense de ${fcfa(Number(montant))} enregistrée.`); onClose(); }}>Enregistrer la dépense</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="d-motif" className="field-label">Motif</label><input id="d-motif" value={motif} onChange={(e) => setMotif(e.target.value)} className="field-input" placeholder="Ex. Achat de craies et registres" /></div>
        <div><label htmlFor="d-cat" className="field-label">Catégorie</label><select id="d-cat" className="field-input">{['Fournitures', 'Électricité et eau', 'Entretien', 'Salaires vacataires', 'Transport', 'Autre'].map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label htmlFor="d-mode" className="field-label">Payée par</label><select id="d-mode" className="field-input">{['Espèces', 'MTN MoMo', 'Orange Money', 'Banque'].map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label htmlFor="d-montant" className="field-label">Montant (FCFA)</label><input id="d-montant" inputMode="numeric" value={montant} onChange={(e) => setMontant(e.target.value.replace(/\D/g, ''))} className="field-input font-display text-lg font-bold chiffres" /></div>
        <div><label htmlFor="d-just" className="field-label">Justificatif</label><input id="d-just" type="file" accept="image/*,.pdf" className="field-input cursor-pointer pt-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-papier-2 file:px-3 file:py-1 file:text-sm file:font-semibold" /></div>
      </div>
    </Modal>
  );
}

function ClotureModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const theorique = 1_382_000;
  const [compte, setCompte] = useState('');
  const c = Number(compte) || 0;
  const ecart = c - theorique;
  return (
    <Modal
      title="Clôturer la caisse"
      lead="Comptez les espèces présentes et saisissez le montant. L’écart éventuel sera enregistré."
      onClose={onClose}
      width="max-w-lg"
      footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button disabled={!compte} onClick={() => { toast('Caisse clôturée du 22 au 24 novembre.'); onClose(); }}>Clôturer la caisse</Button></>}
    >
      <dl className="divide-y divide-papier-ligne rounded-xl bg-papier px-4 text-sm">
        {[['Solde d’ouverture (21/11)', 1_247_500], ['Entrées en espèces', 168_000], ['Sorties en espèces', -33_500]].map(([k, v]) => (
          <div key={k as string} className="flex justify-between py-2.5"><dt className="text-encre-doux">{k}</dt><dd className="font-semibold chiffres">{(v as number) < 0 ? '− ' : ''}{fcfa(Math.abs(v as number))}</dd></div>
        ))}
        <div className="flex justify-between py-3"><dt className="font-semibold">Solde théorique</dt><dd className="font-display text-lg font-bold chiffres">{fcfa(theorique)}</dd></div>
      </dl>
      <label htmlFor="compte" className="field-label mt-5">Espèces comptées (FCFA)</label>
      <input id="compte" inputMode="numeric" value={compte} onChange={(e) => setCompte(e.target.value.replace(/\D/g, ''))} className="field-input font-display text-xl font-bold chiffres" autoFocus />
      {compte && (
        <p className={clsx('mt-3 rounded-lg px-3 py-2.5 text-sm font-semibold', ecart === 0 ? 'bg-valide-50 text-valide-700' : 'bg-stylo-50 text-stylo-700')}>
          {ecart === 0 ? 'Aucun écart : la caisse est juste.' : `Écart de ${ecart > 0 ? '+' : '−'} ${fcfa(Math.abs(ecart))}. Il sera signalé à l’administrateur.`}
        </p>
      )}
    </Modal>
  );
}
