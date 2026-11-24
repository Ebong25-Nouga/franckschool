import clsx from 'clsx';
import { Check, Plus, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../auth';
import { Avatar, Button, Modal, PageHeader, Panel, Pill, Segmented, useToast } from '../../components/ui';
import { demandesRemboursement, eleves, fcfa } from '../../data/demo';

type Statut = 'en_attente' | 'approuvee' | 'refusee' | 'executee';
const statuts: Record<Statut, { tone: 'feutre' | 'encre' | 'stylo' | 'valide'; label: string }> = {
  en_attente: { tone: 'feutre', label: 'À décider' },
  approuvee: { tone: 'encre', label: 'Approuvée, à exécuter' },
  refusee: { tone: 'stylo', label: 'Refusée' },
  executee: { tone: 'valide', label: 'Remboursée' },
};
type Demande = { id: number; eleve: string; classe: string; montant: number; motif: string; demandeur: string; date: string; paiement: string; statut: Statut; decision?: string };

function Circuit({ statut }: { statut: Statut }) {
  const etapes = ['Demandée', statut === 'refusee' ? 'Refusée' : 'Approuvée', 'Remboursée'];
  const atteint = statut === 'en_attente' ? 1 : statut === 'executee' ? 3 : 2;
  return (
    <ol className="flex items-center" aria-label="Circuit du remboursement">
      {etapes.map((e, i) => {
        const fait = i < atteint;
        const refus = statut === 'refusee' && i === 1;
        return (
          <li key={e} className="flex items-center">
            <span className={clsx('flex items-center gap-1.5 text-xs font-semibold', refus ? 'text-stylo' : fait ? 'text-brand-800' : 'text-encre-pale')}>
              <span className={clsx('grid size-5 place-items-center rounded-full', refus ? 'bg-stylo text-white' : fait ? 'bg-brand-700 text-white' : 'bg-papier-2')}>
                {refus ? <X className="size-3" aria-hidden /> : fait ? <Check className="size-3" aria-hidden /> : <span className="size-1.5 rounded-full bg-encre-pale" />}
              </span>
              {e}
            </span>
            {i < 2 && <span className={clsx('mx-2 h-[2px] w-6 rounded-full sm:w-10', i < atteint - 1 && !refus ? 'bg-brand-600' : 'bg-papier-2')} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export default function Remboursements() {
  const toast = useToast();
  const { session } = useAuth();
  const estAdmin = session?.espace === 'admin';
  const [demandes, setDemandes] = useState<Demande[]>(demandesRemboursement.map((d) => ({ ...d, statut: d.statut as Statut })));
  const [filtre, setFiltre] = useState<'actives' | 'toutes'>('actives');
  const [refus, setRefus] = useState<Demande | null>(null);
  const [nouvelle, setNouvelle] = useState(false);

  const maj = (id: number, statut: Statut, extra: Partial<Demande> = {}) => setDemandes((ds) => ds.map((d) => (d.id === id ? { ...d, statut, ...extra } : d)));
  const visibles = demandes.filter((d) => filtre === 'toutes' || d.statut === 'en_attente' || d.statut === 'approuvee');

  return (
    <>
      <PageHeader
        title="Remboursements"
        lead={estAdmin ? 'Les secrétaires préparent les demandes, vous décidez. Un refus ne crée aucun mouvement dans la caisse.' : 'Préparez une demande. Vous pourrez rembourser seulement après l’accord de l’administrateur.'}
        actions={!estAdmin && <Button icon={Plus} onClick={() => setNouvelle(true)}>Nouvelle demande</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Filtrer" value={filtre} onChange={setFiltre} options={[{ value: 'actives', label: 'En cours', count: demandes.filter((d) => d.statut === 'en_attente' || d.statut === 'approuvee').length }, { value: 'toutes', label: 'Historique complet', count: demandes.length }]} />
        <p className="text-sm text-encre-doux">En attente : <b className="text-encre chiffres">{fcfa(demandes.filter((d) => d.statut === 'en_attente').reduce((s, d) => s + d.montant, 0))}</b></p>
      </div>

      <div className="space-y-4">
        {visibles.map((d) => (
          <Panel key={d.id} as="article" className={clsx('overflow-hidden', d.statut === 'en_attente' && estAdmin && 'ring-2 ring-feutre')}>
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto]">
              <div className="flex gap-4">
                <Avatar name={d.eleve} size="lg" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="font-display text-lg font-bold tracking-[-0.01em]">{d.eleve}</h2>
                    <span className="text-sm text-encre-doux">{d.classe}</span>
                    <Pill tone={statuts[d.statut].tone}>{statuts[d.statut].label}</Pill>
                  </div>
                  <p className="mt-1.5 max-w-xl leading-relaxed text-encre">{d.motif}</p>
                  <p className="mt-1.5 text-[13px] text-encre-doux">Demandée par {d.demandeur} le {d.date} · paiement d’origine <span className="font-mono text-xs">{d.paiement}</span></p>
                  {d.decision && <p className="mt-2 rounded-lg bg-stylo-50 px-3 py-2 text-[13px] text-stylo-700">Motif du refus : {d.decision}</p>}
                </div>
              </div>
              <p className="font-display text-[30px] font-extrabold leading-none tracking-[-0.03em] chiffres lg:text-right">{fcfa(d.montant)}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-papier-ligne/70 bg-papier/50 px-5 py-3.5 sm:px-6">
              <Circuit statut={d.statut} />
              <div className="flex gap-2">
                {estAdmin && d.statut === 'en_attente' && (
                  <>
                    <Button size="sm" variant="secondary" icon={X} onClick={() => setRefus(d)}>Refuser</Button>
                    <Button size="sm" variant="success" icon={Check} onClick={() => { maj(d.id, 'approuvee'); toast(`Remboursement de ${d.eleve} approuvé. La secrétaire est prévenue.`); }}>Approuver</Button>
                  </>
                )}
                {!estAdmin && d.statut === 'approuvee' && (
                  <Button size="sm" icon={Send} onClick={() => { maj(d.id, 'executee'); toast(`${fcfa(d.montant)} remboursés à ${d.eleve}. Opération TR-000483 créée.`); }}>Rembourser maintenant</Button>
                )}
                {!estAdmin && d.statut === 'en_attente' && <span className="text-[13px] font-medium text-encre-doux">En attente de l’administrateur</span>}
                {estAdmin && d.statut === 'approuvee' && <span className="text-[13px] font-medium text-encre-doux">La secrétaire peut rembourser</span>}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {refus && <RefusModal demande={refus} onClose={() => setRefus(null)} onConfirm={(m) => { maj(refus.id, 'refusee', { decision: m }); toast('Demande refusée. Aucun mouvement financier.'); setRefus(null); }} />}
      {nouvelle && <NouvelleDemande onClose={() => setNouvelle(false)} onCreate={(d) => { setDemandes([d, ...demandes]); toast('Demande envoyée à l’administrateur.'); setNouvelle(false); }} />}
    </>
  );
}

function RefusModal({ demande, onClose, onConfirm }: { demande: Demande; onClose: () => void; onConfirm: (motif: string) => void }) {
  const [m, setM] = useState('');
  return (
    <Modal title="Refuser la demande" lead={`${demande.eleve}, ${fcfa(demande.montant)}`} onClose={onClose} width="max-w-md" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button variant="danger" disabled={m.trim().length < 5} onClick={() => onConfirm(m)}>Refuser la demande</Button></>}>
      <label htmlFor="motif-refus" className="field-label">Motif du refus</label>
      <textarea id="motif-refus" rows={3} value={m} onChange={(e) => setM(e.target.value)} className="field-input py-2.5" placeholder="Ce motif sera visible par la secrétaire." />
      <p className="field-hint">Un refus ne crée aucun mouvement dans la caisse.</p>
    </Modal>
  );
}

function NouvelleDemande({ onClose, onCreate }: { onClose: () => void; onCreate: (d: Demande) => void }) {
  const [eleve, setEleve] = useState(eleves[10].id);
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');
  const e = eleves.find((x) => x.id === eleve)!;
  return (
    <Modal
      title="Nouvelle demande de remboursement"
      lead="Elle sera envoyée à l’administrateur pour décision."
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button icon={Send} disabled={!montant || motif.trim().length < 5} onClick={() => onCreate({ id: Date.now(), eleve: `${e.nom} ${e.prenom}`, classe: e.classe, montant: Number(montant), motif, demandeur: 'Nadine Ekotto', date: '24/11/2026', statut: 'en_attente', paiement: 'TR-000482' })}>Envoyer la demande</Button></>}
    >
      <div className="grid gap-4">
        <div><label htmlFor="n-eleve" className="field-label">Élève</label><select id="n-eleve" value={eleve} onChange={(x) => setEleve(Number(x.target.value))} className="field-input">{eleves.slice(0, 20).map((x) => <option key={x.id} value={x.id}>{x.nom} {x.prenom}, {x.classe}</option>)}</select></div>
        <div><label htmlFor="n-montant" className="field-label">Montant à rembourser (FCFA)</label><input id="n-montant" inputMode="numeric" value={montant} onChange={(x) => setMontant(x.target.value.replace(/\D/g, ''))} className="field-input font-display text-lg font-bold chiffres" /></div>
        <div><label htmlFor="n-motif" className="field-label">Motif</label><textarea id="n-motif" rows={3} value={motif} onChange={(x) => setMotif(x.target.value)} className="field-input py-2.5" placeholder="Ex. Frais d’examen payés deux fois" /></div>
      </div>
    </Modal>
  );
}
