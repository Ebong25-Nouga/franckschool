import { ArrowDownCircle, ArrowUpCircle, Banknote, FileDown, Lock, Plus, Printer, Smartphone, Undo2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, CardHeader, PageHeader, Select, StatCard, Table, Td } from '../../components/ui';
import { fcfa, transactions } from '../../data/demo';

const typeInfo = {
  recette: { tone: 'green', label: 'Recette', icon: ArrowUpCircle, color: 'text-emerald-600', signe: '+' },
  depense: { tone: 'red', label: 'Dépense', icon: ArrowDownCircle, color: 'text-red-600', signe: '−' },
  remboursement: { tone: 'amber', label: 'Remboursement', icon: Undo2, color: 'text-amber-600', signe: '−' },
} as const;

export default function Caisse() {
  const [type, setType] = useState('Tous les types');
  const [mode, setMode] = useState('Tous les modes');
  const liste = transactions.filter(
    (t) => (type === 'Tous les types' || typeInfo[t.type].label === type) && (mode === 'Tous les modes' || t.mode === mode),
  );

  return (
    <>
      <PageHeader
        title="Caisse"
        subtitle="Recettes, dépenses et remboursements de l’année 2026-2027"
        actions={
          <>
            <Button variant="secondary" icon={FileDown}>Rapport PDF</Button>
            <Button variant="secondary" icon={Lock}>Clôturer la caisse</Button>
            <Button icon={Plus}>Nouvelle opération</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Solde total" value={fcfa(4_215_400)} icon={Wallet} />
        <StatCard label="Espèces en caisse" value={fcfa(1_382_000)} icon={Banknote} tone="green" hint="Dernière clôture : 21/11/2026" />
        <StatCard label="Mobile Money et banque" value={fcfa(2_833_400)} icon={Smartphone} tone="slate" hint="MTN MoMo · Orange Money · Banque" />
        <StatCard label="Impayés scolarité" value={fcfa(27_450_000)} icon={ArrowDownCircle} tone="red" hint="186 élèves avec un reste à payer" />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Journal des opérations"
          subtitle="Une opération confirmée n’est jamais supprimée : toute correction laisse une trace."
          action={
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
              <Select hideLabel label="Type d’opération" value={type} onChange={setType} options={['Tous les types', 'Recette', 'Dépense', 'Remboursement']} />
              <Select hideLabel label="Mode de paiement" value={mode} onChange={setMode} options={['Tous les modes', 'Espèces', 'MTN MoMo', 'Orange Money', 'Banque']} />
            </div>
          }
        />
        <Table caption="Journal des opérations de caisse" head={['Opération', 'Date', 'Type', 'Mode', 'Auteur', 'Montant', '']}>
          {liste.map((t) => {
            const info = typeInfo[t.type];
            return (
              <tr key={t.id} className="hover:bg-slate-50/80">
                <Td>
                  <div className="flex items-center gap-3">
                    <info.icon className={`size-5 shrink-0 ${info.color}`} aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{t.libelle}</p>
                      <p className="text-xs text-slate-500">{t.eleve ?? 'Dépense de fonctionnement'} · <span className="font-mono">{t.numero}</span></p>
                    </div>
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-slate-600">{new Date(t.date.replace(' ', 'T')).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</Td>
                <Td><Badge tone={info.tone}>{info.label}</Badge></Td>
                <Td className="whitespace-nowrap">{t.mode}</Td>
                <Td className="whitespace-nowrap text-slate-600">{t.auteur}</Td>
                <Td className={`whitespace-nowrap text-right font-semibold tabular-nums ${info.color}`}>{info.signe} {fcfa(t.montant)}</Td>
                <Td className="text-right">
                  {t.type === 'recette' && (
                    <button className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-800" aria-label={`Imprimer le reçu ${t.numero}`}>
                      <Printer className="size-4" />
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
