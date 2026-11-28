import { AlertTriangle, ArrowRight, BookMarked, GraduationCap, RotateCcw, UserCog, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/auth';
import { Bloc, Chiffre, Titre } from '@/components/espace';
import { Avatar, Button, Pill } from '@/components/kit';
import { dateFr, dateHeureFr, nombre } from '../secretariat/commun';
import { aujourdhui, useSecretariat, visibles } from '../secretariat/store';
import { useADecider } from './EspaceDirection';
import { useElementsRetires } from './Historique';

export default function TableauDeBord() {
  const { session } = useAuth();
  const { etat } = useSecretariat();
  const d = useADecider();
  const retires = useElementsRetires();
  const jour = aujourdhui();
  const eleves = visibles(etat.eleves).filter((e) => e.situation === 'inscrit');
  const n = (s: string) => eleves.filter((e) => e.statut === s).length;
  const enseignants = visibles(etat.enseignants);
  const classes = visibles(etat.classes);
  const du = eleves.reduce((s, e) => s + e.du, 0);
  const paye = eleves.reduce((s, e) => s + e.paye, 0);
  const recouvrement = du ? Math.round((paye / du) * 100) : 0;
  const encaisseJour = etat.operations.filter((o) => o.type === 'recette' && !o.annulee && o.date.startsWith(jour)).reduce((s, o) => s + o.montant, 0);
  const annee = etat.anneesScolaires.find((a) => a.statut === 'active');
  const seqEnCours = annee?.sequences.find((q) => q.debut <= jour && jour <= q.fin) ?? annee?.sequences[1];
  const s2 = etat.releves.filter((r) => r.sequence === 2);
  const saisie = s2.length ? Math.round((s2.filter((r) => r.statut === 'validee' || r.statut === 'soumise').length / s2.length) * 100) : 0;
  const effectifs = classes.map((c) => ({ classe: c.nom, Élèves: eleves.filter((e) => e.classe === c.nom).length }));

  const aDecider = [
    d.notes > 0 && { titre: `${d.notes} saisie${d.notes > 1 ? 's' : ''} de notes à valider`, texte: 'Soumises par les enseignants', bouton: 'Valider', to: '/direction/notes' },
    d.aPublier.length > 0 && { titre: `${d.aPublier.length} classe${d.aPublier.length > 1 ? 's' : ''} à publier`, texte: `Bulletins générés · ${d.aPublier.join(', ')}`, bouton: 'Publier', to: '/direction/resultats' },
    d.remboursements.length > 0 && { titre: `${d.remboursements.length} remboursement${d.remboursements.length > 1 ? 's' : ''}`, texte: d.remboursements.map((r) => `${r.montant.toLocaleString('fr-FR')} FCFA · ${r.eleve}`).join(' ; '), bouton: 'Décider', to: '/direction/caisse' },
    d.ecarts.length > 0 && { titre: `${d.ecarts.length} écart${d.ecarts.length > 1 ? 's' : ''} de caisse`, texte: d.ecarts.map((c) => `${c.ecart.toLocaleString('fr-FR')} FCFA le ${dateFr(c.date)}`).join(' ; '), bouton: 'Voir', to: '/direction/caisse' },
  ].filter(Boolean) as { titre: string; texte: string; bouton: string; to: string }[];

  // Activité de chaque secrétaire aujourd'hui (d'après le journal)
  const activite = etat.comptes.map((c) => {
    const ops = etat.journal.filter((j) => j.utilisateur === c.nom && j.quand.startsWith(jour));
    const resume = Object.entries(ops.reduce<Record<string, number>>((a, j) => ({ ...a, [j.operation]: (a[j.operation] ?? 0) + 1 }), {}))
      .map(([k, v]) => `${v} ${k.toLowerCase()}`)
      .join(' · ');
    return { c, ops: ops.length, resume };
  });

  return (
    <>
      <Titre kicker={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} titre={`Bonjour, ${session?.nom.split(' ')[0]}`} texte={`Direction du ${etat.parametres.nom}. Voici ce qui attend votre décision et l’état de l’établissement.`} />

      <section className="seyes mb-6 rounded-[22px] bg-brand-950 p-5 text-white">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="shrink-0 xl:w-44">
            <p className="font-display text-[22px] font-extrabold">À décider</p>
            <p className="text-[13px] text-brand-300">{aDecider.length ? `${aDecider.length} sujet${aDecider.length > 1 ? 's' : ''} en attente` : 'Rien en attente'}</p>
          </div>
          {aDecider.length === 0 ? (
            <p className="text-sm text-brand-200">Toutes les notes, bulletins, remboursements et écarts ont été traités.</p>
          ) : (
            <div className="grid flex-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
              {aDecider.map((a) => (
                <Link key={a.to + a.titre} to={a.to} className="group flex items-center gap-3 rounded-2xl bg-white/[0.08] p-3.5 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/[0.12]">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold">{a.titre}</span>
                    <span className="block truncate text-[12.5px] text-brand-200">{a.texte}</span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-feutre px-3 py-1.5 text-[13px] font-bold text-encre">{a.bouton}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Chiffre label="Élèves" valeur={nombre(eleves.length)} icone={GraduationCap} detail={`${n('nouveau')} nouveaux · ${n('ancien')} anciens · ${n('redoublant')} redoublants`} />
        <Chiffre label="Enseignants" valeur={String(enseignants.filter((e) => e.actif).length)} icone={Users2} detail={`${enseignants.filter((e) => e.contrat === 'Permanent').length} permanents · ${enseignants.filter((e) => e.contrat === 'Vacataire').length} vacataires`} />
        <Chiffre label="Secrétaires" valeur={String(etat.comptes.length)} icone={UserCog} detail={`${etat.comptes.filter((c) => c.actif).length} active(s) · ${etat.comptes.filter((c) => !c.actif).length} désactivée(s)`} />
        <Chiffre label="Classes" valeur={String(classes.length)} icone={BookMarked} detail={`Effectif moyen : ${classes.length ? Math.round(eleves.length / classes.length) : 0}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Bloc titre="Finances de l’année">
          <div className="grid grid-cols-3 gap-4">
            {[['Encaissé', nombre(paye), 'text-valide'], ['Reste à percevoir', nombre(du - paye), 'text-stylo'], ['Recouvrement', `${recouvrement} %`, 'text-orange']].map(([l, v, c]) => (
              <div key={l} className="min-w-0"><p className="text-[13px] text-encre-doux">{l}</p><p className={`mt-1 truncate font-display text-[24px] font-extrabold chiffres ${c}`}>{v}</p></div>
            ))}
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-papier-2"><div className="h-full rounded-full bg-brand-700" style={{ width: `${recouvrement}%` }} /></div>
          <p className="mt-2 text-[13px] text-encre-doux">En FCFA · aujourd’hui : {nombre(encaisseJour)} encaissés · caisse {etat.clotures.some((c) => c.date === jour) ? 'clôturée' : 'non clôturée'}</p>
          <Link to="/direction/caisse" className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline">Superviser la caisse →</Link>
        </Bloc>
        <Bloc titre="Année scolaire active">
          <p className="font-display text-[24px] font-extrabold">{annee?.annee}</p>
          <p className="text-[13px] text-encre-doux">Séquence {seqEnCours?.n} en cours · du {seqEnCours && dateFr(seqEnCours.debut)} au {seqEnCours && dateFr(seqEnCours.fin)}</p>
          <div className="mt-3 flex gap-1.5">
            {annee?.sequences.map((q) => (
              <span key={q.n} className={`grid h-8 flex-1 place-items-center rounded-lg text-xs font-bold ${q.fin < jour ? 'bg-brand-700 text-white' : q.n === seqEnCours?.n ? 'bg-brand-50 text-brand-900 ring-1 ring-inset ring-brand-300' : 'bg-papier-2 text-encre-pale'}`}>S{q.n}</span>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-encre-doux">Notes de la séquence 2 soumises ou validées : {saisie} %</p>
        </Bloc>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Bloc titre="Activités récentes" action={<Link to="/direction/historique" className="text-sm font-semibold text-brand-700 hover:underline">Historique</Link>}>
          <ul className="divide-y divide-papier-ligne/70">
            {activite.map(({ c, ops, resume }) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <Avatar name={c.nom} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.nom}</p>
                  <p className="truncate text-[13px] text-encre-doux">{c.actif ? resume || 'Aucune opération aujourd’hui' : 'Compte désactivé'}</p>
                </div>
                <span className={`shrink-0 text-[13px] ${ops ? 'text-valide' : 'text-encre-doux'}`}>{c.actif ? `${ops} opération${ops > 1 ? 's' : ''}` : '—'}</span>
              </li>
            ))}
          </ul>
          <p className="mb-2 mt-4 text-xs font-semibold text-encre-pale">Dernières opérations</p>
          <ul className="space-y-1.5">
            {etat.journal.slice(0, 4).map((j) => (
              <li key={j.id} className="flex gap-2 text-[13px]"><span className="shrink-0 text-encre-pale chiffres">{dateHeureFr(j.quand).slice(-7)}</span><span className="truncate"><b>{j.utilisateur}</b> · {j.operation} · {j.element}</span></li>
            ))}
          </ul>
        </Bloc>
        <Bloc titre="Alertes et éléments retirés" action={<Link to="/direction/historique?onglet=retires" className="text-sm font-semibold text-brand-700 hover:underline">Tout voir</Link>}>
          <ul className="divide-y divide-papier-ligne/70">
            {d.ecarts.map((c) => (
              <li key={'e' + c.id} className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-feutre-50 text-feutre-700"><AlertTriangle className="size-4" aria-hidden /></span>
                <div className="min-w-0 flex-1"><p className="font-semibold">Écart de caisse de {c.ecart.toLocaleString('fr-FR')} FCFA</p><p className="text-[13px] text-encre-doux">Clôture du {dateFr(c.date)} · {c.auteur}</p></div>
                <Link to="/direction/caisse"><Button size="sm" variant="secondary">Voir</Button></Link>
              </li>
            ))}
            {retires.slice(0, 4).map((r) => (
              <li key={r.cle + r.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Pill tone={r.etat === 'masque' ? 'neutre' : 'stylo'}>{r.etat === 'masque' ? 'Masqué' : 'Supprimé'}</Pill>
                  <p className="mt-1 truncate font-semibold">{r.type} · {r.libelle}</p>
                  <p className="truncate text-[13px] text-encre-doux">{r.par} · « {r.motif} »</p>
                </div>
                <Link to="/direction/historique?onglet=retires"><Button size="sm" variant="secondary" icon={RotateCcw}>Restaurer</Button></Link>
              </li>
            ))}
            {d.ecarts.length === 0 && retires.length === 0 && <li className="py-3 text-sm text-encre-doux">Aucune alerte.</li>}
          </ul>
        </Bloc>
      </div>

      <Bloc titre="Effectifs par classe" className="mt-6" action={<Link to="/direction/classes" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">Classes <ArrowRight className="size-4" aria-hidden /></Link>}>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={effectifs} margin={{ left: -18, right: 4, top: 6 }}>
              <CartesianGrid vertical={false} stroke="#E4E7F1" />
              <XAxis dataKey="classe" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#EEF1FB' }} />
              <Bar dataKey="Élèves" fill="#1C32A5" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Bloc>
    </>
  );
}
