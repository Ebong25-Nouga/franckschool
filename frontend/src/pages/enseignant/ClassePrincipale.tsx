import { cn } from '@/lib/utils';
import { AlertCircle, Eye, Lock, Search, Star } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Avatar, Gauge, Grade, Pill, Segmented } from '@/components/kit';
import { Bloc, Titre } from '@/components/espace';
import { appreciation, note } from '@/data/demo';
import { matieresClassePrincipale, resultatsClassePrincipale, type EtatSaisie } from '@/data/enseignant';
import { useEnseignant } from './EspaceEnseignant';

/*
 * Pages réservées au professeur titulaire (professeur principal).
 * Consultation seulement : il ne modifie pas les notes de ses collègues
 * et ne valide rien (règles validées par le propriétaire le 25/11/2026).
 */
function GardeTitulaire({ children }: { children: (classe: string) => ReactNode }) {
  const { titulaire } = useEnseignant();
  // Affichage seulement : la vraie vérification se fera côté Laravel
  if (!titulaire) return <Navigate to="/enseignant" replace />;
  return <>{children(titulaire)}</>;
}

function BandeauLecture() {
  return (
    <p className="mb-6 flex items-start gap-2.5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
      <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
      En tant que titulaire, vous consultez les résultats de toute la classe. Chaque enseignant reste seul responsable de ses notes : vous ne pouvez ni les modifier ni les valider.
    </p>
  );
}

const etats: Record<EtatSaisie, { tone: 'neutre' | 'encre' | 'feutre' | 'valide' | 'stylo'; label: string }> = {
  non_commencee: { tone: 'stylo', label: 'Pas commencée' },
  en_saisie: { tone: 'encre', label: 'En saisie' },
  soumise: { tone: 'feutre', label: 'Soumise, en attente' },
  validee: { tone: 'valide', label: 'Validée' },
};

/* ===============================================================
 * Résultats de la classe
 * ============================================================= */
export function ResultatsClasse() {
  return (
    <GardeTitulaire>
      {(classe) => <Resultats classe={classe} />}
    </GardeTitulaire>
  );
}

function Resultats({ classe }: { classe: string }) {
  const [filtre, setFiltre] = useState<'tous' | 'difficulte'>('tous');
  const [q, setQ] = useState('');
  const tous = resultatsClassePrincipale();
  const moyClasse = tous.reduce((s, e) => s + e.moyenne, 0) / tous.length;
  const sous10 = tous.filter((e) => e.moyenne < 10).length;
  const liste = tous.filter((e) => (filtre === 'tous' || e.moyenne < 10) && `${e.nom} ${e.prenom}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <Titre kicker={`Ma classe principale · ${classe}`} titre="Résultats de la classe" texte="Moyennes générales provisoires de la séquence 2, calculées avec les notes déjà validées ou soumises." />
      <BandeauLecture />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Bloc><p className="text-[13px] text-encre-doux">Moyenne de la classe</p><p className="mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em] chiffres">{note(moyClasse)}</p></Bloc>
        <Bloc><p className="text-[13px] text-encre-doux">Élèves à 10 et plus</p><p className="mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em] text-valide chiffres">{tous.length - sous10}<span className="text-base text-encre-doux">/{tous.length}</span></p></Bloc>
        <Bloc><p className="text-[13px] text-encre-doux">Élèves en difficulté</p><p className="mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em] text-stylo chiffres">{sous10}</p></Bloc>
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Segmented label="Filtrer" value={filtre} onChange={setFiltre} options={[{ value: 'tous', label: 'Tous', count: tous.length }, { value: 'difficulte', label: 'Moyenne < 10', count: sous10 }]} />
        <label className="relative block sm:ml-auto sm:w-72">
          <span className="sr-only">Rechercher un élève</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-encre-pale" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom de l’élève" className="field-input pl-10" />
        </label>
      </div>
      <Bloc>
        <ol className="divide-y divide-papier-ligne/70">
          {liste.map((e) => {
            const rang = tous.findIndex((x) => x.id === e.id) + 1;
            const evol = e.moyenne - e.s1;
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="w-8 text-center font-display font-bold chiffres">{rang}<sup className="text-[9px]">{rang === 1 ? 'er' : 'e'}</sup></span>
                <Avatar name={`${e.nom} ${e.prenom}`} size="sm" />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{e.nom} {e.prenom}</p><p className="text-[13px] text-encre-doux">{appreciation(e.moyenne)} · {e.absences} h d’absence</p></div>
                <span className={cn('text-xs font-semibold chiffres', evol >= 0 ? 'text-valide' : 'text-stylo')} title="Évolution depuis la séquence 1">{evol >= 0 ? '▲' : '▼'} {note(Math.abs(evol))}</span>
                <Grade value={e.moyenne} />
              </li>
            );
          })}
        </ol>
      </Bloc>
    </>
  );
}

/* ===============================================================
 * Moyennes par matière
 * ============================================================= */
export function MoyennesMatiere() {
  return (
    <GardeTitulaire>
      {(classe) => (
        <>
          <Titre kicker={`Ma classe principale · ${classe}`} titre="Moyennes par matière" texte="Toutes les matières enseignées dans votre classe, séquence 2." />
          <BandeauLecture />
          <Bloc>
            <ul className="flex flex-col divide-y divide-papier-ligne/70">
              {matieresClassePrincipale.map((m) => (
                <li key={m.matiere} className="grid gap-x-6 gap-y-2 py-4 sm:grid-cols-[1.2fr_1fr_5rem] sm:items-center">
                  <div className="min-w-0">
                    <p className="font-semibold">{m.matiere} <span className="text-xs font-medium text-encre-pale">coef. {m.coef}</span></p>
                    <p className="truncate text-[13px] text-encre-doux">{m.prof}</p>
                  </div>
                  {m.moyenne !== null ? (
                    <div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-papier-2" aria-hidden><div className={cn('h-full rounded-full', m.moyenne < 10 ? 'bg-stylo' : 'bg-brand-600')} style={{ width: `${(m.moyenne / 20) * 100}%` }} /></div>
                      <p className="mt-1 text-xs text-encre-doux">{m.reussite} % des élèves à 10 et plus</p>
                    </div>
                  ) : (
                    <p className="text-[13px] text-encre-pale">Pas encore de notes</p>
                  )}
                  <div className="sm:text-right">{m.moyenne !== null ? <Grade value={m.moyenne} /> : <span className="text-encre-pale">—</span>}</div>
                </li>
              ))}
            </ul>
          </Bloc>
        </>
      )}
    </GardeTitulaire>
  );
}

/* ===============================================================
 * Suivi des saisies
 * ============================================================= */
export function SuiviSaisies() {
  return (
    <GardeTitulaire>
      {(classe) => {
        const retard = matieresClassePrincipale.filter((m) => m.etat === 'non_commencee' || m.etat === 'en_saisie');
        const compte = (e: EtatSaisie) => matieresClassePrincipale.filter((m) => m.etat === e).length;
        return (
          <>
            <Titre kicker={`Ma classe principale · ${classe}`} titre="Suivi des saisies" texte="Où en est chaque matière pour la séquence 2. Date limite : vendredi 5 décembre, 18 h." />
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['validee', 'soumise', 'en_saisie', 'non_commencee'] as EtatSaisie[]).map((e) => (
                <div key={e} className="rounded-[20px] bg-white p-4 shadow-feuille">
                  <Pill tone={etats[e].tone}>{etats[e].label}</Pill>
                  <p className="mt-2 font-display text-[28px] font-extrabold leading-none">{compte(e)}</p>
                </div>
              ))}
            </div>
            {retard.length > 0 && (
              <Bloc titre="Enseignants qui n’ont pas encore soumis" icone={AlertCircle} className="mb-6 ring-2 ring-stylo/20">
                <ul className="flex flex-col gap-2">
                  {retard.map((m) => (
                    <li key={m.matiere} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-papier px-4 py-3">
                      <Avatar name={m.prof} size="sm" />
                      <span className="min-w-[12rem] flex-1"><span className="block font-semibold">{m.prof}</span><span className="block text-[13px] text-encre-doux">{m.matiere}</span></span>
                      <span className="ml-auto flex items-center gap-3">
                        <span className="whitespace-nowrap text-sm text-encre-doux chiffres">{m.saisies}/{m.total} notes</span>
                        <Pill tone={etats[m.etat].tone}>{etats[m.etat].label}</Pill>
                      </span>
                    </li>
                  ))}
                </ul>
              </Bloc>
            )}
            <Bloc titre="Toutes les matières">
              <ul className="divide-y divide-papier-ligne/70">
                {matieresClassePrincipale.map((m) => (
                  <li key={m.matiere} className="grid gap-x-5 gap-y-2 py-3.5 sm:grid-cols-[1.3fr_1fr_auto] sm:items-center">
                    <div className="min-w-0"><p className="font-semibold">{m.matiere}</p><p className="truncate text-[13px] text-encre-doux">{m.prof} · dernière activité : {m.derniere}</p></div>
                    <Gauge value={(m.saisies / m.total) * 100} label={`Saisie ${m.matiere}`} />
                    <Pill tone={etats[m.etat].tone}>{etats[m.etat].label}</Pill>
                  </li>
                ))}
              </ul>
            </Bloc>
          </>
        );
      }}
    </GardeTitulaire>
  );
}

/* ===============================================================
 * Notes en attente de validation
 * ============================================================= */
export function EnAttenteValidation() {
  return (
    <GardeTitulaire>
      {(classe) => {
        const attente = matieresClassePrincipale.filter((m) => m.etat === 'soumise');
        return (
          <>
            <Titre kicker={`Ma classe principale · ${classe}`} titre="En attente de validation" texte="Les notes soumises par vos collègues, que l’administration doit encore valider." />
            <BandeauLecture />
            {attente.length === 0 ? (
              <Bloc><p className="py-4 text-encre-doux">Aucune note en attente de validation.</p></Bloc>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {attente.map((m) => (
                  <li key={m.matiere} className="rounded-[22px] bg-white p-5 shadow-feuille">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="font-display text-lg font-bold">{m.matiere}</p><p className="text-[13px] text-encre-doux">{m.prof} · soumise le {m.derniere}</p></div>
                      <Pill tone="feutre">En attente</Pill>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 divide-x divide-papier-ligne rounded-xl bg-papier py-3 text-center text-sm">
                      <div><dt className="text-xs text-encre-doux">Moyenne</dt><dd className="mt-0.5">{m.moyenne !== null && <Grade value={m.moyenne} size="sm" />}</dd></div>
                      <div><dt className="text-xs text-encre-doux">Réussite</dt><dd className="mt-0.5 font-bold">{m.reussite} %</dd></div>
                      <div><dt className="text-xs text-encre-doux">Notes</dt><dd className="mt-0.5 font-bold chiffres">{m.saisies}/{m.total}</dd></div>
                    </dl>
                    <p className="mt-3 flex items-center gap-1.5 text-[13px] text-encre-doux"><Eye className="size-3.5" aria-hidden />Consultation seulement. La validation est faite par l’administration.</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 flex items-center gap-1.5 text-sm text-encre-doux"><Star className="size-4 text-feutre-700" aria-hidden />Vous voyez ces informations parce que vous êtes titulaire de la {classe}.</p>
          </>
        );
      }}
    </GardeTitulaire>
  );
}
