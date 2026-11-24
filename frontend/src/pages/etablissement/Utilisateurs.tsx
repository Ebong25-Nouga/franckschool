import { ShieldCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Badge, Button, Card, CardHeader, PageHeader } from '../../components/ui';

const modules = [
  { code: 'eleves', label: 'Élèves et inscriptions' },
  { code: 'classes', label: 'Classes et matières' },
  { code: 'notes', label: 'Notes (consultation)' },
  { code: 'bulletins', label: 'Bulletins' },
  { code: 'caisse', label: 'Caisse : encaisser' },
  { code: 'remboursements', label: 'Remboursements : faire une demande' },
  { code: 'absences', label: 'Absences et retards' },
];

const comptes = [
  { id: 1, nom: 'Jean-Pierre Manga', role: 'Administrateur', email: 'admin@etoiles.cm', actif: true, perms: modules.map((m) => m.code) },
  { id: 2, nom: 'Nadine Ekotto', role: 'Secrétaire', email: 'secretaire@etoiles.cm', actif: true, perms: ['eleves', 'caisse', 'remboursements', 'absences'] },
  { id: 3, nom: 'Paul Biyong', role: 'Secrétaire', email: 'paul.b@etoiles.cm', actif: true, perms: ['eleves', 'classes', 'bulletins'] },
  { id: 4, nom: 'Carine Tagne', role: 'Secrétaire', email: 'carine.t@etoiles.cm', actif: false, perms: ['eleves'] },
];

export default function Utilisateurs() {
  const [selection, setSelection] = useState(2);
  const [donnees, setDonnees] = useState(comptes);
  const c = donnees.find((x) => x.id === selection)!;
  const admin = c.role === 'Administrateur';

  const basculer = (code: string) =>
    setDonnees((ds) => ds.map((d) => (d.id === selection ? { ...d, perms: d.perms.includes(code) ? d.perms.filter((p) => p !== code) : [...d.perms, code] } : d)));

  return (
    <>
      <PageHeader title="Utilisateurs et droits" subtitle="Créez les comptes de vos secrétaires et choisissez précisément ce que chacune peut faire." actions={<Button icon={UserPlus}>Créer un compte secrétaire</Button>} />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Comptes de l’établissement" subtitle={`${donnees.length} comptes administratifs`} />
          <ul className="divide-y divide-slate-100 p-2">
            {donnees.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => setSelection(d.id)}
                  aria-pressed={selection === d.id}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${selection === d.id ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-slate-50'}`}
                >
                  <Avatar name={d.nom} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{d.nom}</p>
                    <p className="truncate text-xs text-slate-500">{d.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={d.role === 'Administrateur' ? 'brand' : 'slate'}>{d.role}</Badge>
                    {!d.actif && <Badge tone="red">Désactivé</Badge>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title={`Permissions de ${c.nom}`} subtitle={admin ? 'L’administrateur dispose de tous les droits de l’établissement.' : 'Cochez les modules accessibles. Le menu de la secrétaire s’adapte automatiquement.'} />
          <fieldset className="p-5" disabled={admin}>
            <legend className="sr-only">Permissions</legend>
            <ul className="grid gap-3 sm:grid-cols-2">
              {modules.map((m) => {
                const actif = c.perms.includes(m.code);
                return (
                  <li key={m.code}>
                    <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${actif ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200 hover:border-slate-300'} ${admin ? 'cursor-not-allowed opacity-70' : ''}`}>
                      <input type="checkbox" checked={actif} onChange={() => basculer(m.code)} className="size-4 cursor-pointer rounded border-slate-300 accent-brand-800" />
                      <span className="font-medium text-slate-800">{m.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <ShieldCheck className="size-5 shrink-0 text-brand-700" aria-hidden />
              <p>Le remboursement direct n’est jamais accordé à une secrétaire : elle fait une demande, et l’administrateur décide. Chaque modification de droits est enregistrée dans le journal.</p>
            </div>
            {!admin && (
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary">{c.actif ? 'Désactiver le compte' : 'Réactiver le compte'}</Button>
                <Button>Enregistrer les droits</Button>
              </div>
            )}
          </fieldset>
        </Card>
      </div>
    </>
  );
}
