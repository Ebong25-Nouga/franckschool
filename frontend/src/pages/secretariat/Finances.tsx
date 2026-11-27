import { Ban, Banknote, BellRing, CheckCircle2, Lock, Paperclip, Plus, Printer, Receipt, Smartphone, Undo2, Vault, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bloc, Chiffre, Titre } from '@/components/espace';
import { Button, EmptyState, Gauge, IconButton, Modal, Pill, SearchInput, Segmented, Table, Td, useToast } from '@/components/kit';
import type { Mode } from '@/data/demo';
import { entete, html, imprimer } from '@/lib/imprimer';
import { Champ, ChoisirEleve, dateFr, dateHeureFr, Grille, Liste, ModalMotif, montant, nombre, nomEleve, Note, Saisie, useDroit, Zone } from './commun';
import { isoJour, type Operation, type StatutRemboursement } from './donnees';
import { aujourdhui, useSecretariat, visibles } from './store';

const modes: Mode[] = ['Espèces', 'MTN MoMo', 'Orange Money', 'Banque'];
const motifs = ['Inscription', 'Scolarité, 1re tranche', 'Scolarité, 2e tranche', 'Scolarité, 3e tranche', 'APE', "Frais d'examen", 'Tenue scolaire', 'Autre'];
const signe = (o: Operation, ops: Operation[]) => {
  if (o.type === 'recette') return 1;
  if (o.type === 'annulation') return ops.find((x) => x.numero === o.origine)?.type === 'recette' ? -1 : 1;
  return -1;
};

export function recu(o: Operation, reste?: number) {
  imprimer(`Reçu ${o.numero}`, `${entete('Reçu de paiement', o.numero)}
    <table>
      <tr><th>Reçu de</th><td class="gras">${html(o.eleve ?? '')}</td><th>Classe</th><td>${html(o.classe ?? '')}</td></tr>
      <tr><th>Motif</th><td>${html(o.libelle)}</td><th>Date</th><td>${html(dateHeureFr(o.date))}</td></tr>
      <tr><th>Mode</th><td>${html(o.mode)}</td><th>Référence</th><td>${html(o.reference ?? '—')}</td></tr>
    </table>
    <div class="encadre"><b style="font-size:16px">Montant reçu : ${html(montant(o.montant))}</b>${reste !== undefined ? `<br/>Reste à payer sur l’année : ${html(montant(reste))}` : ''}</div>
    <p>Encaissé par ${html(o.auteur)}. Ce reçu est la preuve du paiement : conservez-le.</p>
    <div class="signature"><div>Le parent<div class="ligne"></div></div><div>La caisse<div class="ligne"></div></div></div>`);
}

/* =========================================================
 * Caisse
 * ======================================================= */
export function Caisse() {
  const { etat, annulerOperation, journaliser } = useSecretariat();
  const peut = useDroit();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [onglet, setOnglet] = useState<'journal' | 'impayes'>(params.get('onglet') === 'impayes' ? 'impayes' : 'journal');
  const [encaisser, setEncaisser] = useState<number | 'oui' | null>(params.get('encaisser') ? Number(params.get('eleve')) || 'oui' : null);
  const [periode, setPeriode] = useState<'jour' | 'semaine' | 'tout'>('jour');
  const [mode, setMode] = useState('Tous');
  const [type, setType] = useState('Tous');
  const [q, setQ] = useState('');
  const [annuler, setAnnuler] = useState<Operation | null>(null);
  useEffect(() => {
    if ([...params.keys()].length) setParams({}, { replace: true });
  }, [params, setParams]);

  const jour = aujourdhui();
  const ilYa7 = isoJour(new Date(Date.now() - 6 * 864e5));
  const ops = etat.operations;
  const duJour = ops.filter((o) => o.date.startsWith(jour));
  const recettesJour = duJour.reduce((s, o) => s + (o.type === 'recette' || (o.type === 'annulation' && signe(o, ops) < 0) ? signe(o, ops) * o.montant : 0), 0);
  const parMode = (m: Mode) => duJour.filter((o) => o.mode === m).reduce((s, o) => s + signe(o, ops) * o.montant, 0);
  const cloturee = etat.clotures.some((c) => c.date === jour);
  const t = q.trim().toLowerCase();
  const liste = ops
    .filter((o) => (periode === 'jour' ? o.date.startsWith(jour) : periode === 'semaine' ? o.date.slice(0, 10) >= ilYa7 : true))
    .filter((o) => mode === 'Tous' || o.mode === mode)
    .filter((o) => type === 'Tous' || { Recettes: 'recette', Dépenses: 'depense', Remboursements: 'remboursement', Annulations: 'annulation' }[type] === o.type)
    .filter((o) => !t || `${o.numero} ${o.libelle} ${o.eleve ?? ''} ${o.reference ?? ''}`.toLowerCase().includes(t))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const impayes = visibles(etat.eleves).filter((e) => e.situation === 'inscrit' && e.paye < e.du).sort((a, b) => b.du - b.paye - (a.du - a.paye));

  return (
    <>
      <Titre titre="Caisse" texte="Encaissez les paiements, imprimez les reçus et suivez les impayés. Une opération n’est jamais effacée : on l’annule par une écriture inverse." action={<Button icon={Banknote} onClick={() => setEncaisser('oui')}>Encaisser un paiement</Button>} />
      {cloturee && <div className="mb-5"><Note ton="feutre">La caisse du jour est clôturée. Les nouvelles opérations seront comptées dans la clôture de demain.</Note></div>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Chiffre label="Recettes du jour" valeur={nombre(recettesJour)} unite="FCFA" icone={Wallet} ton="valide" detail={`${duJour.filter((o) => o.type === 'recette').length} paiement(s)`} />
        <Chiffre label="Espèces (mouvement du jour)" valeur={nombre(parMode('Espèces'))} unite="FCFA" icone={Banknote} />
        <Chiffre label="MTN MoMo et Orange Money" valeur={nombre(parMode('MTN MoMo') + parMode('Orange Money'))} unite="FCFA" icone={Smartphone} />
        <Chiffre label="Élèves avec un reste" valeur={String(impayes.length)} icone={Receipt} ton="stylo" detail={montant(impayes.reduce((s, e) => s + e.du - e.paye, 0))} />
      </div>
      <div className="mb-5"><Segmented label="Vue" value={onglet} onChange={setOnglet} options={[{ value: 'journal', label: 'Journal de caisse' }, { value: 'impayes', label: 'Impayés', count: impayes.length }]} /></div>

      {onglet === 'journal' ? (
        <section className="rounded-[22px] bg-white shadow-feuille">
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <Segmented label="Période" value={periode} onChange={setPeriode} options={[{ value: 'jour', label: 'Aujourd’hui' }, { value: 'semaine', label: '7 derniers jours' }, { value: 'tout', label: 'Tout' }]} />
            <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
              <SearchInput value={q} onChange={setQ} label="Rechercher" placeholder="N°, élève, libellé ou référence" />
              <Liste aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} options={['Tous', 'Recettes', 'Dépenses', 'Remboursements', 'Annulations']} />
              <Liste aria-label="Mode" value={mode} onChange={(e) => setMode(e.target.value)} options={['Tous', ...modes]} />
            </div>
          </div>
          {liste.length === 0 ? <EmptyState icon={Receipt} title="Aucune opération" text="Aucune opération sur cette période." /> : (
            <Table caption="Journal de caisse" head={['N° et date', 'Opération', 'Mode', 'Par', { label: 'Montant', align: 'right' }, { label: 'Actions', sr: true }]} minWidth={920}>
              {liste.map((o) => {
                const s = signe(o, ops);
                return (
                  <tr key={o.id} className={o.annulee ? 'bg-papier/50' : ''}>
                    <Td><p className="font-semibold chiffres">{o.numero}</p><p className="text-xs text-encre-doux">{dateHeureFr(o.date)}</p></Td>
                    <Td>
                      <p className={o.annulee ? 'text-encre-pale line-through' : 'font-medium'}>{o.libelle}</p>
                      <p className="text-xs text-encre-doux">{o.eleve ? `${o.eleve} · ${o.classe}` : o.beneficiaire ?? ''}</p>
                      {o.annulee && <p className="mt-1 text-xs font-semibold text-stylo">Annulée par {o.annulee.numero} : {o.annulee.motif}</p>}
                    </Td>
                    <Td>{o.mode}{o.reference && <p className="font-mono text-[11px] text-encre-doux">{o.reference}</p>}</Td>
                    <Td className="text-[13px]">{o.auteur}</Td>
                    <Td className={`whitespace-nowrap text-right font-semibold chiffres ${o.annulee ? 'text-encre-pale line-through' : s > 0 ? 'text-valide' : 'text-stylo'}`}>{s > 0 ? '+' : '−'} {montant(o.montant)}</Td>
                    <Td className="text-right">
                      <div className="flex justify-end">
                        {o.type === 'recette' && <IconButton icon={Printer} label={`Imprimer le reçu ${o.numero}`} onClick={() => { const e = etat.eleves.find((x) => x.id === o.eleveId); recu(o, e ? Math.max(0, e.du - e.paye) : undefined); journaliser({ operation: 'Réimpression', module: 'Caisse', element: `Reçu ${o.numero}` }); }} />}
                        {!o.annulee && o.type !== 'annulation' && o.type !== 'remboursement' && (o.type === 'recette' || peut('depenses')) && <IconButton icon={Ban} tone="stylo" label={`Annuler ${o.numero}`} onClick={() => setAnnuler(o)} />}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </Table>
          )}
        </section>
      ) : (
        <section className="rounded-[22px] bg-white shadow-feuille">
          <Table caption="Impayés" head={['Élève', 'Tuteur', 'Payé', { label: 'Reste', align: 'right' }, { label: 'Actions', sr: true }]} minWidth={820}>
            {impayes.map((e) => (
              <tr key={e.id}>
                <Td className="font-semibold">{nomEleve(e)}<p className="text-xs font-normal text-encre-doux">{e.matricule} · {e.classe}</p></Td>
                <Td>{e.tuteur}<p className="text-xs text-encre-doux">{e.telephone}</p></Td>
                <Td className="w-48"><Gauge value={(e.paye / e.du) * 100} label="Part payée" /></Td>
                <Td className="whitespace-nowrap text-right font-semibold text-stylo chiffres">{montant(e.du - e.paye)}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    <IconButton icon={BellRing} label={`Relancer ${e.tuteur}`} onClick={() => (journaliser({ operation: 'Relance', module: 'Caisse', element: `${e.tuteur} pour ${nomEleve(e)}`, apres: `Reste ${montant(e.du - e.paye)}` }), toast(`Relance envoyée à ${e.tuteur} (SMS par le serveur).`))} />
                    <Button size="sm" variant="quiet" icon={Banknote} onClick={() => setEncaisser(e.id)}>Encaisser</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </section>
      )}

      {encaisser !== null && <Encaissement eleveId={encaisser === 'oui' ? null : encaisser} onClose={() => setEncaisser(null)} />}
      {annuler && (
        <ModalMotif
          titre={`Annuler ${annuler.numero}`}
          texte={`${annuler.libelle}, ${montant(annuler.montant)}. Une écriture inverse sera créée ; l’opération d’origine reste visible, barrée.`}
          bouton="Annuler l’opération"
          rappel="L’opération d’origine reste visible, barrée, dans le journal de caisse. L’administrateur voit qui l’a annulée et pourquoi."
          danger
          onValider={(m) => (annulerOperation(annuler.id, m), toast(`${annuler.numero} annulée par une écriture inverse.`))}
          onClose={() => setAnnuler(null)}
        />
      )}
    </>
  );
}

function Encaissement({ eleveId, onClose }: { eleveId: number | null; onClose: () => void }) {
  const { etat, encaisser } = useSecretariat();
  const [id, setId] = useState<number | null>(eleveId);
  const [libelle, setLibelle] = useState(motifs[2]);
  const [autre, setAutre] = useState('');
  const [somme, setSomme] = useState('');
  const [mode, setMode] = useState<Mode>('Espèces');
  const [reference, setReference] = useState('');
  const [essai, setEssai] = useState(false);
  const [fait, setFait] = useState<{ op: Operation; reste: number } | null>(null);
  const e = etat.eleves.find((x) => x.id === id);
  const reste = e ? Math.max(0, e.du - e.paye) : 0;
  const n = Number(somme.replace(/\s/g, ''));
  const refDouble = reference.trim() && etat.operations.some((o) => o.reference?.toLowerCase() === reference.trim().toLowerCase());
  const erreurs = {
    eleve: !e && 'Choisissez un élève.',
    somme: !n || n <= 0 ? 'Saisissez un montant.' : n % 25 !== 0 ? 'Le montant doit être un multiple de 25 FCFA.' : n > reste && libelle.startsWith('Scolarité') ? `Le reste à payer est de ${montant(reste)}.` : false,
    reference: mode !== 'Espèces' && !reference.trim() ? 'La référence de la transaction est obligatoire.' : refDouble && 'Cette référence a déjà été enregistrée : paiement en double ?',
    autre: libelle === 'Autre' && !autre.trim() && 'Précisez le motif.',
  };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];

  if (fait)
    return (
      <Modal title="Paiement enregistré" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Fermer</Button><Button icon={Printer} onClick={() => recu(fait.op, fait.reste)}>Imprimer le reçu</Button></>}>
        <div className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-valide-50 text-valide"><CheckCircle2 className="size-7" aria-hidden /></span>
          <p className="mt-3 font-display text-[28px] font-extrabold chiffres">{montant(fait.op.montant)}</p>
          <p className="text-encre-doux">{fait.op.eleve} · {fait.op.libelle}</p>
          <div className="mt-5 w-full space-y-2 rounded-xl bg-papier p-4 text-left text-sm">
            <p className="flex justify-between"><span className="text-encre-doux">Reçu</span><b className="chiffres">{fait.op.numero}</b></p>
            <p className="flex justify-between"><span className="text-encre-doux">Mode</span><b>{fait.op.mode}{fait.op.reference ? ` · ${fait.op.reference}` : ''}</b></p>
            <p className="flex justify-between"><span className="text-encre-doux">Reste à payer</span><b className={fait.reste ? 'text-stylo' : 'text-valide'}>{fait.reste ? montant(fait.reste) : 'Scolarité soldée'}</b></p>
          </div>
          <p className="mt-3 text-[13px] text-encre-doux">Le paiement apparaît maintenant dans le journal de caisse.</p>
        </div>
      </Modal>
    );

  return (
    <Modal title="Encaisser un paiement" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button icon={Banknote} onClick={() => {
      setEssai(true);
      if (Object.values(erreurs).some(Boolean) || !e) return;
      const op = encaisser({ eleveId: e.id, libelle: libelle === 'Autre' ? autre.trim() : libelle, montant: n, mode, reference: reference.trim() });
      setFait({ op, reste: Math.max(0, e.du - e.paye - n) });
    }}>Encaisser{n > 0 ? ` ${montant(n)}` : ''}</Button></>}>
      <div className="space-y-4">
        <ChoisirEleve valeur={id} onChange={setId} />
        {err('eleve') && <p className="text-[13px] font-medium text-stylo">{err('eleve')}</p>}
        {e && (
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-papier p-3 text-center text-[13px]">
            <p><span className="block text-encre-doux">Dû</span><b className="chiffres">{montant(e.du)}</b></p>
            <p><span className="block text-encre-doux">Payé</span><b className="chiffres">{montant(e.paye)}</b></p>
            <p><span className="block text-encre-doux">Reste</span><b className="text-stylo chiffres">{montant(reste)}</b></p>
          </div>
        )}
        <Grille>
          <Champ label="Motif"><Liste value={libelle} onChange={(x) => setLibelle(x.target.value)} options={motifs} /></Champ>
          {libelle === 'Autre' ? <Champ label="Précisez" erreur={err('autre')}><Saisie value={autre} onChange={(x) => setAutre(x.target.value)} /></Champ> : <span className="hidden sm:block" />}
          <Champ label="Montant (FCFA)" erreur={err('somme')}><Saisie inputMode="numeric" value={somme} onChange={(x) => setSomme(x.target.value.replace(/[^\d\s]/g, ''))} placeholder="50 000" /></Champ>
          <Champ label="Mode de paiement"><Liste value={mode} onChange={(x) => setMode(x.target.value as Mode)} options={modes} /></Champ>
          {mode !== 'Espèces' && <Champ label="Référence de la transaction" erreur={err('reference')} className="sm:col-span-2" aide="Le numéro reçu par SMS (MoMo, Orange Money) ou du virement."><Saisie value={reference} onChange={(x) => setReference(x.target.value)} placeholder="MP261127.0915.A12" /></Champ>}
        </Grille>
        {e && reste > 0 && <button type="button" onClick={() => setSomme(String(reste))} className="cursor-pointer text-[13px] font-semibold text-brand-700 hover:underline">Payer tout le reste ({montant(reste)})</button>}
      </div>
    </Modal>
  );
}

/* =========================================================
 * Dépenses
 * ======================================================= */
const categories = ['Fournitures', 'Entretien', 'Électricité et eau', 'Transport', 'Salaires et primes', 'Communication', 'Autre'];

export function Depenses() {
  const { etat, annulerOperation } = useSecretariat();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [nouvelle, setNouvelle] = useState(params.get('nouvelle') === '1');
  const [annuler, setAnnuler] = useState<Operation | null>(null);
  useEffect(() => {
    if (params.get('nouvelle')) setParams({}, { replace: true });
  }, [params, setParams]);
  const mois = aujourdhui().slice(0, 7);
  const depenses = etat.operations.filter((o) => o.type === 'depense').sort((a, b) => b.date.localeCompare(a.date));
  const duMois = depenses.filter((o) => o.date.startsWith(mois) && !o.annulee);
  const parCategorie = useMemo(() => categories.map((c) => ({ c, total: duMois.filter((o) => o.categorie === c).reduce((s, o) => s + o.montant, 0) })).filter((x) => x.total), [duMois]);

  return (
    <>
      <Titre titre="Dépenses" texte="Chaque dépense est enregistrée avec son justificatif. Une dépense ne s’efface pas : on l’annule avec un motif." action={<Button icon={Plus} onClick={() => setNouvelle(true)}>Enregistrer une dépense</Button>} />
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Chiffre label="Dépenses du mois" valeur={nombre(duMois.reduce((s, o) => s + o.montant, 0))} unite="FCFA" icone={Receipt} ton="feutre" detail={`${duMois.length} dépense(s)`} />
        <Bloc titre="Par catégorie, ce mois">
          {parCategorie.length === 0 ? <p className="text-sm text-encre-doux">Aucune dépense ce mois.</p> : (
            <ul className="space-y-2">{parCategorie.map((x) => <li key={x.c} className="flex justify-between text-sm"><span>{x.c}</span><b className="chiffres">{montant(x.total)}</b></li>)}</ul>
          )}
        </Bloc>
      </div>
      <section className="rounded-[22px] bg-white shadow-feuille">
        <Table caption="Dépenses" head={['N° et date', 'Dépense', 'Catégorie', 'Justificatif', { label: 'Montant', align: 'right' }, { label: 'Actions', sr: true }]} minWidth={900}>
          {depenses.map((o) => (
            <tr key={o.id} className={o.annulee ? 'bg-papier/50' : ''}>
              <Td><p className="font-semibold chiffres">{o.numero}</p><p className="text-xs text-encre-doux">{dateHeureFr(o.date)}</p></Td>
              <Td><p className={o.annulee ? 'text-encre-pale line-through' : 'font-medium'}>{o.libelle}</p><p className="text-xs text-encre-doux">{o.beneficiaire} · {o.mode} · par {o.auteur}</p>{o.annulee && <p className="mt-1 text-xs font-semibold text-stylo">Annulée : {o.annulee.motif}</p>}</Td>
              <Td>{o.categorie ?? '—'}</Td>
              <Td>{o.justificatif ? <span className="inline-flex items-center gap-1.5 text-[13px]"><Paperclip className="size-3.5" aria-hidden />{o.justificatif}</span> : <span className="text-stylo">Manquant</span>}</Td>
              <Td className={`whitespace-nowrap text-right font-semibold chiffres ${o.annulee ? 'text-encre-pale line-through' : 'text-stylo'}`}>− {montant(o.montant)}</Td>
              <Td className="text-right">{!o.annulee && <IconButton icon={Ban} tone="stylo" label={`Annuler ${o.numero}`} onClick={() => setAnnuler(o)} />}</Td>
            </tr>
          ))}
        </Table>
      </section>
      {nouvelle && <NouvelleDepense onClose={() => setNouvelle(false)} />}
      {annuler && <ModalMotif titre={`Annuler ${annuler.numero}`} texte={`${annuler.libelle}, ${montant(annuler.montant)}. Une écriture inverse sera créée.`} bouton="Annuler la dépense" rappel="La dépense d’origine reste visible, barrée. L’administrateur voit qui l’a annulée et pourquoi." danger onValider={(m) => (annulerOperation(annuler.id, m), toast('Dépense annulée par une écriture inverse.'))} onClose={() => setAnnuler(null)} />}
    </>
  );
}

function NouvelleDepense({ onClose }: { onClose: () => void }) {
  const { depenser } = useSecretariat();
  const toast = useToast();
  const [f, setF] = useState({ libelle: '', categorie: categories[0], beneficiaire: '', montant: '', mode: 'Espèces' as Mode, reference: '', justificatif: '' });
  const [essai, setEssai] = useState(false);
  const n = Number(f.montant.replace(/\s/g, ''));
  const erreurs = {
    libelle: !f.libelle.trim() && 'Décrivez la dépense.',
    beneficiaire: !f.beneficiaire.trim() && 'Indiquez le bénéficiaire.',
    montant: (!n || n <= 0) && 'Saisissez un montant.',
    reference: f.mode !== 'Espèces' && !f.reference.trim() && 'La référence est obligatoire.',
    justificatif: !f.justificatif && 'Le justificatif (facture, reçu) est obligatoire.',
  };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  return (
    <Modal title="Enregistrer une dépense" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={() => {
      setEssai(true);
      if (Object.values(erreurs).some(Boolean)) return;
      const op = depenser({ libelle: f.libelle.trim(), categorie: f.categorie, beneficiaire: f.beneficiaire.trim(), montant: n, mode: f.mode, reference: f.reference.trim(), justificatif: f.justificatif });
      toast(`Dépense ${op.numero} enregistrée.`);
      onClose();
    }}>Enregistrer</Button></>}>
      <Grille>
        <Champ label="Libellé" erreur={err('libelle')} className="sm:col-span-2"><Saisie value={f.libelle} onChange={(e) => setF({ ...f, libelle: e.target.value })} placeholder="Exemple : Rame de papier A4" /></Champ>
        <Champ label="Catégorie"><Liste value={f.categorie} onChange={(e) => setF({ ...f, categorie: e.target.value })} options={categories} /></Champ>
        <Champ label="Bénéficiaire" erreur={err('beneficiaire')}><Saisie value={f.beneficiaire} onChange={(e) => setF({ ...f, beneficiaire: e.target.value })} placeholder="Fournisseur ou personne" /></Champ>
        <Champ label="Montant (FCFA)" erreur={err('montant')}><Saisie inputMode="numeric" value={f.montant} onChange={(e) => setF({ ...f, montant: e.target.value.replace(/[^\d\s]/g, '') })} /></Champ>
        <Champ label="Mode"><Liste value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value as Mode })} options={modes} /></Champ>
        {f.mode !== 'Espèces' && <Champ label="Référence" erreur={err('reference')} className="sm:col-span-2"><Saisie value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></Champ>}
        <Champ label="Justificatif" erreur={err('justificatif')} aide="Photo ou PDF de la facture. Le fichier sera envoyé au serveur." className="sm:col-span-2">
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setF({ ...f, justificatif: e.target.files?.[0]?.name ?? '' })} className="field-input py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-800" />
        </Champ>
      </Grille>
    </Modal>
  );
}

/* =========================================================
 * Remboursements
 * ======================================================= */
const libRemb: Record<StatutRemboursement, string> = { en_attente: 'En attente de l’administrateur', approuvee: 'Approuvée, à exécuter', refusee: 'Refusée', executee: 'Exécutée' };
const tonRemb: Record<StatutRemboursement, 'feutre' | 'encre' | 'stylo' | 'valide'> = { en_attente: 'feutre', approuvee: 'encre', refusee: 'stylo', executee: 'valide' };

export function Remboursements() {
  const { etat, executerRemboursement } = useSecretariat();
  const toast = useToast();
  const [nouvelle, setNouvelle] = useState(false);
  const [executer, setExecuter] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('Espèces');
  const d = etat.remboursements.find((x) => x.id === executer);
  return (
    <>
      <Titre titre="Remboursements" texte="Vous faites la demande, l’administrateur décide, puis vous exécutez le remboursement approuvé." action={<Button icon={Plus} onClick={() => setNouvelle(true)}>Nouvelle demande</Button>} />
      <ol className="mb-6 grid gap-3 sm:grid-cols-3">
        {[['1', 'Demande', 'Vous, avec un motif'], ['2', 'Décision', 'L’administrateur approuve ou refuse'], ['3', 'Exécution', 'Vous remettez l’argent']].map(([n, t, x]) => (
          <li key={n} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-feuille"><span className="grid size-9 place-items-center rounded-xl bg-brand-700 font-bold text-white">{n}</span><span><b className="block text-sm">{t}</b><span className="text-[13px] text-encre-doux">{x}</span></span></li>
        ))}
      </ol>
      <section className="rounded-[22px] bg-white shadow-feuille">
        {etat.remboursements.length === 0 ? <EmptyState icon={Undo2} title="Aucune demande" text="Aucune demande de remboursement." /> : (
          <Table caption="Demandes de remboursement" head={['Élève', 'Montant', 'Motif', 'Demande', 'Statut', { label: 'Action', sr: true }]} minWidth={920}>
            {[...etat.remboursements].sort((a, b) => b.id - a.id).map((r) => (
              <tr key={r.id}>
                <Td className="font-semibold">{r.eleve}<p className="text-xs font-normal text-encre-doux">{r.classe} · paiement {r.paiement}</p></Td>
                <Td className="whitespace-nowrap font-semibold chiffres">{montant(r.montant)}</Td>
                <Td className="max-w-72"><p className="line-clamp-2">{r.motif}</p>{r.decision && <p className="mt-1 text-xs text-encre-doux">{r.decision}</p>}</Td>
                <Td className="text-[13px]">{dateFr(r.date)}<p className="text-encre-doux">{r.demandeur}</p></Td>
                <Td><Pill tone={tonRemb[r.statut]}>{libRemb[r.statut]}</Pill></Td>
                <Td className="text-right">{r.statut === 'approuvee' && <Button size="sm" icon={Wallet} onClick={() => setExecuter(r.id)}>Exécuter</Button>}</Td>
              </tr>
            ))}
          </Table>
        )}
      </section>
      {nouvelle && <NouvelleDemande onClose={() => setNouvelle(false)} />}
      {d && (
        <Modal title="Exécuter le remboursement" lead={`${montant(d.montant)} à remettre pour ${d.eleve}.`} onClose={() => setExecuter(null)} footer={<><Button variant="secondary" onClick={() => setExecuter(null)}>Annuler</Button><Button onClick={() => { executerRemboursement(d.id, mode); toast('Remboursement exécuté et inscrit au journal de caisse.'); setExecuter(null); }}>Confirmer la remise</Button></>}>
          <Champ label="Mode de remise"><Liste value={mode} onChange={(e) => setMode(e.target.value as Mode)} options={modes} /></Champ>
          <p className="mt-4 text-sm text-encre-doux">{d.decision}</p>
        </Modal>
      )}
    </>
  );
}

function NouvelleDemande({ onClose }: { onClose: () => void }) {
  const { etat, ajouter, utilisateur } = useSecretariat();
  const toast = useToast();
  const [id, setId] = useState<number | null>(null);
  const [paiement, setPaiement] = useState('');
  const [somme, setSomme] = useState('');
  const [motif, setMotif] = useState('');
  const [essai, setEssai] = useState(false);
  const e = etat.eleves.find((x) => x.id === id);
  const paiements = etat.operations.filter((o) => o.eleveId === id && o.type === 'recette' && !o.annulee);
  const p = paiements.find((o) => o.numero === paiement) ?? paiements[0];
  const n = Number(somme.replace(/\s/g, ''));
  const deja = p && etat.remboursements.some((r) => r.paiement === p.numero && r.statut !== 'refusee');
  const erreurs = { eleve: !e && 'Choisissez un élève.', paiement: !p ? 'Cet élève n’a aucun paiement remboursable.' : deja && 'Une demande existe déjà pour ce paiement.', somme: (!n || n <= 0) ? 'Saisissez un montant.' : p && n > p.montant && `Au plus ${montant(p.montant)}.`, motif: motif.trim().length < 5 && 'Expliquez le motif.' };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  return (
    <Modal title="Demander un remboursement" lead="La demande sera envoyée à l’administrateur pour décision." onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={() => {
      setEssai(true);
      if (Object.values(erreurs).some(Boolean) || !e || !p) return;
      ajouter('remboursements', { eleveId: e.id, eleve: nomEleve(e), classe: e.classe, montant: n, motif: motif.trim(), paiement: p.numero, demandeur: utilisateur, date: aujourdhui(), statut: 'en_attente' }, { operation: 'Demande', module: 'Remboursements', element: `${montant(n)} · ${nomEleve(e)} (paiement ${p.numero})`, motif: motif.trim() });
      toast('Demande envoyée à l’administrateur.');
      onClose();
    }}>Envoyer la demande</Button></>}>
      <div className="space-y-4">
        <ChoisirEleve valeur={id} onChange={(x) => (setId(x), setPaiement(''))} />
        {err('eleve') && <p className="text-[13px] font-medium text-stylo">{err('eleve')}</p>}
        {e && (
          <Champ label="Paiement concerné" erreur={err('paiement')}>
            <Liste value={p?.numero ?? ''} onChange={(x) => setPaiement(x.target.value)} options={paiements.length ? paiements.map((o) => ({ value: o.numero, label: `${o.numero} · ${o.libelle} · ${montant(o.montant)} · ${dateFr(o.date)}` })) : [{ value: '', label: 'Aucun paiement' }]} />
          </Champ>
        )}
        <Champ label="Montant à rembourser (FCFA)" erreur={err('somme')}><Saisie inputMode="numeric" value={somme} onChange={(x) => setSomme(x.target.value.replace(/[^\d\s]/g, ''))} /></Champ>
        <Champ label="Motif" erreur={err('motif')}><Zone value={motif} onChange={(x) => setMotif(x.target.value)} placeholder="Exemple : frais payés deux fois" /></Champ>
      </div>
    </Modal>
  );
}

/* =========================================================
 * Clôture de caisse
 * ======================================================= */
const coupures = [10000, 5000, 2000, 1000, 500, 100, 50, 25];

export function Cloture() {
  const { etat, ajouter, utilisateur } = useSecretariat();
  const toast = useToast();
  const jour = aujourdhui();
  const ops = etat.operations.filter((o) => o.date.startsWith(jour) && o.mode === 'Espèces');
  const [fond, setFond] = useState('50000');
  const [billets, setBillets] = useState<Record<number, string>>({});
  const [observation, setObservation] = useState('');
  const [essai, setEssai] = useState(false);
  const deja = etat.clotures.find((c) => c.date === jour);
  const mouvement = ops.reduce((s, o) => s + signe(o, etat.operations) * o.montant, 0);
  const attendu = (Number(fond) || 0) + mouvement;
  const compte = coupures.reduce((s, c) => s + c * (Number(billets[c]) || 0), 0);
  const ecart = compte - attendu;
  const momo = etat.operations.filter((o) => o.date.startsWith(jour) && (o.mode === 'MTN MoMo' || o.mode === 'Orange Money')).reduce((s, o) => s + signe(o, etat.operations) * o.montant, 0);

  return (
    <>
      <Titre titre="Clôture de caisse" texte="En fin de journée, comptez les espèces. L’écart avec le montant attendu est enregistré et signalé à l’administrateur." />
      {deja ? (
        <Bloc>
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-valide-50 text-valide"><Lock className="size-7" aria-hidden /></span>
            <h2 className="mt-4 font-display text-2xl font-bold">Caisse du {dateFr(jour)} clôturée</h2>
            <p className="mt-1 text-encre-doux">À {deja.heure} par {deja.auteur}</p>
            <div className="mt-5 grid w-full max-w-md grid-cols-3 gap-2 rounded-xl bg-papier p-4 text-sm">
              <p><span className="block text-encre-doux">Attendu</span><b className="chiffres">{montant(deja.attendu)}</b></p>
              <p><span className="block text-encre-doux">Compté</span><b className="chiffres">{montant(deja.compte)}</b></p>
              <p><span className="block text-encre-doux">Écart</span><b className={deja.ecart ? 'text-stylo chiffres' : 'text-valide chiffres'}>{montant(deja.ecart)}</b></p>
            </div>
            {deja.observation && <p className="mt-3 max-w-md text-sm text-encre-doux">{deja.observation}</p>}
            <p className="mt-4 text-[13px] text-encre-doux">Une clôture ne se modifie pas. Pour une correction, l’administrateur doit intervenir.</p>
          </div>
        </Bloc>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Bloc titre="Comptage des espèces" icone={Banknote}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {coupures.map((c) => (
                <Champ key={c} label={`${c.toLocaleString('fr-FR')} FCFA`}>
                  <Saisie inputMode="numeric" value={billets[c] ?? ''} onChange={(e) => setBillets({ ...billets, [c]: e.target.value.replace(/\D/g, '') })} placeholder="0" />
                </Champ>
              ))}
            </div>
            <p className="mt-5 flex justify-between rounded-xl bg-papier px-4 py-3 text-[15px]"><span>Total compté</span><b className="chiffres">{montant(compte)}</b></p>
          </Bloc>
          <div className="space-y-6">
            <Bloc titre="Calcul" icone={Vault}>
              <Champ label="Fond de caisse du matin (FCFA)"><Saisie inputMode="numeric" value={fond} onChange={(e) => setFond(e.target.value.replace(/\D/g, ''))} /></Champ>
              <div className="mt-4 space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-encre-doux">Mouvement espèces du jour ({ops.length} op.)</span><b className="chiffres">{montant(mouvement)}</b></p>
                <p className="flex justify-between"><span className="text-encre-doux">Attendu en caisse</span><b className="chiffres">{montant(attendu)}</b></p>
                <p className="flex justify-between"><span className="text-encre-doux">Compté</span><b className="chiffres">{montant(compte)}</b></p>
                <p className={`flex justify-between rounded-xl px-4 py-3 text-[15px] ${ecart === 0 ? 'bg-valide-50 text-valide-700' : 'bg-stylo-50 text-stylo-700'}`}><span>Écart</span><b className="chiffres">{ecart > 0 ? '+' : ''}{montant(ecart)}</b></p>
                <p className="flex justify-between pt-2 text-[13px]"><span className="text-encre-doux">Pour information : mobile money du jour</span><span className="chiffres">{montant(momo)}</span></p>
              </div>
              {ecart !== 0 && <div className="mt-4"><Champ label="Explication de l’écart (obligatoire)" erreur={essai && observation.trim().length < 5 && 'Expliquez l’écart.'}><Zone value={observation} onChange={(e) => setObservation(e.target.value)} /></Champ></div>}
              <Button className="mt-5 w-full" size="lg" icon={Lock} onClick={() => {
                setEssai(true);
                if (ecart !== 0 && observation.trim().length < 5) return;
                const heure = new Date().toTimeString().slice(0, 5);
                ajouter('clotures', { date: jour, heure, attendu, compte, ecart, observation: observation.trim(), auteur: utilisateur }, { operation: 'Clôture', module: 'Clôture de caisse', element: `Caisse du ${dateFr(jour)} · écart ${montant(ecart)}`, apres: `Attendu ${montant(attendu)}, compté ${montant(compte)}`, motif: observation.trim() || undefined });
                toast(ecart === 0 ? 'Caisse clôturée sans écart.' : 'Caisse clôturée. L’écart est signalé à l’administrateur.');
              }}>Clôturer la caisse</Button>
            </Bloc>
          </div>
        </div>
      )}
      <Bloc titre="Clôtures précédentes" className="mt-6">
        <div className="-mx-5 sm:-mx-6">
          <Table caption="Clôtures" head={['Date', 'Par', { label: 'Attendu', align: 'right' }, { label: 'Compté', align: 'right' }, { label: 'Écart', align: 'right' }, 'Observation']} minWidth={760}>
            {[...etat.clotures].sort((a, b) => b.date.localeCompare(a.date)).map((c) => (
              <tr key={c.id}>
                <Td className="chiffres">{dateFr(c.date)} <span className="text-encre-doux">{c.heure}</span></Td>
                <Td>{c.auteur}</Td>
                <Td className="text-right chiffres">{montant(c.attendu)}</Td>
                <Td className="text-right chiffres">{montant(c.compte)}</Td>
                <Td className={`text-right font-semibold chiffres ${c.ecart ? 'text-stylo' : 'text-valide'}`}>{montant(c.ecart)}</Td>
                <Td className="text-[13px] text-encre-doux">{c.observation || '—'}</Td>
              </tr>
            ))}
          </Table>
        </div>
      </Bloc>
    </>
  );
}
