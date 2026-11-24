import { Banknote, CalendarClock, Download, GraduationCap, Info, MapPin, Phone, Receipt } from 'lucide-react';
import { Avatar, Badge, Card, CardHeader, PageHeader, Progress, StatCard } from '../../components/ui';
import { ecole, fcfa } from '../../data/demo';

const enfants = [
  { nom: 'MBARGA Marie-Claire', classe: '4ème A', pp: 'Mme ABENA Lucie', du: 150000, paye: 125000, prochaine: { libelle: '3e tranche', montant: 25000, date: '15/01/2027' } },
  { nom: 'MBARGA Junior', classe: '6ème B', pp: 'Mme NGO BASSA Rose', du: 150000, paye: 150000, prochaine: null },
];

const recus = [
  { numero: 'REC-000482', date: '24/11/2026', enfant: 'Marie-Claire', libelle: 'Scolarité — 2e tranche', mode: 'MTN MoMo', montant: 50000 },
  { numero: 'REC-000311', date: '02/10/2026', enfant: 'Junior', libelle: 'Scolarité — solde', mode: 'Espèces', montant: 75000 },
  { numero: 'REC-000108', date: '05/09/2026', enfant: 'Marie-Claire', libelle: 'Inscription + 1re tranche', mode: 'Orange Money', montant: 100000 },
];

export function TableauParent() {
  const reste = enfants.reduce((s, e) => s + e.du - e.paye, 0);
  return (
    <>
      <PageHeader title="Bonjour, Mme Mbarga" subtitle={`${ecole.nom} · année ${ecole.annee}`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Enfants inscrits" value={String(enfants.length)} icon={GraduationCap} />
        <StatCard label="Total payé" value={fcfa(enfants.reduce((s, e) => s + e.paye, 0))} icon={Banknote} tone="green" />
        <StatCard label="Reste à payer" value={fcfa(reste)} icon={CalendarClock} tone={reste ? 'amber' : 'green'} hint={reste ? 'Prochaine échéance : 15/01/2027' : 'Tout est réglé'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {enfants.map((e) => (
          <Card key={e.nom} className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={e.nom} className="size-12 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{e.nom}</p>
                <p className="text-sm text-slate-500">{e.classe} · Prof. principal : {e.pp}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-slate-600">Scolarité payée</span>
              <Progress value={Math.round((e.paye / e.du) * 100)} label={`Scolarité de ${e.nom}`} />
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
              {e.prochaine ? (
                <p className="text-slate-700">Prochaine échéance : <strong>{e.prochaine.libelle}</strong>, {fcfa(e.prochaine.montant)} avant le <strong>{e.prochaine.date}</strong></p>
              ) : (
                <p className="font-medium text-emerald-700">Scolarité entièrement réglée. Merci !</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-900">
        <Info className="size-5 shrink-0" aria-hidden />
        <p>Les notes et bulletins pourront s’afficher ici quand l’établissement l’aura activé (point à confirmer dans le document maître).</p>
      </div>
    </>
  );
}

export function PaiementsParent() {
  return (
    <>
      <PageHeader title="Paiements et reçus" subtitle="Historique de vos paiements et reçus téléchargeables" />
      <Card>
        <CardHeader title="Reçus" subtitle="Année 2026-2027" />
        <ul className="divide-y divide-slate-100">
          {recus.map((r) => (
            <li key={r.numero} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Receipt className="size-5" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{r.libelle} — {r.enfant}</p>
                <p className="text-xs text-slate-500">{r.date} · {r.mode} · <span className="font-mono">{r.numero}</span></p>
              </div>
              <span className="font-bold tabular-nums text-slate-900">{fcfa(r.montant)}</span>
              <button className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" aria-label={`Télécharger le reçu ${r.numero}`}>
                <Download className="size-4" aria-hidden /> PDF
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

export function EcoleParent() {
  return (
    <>
      <PageHeader title="L’établissement" />
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900">{ecole.nom}</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex items-center gap-2"><MapPin className="size-4 text-brand-700" aria-hidden /> Quartier Bastos, {ecole.ville}</li>
          <li className="flex items-center gap-2"><Phone className="size-4 text-brand-700" aria-hidden /> +237 222 20 30 40</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone="brand">Année {ecole.annee}</Badge>
          <Badge tone="slate">{ecole.periodeCourante}</Badge>
        </div>
      </Card>
    </>
  );
}
