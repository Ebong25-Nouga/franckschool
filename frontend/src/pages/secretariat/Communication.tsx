import { Download, FileText, Megaphone, Printer, Send } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bloc, Titre } from '@/components/espace';
import { Avatar, Button, EmptyState, Pill, Segmented, Table, Td, useToast } from '@/components/kit';
import { ecole } from '@/data/demo';
import { entete, html, imprimer, telechargerCsv } from '@/lib/imprimer';
import { BoutonsRetrait, Champ, ChoisirEleve, dateFr, dateHeureFr, Liste, montant, nomEleve, Note, Saisie, useDroit, Zone } from './commun';
import { isoJour, isoMinute, type EleveS } from './donnees';
import { useSecretariat, visibles } from './store';

/* =========================================================
 * Documents administratifs
 * ======================================================= */
const typesDocument = [
  { type: 'Certificat de scolarité', prefixe: 'CS', cible: 'eleve' },
  { type: 'Attestation d’inscription', prefixe: 'AI', cible: 'eleve' },
  { type: 'Attestation de paiement', prefixe: 'AP', cible: 'eleve' },
  { type: 'Liste de classe', prefixe: 'LC', cible: 'classe' },
] as const;
type TypeDoc = (typeof typesDocument)[number]['type'];

export function Documents() {
  const { etat, ajouter, numeroDocument, utilisateur } = useSecretariat();
  const toast = useToast();
  const [params] = useSearchParams();
  const [type, setType] = useState<TypeDoc>('Certificat de scolarité');
  const [eleveId, setEleveId] = useState<number | null>(Number(params.get('eleve')) || null);
  const classes = visibles(etat.classes).map((c) => c.nom);
  const [classe, setClasse] = useState(classes[0] ?? '');
  const def = typesDocument.find((d) => d.type === type)!;
  const e = etat.eleves.find((x) => x.id === eleveId);
  const pret = def.cible === 'classe' ? !!classe : !!e;
  const paiements = e ? etat.operations.filter((o) => o.eleveId === e.id && o.type === 'recette' && !o.annulee) : [];

  const corps = (numero: string, el?: EleveS) => {
    const fin = `<p>En foi de quoi, la présente est délivrée pour servir et valoir ce que de droit.</p><p class="droite">Fait à ${html(ecole.ville)}, le ${new Date().toLocaleDateString('fr-FR')}</p><div class="signature"><div></div><div>Le Principal<div class="ligne"></div></div></div>`;
    if (type === 'Liste de classe') {
      const l = visibles(etat.eleves).filter((x) => x.classe === classe && x.situation === 'inscrit').sort((a, b) => a.nom.localeCompare(b.nom));
      return `${entete(`Liste de la classe de ${classe}`, numero)}<table><tr><th>N°</th><th>Matricule</th><th>Nom et prénom</th><th>Sexe</th><th>Né(e) le</th><th>Statut</th></tr>${l.map((x, i) => `<tr><td>${i + 1}</td><td>${html(x.matricule)}</td><td>${html(nomEleve(x))}</td><td>${x.sexe}</td><td>${dateFr(x.dateNaissance)}</td><td>${html(x.statut)}</td></tr>`).join('')}</table><p class="gras">Effectif : ${l.length} (${l.filter((x) => x.sexe === 'F').length} filles, ${l.filter((x) => x.sexe === 'M').length} garçons)</p>`;
    }
    const x = el!;
    const id = `l’élève <b>${html(nomEleve(x))}</b>, matricule <b>${html(x.matricule)}</b>, né(e) le ${dateFr(x.dateNaissance)} à ${html(x.lieuNaissance)}`;
    if (type === 'Certificat de scolarité') return `${entete('Certificat de scolarité', numero)}<p>Je soussigné, Principal du ${html(ecole.nom)}, certifie que ${id}, est régulièrement inscrit(e) dans notre établissement en classe de <b>${html(x.classe)}</b> pour l’année scolaire ${html(ecole.annee)}.</p>${fin}`;
    if (type === 'Attestation d’inscription') return `${entete('Attestation d’inscription', numero)}<p>Le secrétariat du ${html(ecole.nom)} atteste que ${id}, a été inscrit(e) le ${dateFr(x.inscritLe)} en classe de <b>${html(x.classe)}</b> pour l’année scolaire ${html(ecole.annee)}.</p>${fin}`;
    return `${entete('Attestation de paiement', numero)}<p>Le secrétariat atteste que les sommes suivantes ont été versées pour ${id}, classe de ${html(x.classe)} :</p><table><tr><th>Reçu</th><th>Date</th><th>Motif</th><th>Mode</th><th class="droite-t">Montant</th></tr>${paiements.map((o) => `<tr><td>${o.numero}</td><td>${dateFr(o.date)}</td><td>${html(o.libelle)}</td><td>${o.mode}</td><td class="droite-t">${html(montant(o.montant))}</td></tr>`).join('')}</table><div class="encadre">Total versé : <b>${html(montant(x.paye))}</b> sur ${html(montant(x.du))} · Reste : <b>${html(montant(Math.max(0, x.du - x.paye)))}</b></div>${fin}`;
  };

  const generer = () => {
    if (!pret) return;
    const numero = numeroDocument(def.prefixe);
    const cible = def.cible === 'classe' ? classe : nomEleve(e!);
    imprimer(`${type} ${numero}`, corps(numero, e));
    ajouter('documents', { numero, type, cible, auteur: utilisateur, date: isoMinute(new Date()) }, { operation: 'Impression', module: 'Documents', element: `${numero} · ${type} · ${cible}` });
    toast(`${type} n° ${numero} prêt à imprimer.`);
  };

  return (
    <>
      <Titre titre="Documents administratifs" texte="Certificats, attestations et listes imprimables. Chaque document reçoit un numéro unique et reste dans l’historique." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Bloc titre="Nouveau document" icone={FileText}>
          <div className="grid gap-2">
            {typesDocument.map((d) => (
              <button key={d.type} type="button" aria-pressed={d.type === type} onClick={() => setType(d.type)} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-4 text-left text-[14.5px] font-semibold ring-1 ring-inset ${d.type === type ? 'bg-brand-50 text-brand-900 ring-brand-300' : 'ring-papier-ligne hover:bg-papier'}`}>
                <FileText className="size-4 text-brand-700" aria-hidden />{d.type}
              </button>
            ))}
          </div>
          <div className="mt-5">
            {def.cible === 'classe' ? <Champ label="Classe"><Liste value={classe} onChange={(x) => setClasse(x.target.value)} options={classes} /></Champ> : <ChoisirEleve valeur={eleveId} onChange={setEleveId} />}
          </div>
          {type === 'Attestation de paiement' && e && paiements.length === 0 && <div className="mt-4"><Note ton="feutre">Aucun paiement enregistré pour cet élève.</Note></div>}
          <Button className="mt-5 w-full" icon={Printer} disabled={!pret} onClick={generer}>Générer et imprimer</Button>
          <p className="mt-3 text-[13px] text-encre-doux">Dans la fenêtre d’impression, choisissez « Enregistrer en PDF » pour obtenir un fichier.</p>
        </Bloc>
        <Bloc titre="Historique des documents">
          {etat.documents.length === 0 ? <p className="text-sm text-encre-doux">Aucun document généré.</p> : (
            <ul className="divide-y divide-papier-ligne/70">
              {etat.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0"><span className="block truncate font-semibold">{d.type}</span><span className="block truncate text-[13px] text-encre-doux">{d.cible} · {dateHeureFr(d.date)}{d.auteur ? ` · ${d.auteur}` : ''}</span></span>
                  <span className="shrink-0 font-mono text-[13px] font-semibold">{d.numero}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloc>
      </div>
    </>
  );
}

/* =========================================================
 * Annonces
 * ======================================================= */
export function Annonces() {
  const { etat, ajouter, retirer, utilisateur } = useSecretariat();
  const toast = useToast();
  const classes = visibles(etat.classes).map((c) => c.nom);
  const destinataires = ['Tous les parents', 'Tous les enseignants', 'Tout le personnel', ...classes.map((c) => `Parents de la ${c}`)];
  const [f, setF] = useState({ titre: '', message: '', destinataires: destinataires[0] });
  const [essai, setEssai] = useState(false);
  const liste = visibles(etat.annonces).sort((a, b) => b.date.localeCompare(a.date));
  const ok = f.titre.trim().length >= 3 && f.message.trim().length >= 10;
  return (
    <>
      <Titre titre="Annonces" texte="Publiez une annonce : elle apparaît dans l’espace des destinataires. L’envoi par SMS sera fait par le serveur." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Bloc titre="Nouvelle annonce" icone={Megaphone}>
          <div className="space-y-4">
            <Champ label="Destinataires"><Liste value={f.destinataires} onChange={(e) => setF({ ...f, destinataires: e.target.value })} options={destinataires} /></Champ>
            <Champ label="Titre" erreur={essai && f.titre.trim().length < 3 && 'Donnez un titre.'}><Saisie value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} maxLength={80} /></Champ>
            <Champ label="Message" erreur={essai && f.message.trim().length < 10 && 'Écrivez le message (10 caractères au moins).'} aide={`${f.message.length} / 600 caractères`}><Zone rows={5} value={f.message} maxLength={600} onChange={(e) => setF({ ...f, message: e.target.value })} /></Champ>
            <Button className="w-full" icon={Send} onClick={() => {
              setEssai(true);
              if (!ok) return;
              ajouter('annonces', { titre: f.titre.trim(), message: f.message.trim(), destinataires: f.destinataires, auteur: utilisateur, date: isoMinute(new Date()), etat: 'actif' }, { operation: 'Publication', module: 'Annonces', element: `« ${f.titre.trim()} » → ${f.destinataires}` });
              toast('Annonce publiée.');
              setF({ titre: '', message: '', destinataires: f.destinataires });
              setEssai(false);
            }}>Publier</Button>
          </div>
        </Bloc>
        <Bloc titre="Annonces publiées">
          {liste.length === 0 ? <EmptyState icon={Megaphone} title="Aucune annonce" text="Les annonces publiées apparaîtront ici." /> : (
            <ul className="space-y-3">
              {liste.map((a) => (
                <li key={a.id} className="rounded-2xl bg-papier p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Pill tone="encre">{a.destinataires}</Pill>
                      <p className="mt-2 font-display text-[17px] font-bold">{a.titre}</p>
                    </div>
                    <div className="flex shrink-0"><BoutonsRetrait quoi="cette annonce" onRetirer={(mode, motif) => (retirer('annonces', a.id, mode, motif, { module: 'Annonces', element: a.titre }), toast('Annonce retirée. L’administrateur peut la restaurer.'))} /></div>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-[14.5px] leading-relaxed">{a.message}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-encre-doux"><Avatar name={a.auteur} size="sm" />{a.auteur} · {dateHeureFr(a.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </Bloc>
      </div>
    </>
  );
}

/* =========================================================
 * Statistiques
 * ======================================================= */
const COULEURS = ['#1C32A5', '#F2C200', '#E8761E', '#0A8F5A'];

export function Statistiques() {
  const { etat, journaliser } = useSecretariat();
  const peut = useDroit();
  const [vue, setVue] = useState<'eleves' | 'finances' | 'vie'>('eleves');
  const eleves = visibles(etat.eleves).filter((e) => e.situation === 'inscrit');
  const classes = visibles(etat.classes).map((c) => c.nom);
  const parClasse = classes.map((c) => {
    const l = eleves.filter((e) => e.classe === c);
    return { classe: c, Filles: l.filter((e) => e.sexe === 'F').length, Garçons: l.filter((e) => e.sexe === 'M').length, recouvrement: l.length ? Math.round((l.reduce((s, e) => s + e.paye, 0) / l.reduce((s, e) => s + e.du, 0)) * 100) : 0, absences: visibles(etat.absences).filter((a) => l.some((e) => e.id === a.eleveId)).length };
  });
  const statuts = [{ name: 'Nouveaux', value: eleves.filter((e) => e.statut === 'nouveau').length }, { name: 'Anciens', value: eleves.filter((e) => e.statut === 'ancien').length }, { name: 'Redoublants', value: eleves.filter((e) => e.statut === 'redoublant').length }];
  const ops = etat.operations.filter((o) => !o.annulee && o.type !== 'annulation');
  const jours = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 864e5);
    const k = isoJour(d);
    return { jour: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), Recettes: ops.filter((o) => o.type === 'recette' && o.date.startsWith(k)).reduce((s, o) => s + o.montant, 0), Dépenses: ops.filter((o) => o.type === 'depense' && o.date.startsWith(k)).reduce((s, o) => s + o.montant, 0) };
  });
  const finances = peut('caisse') || peut('depenses');

  const exporter = () => {
    const lignes: (string | number)[][] = [['Classe', 'Filles', 'Garçons', 'Effectif', 'Recouvrement (%)', 'Absences']];
    parClasse.forEach((c) => lignes.push([c.classe, c.Filles, c.Garçons, c.Filles + c.Garçons, c.recouvrement, c.absences]));
    telechargerCsv(`statistiques-${isoJour(new Date())}.csv`, lignes);
    journaliser({ operation: 'Export', module: 'Statistiques', element: 'Statistiques par classe (CSV)' });
  };

  return (
    <>
      <Titre titre="Statistiques" texte={`Année ${ecole.annee}. Les chiffres se mettent à jour à chaque opération.`} action={<Button variant="secondary" icon={Download} onClick={exporter}>Exporter (Excel)</Button>} />
      <div className="mb-5"><Segmented label="Vue" value={vue} onChange={setVue} options={[{ value: 'eleves', label: 'Élèves' }, ...(finances ? [{ value: 'finances' as const, label: 'Finances' }] : []), { value: 'vie', label: 'Vie scolaire' }]} /></div>
      {vue === 'eleves' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Bloc titre="Effectifs par classe">
            <div className="h-72"><ResponsiveContainer><BarChart data={parClasse} margin={{ left: -16 }}><CartesianGrid vertical={false} stroke="#E4E7F1" /><XAxis dataKey="classe" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><Tooltip cursor={{ fill: '#EEF1FB' }} /><Legend /><Bar dataKey="Filles" stackId="a" fill="#1C32A5" /><Bar dataKey="Garçons" stackId="a" fill="#8E9CE0" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </Bloc>
          <Bloc titre="Statut des élèves">
            <div className="h-72"><ResponsiveContainer><PieChart><Pie data={statuts} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>{statuts.map((_, i) => <Cell key={i} fill={COULEURS[i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
          </Bloc>
        </div>
      )}
      {vue === 'finances' && finances && (
        <div className="space-y-6">
          <Bloc titre="Recettes et dépenses, 14 derniers jours">
            <div className="h-72"><ResponsiveContainer><BarChart data={jours} margin={{ left: 0 }}><CartesianGrid vertical={false} stroke="#E4E7F1" /><XAxis dataKey="jour" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000} k` : v)} /><Tooltip formatter={(v) => montant(Number(v))} cursor={{ fill: '#EEF1FB' }} /><Legend /><Bar dataKey="Recettes" fill="#1C32A5" radius={[5, 5, 0, 0]} /><Bar dataKey="Dépenses" fill="#E8761E" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </Bloc>
          <Bloc titre="Taux de recouvrement par classe">
            <div className="-mx-5 sm:-mx-6"><Table caption="Recouvrement" head={['Classe', 'Recouvrement']} minWidth={480}>{parClasse.map((c) => <tr key={c.classe}><Td className="font-semibold">{c.classe}</Td><Td><span className="font-semibold chiffres">{c.recouvrement} %</span></Td></tr>)}</Table></div>
          </Bloc>
        </div>
      )}
      {vue === 'vie' && (
        <Bloc titre="Absences et retards par classe">
          <div className="h-72"><ResponsiveContainer><BarChart data={parClasse} margin={{ left: -16 }}><CartesianGrid vertical={false} stroke="#E4E7F1" /><XAxis dataKey="classe" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} /><Tooltip cursor={{ fill: '#EEF1FB' }} /><Bar dataKey="absences" name="Absences et retards" fill="#E8761E" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Bloc>
      )}
    </>
  );
}
