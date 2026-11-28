import { Banknote, CheckCircle2, KeyRound, Printer, RotateCcw, Search, UserPlus } from 'lucide-react';
import { RemiseAcces } from './Personnes';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bloc, Chiffre, Titre } from '@/components/espace';
import { Avatar, Button, Grade, Modal, Pill, Segmented, Table, Td, useToast } from '@/components/kit';
import { ecole } from '@/data/demo';
import { entete, html, imprimer } from '@/lib/imprimer';
import { Champ, ChoisirEleve, dateFr, Grille, Liste, montant, nomEleve, Note, Saisie, useDroit, espaceCourant } from './commun';
import type { AncienEleve, EleveS } from './donnees';
import { aujourdhui, useSecretariat, visibles } from './store';

const fraisAnnuels = (classe: string) => (classe.startsWith('Tle') || classe.startsWith('1ère') ? 185000 : 150000);
const suivant: Record<string, string> = { '6ème': '5ème', '5ème': '4ème', '4ème': '3ème', '3ème': '2nde', '2nde': '1ère', '1ère': 'Tle' };

export function ficheInscription(e: EleveS, tuteur: string, telephone: string) {
  imprimer(`Fiche d’inscription ${e.matricule}`, `${entete('Fiche d’inscription', e.matricule)}
    <table>
      <tr><th>Nom et prénom</th><td class="gras">${html(nomEleve(e))}</td><th>Matricule</th><td>${html(e.matricule)}</td></tr>
      <tr><th>Né(e) le</th><td>${html(dateFr(e.dateNaissance))} à ${html(e.lieuNaissance)}</td><th>Sexe</th><td>${e.sexe === 'F' ? 'Féminin' : 'Masculin'}</td></tr>
      <tr><th>Classe</th><td class="gras">${html(e.classe)}</td><th>Statut</th><td>${html(e.statut)}</td></tr>
      <tr><th>Adresse</th><td colspan="3">${html(e.adresse)}</td></tr>
      <tr><th>Parent ou tuteur</th><td>${html(tuteur)}</td><th>Téléphone</th><td>${html(telephone)}</td></tr>
      <tr><th>Frais de scolarité</th><td colspan="3">${html(montant(e.du))} pour l’année ${html(ecole.annee)}</td></tr>
    </table>
    <p>Inscrit(e) le ${html(dateFr(e.inscritLe))} par ${html(e.inscritPar)}.</p>
    <div class="signature"><div>Le parent ou tuteur<div class="ligne"></div></div><div>Le secrétariat<div class="ligne"></div></div></div>`);
}

export default function Inscriptions() {
  const { etat } = useSecretariat();
  const [onglet, setOnglet] = useState<'nouvelle' | 'reinscription' | 'liste'>('nouvelle');
  const annee = etat.annees[0];
  const aReinscrire = annee.eleves.filter((a) => a.decision !== 'Exclu' && !etat.eleves.some((e) => e.ancienMatricule === a.matricule));
  const inscrits = visibles(etat.eleves).filter((e) => e.situation === 'inscrit');

  return (
    <>
      <Titre titre="Inscriptions et réinscriptions" texte={`Année scolaire ${ecole.annee}. Inscrivez un nouvel élève ou réinscrivez un élève de l’année ${annee.annee}.`} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Chiffre label="Nouveaux élèves" valeur={String(inscrits.filter((e) => e.statut === 'nouveau').length)} icone={UserPlus} />
        <Chiffre label="Anciens et redoublants" valeur={String(inscrits.filter((e) => e.statut !== 'nouveau').length)} icone={RotateCcw} />
        <Chiffre label={`À réinscrire (${annee.annee})`} valeur={String(aReinscrire.length)} icone={Search} ton={aReinscrire.length ? 'feutre' : 'encre'} />
      </div>
      <div className="mb-5">
        <Segmented
          label="Inscriptions"
          value={onglet}
          onChange={setOnglet}
          options={[
            { value: 'nouvelle', label: 'Nouvelle inscription' },
            { value: 'reinscription', label: 'Réinscriptions', count: aReinscrire.length },
            { value: 'liste', label: 'Inscriptions de l’année', count: inscrits.length },
          ]}
        />
      </div>
      {onglet === 'nouvelle' && <NouvelleInscription />}
      {onglet === 'reinscription' && <Reinscriptions liste={aReinscrire} annee={annee.annee} />}
      {onglet === 'liste' && <ListeInscriptions />}
    </>
  );
}

/* =========================================================
 * Nouvelle inscription
 * ======================================================= */
const vide = { nom: '', prenom: '', sexe: 'F' as 'M' | 'F', dateNaissance: '', lieuNaissance: '', adresse: '', classe: '', statut: 'nouveau' as EleveS['statut'], tuteurExistant: null as number | null, tuteurNom: '', lien: 'Mère', telephone: '', profession: '' };

function NouvelleInscription() {
  const { etat, ajouter, utilisateur } = useSecretariat();
  const peut = useDroit();
  const toast = useToast();
  const classes = visibles(etat.classes);
  const [f, setF] = useState({ ...vide, classe: classes[0]?.nom ?? '' });
  const [modeTuteur, setModeTuteur] = useState<'nouveau' | 'existant'>('nouveau');
  const [essai, setEssai] = useState(false);
  const [fait, setFait] = useState<EleveS | null>(null);
  const [remise, setRemise] = useState(false);
  const [q, setQ] = useState('');

  const places = (nom: string) => {
    const c = classes.find((x) => x.nom === nom);
    const n = visibles(etat.eleves).filter((e) => e.classe === nom && e.situation === 'inscrit').length;
    return { n, cap: c?.capacite ?? 0 };
  };
  const p = places(f.classe);
  const tel = f.telephone.replace(/\s/g, '');
  const erreurs = {
    nom: !f.nom.trim() && 'Le nom est obligatoire.',
    prenom: !f.prenom.trim() && 'Le prénom est obligatoire.',
    dateNaissance: !f.dateNaissance && 'La date de naissance est obligatoire.',
    lieuNaissance: !f.lieuNaissance.trim() && 'Le lieu de naissance est obligatoire.',
    classe: p.n >= p.cap && 'Cette classe est pleine.',
    tuteurNom: modeTuteur === 'nouveau' && !f.tuteurNom.trim() && 'Le nom du tuteur est obligatoire.',
    telephone: modeTuteur === 'nouveau' && !/^(\+237)?6\d{8}$/.test(tel) && 'Numéro camerounais attendu : 6XX XX XX XX.',
    tuteurExistant: modeTuteur === 'existant' && !f.tuteurExistant && 'Choisissez un tuteur.',
  };
  const doublon = visibles(etat.eleves).find((e) => e.nom === f.nom.trim().toUpperCase() && e.prenom.toLowerCase() === f.prenom.trim().toLowerCase() && e.dateNaissance === f.dateNaissance);
  const valide = Object.values(erreurs).every((x) => !x);

  const inscrire = () => {
    setEssai(true);
    if (!valide) return;
    let parentId = f.tuteurExistant;
    let tuteur = etat.parents.find((x) => x.id === parentId);
    if (modeTuteur === 'nouveau') {
      const t = { nom: f.tuteurNom.trim(), lien: f.lien, telephone: f.telephone.trim(), profession: f.profession.trim() || undefined, adresse: f.adresse.trim() || undefined, etat: 'actif' as const };
      parentId = ajouter('parents', t, { operation: 'Création', module: 'Parents et tuteurs', element: `${t.nom} (${t.lien})` });
      tuteur = { ...t, id: parentId };
    }
    const n = etat.eleves.reduce((m, e) => Math.max(m, Number(e.matricule.slice(-4)) || 0), 0) + 1;
    const eleve: Omit<EleveS, 'id'> = {
      matricule: `CBE26-${String(n).padStart(4, '0')}`,
      nom: f.nom.trim().toUpperCase(),
      prenom: f.prenom.trim(),
      sexe: f.sexe,
      dateNaissance: f.dateNaissance,
      lieuNaissance: f.lieuNaissance.trim(),
      classe: f.classe,
      statut: f.statut,
      tuteur: tuteur!.nom,
      lien: tuteur!.lien,
      telephone: tuteur!.telephone,
      du: fraisAnnuels(f.classe),
      paye: 0,
      moyenne: 0,
      absences: 0,
      etat: 'actif',
      situation: 'inscrit',
      parentIds: [parentId!],
      inscritLe: aujourdhui(),
      inscritPar: utilisateur,
      adresse: f.adresse.trim() || '—',
    };
    const id = ajouter('eleves', eleve, { operation: 'Inscription', module: 'Inscriptions', element: `${eleve.nom} ${eleve.prenom} (${eleve.matricule}) en ${eleve.classe}` });
    setFait({ ...eleve, id });
    toast(`${eleve.nom} ${eleve.prenom} est inscrit(e) en ${eleve.classe}.`);
  };

  if (fait) {
    const tuteur = etat.parents.find((x) => x.id === fait.parentIds[0]);
    return (
      <Bloc>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-valide-50 text-valide"><CheckCircle2 className="size-8" aria-hidden /></span>
          <h2 className="mt-4 font-display text-2xl font-bold">Inscription enregistrée</h2>
          <p className="mt-1 text-encre-doux">{nomEleve(fait)} · {fait.classe}</p>
          <p className="mt-4 rounded-xl bg-papier px-5 py-3 font-display text-xl font-bold chiffres">Matricule {fait.matricule}</p>
          {tuteur && (
            <div className="mt-6 w-full max-w-lg rounded-2xl bg-brand-50/70 p-4 text-left ring-1 ring-inset ring-brand-100">
              <p className="text-sm font-semibold">Espace parent de {tuteur.nom}</p>
              {tuteur.acces ? (
                <p className="mt-1 text-[13px] text-encre-doux">Ce parent a déjà un accès (remis le {dateFr(tuteur.acces.remisLe)}). Il verra ce nouvel enfant dans son espace.</p>
              ) : (
                <>
                  <p className="mt-1 text-[13px] text-encre-doux">Remettez-lui son identifiant et son code, par WhatsApp en privé ou en personne.</p>
                  <Button className="mt-3" icon={KeyRound} onClick={() => setRemise(true)}>Remettre l’accès au parent</Button>
                </>
              )}
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" icon={Printer} onClick={() => ficheInscription(fait, fait.tuteur, fait.telephone)}>Imprimer la fiche</Button>
            {peut('caisse') && <Link to={`${espaceCourant()}/caisse?encaisser=1&eleve=${fait.id}`}><Button icon={Banknote}>Encaisser les frais d’inscription</Button></Link>}
            <Button variant="ghost" onClick={() => { setFait(null); setF({ ...vide, classe: f.classe }); setEssai(false); }}>Inscrire un autre élève</Button>
          </div>
        </div>
        {remise && tuteur && <RemiseAcces parentId={tuteur.id} onClose={() => setRemise(false)} />}
      </Bloc>
    );
  }

  const err = (k: keyof typeof erreurs) => essai && erreurs[k];
  const parents = visibles(etat.parents).filter((x) => q.trim() && `${x.nom} ${x.telephone}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5);
  const choisi = etat.parents.find((x) => x.id === f.tuteurExistant);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Bloc titre="1. L’élève">
        <Grille>
          <Champ label="Nom" erreur={err('nom')}><Saisie value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="Exemple : MBARGA" /></Champ>
          <Champ label="Prénom" erreur={err('prenom')}><Saisie value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} /></Champ>
          <Champ label="Sexe"><Liste value={f.sexe} onChange={(e) => setF({ ...f, sexe: e.target.value as 'M' | 'F' })} options={[{ value: 'F', label: 'Féminin' }, { value: 'M', label: 'Masculin' }]} /></Champ>
          <Champ label="Date de naissance" erreur={err('dateNaissance')}><Saisie type="date" value={f.dateNaissance} onChange={(e) => setF({ ...f, dateNaissance: e.target.value })} /></Champ>
          <Champ label="Lieu de naissance" erreur={err('lieuNaissance')}><Saisie value={f.lieuNaissance} onChange={(e) => setF({ ...f, lieuNaissance: e.target.value })} /></Champ>
          <Champ label="Adresse (quartier)"><Saisie value={f.adresse} onChange={(e) => setF({ ...f, adresse: e.target.value })} placeholder="Exemple : Essos, Yaoundé" /></Champ>
        </Grille>
        {doublon && <div className="mt-4"><Note ton="feutre">Un élève porte déjà ce nom avec la même date de naissance ({doublon.matricule}, {doublon.classe}). Vérifiez avant d’enregistrer.</Note></div>}
      </Bloc>

      <div className="space-y-6">
        <Bloc titre="2. La scolarité">
          <Grille>
            <Champ label="Classe" erreur={err('classe')} aide={`${p.n} élèves sur ${p.cap} places`}>
              <Liste value={f.classe} onChange={(e) => setF({ ...f, classe: e.target.value })} options={classes.map((c) => c.nom)} />
            </Champ>
            <Champ label="Statut"><Liste value={f.statut} onChange={(e) => setF({ ...f, statut: e.target.value as EleveS['statut'] })} options={[{ value: 'nouveau', label: 'Nouveau' }, { value: 'redoublant', label: 'Redoublant (venu d’ailleurs)' }]} /></Champ>
          </Grille>
          <p className="mt-4 rounded-xl bg-papier px-4 py-3 text-sm">Frais de scolarité de l’année : <b className="chiffres">{montant(fraisAnnuels(f.classe))}</b>, dont 25 000 FCFA d’inscription.</p>
        </Bloc>

        <Bloc titre="3. Le parent ou tuteur">
          <Segmented label="Tuteur" value={modeTuteur} onChange={setModeTuteur} options={[{ value: 'nouveau', label: 'Nouveau tuteur' }, { value: 'existant', label: 'Déjà enregistré (fratrie)' }]} />
          <div className="mt-4">
            {modeTuteur === 'nouveau' ? (
              <Grille>
                <Champ label="Nom complet" erreur={err('tuteurNom')}><Saisie value={f.tuteurNom} onChange={(e) => setF({ ...f, tuteurNom: e.target.value })} placeholder="Exemple : Mme MBARGA Odile" /></Champ>
                <Champ label="Lien"><Liste value={f.lien} onChange={(e) => setF({ ...f, lien: e.target.value })} options={['Mère', 'Père', 'Tuteur', 'Tutrice', 'Oncle', 'Tante', 'Grand-parent']} /></Champ>
                <Champ label="Téléphone" erreur={err('telephone')}><Saisie inputMode="tel" value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} placeholder="6XX XX XX XX" /></Champ>
                <Champ label="Profession"><Saisie value={f.profession} onChange={(e) => setF({ ...f, profession: e.target.value })} /></Champ>
              </Grille>
            ) : choisi ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-50/60 px-4 py-3 ring-1 ring-inset ring-brand-200">
                <span><b>{choisi.nom}</b> · {choisi.lien}<br /><span className="text-[13px] text-encre-doux">{choisi.telephone}</span></span>
                <button className="cursor-pointer text-[13px] font-semibold text-brand-700 hover:underline" onClick={() => setF({ ...f, tuteurExistant: null })}>Changer</button>
              </div>
            ) : (
              <Champ label="Rechercher le tuteur" erreur={err('tuteurExistant')}>
                <Saisie type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou téléphone" />
                {parents.length > 0 && (
                  <ul className="mt-1.5 rounded-xl bg-white p-1 shadow-leve ring-1 ring-papier-ligne">
                    {parents.map((x) => (
                      <li key={x.id}><button type="button" onClick={() => (setF({ ...f, tuteurExistant: x.id }), setQ(''))} className="flex w-full cursor-pointer justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-papier"><span className="font-medium">{x.nom}</span><span className="text-encre-doux">{x.telephone}</span></button></li>
                    ))}
                  </ul>
                )}
              </Champ>
            )}
          </div>
        </Bloc>
        <div className="flex justify-end"><Button size="lg" icon={UserPlus} onClick={inscrire}>Enregistrer l’inscription</Button></div>
      </div>
    </div>
  );
}

/* =========================================================
 * Réinscriptions : élèves de l'année passée
 * ======================================================= */
function Reinscriptions({ liste, annee }: { liste: AncienEleve[]; annee: string }) {
  const [q, setQ] = useState('');
  const [choisi, setChoisi] = useState<AncienEleve | null>(null);
  const t = q.trim().toLowerCase();
  const res = liste.filter((a) => !t || `${a.nom} ${a.prenom} ${a.matricule}`.toLowerCase().includes(t));
  return (
    <section className="rounded-[22px] bg-white shadow-feuille">
      <div className="p-5 sm:p-6">
        <Note>Élèves de l’année {annee} pas encore réinscrits. La classe proposée suit la décision du conseil de classe (admis : classe supérieure ; redouble : même niveau).</Note>
        <label className="relative mt-4 block max-w-md">
          <span className="sr-only">Rechercher</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-encre-pale" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom ou ancien matricule" className="field-input pl-10" />
        </label>
      </div>
      {res.length === 0 ? <p className="px-6 pb-8 text-sm text-encre-doux">Tous les élèves ont été réinscrits.</p> : (
        <Table caption="Élèves à réinscrire" head={['Élève', `Classe ${annee}`, 'Moyenne annuelle', 'Décision', { label: 'Action', sr: true }]} minWidth={720}>
          {res.map((a) => (
            <tr key={a.id}>
              <Td><div className="flex items-center gap-3"><Avatar name={`${a.prenom} ${a.nom}`} /><div><p className="font-semibold">{a.nom} {a.prenom}</p><p className="text-xs text-encre-doux">{a.matricule}</p></div></div></Td>
              <Td>{a.classe}</Td>
              <Td><Grade value={a.moyenne} size="sm" /></Td>
              <Td><Pill tone={a.decision === 'Admis' ? 'valide' : 'orange'}>{a.decision === 'Admis' ? 'Admis' : 'Redouble'}</Pill></Td>
              <Td className="text-right"><Button size="sm" icon={RotateCcw} onClick={() => setChoisi(a)}>Réinscrire</Button></Td>
            </tr>
          ))}
        </Table>
      )}
      {choisi && <ModalReinscrire a={choisi} annee={annee} onClose={() => setChoisi(null)} />}
    </section>
  );
}

function ModalReinscrire({ a, annee, onClose }: { a: AncienEleve; annee: string; onClose: () => void }) {
  const { etat, ajouter, utilisateur } = useSecretariat();
  const toast = useToast();
  const classes = visibles(etat.classes);
  const niveau = a.classe.split(' ')[0];
  const cible = a.decision === 'Admis' ? suivant[niveau] : niveau;
  const [classe, setClasse] = useState(classes.find((c) => c.nom.startsWith(cible))?.nom ?? classes[0]?.nom ?? '');
  const valider = () => {
    const parentId = ajouter('parents', { nom: a.tuteur, lien: a.tuteur.startsWith('Mme') ? 'Mère' : 'Père', telephone: a.telephone, etat: 'actif' }, { operation: 'Création', module: 'Parents et tuteurs', element: `${a.tuteur} (réinscription)` });
    const n = etat.eleves.reduce((m, e) => Math.max(m, Number(e.matricule.slice(-4)) || 0), 0) + 1;
    const eleve: Omit<EleveS, 'id'> = {
      matricule: `CBE26-${String(n).padStart(4, '0')}`, nom: a.nom, prenom: a.prenom, sexe: a.sexe, dateNaissance: '2011-01-01', lieuNaissance: 'Yaoundé', classe, statut: a.decision === 'Admis' ? 'ancien' : 'redoublant',
      tuteur: a.tuteur, lien: a.tuteur.startsWith('Mme') ? 'Mère' : 'Père', telephone: a.telephone, du: fraisAnnuels(classe), paye: 0, moyenne: 0, absences: 0, etat: 'actif', situation: 'inscrit', parentIds: [parentId], inscritLe: aujourdhui(), inscritPar: utilisateur, adresse: '—', ancienMatricule: a.matricule,
    };
    // L'année passée reste en lecture seule : le nouveau dossier garde l'ancien matricule
    ajouter('eleves', eleve, { operation: 'Réinscription', module: 'Inscriptions', element: `${a.nom} ${a.prenom} : ${a.classe} (${annee}) → ${classe}`, avant: a.matricule, apres: eleve.matricule });
    toast(`${a.nom} ${a.prenom} est réinscrit(e) en ${classe}.`);
    onClose();
  };
  return (
    <Modal title="Réinscrire l’élève" lead={`${a.nom} ${a.prenom} · ${a.classe} en ${annee} · ${a.decision}`} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={valider}>Réinscrire</Button></>}>
      <Champ label={`Classe pour ${ecole.annee}`} aide={a.decision === 'Admis' ? `Admis : classe de ${cible} proposée.` : 'Redouble : même niveau proposé.'}>
        <Liste value={classe} onChange={(e) => setClasse(e.target.value)} options={classes.map((c) => c.nom)} />
      </Champ>
      <p className="mt-4 text-sm text-encre-doux">Un nouveau matricule est attribué. Le dossier de {annee} reste consultable dans « Anciennes années ».</p>
    </Modal>
  );
}

/* =========================================================
 * Inscriptions de l'année
 * ======================================================= */
function ListeInscriptions() {
  const { etat } = useSecretariat();
  const [eleve, setEleve] = useState<number | null>(null);
  const liste = useMemo(() => visibles(etat.eleves).filter((e) => e.situation === 'inscrit').sort((a, b) => b.inscritLe.localeCompare(a.inscritLe) || b.id - a.id), [etat.eleves]);
  const e = liste.find((x) => x.id === eleve);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-[22px] bg-white shadow-feuille">
        <Table caption="Inscriptions de l’année" head={['Élève', 'Classe', 'Statut', 'Inscrit le', 'Par']} minWidth={640}>
          {liste.slice(0, 20).map((x) => (
            <tr key={x.id}>
              <Td className="font-semibold">{nomEleve(x)}<p className="text-xs font-normal text-encre-doux">{x.matricule}</p></Td>
              <Td>{x.classe}</Td>
              <Td className="capitalize">{x.statut}</Td>
              <Td className="chiffres">{dateFr(x.inscritLe)}</Td>
              <Td>{x.inscritPar}</Td>
            </tr>
          ))}
        </Table>
        <p className="px-6 py-3 text-[13px] text-encre-doux">Les 20 dernières inscriptions. Toutes les inscriptions sont dans « Élèves ».</p>
      </section>
      <Bloc titre="Réimprimer une fiche d’inscription" icone={Printer}>
        <ChoisirEleve valeur={eleve} onChange={setEleve} />
        <Button className="mt-4 w-full" variant="secondary" icon={Printer} disabled={!e} onClick={() => e && ficheInscription(e, e.tuteur, e.telephone)}>Imprimer la fiche</Button>
      </Bloc>
    </div>
  );
}
