import { ArrowRight, Banknote, BookMarked, CalendarCheck2, CircleAlert, GraduationCap, Receipt, TrendingUp, UserPlus, Users2, Vault, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/auth';
import { Bloc, Chiffre, Titre } from '@/components/espace';
import { Avatar } from '@/components/kit';
import { ecole } from '@/data/demo';
import { dateHeureFr, montant, nombre, nomEleve, useDroit } from './commun';
import { isoJour } from './donnees';
import { aujourdhui, useSecretariat, visibles } from './store';

export default function Accueil() {
  const { session } = useAuth();
  const peut = useDroit();
  const { etat, utilisateur } = useSecretariat();
  const jour = aujourdhui();
  const mois = jour.slice(0, 7);

  const eleves = visibles(etat.eleves).filter((e) => e.situation === 'inscrit');
  const parStatut = (s: string) => eleves.filter((e) => e.statut === s).length;
  const ops = etat.operations.filter((o) => !o.annulee && o.type !== 'annulation');
  const recettes = (f: (d: string) => boolean) => ops.filter((o) => o.type === 'recette' && f(o.date)).reduce((s, o) => s + o.montant, 0);
  const depensesMois = ops.filter((o) => o.type === 'depense' && o.date.startsWith(mois)).reduce((s, o) => s + o.montant, 0);
  const reste = eleves.reduce((s, e) => s + Math.max(0, e.du - e.paye), 0);
  const impayes = eleves.filter((e) => e.paye < e.du).length;
  const absJour = visibles(etat.absences).filter((a) => a.date === jour);
  const nonJustifiees = visibles(etat.absences).filter((a) => a.statut !== 'justifiee').length;
  const aExecuter = etat.remboursements.filter((r) => r.statut === 'approuvee').length;
  const clotureFaite = etat.clotures.some((c) => c.date === jour);

  // Recettes des 7 derniers jours
  const semaine = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = isoJour(d);
    return { jour: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''), recettes: recettes((x) => x.startsWith(k)) };
  });

  const aFaire = [
    peut('absences') && nonJustifiees > 0 && { texte: `${nonJustifiees} absence${nonJustifiees > 1 ? 's' : ''} ou retard${nonJustifiees > 1 ? 's' : ''} à justifier`, to: '/secretariat/absences' },
    peut('remboursements') && aExecuter > 0 && { texte: `${aExecuter} remboursement${aExecuter > 1 ? 's' : ''} approuvé${aExecuter > 1 ? 's' : ''} à exécuter`, to: '/secretariat/remboursements' },
    peut('clotures') && !clotureFaite && { texte: 'La caisse du jour n’est pas encore clôturée', to: '/secretariat/cloture' },
    peut('caisse') && impayes > 0 && { texte: `${impayes} élèves ont un reste à payer`, to: '/secretariat/caisse?onglet=impayes' },
  ].filter(Boolean) as { texte: string; to: string }[];

  const raccourcis = [
    peut('caisse') && { label: 'Encaisser un paiement', to: '/secretariat/caisse?encaisser=1', icon: Banknote },
    peut('inscriptions') && { label: 'Inscrire un élève', to: '/secretariat/inscriptions', icon: UserPlus },
    peut('absences') && { label: 'Signaler une absence', to: '/secretariat/absences?nouvelle=1', icon: CalendarCheck2 },
    peut('depenses') && { label: 'Enregistrer une dépense', to: '/secretariat/depenses?nouvelle=1', icon: Receipt },
  ].filter(Boolean) as { label: string; to: string; icon: typeof Banknote }[];

  const mesOperations = etat.journal.filter((j) => j.utilisateur === utilisateur).slice(0, 6);
  const heure = new Date().getHours();

  return (
    <>
      <Titre
        kicker={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        titre={`${heure < 13 ? 'Bonjour' : 'Bonsoir'}, ${session?.nom.split(' ')[0]}`}
        texte={`Secrétariat du ${ecole.nom}. Voici l’essentiel de la journée.`}
      />

      {raccourcis.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {raccourcis.map((r) => (
            <Link key={r.to} to={r.to} className="group flex min-h-16 items-center gap-3 rounded-2xl bg-brand-700 px-4 py-3 text-white shadow-encre transition-colors hover:bg-brand-800">
              <r.icon className="size-5 shrink-0" aria-hidden />
              <span className="flex-1 text-[14px] font-semibold leading-snug">{r.label}</span>
              <ArrowRight className="hidden size-4 transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Chiffre label="Élèves inscrits" valeur={eleves.length.toLocaleString('fr-FR')} icone={GraduationCap} detail={`${parStatut('nouveau')} nouveaux · ${parStatut('ancien')} anciens · ${parStatut('redoublant')} redoublants`} />
        <Chiffre label="Enseignants" valeur={String(visibles(etat.enseignants).filter((e) => e.actif).length)} icone={Users2} detail={`${visibles(etat.enseignants).filter((e) => e.contrat === 'Permanent').length} permanents`} />
        <Chiffre label="Classes" valeur={String(visibles(etat.classes).length)} icone={BookMarked} detail={`Année ${ecole.annee}`} />
        <Chiffre label="Absences du jour" valeur={String(absJour.length)} icone={CalendarCheck2} ton={absJour.length ? 'feutre' : 'encre'} detail={`${absJour.filter((a) => a.type === 'retard').length} retard(s)`} />
        {peut('caisse') && (
          <>
            <Chiffre label="Encaissé aujourd’hui" valeur={nombre(recettes((d) => d.startsWith(jour)))} unite="FCFA" icone={Wallet} ton="valide" detail={`${ops.filter((o) => o.type === 'recette' && o.date.startsWith(jour)).length} paiement(s)`} />
            <Chiffre label="Encaissé ce mois" valeur={nombre(recettes((d) => d.startsWith(mois)))} unite="FCFA" icone={TrendingUp} />
            <Chiffre label="Dépenses du mois" valeur={nombre(depensesMois)} unite="FCFA" icone={Receipt} ton="feutre" />
            <Chiffre label="Reste à percevoir" valeur={nombre(reste)} unite="FCFA" icone={CircleAlert} ton="stylo" detail={`${impayes} élèves concernés`} />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {peut('caisse') ? (
          <Bloc titre="Recettes des 7 derniers jours" icone={TrendingUp}>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semaine} margin={{ left: -8, right: 4, top: 6 }}>
                  <CartesianGrid vertical={false} stroke="#E4E7F1" />
                  <XAxis dataKey="jour" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7190' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7190' }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000} k` : v)} />
                  <Tooltip formatter={(v) => montant(Number(v))} cursor={{ fill: '#EEF1FB' }} />
                  <Bar dataKey="recettes" name="Recettes" fill="#1C32A5" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Bloc>
        ) : (
          <Bloc titre="Absences du jour" icone={CalendarCheck2}>
            {absJour.length === 0 ? <p className="text-sm text-encre-doux">Aucune absence enregistrée aujourd’hui.</p> : (
              <ul className="divide-y divide-papier-ligne/70">
                {absJour.map((a) => {
                  const e = etat.eleves.find((x) => x.id === a.eleveId);
                  return <li key={a.id} className="py-2.5 text-sm"><b>{e && nomEleve(e)}</b> · {e?.classe} · {a.type === 'retard' ? `retard ${a.duree ?? ''}` : a.creneau}</li>;
                })}
              </ul>
            )}
          </Bloc>
        )}

        <Bloc titre="À faire" icone={CircleAlert}>
          {aFaire.length === 0 ? (
            <p className="text-sm text-encre-doux">Rien en attente. Bon travail !</p>
          ) : (
            <ul className="space-y-2">
              {aFaire.map((t) => (
                <li key={t.to}>
                  <Link to={t.to} className="flex min-h-12 items-center gap-3 rounded-xl bg-papier px-4 py-2.5 text-[14.5px] font-medium transition-colors hover:bg-brand-50">
                    <span className="size-2 shrink-0 rounded-full bg-feutre" aria-hidden />
                    <span className="flex-1">{t.texte}</span>
                    <ArrowRight className="size-4 text-encre-pale" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {peut('clotures') && clotureFaite && (
            <p className="mt-4 flex items-center gap-2 text-[13px] font-medium text-valide"><Vault className="size-4" aria-hidden /> Caisse du jour clôturée.</p>
          )}
        </Bloc>
      </div>

      <Bloc titre="Mes dernières opérations" className="mt-6" action={<Link to="/secretariat/activite" className="text-sm font-semibold text-brand-700 hover:underline">Tout voir</Link>}>
        {mesOperations.length === 0 ? (
          <p className="text-sm text-encre-doux">Vous n’avez encore rien enregistré.</p>
        ) : (
          <ul className="divide-y divide-papier-ligne/70">
            {mesOperations.map((j) => (
              <li key={j.id} className="flex items-start gap-3 py-3">
                <Avatar name={j.utilisateur} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px]"><b>{j.operation}</b> · {j.module}</p>
                  <p className="truncate text-[13px] text-encre-doux">{j.element}</p>
                </div>
                <span className="shrink-0 text-xs text-encre-pale">{dateHeureFr(j.quand)}</span>
              </li>
            ))}
          </ul>
        )}
      </Bloc>
    </>
  );
}
