import { Archive, BookMarked, Lock, Pencil, Plus, Search, Star } from 'lucide-react';
import { useState } from 'react';
import { Bloc, Chiffre, Titre } from '@/components/espace';
import { Button, EmptyState, Gauge, Grade, IconButton, Modal, Pill, Table, Td, useToast } from '@/components/kit';
import { ecole } from '@/data/demo';
import { BoutonsRetrait, Champ, Grille, Liste, nombre, Note, Saisie } from './commun';
import type { Classe, Matiere } from './donnees';
import { useSecretariat, visibles } from './store';

/* =========================================================
 * Classes
 * ======================================================= */
export function Classes() {
  const { etat, retirer } = useSecretariat();
  const toast = useToast();
  const [edition, setEdition] = useState<Classe | 'nouvelle' | null>(null);
  const classes = visibles(etat.classes);
  const effectif = (nom: string) => visibles(etat.eleves).filter((e) => e.classe === nom && e.situation === 'inscrit').length;

  return (
    <>
      <Titre titre="Classes" texte={`Année ${ecole.annee}. Créez une classe, fixez sa capacité et désignez son professeur principal.`} action={<Button icon={Plus} onClick={() => setEdition('nouvelle')}>Nouvelle classe</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {classes.map((c) => {
          const n = effectif(c.nom);
          return (
            <article key={c.id} className="flex flex-col rounded-[22px] bg-white p-5 shadow-feuille">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-[22px] font-bold tracking-[-0.02em]">{c.nom}</h2>
                  <p className="text-[13px] text-encre-doux">{c.niveau} · {c.salle}</p>
                </div>
                <div className="flex">
                  <IconButton icon={Pencil} label={`Modifier la ${c.nom}`} onClick={() => setEdition(c)} />
                  {n === 0 && <BoutonsRetrait quoi="cette classe" onRetirer={(mode, motif) => (retirer('classes', c.id, mode, motif, { module: 'Classes', element: c.nom }), toast('Fait. L’administrateur peut restaurer cette classe.'))} />}
                </div>
              </div>
              <p className="mt-4 text-sm"><b className="font-display text-[26px] chiffres">{n}</b> <span className="text-encre-doux">/ {c.capacite} places</span></p>
              <Gauge className="mt-2" value={(n / c.capacite) * 100} label={`Remplissage de la ${c.nom}`} />
              <p className="mt-4 flex items-center gap-1.5 border-t border-papier-ligne/70 pt-3 text-[13px]">
                <Star className="size-3.5 text-feutre-700" aria-hidden />
                {c.pp ? <span>{c.pp}</span> : <span className="font-semibold text-stylo">Pas de professeur principal</span>}
              </p>
            </article>
          );
        })}
      </div>
      <p className="mt-5 text-[13px] text-encre-doux">Une classe qui contient des élèves ne peut être ni masquée ni supprimée : changez d’abord les élèves de classe.</p>
      {edition && <EditionClasse c={edition === 'nouvelle' ? null : edition} onClose={() => setEdition(null)} />}
    </>
  );
}

function EditionClasse({ c, onClose }: { c: Classe | null; onClose: () => void }) {
  const { etat, ajouter, modifier } = useSecretariat();
  const toast = useToast();
  const profs = visibles(etat.enseignants).filter((e) => e.actif).map((e) => `${e.civilite} ${e.nom} ${e.prenom}`);
  const [f, setF] = useState({ nom: c?.nom ?? '', niveau: c?.niveau ?? 'Premier cycle', capacite: String(c?.capacite ?? 50), salle: c?.salle ?? '', pp: c?.pp ?? '' });
  const [essai, setEssai] = useState(false);
  const effectif = c ? visibles(etat.eleves).filter((e) => e.classe === c.nom && e.situation === 'inscrit').length : 0;
  const cap = Number(f.capacite);
  const dejaPP = f.pp && visibles(etat.classes).find((x) => x.pp === f.pp && x.id !== c?.id);
  const erreurs = {
    nom: !f.nom.trim() ? 'Le nom est obligatoire.' : visibles(etat.classes).some((x) => x.id !== c?.id && x.nom.toLowerCase() === f.nom.trim().toLowerCase()) && 'Cette classe existe déjà.',
    capacite: (!cap || cap < 1 || cap > 120) ? 'Capacité entre 1 et 120.' : cap < effectif && `La classe compte déjà ${effectif} élèves.`,
    pp: dejaPP && `Déjà professeur principal de la ${dejaPP.nom}.`,
  };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  const enregistrer = () => {
    setEssai(true);
    if (Object.values(erreurs).some(Boolean)) return;
    const d = { nom: f.nom.trim(), niveau: f.niveau, capacite: cap, salle: f.salle.trim() || '—', pp: f.pp || null };
    if (c) {
      if (d.nom !== c.nom && effectif > 0) return toast('Renommer une classe qui a des élèves se fera avec l’administrateur.');
      modifier('classes', c.id, d, { operation: 'Modification', module: 'Classes', element: c.nom, avant: `${c.capacite} places, ${c.salle}, PP : ${c.pp ?? '—'}`, apres: `${d.capacite} places, ${d.salle}, PP : ${d.pp ?? '—'}` });
      toast('Classe mise à jour.');
    } else {
      ajouter('classes', { ...d, etat: 'actif' }, { operation: 'Création', module: 'Classes', element: `${d.nom} (${d.capacite} places)` });
      toast(`La classe ${d.nom} est créée. Ajoutez maintenant ses matières.`);
    }
    onClose();
  };
  return (
    <Modal title={c ? `Modifier la ${c.nom}` : 'Nouvelle classe'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={enregistrer}>{c ? 'Enregistrer' : 'Créer la classe'}</Button></>}>
      <Grille>
        <Champ label="Nom de la classe" erreur={err('nom')}><Saisie value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="Exemple : 5ème B" /></Champ>
        <Champ label="Cycle"><Liste value={f.niveau} onChange={(e) => setF({ ...f, niveau: e.target.value })} options={['Premier cycle', 'Second cycle']} /></Champ>
        <Champ label="Capacité (places)" erreur={err('capacite')}><Saisie type="number" min={1} max={120} value={f.capacite} onChange={(e) => setF({ ...f, capacite: e.target.value })} /></Champ>
        <Champ label="Salle"><Saisie value={f.salle} onChange={(e) => setF({ ...f, salle: e.target.value })} placeholder="Exemple : Salle 8" /></Champ>
        <Champ label="Professeur principal" erreur={err('pp')} className="sm:col-span-2"><Liste value={f.pp} onChange={(e) => setF({ ...f, pp: e.target.value })} options={[{ value: '', label: 'Pas encore désigné' }, ...profs.map((p) => ({ value: p, label: p }))]} /></Champ>
      </Grille>
    </Modal>
  );
}

/* =========================================================
 * Matières
 * ======================================================= */
const groupes = { 1: 'Groupe 1 · Littéraire', 2: 'Groupe 2 · Scientifique', 3: 'Groupe 3 · Complémentaire' } as const;

export function Matieres() {
  const { etat, retirer } = useSecretariat();
  const toast = useToast();
  const classes = visibles(etat.classes);
  const [classe, setClasse] = useState(classes[0]?.nom ?? '');
  const [edition, setEdition] = useState<Matiere | 'nouvelle' | null>(null);
  const liste = visibles(etat.matieres).filter((m) => m.classe === classe).sort((a, b) => a.groupe - b.groupe || b.coef - a.coef);
  const totalCoef = liste.reduce((s, m) => s + m.coef, 0);

  return (
    <>
      <Titre titre="Matières" texte="Matières, coefficients et enseignants de chaque classe. Les coefficients servent au calcul des moyennes des bulletins." action={<Button icon={Plus} onClick={() => setEdition('nouvelle')} disabled={!classe}>Ajouter une matière</Button>} />
      <section className="rounded-[22px] bg-white shadow-feuille">
        <div className="flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
          <Champ label="Classe" className="w-56"><Liste value={classe} onChange={(e) => setClasse(e.target.value)} options={classes.map((c) => c.nom)} /></Champ>
          <p className="text-sm text-encre-doux">{liste.length} matières · total des coefficients <b className="text-encre chiffres">{totalCoef}</b></p>
        </div>
        {liste.length === 0 ? <EmptyState icon={BookMarked} title="Aucune matière" text="Cette classe n’a pas encore de matière." action={<Button icon={Plus} onClick={() => setEdition('nouvelle')}>Ajouter une matière</Button>} /> : (
          <Table caption={`Matières de la ${classe}`} head={['Code', 'Matière', 'Groupe', { label: 'Coef.', align: 'center' }, 'Enseignant', { label: 'Actions', sr: true }]} minWidth={760}>
            {liste.map((m) => (
              <tr key={m.id}>
                <Td className="font-mono text-[13px] font-semibold">{m.code}</Td>
                <Td className="font-semibold">{m.nom}</Td>
                <Td className="text-encre-doux">{groupes[m.groupe]}</Td>
                <Td className="text-center"><span className="inline-grid size-8 place-items-center rounded-lg bg-brand-50 font-bold text-brand-800 chiffres">{m.coef}</span></Td>
                <Td>{m.prof || <span className="text-stylo">À attribuer</span>}</Td>
                <Td className="text-right">
                  <div className="flex justify-end">
                    <IconButton icon={Pencil} label={`Modifier ${m.nom}`} onClick={() => setEdition(m)} />
                    <BoutonsRetrait quoi="cette matière" onRetirer={(mode, motif) => (retirer('matieres', m.id, mode, motif, { module: 'Matières', element: `${m.nom} (${m.classe})` }), toast('Fait. L’administrateur peut restaurer cette matière.'))} />
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </section>
      {edition && <EditionMatiere m={edition === 'nouvelle' ? null : edition} classe={classe} onClose={() => setEdition(null)} />}
    </>
  );
}

function EditionMatiere({ m, classe, onClose }: { m: Matiere | null; classe: string; onClose: () => void }) {
  const { etat, ajouter, modifier } = useSecretariat();
  const toast = useToast();
  const profs = visibles(etat.enseignants).filter((e) => e.actif);
  const [f, setF] = useState({ code: m?.code ?? '', nom: m?.nom ?? '', coef: String(m?.coef ?? 2), groupe: String(m?.groupe ?? 1), prof: m?.prof ?? '' });
  const [essai, setEssai] = useState(false);
  const coef = Number(f.coef);
  const erreurs = {
    code: !/^[A-Z]{2,6}$/.test(f.code.trim().toUpperCase()) ? 'Code de 2 à 6 lettres, exemple : MATH.' : visibles(etat.matieres).some((x) => x.classe === classe && x.id !== m?.id && x.code === f.code.trim().toUpperCase()) && 'Ce code existe déjà dans cette classe.',
    nom: !f.nom.trim() && 'Le nom est obligatoire.',
    coef: (!coef || coef < 1 || coef > 10 || !Number.isInteger(coef)) && 'Coefficient entier entre 1 et 10.',
  };
  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  const enregistrer = () => {
    setEssai(true);
    if (Object.values(erreurs).some(Boolean)) return;
    const d = { code: f.code.trim().toUpperCase(), nom: f.nom.trim(), coef, groupe: Number(f.groupe) as 1 | 2 | 3, prof: f.prof };
    if (m) {
      modifier('matieres', m.id, d, { operation: 'Modification', module: 'Matières', element: `${m.nom} (${classe})`, avant: `coef ${m.coef}, ${m.prof || '—'}`, apres: `coef ${d.coef}, ${d.prof || '—'}` });
      toast('Matière mise à jour.');
    } else {
      ajouter('matieres', { ...d, classe, etat: 'actif' }, { operation: 'Création', module: 'Matières', element: `${d.nom} (${classe}), coef ${d.coef}` });
      toast('Matière ajoutée.');
    }
    onClose();
  };
  return (
    <Modal title={m ? 'Modifier la matière' : `Ajouter une matière en ${classe}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={enregistrer}>Enregistrer</Button></>}>
      <Grille>
        <Champ label="Code" erreur={err('code')}><Saisie value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="MATH" /></Champ>
        <Champ label="Nom" erreur={err('nom')}><Saisie value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="Mathématiques" /></Champ>
        <Champ label="Coefficient" erreur={err('coef')}><Saisie type="number" min={1} max={10} value={f.coef} onChange={(e) => setF({ ...f, coef: e.target.value })} /></Champ>
        <Champ label="Groupe"><Liste value={f.groupe} onChange={(e) => setF({ ...f, groupe: e.target.value })} options={Object.entries(groupes).map(([value, label]) => ({ value, label }))} /></Champ>
        <Champ label="Enseignant" className="sm:col-span-2"><Liste value={f.prof} onChange={(e) => setF({ ...f, prof: e.target.value })} options={[{ value: '', label: 'À attribuer' }, ...profs.map((p) => { const court = `${p.civilite} ${p.nom}`; return { value: court, label: `${p.civilite} ${p.nom} ${p.prenom} · ${p.specialite}` }; })]} /></Champ>
      </Grille>
      {m && Number(f.coef) !== m.coef && <div className="mt-4"><Note ton="feutre">Changer un coefficient modifie le calcul des moyennes des bulletins pas encore générés.</Note></div>}
    </Modal>
  );
}

/* =========================================================
 * Anciennes années (lecture seule)
 * ======================================================= */
export function Annees() {
  const { etat } = useSecretariat();
  const [annee, setAnnee] = useState(etat.annees[0]?.annee ?? '');
  const [q, setQ] = useState('');
  const a = etat.annees.find((x) => x.annee === annee)!;
  const t = q.trim().toLowerCase();
  const liste = a.eleves.filter((e) => !t || `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(t));
  return (
    <>
      <Titre titre="Anciennes années" texte="Consultez les années scolaires passées. Elles sont archivées : rien ne peut y être modifié." action={<Pill tone="neutre"><Lock className="size-3" aria-hidden /> Lecture seule</Pill>} />
      <div className="mb-5 flex flex-wrap gap-2">
        {etat.annees.map((x) => (
          <button key={x.annee} onClick={() => setAnnee(x.annee)} aria-pressed={x.annee === annee} className={`min-h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold ring-1 ring-inset ${x.annee === annee ? 'bg-brand-700 text-white ring-brand-700' : 'bg-white ring-papier-ligne hover:ring-brand-300'}`}>
            <Archive className="mr-1.5 inline size-4" aria-hidden />Année {x.annee}
          </button>
        ))}
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Chiffre label="Effectif" valeur={a.effectif.toLocaleString('fr-FR')} icone={BookMarked} />
        <Chiffre label="Taux de réussite" valeur={`${a.reussite} %`} icone={Star} ton="valide" />
        <Chiffre label="Recettes de l’année" valeur={nombre(a.recettes)} unite="FCFA" icone={Archive} />
      </div>
      <Bloc titre={`Élèves de ${a.annee}`} action={<label className="relative block w-64 max-w-full"><span className="sr-only">Rechercher</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-encre-pale" aria-hidden /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou matricule" className="field-input pl-9" /></label>}>
        <div className="-mx-5 sm:-mx-6">
          <Table caption={`Élèves de ${a.annee}`} head={['Matricule', 'Élève', 'Classe', 'Moyenne annuelle', 'Décision', 'Réinscrit']} minWidth={720}>
            {liste.map((e) => {
              const reinscrit = etat.eleves.find((x) => x.ancienMatricule === e.matricule);
              return (
                <tr key={e.id}>
                  <Td className="chiffres text-[13px]">{e.matricule}</Td>
                  <Td className="font-semibold">{e.nom} {e.prenom}</Td>
                  <Td>{e.classe}</Td>
                  <Td><Grade value={e.moyenne} size="sm" /></Td>
                  <Td><Pill tone={e.decision === 'Admis' ? 'valide' : e.decision === 'Exclu' ? 'stylo' : 'orange'}>{e.decision}</Pill></Td>
                  <Td>{reinscrit ? <span className="text-sm">{reinscrit.classe} · {reinscrit.matricule}</span> : <span className="text-sm text-encre-pale">Non</span>}</Td>
                </tr>
              );
            })}
          </Table>
        </div>
        <p className="mt-4 text-[13px] text-encre-doux">Seule une partie des élèves est affichée dans cette démonstration. La création et la clôture d’une année sont réservées à l’administrateur.</p>
      </Bloc>
    </>
  );
}
