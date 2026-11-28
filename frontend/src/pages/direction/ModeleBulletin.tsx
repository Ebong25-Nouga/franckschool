import { ChevronDown, ImagePlus, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Titre } from '@/components/espace';
import { Button, Modal, Segmented, useToast } from '@/components/kit';
import { documentBulletins, htmlBulletin, type DonneesBulletin, type LigneBulletin } from '@/lib/bulletin';
import { cn } from '@/lib/utils';
import { Champ, Grille, Note, Saisie } from '../secretariat/commun';
import { modeleBulletinDefaut, type ModeleBulletin as Modele, type Parametres } from '../secretariat/donnees';
import { useSecretariat } from '../secretariat/store';

/* =========================================================
 * Modèle de bulletin (décisions 033-034)
 * À gauche : la partie fixe du bulletin, réglée par l'administrateur.
 * À droite : l'aperçu en direct, rempli avec des données d'exemple.
 * Les données de chaque élève (nom, classe, notes, moyennes, rangs)
 * sont toujours remplies par le système.
 * ======================================================= */

/* ---------- Données d'exemple pour l'aperçu ---------- */
const MATIERES: [string, string, number, 1 | 2 | 3, number][] = [
  ['Français', 'Mme NGO BASSA Rose', 4, 1, 13.75],
  ['Anglais', 'Mme ABENA Lucie', 3, 1, 16.75],
  ['Histoire-Géographie', 'M. KAMGA Hervé', 2, 1, 12.5],
  ['Mathématiques', 'M. ESSOMBA Paul', 5, 2, 13.1],
  ['Physique-Chimie', 'M. FOTSO Alain', 4, 2, 10.5],
  ['SVT', 'Mme OWONA Sylvie', 2, 2, 14.5],
  ['Informatique', 'M. TAGNE Éric', 1, 2, 15.75],
  ['Éducation civique', 'M. KAMGA Hervé', 1, 3, 15.5],
  ['EPS', 'Mme EYENGA Rachel', 1, 3, 16.5],
];
const MATIERES_EN_PLUS: typeof MATIERES = [
  ['Espagnol', 'M. ATANGANA Luc', 2, 1, 12.25],
  ['Allemand', 'Mme NANGA Brigitte', 2, 1, 11.5],
  ['Littérature', 'Mme NGO BASSA Rose', 1, 1, 14],
  ['Langue nationale', 'M. MBIDA Joseph', 1, 1, 15],
  ['Technologie', 'M. FOTSO Alain', 1, 2, 12.75],
  ['Travail manuel', 'M. TCHOUA Marc', 1, 3, 16],
  ['Dessin', 'Mme ONANA Grâce', 1, 3, 14.25],
];

function exemple(trimestre: 1 | 2 | 3, chargee: boolean): DonneesBulletin {
  const decal = (trimestre - 1) * 0.4;
  const liste = chargee ? [...MATIERES, ...MATIERES_EN_PLUS] : MATIERES;
  const lignes: LigneBulletin[] = liste.map(([matiere, prof, coef, groupe, base], i) => {
    const n1 = Math.min(20, Math.round((base + decal - 0.75 + (i % 3) * 0.25) * 4) / 4);
    const n2 = Math.min(20, Math.round((base + decal + 0.75 - (i % 2) * 0.5) * 4) / 4);
    const moyenne = (n1 + n2) / 2;
    return { matiere, prof, groupe, coef, notes: [n1, n2], moyenne, rang: 1 + ((i * 7 + trimestre * 3) % 21), moyClasse: 10.2 + ((i * 3) % 7) * 0.55, min: 3 + (i % 5), max: Math.min(20, 16 + (i % 4) * 0.75) };
  });
  const coefs = lignes.reduce((s, l) => s + l.coef, 0);
  const moy = (k: (l: LigneBulletin) => number) => lignes.reduce((s, l) => s + k(l) * l.coef, 0) / coefs;
  const moyenne = moy((l) => l.moyenne);
  return {
    trimestre,
    annee: '2026-2027',
    numero: `BUL-2026-T${trimestre}-0001`,
    date: ['19/12/2026', '27/03/2027', '18/06/2027'][trimestre - 1],
    eleve: { nom: 'MBARGA Marie-Claire', matricule: 'CBE26-0001', naissance: '12 mars 2012 à Yaoundé', sexe: 'F', classe: '4ème A', effectif: 48, redoublant: false, pp: 'Mme ABENA Lucie' },
    lignes,
    resultats: { moyenne, rang: 5, moyClasse: 11.42, max: 16.87, min: 6.35, taux: 62.5, moySeq: [moy((l) => l.notes[0] ?? 0), moy((l) => l.notes[1] ?? 0)] },
    assiduite: { justifiees: 2, nonJustifiees: 4, retards: 1 },
    appreciation: 'Bon trimestre. Élève sérieuse et régulière ; doit renforcer la Physique-Chimie.',
    annuel: trimestre === 3 ? { trimestres: [moyenne - 0.8, moyenne - 0.4, moyenne], moyenne: moyenne - 0.4, rang: 6 } : undefined,
  };
}

/* ---------- Petits éléments du formulaire ---------- */
function Partie({ n, titre, sous, ouverte, onBasculer, children }: { n: number; titre: string; sous: string; ouverte: boolean; onBasculer: () => void; children: ReactNode }) {
  return (
    <section className={cn('overflow-hidden rounded-2xl bg-white ring-1', ouverte ? 'ring-brand-200' : 'ring-papier-ligne/70')}>
      <h2>
        <button type="button" aria-expanded={ouverte} onClick={onBasculer} className={cn('flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left', ouverte ? 'bg-brand-50/60' : 'hover:bg-papier')}>
          <span className={cn('grid size-7 shrink-0 place-items-center rounded-lg text-[13px] font-bold', ouverte ? 'bg-brand-700 text-white' : 'bg-papier-2 text-encre-doux')}>{n}</span>
          <span className="min-w-0 flex-1"><span className="block text-[15px] font-bold">{titre}</span><span className="block text-[13px] font-normal text-encre-doux">{sous}</span></span>
          <ChevronDown className={cn('size-5 shrink-0 text-encre-doux transition-transform', ouverte && 'rotate-180')} aria-hidden />
        </button>
      </h2>
      {ouverte && <div className="space-y-4 px-4 pb-5 pt-4">{children}</div>}
    </section>
  );
}

function Interrupteur({ label, aide, on, onChange }: { label: string; aide?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
      <span className="min-w-0"><span className={cn('block text-[14.5px]', on ? 'font-semibold' : 'text-encre-doux')}>{label}</span>{aide && <span className="block text-xs text-encre-pale">{aide}</span>}</span>
      <input type="checkbox" role="switch" checked={on} onChange={() => onChange(!on)} className="peer sr-only" />
      <span aria-hidden className={cn('relative h-6 w-10 shrink-0 rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/20', on ? 'bg-brand-700' : 'bg-papier-ligne')}>
        <span className={cn('absolute top-[3px] size-[18px] rounded-full bg-white shadow transition-all', on ? 'left-[19px]' : 'left-[3px]')} />
      </span>
    </label>
  );
}

/* ---------- Aperçu (cadre A4 mis à l'échelle) ---------- */
function Apercu({ p }: { p: Parametres }) {
  const [trimestre, setTrimestre] = useState<'1' | '2' | '3'>('1');
  const [classe, setClasse] = useState<'normale' | 'chargee'>('normale');
  const zone = useRef<HTMLDivElement>(null);
  const [largeur, setLargeur] = useState(560);
  useEffect(() => {
    const el = zone.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLargeur(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pages = useMemo(() => htmlBulletin(p.modeleBulletin, p, exemple(Number(trimestre) as 1 | 2 | 3, classe === 'chargee')), [p, trimestre, classe]);
  const nbPages = (pages.match(/<section class="feuille/g) ?? []).length;
  const echelle = Math.min(1, largeur / 794);
  const hauteur = nbPages * 1123 + (nbPages - 1) * 24;
  return (
    <section aria-label="Aperçu du bulletin" className="overflow-hidden rounded-[22px] bg-white shadow-feuille">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-papier-ligne/70 px-4 py-3">
        <h2 className="font-display text-[17px] font-bold">Aperçu</h2>
        <Segmented label="Trimestre de l’aperçu" value={trimestre} onChange={setTrimestre} options={[{ value: '1', label: '1er trim.' }, { value: '2', label: '2e trim.' }, { value: '3', label: '3e trim.' }]} />
        <Segmented label="Classe d’exemple" value={classe} onChange={setClasse} options={[{ value: 'normale', label: '9 matières' }, { value: 'chargee', label: '16 matières' }]} />
      </div>
      <div className="bg-papier-2 p-3 sm:p-4">
        <div ref={zone} className="mx-auto w-full max-w-[794px]">
          <div style={{ height: hauteur * echelle }} className="overflow-hidden">
            <iframe title="Aperçu du bulletin" srcDoc={documentBulletins(p, pages)} style={{ width: 794, height: hauteur, transform: `scale(${echelle})`, transformOrigin: '0 0' }} className="block border-0 shadow-leve" />
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-encre-doux">Élève et notes fictifs : sur les vrais bulletins, le système remplit les informations de chaque élève. {nbPages > 1 && 'Avec beaucoup de matières, le bulletin passe sur 2 pages.'}</p>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function ModeleBulletin() {
  const { etat, majParametres } = useSecretariat();
  const toast = useToast();
  const [p, setP] = useState<Parametres>(etat.parametres);
  const [ouvertes, setOuvertes] = useState<number[]>([1, 2, 3]);
  const [defaut, setDefaut] = useState(false);
  const m = p.modeleBulletin;
  const change = JSON.stringify(p) !== JSON.stringify(etat.parametres);
  const basculer = (n: number) => setOuvertes((o) => (o.includes(n) ? o.filter((x) => x !== n) : [...o, n]));
  const setM = (x: Partial<Modele>) => setP({ ...p, modeleBulletin: { ...m, ...x } });
  const ent = (k: keyof Modele['entete']) => ({ value: m.entete[k], onChange: (e: { target: { value: string } }) => setM({ entete: { ...m.entete, [k]: e.target.value } }) });
  const etab = (k: 'nom' | 'sigle' | 'devise' | 'adresse' | 'ville' | 'telephone' | 'email' | 'autorisation' | 'signataire' | 'titreSignataire') => ({ value: p[k], onChange: (e: { target: { value: string } }) => setP({ ...p, [k]: e.target.value }) });
  const titreVide = !m.titre.trim() || !p.nom.trim();

  const enregistrer = () => {
    if (titreVide) return toast('Le titre du bulletin et le nom de l’établissement sont obligatoires.');
    majParametres(p, { operation: 'Modification', module: 'Bulletins', element: 'Modèle de bulletin', apres: 'Appliqué aux prochains bulletins ; les bulletins déjà publiés ne changent pas' });
    toast('Modèle enregistré. Il servira aux prochains bulletins.');
  };
  const logo = (fichier?: File) => {
    if (!fichier) return;
    if (fichier.size > 500_000) return toast('Logo trop lourd : 500 Ko au maximum.');
    const r = new FileReader();
    r.onload = () => setP((x) => ({ ...x, logo: String(r.result) }));
    r.readAsDataURL(fichier);
  };

  return (
    <>
      <Titre
        titre="Modèle de bulletin"
        texte="Réglez la partie fixe du bulletin de votre établissement. L’aperçu change pendant que vous écrivez."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={RotateCcw} onClick={() => setDefaut(true)}>Modèle par défaut</Button>
            <Button icon={Save} disabled={!change} onClick={enregistrer}>Enregistrer le modèle</Button>
          </div>
        }
      />
      <div className="mb-5">
        <Note ton="feutre">Les bulletins sont produits <b>uniquement à la fin de chaque trimestre</b> : 1er trimestre (séquences 1 et 2), 2e trimestre (séquences 3 et 4), 3e trimestre (séquences 5 et 6, avec le bilan de l’année). Le nom de l’élève, sa classe, ses notes, moyennes et rangs sont remplis par le système. Le modèle enregistré sert aux prochains bulletins ; ceux déjà publiés aux parents ne changent pas.</Note>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-3">
          <Partie n={1} titre="Nom du bulletin" sous="Le titre imprimé en haut" ouverte={ouvertes.includes(1)} onBasculer={() => basculer(1)}>
            <Champ label="Titre" erreur={!m.titre.trim() && 'Le titre est obligatoire.'} aide={`Le système ajoute le trimestre : « ${m.titre || 'Bulletin de notes'} du 1er trimestre ».`}>
              <Saisie value={m.titre} onChange={(e) => setM({ titre: e.target.value })} />
            </Champ>
          </Partie>

          <Partie n={2} titre="En-tête" sous="République, ministère, délégations (français et anglais)" ouverte={ouvertes.includes(2)} onBasculer={() => basculer(2)}>
            <Grille>
              <Champ label="Pays (français)"><Saisie {...ent('paysFr')} /></Champ>
              <Champ label="Pays (anglais)"><Saisie {...ent('paysEn')} /></Champ>
              <Champ label="Devise (français)"><Saisie {...ent('deviseFr')} /></Champ>
              <Champ label="Devise (anglais)"><Saisie {...ent('deviseEn')} /></Champ>
              <Champ label="Ministère" className="sm:col-span-2"><Saisie {...ent('ministereFr')} /></Champ>
              <Champ label="Ministry" className="sm:col-span-2"><Saisie {...ent('ministereEn')} /></Champ>
              <Champ label="Délégation régionale" className="sm:col-span-2"><Saisie {...ent('regionFr')} /></Champ>
              <Champ label="Regional delegation" className="sm:col-span-2"><Saisie {...ent('regionEn')} /></Champ>
              <Champ label="Délégation départementale" className="sm:col-span-2"><Saisie {...ent('departementFr')} /></Champ>
              <Champ label="Divisional delegation" className="sm:col-span-2"><Saisie {...ent('departementEn')} /></Champ>
            </Grille>
          </Partie>

          <Partie n={3} titre="Logo" sous="Image et place dans l’en-tête" ouverte={ouvertes.includes(3)} onBasculer={() => basculer(3)}>
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl text-lg font-extrabold text-white" style={{ background: p.couleur }}>{p.logo ? <img src={p.logo} alt="Logo de l’établissement" className="size-full bg-white object-contain" /> : p.sigle}</span>
              <div className="space-y-2">
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-white px-3.5 text-sm font-semibold ring-1 ring-inset ring-papier-ligne hover:ring-brand-300"><ImagePlus className="size-4" aria-hidden />Changer le logo<input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={(e) => logo(e.target.files?.[0])} /></label>
                {p.logo && <button type="button" onClick={() => setP({ ...p, logo: undefined })} className="flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-stylo hover:underline"><Trash2 className="size-3.5" aria-hidden />Retirer le logo</button>}
                <p className="text-xs text-encre-doux">PNG, JPG ou SVG, 500 Ko au plus. Sans logo, le sigle est affiché.</p>
              </div>
            </div>
            <div>
              <p className="field-label">Place du logo</p>
              <Segmented label="Place du logo" value={m.logoPlace} onChange={(v) => setM({ logoPlace: v })} options={[{ value: 'gauche', label: 'À gauche' }, { value: 'centre', label: 'Au centre' }, { value: 'droite', label: 'À droite' }]} />
            </div>
          </Partie>

          <Partie n={4} titre="Établissement" sous="Nom, adresse, contacts, autorisation, devise" ouverte={ouvertes.includes(4)} onBasculer={() => basculer(4)}>
            <Grille>
              <Champ label="Nom de l’établissement" className="sm:col-span-2" erreur={!p.nom.trim() && 'Le nom est obligatoire.'}><Saisie {...etab('nom')} /></Champ>
              <Champ label="Sigle"><Saisie {...etab('sigle')} /></Champ>
              <Champ label="Devise de l’école"><Saisie {...etab('devise')} /></Champ>
              <Champ label="Adresse"><Saisie {...etab('adresse')} /></Champ>
              <Champ label="Ville"><Saisie {...etab('ville')} /></Champ>
              <Champ label="Téléphone"><Saisie {...etab('telephone')} /></Champ>
              <Champ label="E-mail"><Saisie type="email" {...etab('email')} /></Champ>
              <Champ label="Autorisation d’ouverture" className="sm:col-span-2"><Saisie {...etab('autorisation')} /></Champ>
            </Grille>
            <p className="text-[13px] text-encre-doux">Ce sont les mêmes informations que dans Paramètres : les changer ici les change partout.</p>
          </Partie>

          <Partie n={5} titre="Tableau des notes" sous="Colonnes affichées, groupes de matières" ouverte={ouvertes.includes(5)} onBasculer={() => basculer(5)}>
            <div className="divide-y divide-papier-ligne/60">
              <Interrupteur label="Nom de l’enseignant" aide="Sous le nom de chaque matière" on={m.colonnes.enseignant} onChange={(v) => setM({ colonnes: { ...m.colonnes, enseignant: v } })} />
              <Interrupteur label="Notes de chaque séquence" on={m.colonnes.sequences} onChange={(v) => setM({ colonnes: { ...m.colonnes, sequences: v } })} />
              <Interrupteur label="Total (moyenne × coefficient)" on={m.colonnes.total} onChange={(v) => setM({ colonnes: { ...m.colonnes, total: v } })} />
              <Interrupteur label="Rang dans la matière" on={m.colonnes.rang} onChange={(v) => setM({ colonnes: { ...m.colonnes, rang: v } })} />
              <Interrupteur label="Moyenne de la classe" on={m.colonnes.moyClasse} onChange={(v) => setM({ colonnes: { ...m.colonnes, moyClasse: v } })} />
              <Interrupteur label="Note la plus basse et la plus haute" on={m.colonnes.minMax} onChange={(v) => setM({ colonnes: { ...m.colonnes, minMax: v } })} />
              <Interrupteur label="Appréciation" on={m.colonnes.appreciation} onChange={(v) => setM({ colonnes: { ...m.colonnes, appreciation: v } })} />
              <Interrupteur label="Regrouper les matières par groupe" aide="Littéraires, scientifiques, complémentaires, avec sous-totaux" on={m.groupes} onChange={(v) => setM({ groupes: v })} />
            </div>
            <p className="text-[13px] text-encre-doux">La moyenne et le coefficient sont toujours affichés. Les lignes viennent des matières de chaque classe (page Matières) : leur nombre s’adapte tout seul.</p>
          </Partie>

          <Partie n={6} titre="Résultats et mentions" sous="Barème des mentions, distinctions, assiduité" ouverte={ouvertes.includes(6)} onBasculer={() => basculer(6)}>
            <div>
              <p className="field-label">Mentions selon la moyenne</p>
              <ul className="space-y-2">
                {p.mentions.map((x, i) => (
                  <li key={i} className="grid grid-cols-[auto_84px_minmax(0,1fr)] items-center gap-2">
                    <span className="text-[13px] text-encre-doux">À partir de</span>
                    <Saisie type="number" min={0} max={20} step={0.5} value={x.min} onChange={(e) => setP({ ...p, mentions: p.mentions.map((y, j) => (j === i ? { ...y, min: Number(e.target.value) } : y)) })} aria-label={`Seuil de la mention ${x.libelle}`} />
                    <Saisie value={x.libelle} onChange={(e) => setP({ ...p, mentions: p.mentions.map((y, j) => (j === i ? { ...y, libelle: e.target.value } : y)) })} aria-label="Mention" />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="field-label">Distinctions (cochées selon la moyenne)</p>
              <ul className="space-y-2">
                {m.distinctions.map((x, i) => (
                  <li key={i} className="grid grid-cols-[minmax(0,1fr)_84px_auto] items-center gap-2">
                    <Saisie value={x.libelle} onChange={(e) => setM({ distinctions: m.distinctions.map((y, j) => (j === i ? { ...y, libelle: e.target.value } : y)) })} aria-label="Distinction" />
                    <Saisie type="number" min={0} max={20} step={0.5} value={x.min} onChange={(e) => setM({ distinctions: m.distinctions.map((y, j) => (j === i ? { ...y, min: Number(e.target.value) } : y)) })} aria-label={`Moyenne minimale pour ${x.libelle}`} />
                    <button type="button" onClick={() => setM({ distinctions: m.distinctions.filter((_, j) => j !== i) })} aria-label={`Retirer ${x.libelle}`} className="grid size-10 cursor-pointer place-items-center rounded-[10px] text-stylo hover:bg-stylo-50"><Trash2 className="size-4" aria-hidden /></button>
                  </li>
                ))}
              </ul>
              {m.distinctions.length < 5 && <button type="button" onClick={() => setM({ distinctions: [...m.distinctions, { libelle: 'Nouvelle distinction', min: 15 }] })} className="mt-2 flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline"><Plus className="size-3.5" aria-hidden />Ajouter une distinction</button>}
            </div>
            <div className="divide-y divide-papier-ligne/60">
              <Interrupteur label="Bloc « Assiduité »" aide="Absences justifiées, non justifiées, retards" on={m.assiduite} onChange={(v) => setM({ assiduite: v })} />
              <Interrupteur label="Case pour la photo de l’élève" on={m.photo} onChange={(v) => setM({ photo: v })} />
            </div>
          </Partie>

          <Partie n={7} titre="Signatures" sous="Titres des cases de signature" ouverte={ouvertes.includes(7)} onBasculer={() => basculer(7)}>
            <Grille>
              <Champ label="Case du parent"><Saisie value={m.visaParent} onChange={(e) => setM({ visaParent: e.target.value })} /></Champ>
              <Champ label="Case du professeur principal" aide="Son nom vient de la page Classes."><Saisie value={m.titrePP} onChange={(e) => setM({ titrePP: e.target.value })} /></Champ>
              <Champ label="Titre du chef d’établissement"><Saisie {...etab('titreSignataire')} placeholder="Le Principal" /></Champ>
              <Champ label="Nom du chef d’établissement"><Saisie {...etab('signataire')} /></Champ>
            </Grille>
          </Partie>

          <Partie n={8} titre="Bas de page" sous="Mention en bas du bulletin" ouverte={ouvertes.includes(8)} onBasculer={() => basculer(8)}>
            <Champ label="Mention" aide="La date, le numéro du bulletin et la page sont ajoutés automatiquement.">
              <Saisie value={m.piedPage} onChange={(e) => setM({ piedPage: e.target.value })} />
            </Champ>
          </Partie>
        </div>

        <div className="min-w-0 xl:sticky xl:top-6">
          <Apercu p={p} />
        </div>
      </div>

      {change && (
        <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-encre px-5 py-3 text-white shadow-leve">
          <span className="text-sm">Modifications non enregistrées.</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setP(etat.parametres)}>Annuler</Button>
            <Button size="sm" variant="success" onClick={enregistrer}>Enregistrer</Button>
          </div>
        </div>
      )}

      {defaut && (
        <Modal
          title="Revenir au modèle par défaut ?"
          lead="L’en-tête, le titre, les colonnes, les distinctions, les signatures et le bas de page reprennent leurs valeurs de départ. Le logo, les informations de l’établissement et les mentions ne changent pas."
          onClose={() => setDefaut(false)}
          footer={<><Button variant="secondary" onClick={() => setDefaut(false)}>Annuler</Button><Button onClick={() => { setP({ ...p, modeleBulletin: modeleBulletinDefaut }); setDefaut(false); toast('Modèle par défaut repris. Enregistrez pour l’appliquer.'); }}>Reprendre le modèle par défaut</Button></>}
        >
          <p className="text-sm text-encre-doux">Rien n’est enregistré tant que vous ne cliquez pas sur « Enregistrer le modèle ».</p>
        </Modal>
      )}
    </>
  );
}
