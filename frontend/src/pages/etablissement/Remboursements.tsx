import { Check, CheckCircle2, Clock, Plus, Send, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../auth';
import { Badge, Button, Card, PageHeader } from '../../components/ui';
import { demandesRemboursement, fcfa } from '../../data/demo';

type Statut = 'en_attente' | 'approuvee' | 'refusee' | 'executee';
const statuts: Record<Statut, { tone: 'amber' | 'brand' | 'red' | 'green'; label: string }> = {
  en_attente: { tone: 'amber', label: 'En attente de décision' },
  approuvee: { tone: 'brand', label: 'Approuvée — à exécuter' },
  refusee: { tone: 'red', label: 'Refusée' },
  executee: { tone: 'green', label: 'Exécutée' },
};

const etapes = ['Demande', 'Décision', 'Exécution'];

export default function Remboursements() {
  const { session } = useAuth();
  const estAdmin = session?.espace === 'admin';
  const [demandes, setDemandes] = useState(demandesRemboursement.map((d) => ({ ...d, statut: d.statut as Statut })));
  const [annonce, setAnnonce] = useState('');

  const changer = (id: number, statut: Statut, message: string) => {
    setDemandes((ds) => ds.map((d) => (d.id === id ? { ...d, statut } : d)));
    setAnnonce(message);
  };

  return (
    <>
      <PageHeader
        title="Demandes de remboursement"
        subtitle={estAdmin ? 'Approuvez ou refusez les demandes des secrétaires. Un refus ne crée aucun mouvement financier.' : 'Préparez une demande : elle sera exécutée seulement après l’approbation de l’administrateur.'}
        actions={!estAdmin && <Button icon={Plus}>Nouvelle demande</Button>}
      />

      <p role="status" aria-live="polite" className="sr-only">{annonce}</p>
      {annonce && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" aria-hidden /> {annonce}
        </div>
      )}

      <div className="space-y-4">
        {demandes.map((d) => {
          const etape = d.statut === 'en_attente' ? 1 : d.statut === 'executee' ? 3 : 2;
          return (
            <Card key={d.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{d.eleve}</h2>
                    <span className="text-sm text-slate-500">{d.classe}</span>
                    <Badge tone={statuts[d.statut].tone}>{statuts[d.statut].label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{d.motif}</p>
                  <p className="mt-1 text-xs text-slate-500">Demandée par {d.demandeur} le {new Date(d.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <p className="text-xl font-bold tabular-nums text-slate-900">{fcfa(d.montant)}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                <ol className="flex items-center gap-2 text-xs" aria-label="Étapes du remboursement">
                  {etapes.map((e, i) => {
                    const fait = i < etape;
                    const refus = d.statut === 'refusee' && i === 1;
                    return (
                      <li key={e} className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${refus ? 'bg-red-50 text-red-700' : fait ? 'bg-brand-50 text-brand-800' : 'bg-slate-100 text-slate-500'}`}>
                          {refus ? <XCircle className="size-3.5" aria-hidden /> : fait ? <Check className="size-3.5" aria-hidden /> : <Clock className="size-3.5" aria-hidden />}
                          {e}
                        </span>
                        {i < etapes.length - 1 && <span className="h-px w-4 bg-slate-300" aria-hidden />}
                      </li>
                    );
                  })}
                </ol>

                <div className="flex gap-2">
                  {estAdmin && d.statut === 'en_attente' && (
                    <>
                      <Button size="sm" variant="secondary" icon={X} onClick={() => changer(d.id, 'refusee', `Demande de ${d.eleve} refusée. Aucun mouvement financier.`)}>Refuser</Button>
                      <Button size="sm" variant="success" icon={Check} onClick={() => changer(d.id, 'approuvee', `Demande de ${d.eleve} approuvée. La secrétaire peut l’exécuter.`)}>Approuver</Button>
                    </>
                  )}
                  {!estAdmin && d.statut === 'approuvee' && (
                    <Button size="sm" icon={Send} onClick={() => changer(d.id, 'executee', `Remboursement de ${fcfa(d.montant)} exécuté et enregistré dans la caisse.`)}>Effectuer le remboursement</Button>
                  )}
                  {!estAdmin && d.statut === 'en_attente' && <span className="text-xs text-slate-500">En attente de l’administrateur</span>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
