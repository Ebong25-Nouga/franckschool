import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowRight,
  Banknote,
  BellRing,
  BookOpenCheck,
  Building2,
  CalendarRange,
  Check,
  ClipboardPen,
  FileBadge2,
  GraduationCap,
  History,
  KeyRound,
  Layers,
  Menu,
  ShieldCheck,
  Smartphone,
  UserCog,
  Users2,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ApercuDirection, ApercuEnseignant, ApercuParent, ApercuSecretariat, FenetreApp, MiniJournal } from './accueil/Apercus';
import { PiedDePage, PretRentree } from './accueil/Fin';
import { Tarifs } from './accueil/Tarifs';
import { VideoPresentation } from './accueil/VideoPresentation';

/* ---------------------------------------------------------------
 * Contenu (tiré du cahier des charges, document maître V1)
 * ------------------------------------------------------------- */
const liens = [
  { href: '#annee', label: 'L’année scolaire' },
  { href: '#espaces', label: 'Les espaces' },
  { href: '#caisse', label: 'La caisse' },
  { href: '#securite', label: 'Sécurité' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#questions', label: 'Questions' },
];

const annee = [
  { icon: GraduationCap, quand: 'Septembre', titre: 'Inscriptions', texte: 'Dossier de l’élève, tuteurs, classe et statut : nouveau, ancien ou redoublant. Le matricule est attribué automatiquement.' },
  { icon: ClipboardPen, quand: 'Chaque séquence', titre: 'Notes', texte: 'Les professeurs saisissent depuis chez eux. L’administration valide. Chaque correction laisse une trace.' },
  { icon: FileBadge2, quand: 'Fin de trimestre', titre: 'Bulletins', texte: 'Moyennes, coefficients, rangs et appréciations calculés. Bulletins PDF par élève ou par classe.' },
  { icon: Banknote, quand: 'Toute l’année', titre: 'Paiements', texte: 'Tranches, reçus numérotés, impayés suivis. Espèces, MTN Mobile Money, Orange Money.' },
  { icon: History, quand: 'Juin', titre: 'Archives', texte: 'L’année se clôture sans rien effacer. Classes, notes et bulletins restent consultables.' },
];

const espaces = [
  {
    id: 'direction',
    icon: ShieldCheck,
    label: 'Direction',
    titre: 'L’administrateur pilote son établissement',
    points: ['Tableau de bord de l’école en temps réel', 'Validation des notes et des bulletins', 'Décision sur chaque demande de remboursement', 'Création des comptes secrétaires et de leurs droits'],
    apercu: <ApercuDirection />,
  },
  {
    id: 'secretariat',
    icon: Banknote,
    label: 'Secrétariat',
    titre: 'Les secrétaires travaillent dans la même interface, avec leurs propres droits',
    points: ['Inscriptions et dossiers des élèves', 'Encaissements et reçus en PDF', 'Demandes de remboursement à l’administrateur', 'Chaque opération signée de son auteur'],
    apercu: <ApercuSecretariat />,
  },
  {
    id: 'enseignants',
    icon: ClipboardPen,
    label: 'Enseignants',
    titre: 'Les professeurs saisissent leurs notes de la maison',
    points: ['Classes et matières affectées', 'Saisie rapide au clavier, séquence par séquence', 'Soumission à l’administration pour validation', 'Suivi de classe pour le professeur principal'],
    apercu: <ApercuEnseignant />,
  },
  {
    id: 'parents',
    icon: Users2,
    label: 'Parents',
    titre: 'Les parents suivent leurs enfants et leurs paiements',
    points: ['Reste à payer et prochaine échéance', 'Historique des paiements et reçus téléchargeables', 'Informations et notifications de l’établissement', 'Un seul compte pour plusieurs enfants'],
    apercu: <ApercuParent />,
  },
];

const modules = [
  { icon: GraduationCap, titre: 'Élèves et inscriptions', texte: 'Dossiers, tuteurs, historique des classes fréquentées.' },
  { icon: Layers, titre: 'Classes et matières', texte: 'Coefficients par classe, professeur principal, salles.' },
  { icon: Users2, titre: 'Professeurs', texte: 'Comptes, affectations par matière et par classe.' },
  { icon: BookOpenCheck, titre: 'Notes et séquences', texte: '6 séquences, 3 trimestres, circuit de validation.' },
  { icon: FileBadge2, titre: 'Bulletins PDF', texte: 'Modèle camerounais, versions conservées.' },
  { icon: Banknote, titre: 'Paiements et caisse', texte: 'Recettes, dépenses, clôtures, rapports PDF.' },
  { icon: BellRing, titre: 'Notifications', texte: 'Décisions, opérations, événements importants.' },
  { icon: CalendarRange, titre: 'Années scolaires', texte: 'Une année active, toutes les autres archivées.' },
];

const questions = [
  { q: 'Faut-il installer un logiciel ?', r: 'Non. Franck School s’utilise dans le navigateur, sur ordinateur comme sur téléphone. Les professeurs peuvent saisir leurs notes depuis chez eux.' },
  { q: 'Nos données sont-elles visibles par d’autres écoles ?', r: 'Non. Chaque établissement a son propre espace. Ses élèves, ses notes et sa caisse ne sont jamais mélangés avec ceux d’une autre école.' },
  { q: 'Peut-on limiter ce que fait chaque secrétaire ?', r: 'Oui. L’administrateur choisit les droits de chaque secrétaire au moment de créer son compte, et peut les modifier à tout moment. Le menu de la secrétaire n’affiche que ce qui lui est permis.' },
  { q: 'Que se passe-t-il si on supprime un élève ou un paiement par erreur ?', r: 'Rien n’est détruit depuis l’interface. Un élève est archivé, un paiement confirmé est annulé par une écriture inverse. L’historique reste consultable par l’administration.' },
  { q: 'Les bulletins suivent-ils le système camerounais ?', r: 'Oui : notes sur 20, coefficients, six séquences réparties en trois trimestres, moyennes, rangs et appréciations.' },
  { q: 'Combien coûte Franck School ?', r: 'Un abonnement par établissement, selon le nombre d’élèves : voir la section Tarifs. Les tarifs affichés sont provisoires et vous seront confirmés lors de la démonstration.' },
];

/* ---------------------------------------------------------------
 * Page
 * ------------------------------------------------------------- */
export default function Accueil() {
  const [demo, setDemo] = useState(false);
  const [defile, setDefile] = useState(false);

  useEffect(() => {
    const f = () => setDefile(window.scrollY > 24);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  return (
    <div className="min-h-dvh bg-white text-encre">
      {/* ===================== En-tête ===================== */}
      <header className={cn('fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-300', defile ? 'bg-brand-950/90 shadow-[0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-md' : 'bg-transparent')}>
        <nav aria-label="Navigation principale" className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-8 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 text-white" aria-label="Franck School, accueil">
            <img src="/logo.svg" alt="" className="size-9 rounded-[10px] shadow-[0_0_0_1px_rgb(255_255_255/0.15)]" />
            <span className="font-display text-[19px] font-extrabold tracking-[-0.02em]">Franck School</span>
          </Link>
          <ul className="hidden items-center gap-0.5 xl:flex">
            {liens.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium text-brand-100/85 transition-colors hover:bg-white/10 hover:text-white">{l.label}</a>
              </li>
            ))}
          </ul>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" className="h-10 px-4 text-[14px] text-white hover:bg-white/10 hover:text-white">
              <Link to="/connexion">Se connecter</Link>
            </Button>
            <Button onClick={() => setDemo(true)} className="h-10 bg-feutre px-4 text-[14px] font-semibold text-encre hover:bg-[#FFD93A]">
              Demander une démonstration
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="ml-auto text-white hover:bg-white/10 hover:text-white sm:ml-0 xl:hidden" aria-label="Ouvrir le menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="font-display text-lg">Franck School</SheetTitle>
                <SheetDescription>Gestion scolaire pour les établissements du Cameroun</SheetDescription>
              </SheetHeader>
              <ul className="flex flex-col gap-1 px-4">
                {liens.map((l) => (
                  <li key={l.href}><a href={l.href} className="block rounded-lg px-3 py-3 font-medium hover:bg-muted">{l.label}</a></li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2 p-4">
                <Button asChild variant="outline" className="h-11"><Link to="/connexion">Se connecter</Link></Button>
                <Button className="h-11" onClick={() => setDemo(true)}>Demander une démonstration</Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </header>

      <main>
        {/* ===================== Ouverture ===================== */}
        <section className="seyes relative overflow-hidden bg-brand-950 text-white">
          <div aria-hidden className="absolute -left-48 -top-48 size-[720px] rounded-full bg-brand-700/45 blur-[140px]" />
          <div aria-hidden className="absolute -right-40 top-1/3 size-[520px] rounded-full bg-brand-500/20 blur-[120px]" />

          <div className="relative mx-auto max-w-[1200px] px-5 pb-24 pt-36 sm:px-8 lg:pt-44">
            <div className="mx-auto max-w-[860px] animate-entree text-center">
              <Badge variant="outline" className="h-7 gap-2 border-white/20 bg-white/[0.06] px-3 text-[13px] font-medium text-brand-100">
                <span className="size-1.5 rounded-full bg-feutre" aria-hidden />
                Pour les écoles privées du Cameroun
              </Badge>
              <h1 className="mt-6 font-display text-[42px] font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-[58px] lg:text-[70px]">
                Toute votre école,
                <br />
                <span className="lg:whitespace-nowrap">de l’inscription au bulletin.</span>
              </h1>
              <p className="mx-auto mt-7 max-w-[40rem] text-[18px] leading-relaxed text-brand-100/90">
                Élèves, notes des six séquences, bulletins, caisse et parents réunis sur une seule plateforme. Chaque secrétaire a ses droits, chaque opération est tracée, rien ne se perd d’une année à l’autre.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Button onClick={() => setDemo(true)} className="h-12 gap-2 bg-feutre px-6 text-[15px] font-semibold text-encre hover:bg-[#FFD93A]">
                  Demander une démonstration
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button asChild variant="outline" className="h-12 border-white/25 bg-transparent px-6 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white">
                  <Link to="/connexion">Accéder à mon espace</Link>
                </Button>
              </div>
            </div>

            {/* La vidéo Remotion : Franck School en action */}
            <div className="mx-auto mt-16 max-w-[1080px]">
              <VideoPresentation />
            </div>

            <dl className="mx-auto mt-16 grid max-w-[760px] grid-cols-3 gap-6 border-t border-white/10 pt-8 text-center">
              {[['6', 'séquences, 3 trimestres'], ['5', 'espaces selon le rôle'], ['0', 'donnée effacée en silence']].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-[40px] font-extrabold leading-none tracking-[-0.04em] text-white">{v}</dd>
                  <dd className="mt-2 text-[13px] leading-snug text-brand-200">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ===================== Pour qui ===================== */}
        <section aria-label="Types d’établissements" className="border-b border-papier-ligne bg-white">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-8 text-[15px] font-medium text-encre-doux sm:px-8">
            <span className="text-encre">Conçu pour :</span>
            {['Écoles maternelles et primaires', 'Collèges', 'Lycées', 'Complexes scolaires', 'Groupes de plusieurs écoles'].map((t) => (
              <span key={t} className="flex items-center gap-2"><Check className="size-4 text-brand-600" aria-hidden />{t}</span>
            ))}
          </div>
        </section>

        {/* ===================== L’année scolaire ===================== */}
        <section id="annee" className="scroll-mt-20 bg-white py-28">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">Une année scolaire entière, sans un cahier perdu.</h2>
              <p className="mt-5 text-lg leading-relaxed text-encre-doux">Franck School suit le rythme de votre établissement, de la rentrée de septembre à l’archivage de juin.</p>
            </div>
            <ol className="relative mt-16 grid gap-10 md:grid-cols-5 md:gap-6">
              <span aria-hidden className="absolute left-0 right-0 top-[27px] hidden h-[2px] bg-[linear-gradient(90deg,rgb(var(--brand-600)),rgb(var(--brand-300)))] md:block" />
              {annee.map((e, i) => (
                <li key={e.titre} className="relative flex gap-5 md:flex-col md:gap-0">
                  <span className={cn('relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl ring-[6px] ring-white', i === 1 ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700')}>
                    <e.icon className="size-6" aria-hidden />
                  </span>
                  <div className="md:mt-6">
                    <p className="text-[13px] font-semibold text-brand-600">{e.quand}</p>
                    <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.02em]">{e.titre}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-encre-doux">{e.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===================== Les espaces ===================== */}
        <section id="espaces" className="scroll-mt-20 bg-papier py-28">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">Chacun son espace. Une seule école.</h2>
                <p className="mt-5 text-lg leading-relaxed text-encre-doux">Chaque utilisateur ne voit que ce qui le concerne. Les droits de chaque secrétaire sont choisis par l’administrateur.</p>
              </div>
            </div>
            <Tabs defaultValue="direction" className="mt-12 gap-8">
              <TabsList className="h-auto w-full flex-wrap group-data-horizontal/tabs:h-auto justify-start gap-1 rounded-2xl bg-white p-1.5 shadow-feuille sm:w-fit">
                {espaces.map((e) => (
                  <TabsTrigger key={e.id} value={e.id} className="h-11 flex-none gap-2 rounded-xl px-4 text-[15px] data-[state=active]:bg-brand-700 data-[state=active]:text-white data-[state=active]:shadow-encre">
                    <e.icon data-icon="inline-start" />
                    {e.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {espaces.map((e) => (
                <TabsContent key={e.id} value={e.id} className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
                  <div>
                    <h3 className="font-display text-[28px] font-bold leading-tight tracking-[-0.03em]">{e.titre}</h3>
                    <ul className="mt-6 flex flex-col gap-3.5">
                      {e.points.map((p) => (
                        <li key={p} className="flex items-start gap-3 text-[16px] text-encre">
                          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"><Check className="size-3.5" aria-hidden /></span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <FenetreApp titre={`Espace ${e.label.toLowerCase()}`} className="shadow-leve">{e.apercu}</FenetreApp>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* ===================== Modules ===================== */}
        <section aria-labelledby="modules-titre" className="bg-white py-28">
          <div className="mx-auto grid max-w-[1200px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 id="modules-titre" className="font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[44px]">Tout ce que gère un établissement.</h2>
              <p className="mt-5 text-lg leading-relaxed text-encre-doux">Les modules fonctionnent ensemble : une inscription crée le dossier, la scolarité due et la place dans la classe.</p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-3xl bg-papier-ligne ring-1 ring-papier-ligne sm:grid-cols-2">
              {modules.map((m) => (
                <li key={m.titre} className="flex gap-4 bg-white p-7">
                  <m.icon className="mt-1 size-6 shrink-0 text-brand-700" aria-hidden />
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-[-0.01em]">{m.titre}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-encre-doux">{m.texte}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===================== Caisse ===================== */}
        <section id="caisse" className="seyes relative scroll-mt-20 overflow-hidden bg-brand-950 py-28 text-white">
          <div aria-hidden className="absolute -right-48 -top-40 size-[620px] rounded-full bg-brand-700/40 blur-[130px]" />
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">Pas un franc ne sort sans accord.</h2>
              <p className="mt-5 text-lg leading-relaxed text-brand-100/90">Chaque paiement reçoit un reçu numéroté. Un paiement confirmé ne disparaît jamais : il s’annule par une écriture inverse, visible dans l’historique.</p>
              <ol className="mt-10 flex flex-col gap-4">
                {[
                  ['La secrétaire prépare la demande', 'Élève concerné, montant et motif.'],
                  ['L’administrateur décide', 'Il approuve ou refuse. Un refus ne crée aucun mouvement.'],
                  ['La secrétaire rembourse', 'L’opération est enregistrée et reste dans l’historique.'],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-feutre font-display font-extrabold text-encre">{i + 1}</span>
                    <div>
                      <p className="font-semibold">{t}</p>
                      <p className="mt-1 text-[15px] text-brand-200">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative">
              <FenetreApp titre="Journal de caisse">
                <div className="grid grid-cols-2 gap-3 border-b border-papier-ligne/70 bg-papier p-5">
                  <div className="rounded-xl bg-white p-3.5 shadow-feuille">
                    <p className="flex items-center gap-1.5 text-xs text-encre-doux"><Banknote className="size-3.5" aria-hidden />Espèces</p>
                    <p className="mt-1 font-display text-xl font-bold text-encre chiffres">1 382 000</p>
                  </div>
                  <div className="rounded-xl bg-white p-3.5 shadow-feuille">
                    <p className="flex items-center gap-1.5 text-xs text-encre-doux"><Smartphone className="size-3.5" aria-hidden />Mobile Money</p>
                    <p className="mt-1 font-display text-xl font-bold text-encre chiffres">2 833 400</p>
                  </div>
                </div>
                <MiniJournal />
              </FenetreApp>
            </div>
          </div>
        </section>

        {/* ===================== Sécurité ===================== */}
        <section id="securite" className="scroll-mt-20 bg-white py-28">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <h2 className="max-w-2xl font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">Vos données restent les vôtres.</h2>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              <article className="rounded-3xl bg-papier p-7">
                <Building2 className="size-7 text-brand-700" aria-hidden />
                <h3 className="mt-5 font-display text-xl font-bold">Chaque école isolée</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-encre-doux">Plusieurs établissements utilisent la plateforme, mais les élèves, les notes et la caisse d’une école ne sont jamais visibles par une autre.</p>
              </article>
              <article className="rounded-3xl bg-papier p-7">
                <UserCog className="size-7 text-brand-700" aria-hidden />
                <h3 className="mt-5 font-display text-xl font-bold">Des droits par personne</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-encre-doux">L’administrateur crée plusieurs secrétaires et coche ce que chacune peut faire. Un compte désactivé garde tout son historique.</p>
                <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-white p-4 text-sm shadow-feuille" aria-hidden>
                  {[['Encaisser les paiements', true], ['Générer les bulletins', false], ['Clôturer la caisse', true]].map(([l, on]) => (
                    <div key={l as string} className="flex items-center justify-between">
                      <span>{l as string}</span>
                      <span className={cn('relative h-5 w-9 rounded-full', on ? 'bg-brand-700' : 'bg-papier-ligne')}><span className={cn('absolute top-0.5 size-4 rounded-full bg-white shadow transition-all', on ? 'left-[18px]' : 'left-0.5')} /></span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-3xl bg-papier p-7">
                <KeyRound className="size-7 text-brand-700" aria-hidden />
                <h3 className="mt-5 font-display text-xl font-bold">Tout est tracé</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-encre-doux">Création, modification, annulation, approbation : chaque action importante est enregistrée avec son auteur, la date et l’heure.</p>
                <ul className="mt-5 flex flex-col gap-2.5 rounded-2xl bg-white p-4 text-[13px] shadow-feuille" aria-hidden>
                  {[['09:12', 'Nadine E. a encaissé 50 000 FCFA'], ['08:55', 'M. Essomba a soumis ses notes'], ['08:31', 'L’admin a validé un remboursement']].map(([h, t]) => (
                    <li key={h} className="flex gap-3"><span className="font-mono text-encre-pale">{h}</span><span>{t}</span></li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ===================== Tarifs ===================== */}
        <Tarifs onDemo={() => setDemo(true)} />

        {/* ===================== Questions ===================== */}
        <section id="questions" className="scroll-mt-20 border-t border-papier-ligne bg-papier py-28">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[44px]">Vos questions.</h2>
              <p className="mt-5 text-lg leading-relaxed text-encre-doux">Une autre question ? Demandez une démonstration, nous y répondrons avec votre établissement sous les yeux.</p>
            </div>
            <Accordion type="single" collapsible className="rounded-3xl bg-white px-6 shadow-feuille sm:px-8">
              {questions.map((q, i) => (
                <AccordionItem key={q.q} value={`q${i}`}>
                  <AccordionTrigger className="py-5 text-left font-display text-[17px] font-semibold hover:no-underline">{q.q}</AccordionTrigger>
                  <AccordionContent className="pb-5 text-[15px] leading-relaxed text-encre-doux">{q.r}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ===================== Prêt pour la rentrée ===================== */}
        <PretRentree onDemo={() => setDemo(true)} />
      </main>

      <PiedDePage onDemo={() => setDemo(true)} />

      <DemandeDemo ouvert={demo} onChange={setDemo} />
    </div>
  );
}

/* ---------------------------------------------------------------
 * Demande de démonstration
 * ------------------------------------------------------------- */
function DemandeDemo({ ouvert, onChange }: { ouvert: boolean; onChange: (v: boolean) => void }) {
  const [f, setF] = useState({ nom: '', ecole: '', ville: '', tel: '', taille: '' });
  const [essai, setEssai] = useState(false);
  const erreurs = {
    nom: !f.nom.trim() ? 'Indiquez votre nom.' : '',
    ecole: !f.ecole.trim() ? 'Indiquez le nom de l’établissement.' : '',
    tel: f.tel.replace(/\D/g, '').length < 9 ? 'Numéro incomplet : 9 chiffres au minimum.' : '',
  };
  const valide = !erreurs.nom && !erreurs.ecole && !erreurs.tel;

  const envoyer = (e: FormEvent) => {
    e.preventDefault();
    setEssai(true);
    if (!valide) return;
    onChange(false);
    toast.success('Demande envoyée', { description: `Nous appelons ${f.nom} au ${f.tel} pour fixer la démonstration.` });
    setF({ nom: '', ecole: '', ville: '', tel: '', taille: '' });
    setEssai(false);
  };

  return (
    <Dialog open={ouvert} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={envoyer} noValidate>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Demander une démonstration</DialogTitle>
            <DialogDescription>Nous vous appelons pour vous présenter Franck School avec votre établissement.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="my-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={essai && !!erreurs.nom}>
                <FieldLabel htmlFor="d-nom">Votre nom</FieldLabel>
                <Input id="d-nom" autoComplete="name" value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} aria-invalid={essai && !!erreurs.nom} className="h-10" />
                {essai && erreurs.nom && <FieldDescription className="text-destructive">{erreurs.nom}</FieldDescription>}
              </Field>
              <Field data-invalid={essai && !!erreurs.tel}>
                <FieldLabel htmlFor="d-tel">Téléphone</FieldLabel>
                <Input id="d-tel" type="tel" inputMode="tel" autoComplete="tel" placeholder="+237 6XX XX XX XX" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} aria-invalid={essai && !!erreurs.tel} className="h-10" />
                {essai && erreurs.tel && <FieldDescription className="text-destructive">{erreurs.tel}</FieldDescription>}
              </Field>
            </div>
            <Field data-invalid={essai && !!erreurs.ecole}>
              <FieldLabel htmlFor="d-ecole">Établissement</FieldLabel>
              <Input id="d-ecole" autoComplete="organization" value={f.ecole} onChange={(e) => setF({ ...f, ecole: e.target.value })} aria-invalid={essai && !!erreurs.ecole} className="h-10" />
              {essai && erreurs.ecole && <FieldDescription className="text-destructive">{erreurs.ecole}</FieldDescription>}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="d-ville">Ville</FieldLabel>
                <Input id="d-ville" value={f.ville} onChange={(e) => setF({ ...f, ville: e.target.value })} placeholder="Ex. Douala" className="h-10" />
              </Field>
              <Field>
                <FieldLabel htmlFor="d-taille">Nombre d’élèves</FieldLabel>
                <Select value={f.taille} onValueChange={(v) => setF({ ...f, taille: v })}>
                  <SelectTrigger id="d-taille" className="h-10 w-full"><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {['Moins de 300', '300 à 1 000', 'Plus de 1 000', 'Plusieurs établissements'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" className="h-10 px-4" onClick={() => onChange(false)}>Annuler</Button>
            <Button type="submit" className="h-10 px-5">Envoyer la demande</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
