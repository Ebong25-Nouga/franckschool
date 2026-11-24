import clsx from 'clsx';
import { Check, Copy, Download, Mail, MapPin, Phone, Receipt, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Avatar, Button, Gauge, PageHeader, Panel, PanelHead, Pill, useToast } from '../../components/kit';
import { ecole, fcfa } from '../../data/demo';

const enfants = [
  {
    id: 1, prenom: 'Marie-Claire', nom: 'MBARGA', classe: '4ème A', pp: 'Mme ABENA Lucie', du: 150000, paye: 125000,
    tranches: [
      { l: 'Inscription', m: 25000, d: '05/09', ok: true },
      { l: '1re tranche', m: 50000, d: '30/09', ok: true },
      { l: '2e tranche', m: 50000, d: '30/11', ok: true },
      { l: '3e tranche', m: 25000, d: '15/01', ok: false },
    ],
  },
  {
    id: 2, prenom: 'Junior', nom: 'MBARGA', classe: '6ème B', pp: 'Mme EYENGA Rachel', du: 150000, paye: 150000,
    tranches: [
      { l: 'Inscription', m: 25000, d: '05/09', ok: true },
      { l: '1re tranche', m: 50000, d: '30/09', ok: true },
      { l: '2e tranche', m: 50000, d: '30/11', ok: true },
      { l: '3e tranche', m: 25000, d: '15/01', ok: true },
    ],
  },
];

const recus = [
  { numero: 'REC-000482', date: '24 nov. 2026', enfant: 'Marie-Claire', libelle: 'Scolarité, 2e tranche', mode: 'MTN MoMo', montant: 50000 },
  { numero: 'REC-000311', date: '02 oct. 2026', enfant: 'Junior', libelle: 'Scolarité, solde', mode: 'Espèces', montant: 75000 },
  { numero: 'REC-000187', date: '28 sept. 2026', enfant: 'Marie-Claire', libelle: 'Scolarité, 1re tranche', mode: 'Orange Money', montant: 50000 },
  { numero: 'REC-000108', date: '05 sept. 2026', enfant: 'Junior', libelle: 'Inscription et 1re tranche', mode: 'Espèces', montant: 75000 },
];

export function TableauParent() {
  const toast = useToast();
  const [sel, setSel] = useState(1);
  const e = enfants.find((x) => x.id === sel)!;
  const reste = e.du - e.paye;
  const prochaine = e.tranches.find((t) => !t.ok);

  return (
    <>
      <PageHeader kicker={`${ecole.nom}, année ${ecole.annee}`} title="Bonjour, Madame Mbarga" />

      <div className="mb-6 flex flex-wrap gap-3" role="tablist" aria-label="Choisir un enfant">
        {enfants.map((x) => (
          <button key={x.id} role="tab" aria-selected={sel === x.id} onClick={() => setSel(x.id)} className={clsx('flex cursor-pointer items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-5 text-left transition-colors', sel === x.id ? 'bg-brand-700 text-white shadow-encre' : 'bg-white shadow-feuille hover:ring-1 hover:ring-brand-200')}>
            <Avatar name={`${x.prenom} ${x.nom}`} />
            <span><span className="block font-semibold">{x.prenom}</span><span className={clsx('block text-xs', sel === x.id ? 'text-brand-100' : 'text-encre-doux')}>{x.classe}</span></span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className={clsx('relative overflow-hidden rounded-[22px] p-6 shadow-leve sm:p-7', reste ? 'seyes bg-brand-950 text-white' : 'bg-valide text-white')}>
          <p className="text-sm font-medium opacity-80">Reste à payer pour {e.prenom}</p>
          <p className="mt-2 font-display text-[48px] font-extrabold leading-none tracking-[-0.04em] chiffres">{reste ? fcfa(reste).replace(' FCFA', '') : '0'}<span className="ml-2 text-lg font-semibold tracking-normal opacity-80">FCFA</span></p>
          {prochaine ? (
            <p className="mt-3 text-[15px] opacity-90">{prochaine.l} à régler avant le <b>{prochaine.d}/2027</b>.</p>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-[15px]"><Check className="size-5" aria-hidden />Scolarité entièrement réglée. Merci.</p>
          )}
          {reste > 0 && (
            <div className="mt-6 rounded-2xl bg-white p-4 text-encre">
              <p className="flex items-center gap-2 text-sm font-semibold"><Smartphone className="size-4 text-[#7A5B00]" aria-hidden />Payer par MTN Mobile Money</p>
              <p className="mt-1 text-[13px] text-encre-doux">Composez le code ci-dessous, puis indiquez le matricule de l’élève en motif. Le reçu arrive dans votre espace.</p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-papier px-3 py-2 font-mono text-[15px] font-bold">*126*4*482137#</code>
                <Button size="sm" variant="secondary" icon={Copy} onClick={() => { navigator.clipboard?.writeText('*126*4*482137#').catch(() => {}); toast('Code de paiement copié.'); }}>Copier</Button>
              </div>
              <p className="mt-2 text-xs text-encre-doux">Motif : <span className="font-mono font-semibold text-encre">CBE26-0001</span></p>
            </div>
          )}
        </section>

        <Panel>
          <PanelHead title="Échéancier" hint={`Scolarité de ${e.classe} : ${fcfa(e.du)}`} />
          <ol className="px-6 pb-6">
            {e.tranches.map((t, i) => (
              <li key={t.l} className="relative flex items-center gap-4 pb-5 last:pb-0">
                {i < e.tranches.length - 1 && <span className={clsx('absolute left-[13px] top-7 h-[calc(100%-12px)] w-[2px]', t.ok ? 'bg-valide' : 'bg-papier-2')} aria-hidden />}
                <span className={clsx('relative grid size-7 shrink-0 place-items-center rounded-full', t.ok ? 'bg-valide text-white' : 'bg-white text-encre-pale ring-2 ring-papier-ligne')}>
                  {t.ok ? <Check className="size-4" aria-hidden /> : <span className="size-2 rounded-full bg-stylo" />}
                </span>
                <div className="flex-1"><p className="font-semibold">{t.l}</p><p className="text-[13px] text-encre-doux">Avant le {t.d}</p></div>
                <span className={clsx('font-display font-bold chiffres', !t.ok && 'text-stylo')}>{fcfa(t.m)}</span>
              </li>
            ))}
          </ol>
          <div className="border-t border-papier-ligne/70 px-6 py-4"><Gauge value={(e.paye / e.du) * 100} label="Scolarité payée" /></div>
        </Panel>
      </div>

      <Panel className="mt-6 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={e.pp} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-encre-doux">Professeur principal de {e.prenom}</p>
            <p className="font-semibold">{e.pp}</p>
          </div>
          <Pill tone="neutre" dot={false}>Notes et bulletins : bientôt</Pill>
        </div>
      </Panel>
    </>
  );
}

export function PaiementsParent() {
  const toast = useToast();
  return (
    <>
      <PageHeader title="Paiements et reçus" lead="Tous vos paiements de l’année. Chaque reçu est numéroté et téléchargeable." />
      <Panel>
        <ul className="divide-y divide-papier-ligne/70">
          {recus.map((r) => (
            <li key={r.numero} className="flex flex-wrap items-center gap-4 px-6 py-4">
              <span className="grid size-11 place-items-center rounded-xl bg-valide-50 text-valide"><Receipt className="size-5" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{r.libelle}, {r.enfant}</p>
                <p className="text-[13px] text-encre-doux">{r.date} · {r.mode} · <span className="font-mono text-xs">{r.numero}</span></p>
              </div>
              <span className="font-display text-lg font-bold chiffres">{fcfa(r.montant)}</span>
              <Button size="sm" variant="secondary" icon={Download} onClick={() => toast(`Reçu ${r.numero} téléchargé.`)} aria-label={`Télécharger le reçu ${r.numero}`}>PDF</Button>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

export function EcoleParent() {
  return (
    <>
      <PageHeader title="L’établissement" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="seyes relative overflow-hidden rounded-[22px] bg-brand-950 p-7 text-white shadow-leve">
          <img src="/logo.svg" alt="" className="size-14 rounded-2xl" />
          <h2 className="mt-5 font-display text-[28px] font-bold leading-tight tracking-[-0.03em]">{ecole.nom}</h2>
          <p className="mt-1 text-brand-200">{ecole.devise}</p>
          <ul className="mt-6 space-y-3 text-[15px]">
            <li className="flex items-center gap-3"><MapPin className="size-4 text-brand-300" aria-hidden />Quartier {ecole.quartier}, {ecole.ville}</li>
            <li className="flex items-center gap-3"><Phone className="size-4 text-brand-300" aria-hidden /><span className="select-all">{ecole.telephone}</span></li>
            <li className="flex items-center gap-3"><Mail className="size-4 text-brand-300" aria-hidden /><span className="select-all">{ecole.email}</span></li>
          </ul>
        </section>
        <Panel>
          <PanelHead title="Calendrier du trimestre" />
          <ul className="divide-y divide-papier-ligne/70 px-6 pb-4">
            {[['05 déc.', 'Fin des compositions de la séquence 2'], ['12 déc.', 'Remise des bulletins du 1er trimestre'], ['19 déc.', 'Début des congés de Noël'], ['05 janv.', 'Rentrée, début de la séquence 3']].map(([d, t]) => (
              <li key={d} className="flex gap-4 py-3.5"><span className="w-16 shrink-0 font-display font-bold text-brand-700">{d}</span><span>{t}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
