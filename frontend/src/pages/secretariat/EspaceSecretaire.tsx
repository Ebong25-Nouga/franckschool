import { cn } from '@/lib/utils';
import {
  Archive,
  Banknote,
  BarChart3,
  BookMarked,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileBadge2,
  FileText,
  GraduationCap,
  History,
  Home,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  Receipt,
  ShieldCheck,
  UserPlus,
  UserRound,
  Users,
  Users2,
  Undo2,
  Vault,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth';
import EnteteBureau, { type NotificationEntete, type ResultatRecherche } from '@/components/EnteteBureau';
import { Avatar, Button } from '@/components/kit';
import { ecole } from '@/data/demo';
import { libelleDroit } from '@/lib/permissions';
import { appliquerTeinte } from '@/lib/teintes';
import { chemin, nomEleve, useDroit } from './commun';
import { aujourdhui, SecretariatProvider, useSecretariat, visibles } from './store';

export interface Lien {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Un droit, ou plusieurs (il suffit d'en avoir un) */
  droit?: string | string[];
  badge?: number;
}
export interface Groupe {
  titre?: string;
  liens: Lien[];
}

function useMenuSecretariat(): Groupe[] {
  const peut = useDroit();
  const { etat } = useSecretariat();
  const absencesATraiter = visibles(etat.absences).filter((a) => a.statut !== 'justifiee').length;
  const aExecuter = etat.remboursements.filter((r) => r.statut === 'approuvee').length;
  const groupes: Groupe[] = [
    { liens: [{ to: '/secretariat', label: 'Accueil', icon: Home }] },
    {
      titre: 'Scolarité',
      liens: [
        { to: '/secretariat/eleves', label: 'Élèves', icon: GraduationCap, droit: 'eleves' },
        { to: '/secretariat/inscriptions', label: 'Inscriptions', icon: UserPlus, droit: 'inscriptions' },
        { to: '/secretariat/parents', label: 'Parents et tuteurs', icon: Users, droit: 'parents' },
        { to: '/secretariat/enseignants', label: 'Enseignants', icon: Users2, droit: 'enseignants' },
        { to: '/secretariat/classes', label: 'Classes', icon: BookMarked, droit: 'classes' },
        { to: '/secretariat/matieres', label: 'Matières', icon: ClipboardList, droit: 'matieres' },
        { to: '/secretariat/annees', label: 'Anciennes années', icon: Archive, droit: 'archives' },
      ],
    },
    {
      titre: 'Vie scolaire',
      liens: [
        { to: '/secretariat/absences', label: 'Absences et retards', icon: CalendarCheck2, droit: 'absences', badge: absencesATraiter },
        { to: '/secretariat/emplois-du-temps', label: 'Emplois du temps', icon: CalendarDays, droit: 'emplois' },
      ],
    },
    {
      titre: 'Évaluations',
      liens: [
        { to: '/secretariat/notes-bulletins', label: 'Notes et bulletins', icon: FileBadge2, droit: ['notes', 'bulletins'] },
      ],
    },
    {
      titre: 'Finances',
      liens: [
        { to: '/secretariat/caisse', label: 'Caisse', icon: Banknote, droit: 'caisse' },
        { to: '/secretariat/depenses', label: 'Dépenses', icon: Receipt, droit: 'depenses' },
        { to: '/secretariat/remboursements', label: 'Remboursements', icon: Undo2, droit: 'remboursements', badge: aExecuter },
        { to: '/secretariat/cloture', label: 'Clôture de caisse', icon: Vault, droit: 'clotures' },
      ],
    },
    {
      titre: 'Documents et communication',
      liens: [
        { to: '/secretariat/documents', label: 'Documents', icon: FileText, droit: 'documents' },
        { to: '/secretariat/annonces', label: 'Annonces', icon: Megaphone, droit: 'annonces' },
        { to: '/secretariat/statistiques', label: 'Statistiques', icon: BarChart3, droit: 'statistiques' },
      ],
    },
    {
      titre: 'Mon espace',
      liens: [
        { to: '/secretariat/activite', label: 'Mon activité', icon: History },
        { to: '/secretariat/compte', label: 'Mon compte', icon: UserRound },
      ],
    },
  ];
  return filtrerMenu(groupes, peut);
}

/** Ne garde que les liens autorisés, et les groupes non vides. */
// eslint-disable-next-line react-refresh/only-export-components
export const filtrerMenu = (groupes: Groupe[], peut: (d: string) => boolean) => groupes.map((g) => ({ ...g, liens: g.liens.filter((l) => !l.droit || [l.droit].flat().some(peut)) })).filter((g) => g.liens.length);

function useNotificationsSecretariat(): NotificationEntete[] {
  const { etat } = useSecretariat();
  const peut = useDroit();
  const jour = aujourdhui();
  const notifications: NotificationEntete[] = [];
  const absences = visibles(etat.absences).filter((a) => a.statut !== 'justifiee').length;
  if (peut('absences') && absences) notifications.push({ id: 'abs' + absences, titre: 'Absences à justifier', texte: `${absences} absence(s) ou retard(s) attendent un justificatif.`, to: '/secretariat/absences' });
  etat.remboursements.filter((r) => r.statut === 'approuvee').forEach((r) => peut('remboursements') && notifications.push({ id: 'rb' + r.id, titre: 'Remboursement approuvé', texte: `${r.montant.toLocaleString('fr-FR')} FCFA pour ${r.eleve} : à exécuter.`, to: '/secretariat/remboursements' }));
  if (peut('clotures') && !etat.clotures.some((c) => c.date === jour)) notifications.push({ id: 'cl' + jour, titre: 'Clôture de caisse', texte: 'La caisse du jour n’est pas encore clôturée.', to: '/secretariat/cloture' });
  visibles(etat.annonces).slice(0, 2).forEach((a) => notifications.push({ id: 'an' + a.id, titre: a.titre, texte: `Annonce de ${a.auteur} · ${a.destinataires}`, to: peut('annonces') ? '/secretariat/annonces' : undefined }));
  return notifications;
}

function Navigation({ groupes, sombre, onNavigate }: { groupes: Groupe[]; sombre?: boolean; onNavigate?: () => void }) {
  return (
    <div className="space-y-5">
      {groupes.map((g, i) => (
        <div key={g.titre ?? i}>
          {g.titre && <p className={cn('mb-1.5 px-3.5 text-xs font-semibold', sombre ? 'text-brand-400' : 'text-encre-pale')}>{g.titre}</p>}
          <ul className="flex flex-col gap-0.5">
            {g.liens.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex min-h-11 items-center gap-3.5 rounded-xl px-3.5 text-[15px] font-medium transition-colors duration-150 lg:min-h-10 lg:text-[14.5px]',
                      sombre ? (isActive ? 'bg-white text-brand-900 shadow-[0_6px_16px_-8px_rgb(0_0_0/0.5)]' : 'text-brand-100/90 hover:bg-white/[0.07] hover:text-white') : isActive ? 'bg-brand-50 text-brand-900' : 'text-encre hover:bg-papier',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <it.icon className={cn('size-5 shrink-0 lg:size-[18px]', isActive ? 'text-brand-700' : sombre ? 'text-brand-300' : 'text-encre-doux')} strokeWidth={1.9} aria-hidden />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.badge ? <span className="grid min-w-5 place-items-center rounded-full bg-feutre px-1.5 text-[11px] font-bold leading-5 text-encre" aria-label={`${it.badge} à traiter`}>{it.badge}</span> : null}
                      {!sombre && <ChevronRight className="size-4 text-encre-pale" aria-hidden />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ---------- En-tête ordinateur : page en cours, recherche, notifications ---------- */
function Entete({ config, onDeconnexion }: { config: ConfigEspace; onDeconnexion: () => void }) {
  const { session } = useAuth();
  const { etat } = useSecretariat();
  const peut = useDroit();
  const loc = useLocation();
  const liens = config.groupes.flatMap((g) => g.liens);
  const page = liens.find((l) => l.to === loc.pathname && l.to !== config.accueil)?.label ?? '';
  const base = config.accueil;

  const rechercher = (q: string): ResultatRecherche[] => {
    const r: ResultatRecherche[] = liens.filter((l) => l.label.toLowerCase().includes(q)).map((l) => ({ id: 'p' + l.to, groupe: 'Pages', label: l.label, to: l.to, icone: l.icon }));
    if (peut('eleves'))
      visibles(etat.eleves)
        .filter((e) => `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach((e) => r.push({ id: 'e' + e.id, groupe: 'Élèves', label: nomEleve(e), detail: `${e.matricule} · ${e.classe}${e.situation === 'parti' ? ' · parti' : ''}`, to: `${base}/eleves?eleve=${e.id}`, icone: GraduationCap }));
    if (peut('parents'))
      visibles(etat.parents)
        .filter((x) => `${x.nom} ${x.telephone}`.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((x) => r.push({ id: 'pa' + x.id, groupe: 'Parents', label: x.nom, detail: x.telephone, to: `${base}/parents?q=${encodeURIComponent(x.nom)}`, icone: Users }));
    if (peut('caisse'))
      etat.operations
        .filter((o) => `${o.numero} ${o.reference ?? ''}`.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach((o) => r.push({ id: 'o' + o.id, groupe: 'Caisse', label: `${o.numero} · ${o.libelle}`, detail: `${o.montant.toLocaleString('fr-FR')} FCFA${o.eleve ? ` · ${o.eleve}` : ''}`, to: `${base}/caisse?q=${o.numero}`, icone: Receipt }));
    return r;
  };

  if (!session) return null;
  return (
    <EnteteBureau
      espace={config.court}
      accueil={config.accueil}
      page={page}
      placeholder={peut('eleves') ? 'Rechercher un élève, un matricule, un reçu…' : 'Rechercher une page…'}
      rechercher={rechercher}
      notifications={config.notifications}
      toutesNotifications={config.toutesNotifications}
      nom={session.nom}
      fonction={session.fonction}
      liens={config.liensCompte}
      onDeconnexion={onDeconnexion}
    />
  );
}

/** Ce qui change d'un espace à l'autre (secrétariat, direction). */
export interface ConfigEspace {
  libelle: string;
  court: string;
  accueil: string;
  groupes: Groupe[];
  notifications: NotificationEntete[];
  toutesNotifications?: string;
  liensCompte: { label: string; to: string; icone: LucideIcon }[];
}

export function CadreEspace({ config }: { config: ConfigEspace }) {
  const { session, deconnexion } = useAuth();
  const { etat } = useSecretariat();
  // Couleur choisie par l'établissement dans ses paramètres
  useEffect(() => appliquerTeinte(etat.parametres.couleur), [etat.parametres.couleur]);
  const nav = useNavigate();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  useEffect(() => {
    if (!menu) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [menu]);

  if (!session) return null;
  const sortir = () => {
    deconnexion();
    nav('/connexion');
  };

  return (
    <div className="min-h-dvh bg-papier lg:pl-[288px]">
      {/* Barre latérale (ordinateur) */}
      <aside className="seyes fixed inset-y-0 left-0 z-30 hidden w-[288px] flex-col bg-brand-950 lg:flex">
        <div className="flex items-center gap-3 px-6 pb-5 pt-7">
          <img src="/logo.svg" alt="" className="size-12 rounded-2xl shadow-[0_0_0_1px_rgb(255_255_255/0.12)]" />
          <div className="leading-tight">
            <p className="font-display text-[19px] font-extrabold text-white">Franck School</p>
            <p className="text-[13px] text-brand-300">{config.libelle}</p>
          </div>
        </div>
        <div className="mx-4 mb-4 rounded-xl bg-white/[0.06] px-4 py-3 ring-1 ring-inset ring-white/10">
          <p className="truncate text-[13px] font-semibold text-white">{etat.parametres.nom}</p>
          <p className="mt-0.5 text-xs text-brand-300">Année {ecole.annee} · séquence 2</p>
        </div>
        <nav aria-label={`Navigation : ${config.libelle}`} className="flex-1 overflow-y-auto px-3 pb-4">
          <Navigation groupes={config.groupes} sombre />
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={session.nom} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-white">{session.nom}</p>
              <p className="truncate text-xs text-brand-300">{session.fonction}</p>
            </div>
            <button onClick={sortir} className="grid size-10 cursor-pointer place-items-center rounded-lg text-brand-200 hover:bg-white/10 hover:text-white" aria-label="Se déconnecter" title="Se déconnecter">
              <LogOut className="size-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* En-tête (téléphone et tablette) */}
      <header className="sticky top-0 z-20 border-b border-papier-ligne/80 bg-white/90 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center gap-3 px-4">
          <button onClick={() => setMenu(true)} className="grid size-11 cursor-pointer place-items-center rounded-xl text-encre hover:bg-papier" aria-label="Ouvrir le menu">
            <Menu className="size-6" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img src="/logo.svg" alt="" className="size-9 rounded-xl" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-[17px] font-extrabold tracking-[-0.01em]">Franck School</span>
              <span className="block text-xs text-encre-doux">{config.court}</span>
            </span>
          </div>
          <NavLink to={config.liensCompte[0]?.to ?? config.accueil} className="grid size-11 place-items-center rounded-xl hover:bg-papier" aria-label={config.liensCompte[0]?.label ?? 'Mon compte'}>
            <Avatar name={session.nom} size="sm" />
          </NavLink>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 cursor-default bg-encre/45" aria-label="Fermer le menu" tabIndex={-1} onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[330px] max-w-[88vw] animate-entree flex-col bg-white shadow-leve">
            <div className="flex items-center gap-3 border-b border-papier-ligne px-5 py-4">
              <img src="/logo.svg" alt="" className="size-10 rounded-xl" />
              <span className="flex-1 font-display text-lg font-extrabold">Franck School</span>
              <button onClick={() => setMenu(false)} className="grid size-10 cursor-pointer place-items-center rounded-lg text-encre-doux hover:bg-papier" aria-label="Fermer le menu">
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label={`Navigation : ${config.libelle}`} className="flex-1 overflow-y-auto px-3 py-4">
              <Navigation groupes={config.groupes} onNavigate={() => setMenu(false)} />
            </nav>
            <div className="flex items-center gap-3 border-t border-papier-ligne p-4">
              <Avatar name={session.nom} />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold">{session.nom}</p>
                <p className="truncate text-xs text-encre-doux">{session.fonction}</p>
              </div>
              <button onClick={sortir} className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-stylo hover:bg-stylo-50">
                <LogOut className="size-4" aria-hidden /> Sortir
              </button>
            </div>
          </div>
        </div>
      )}

      <Entete config={config} onDeconnexion={sortir} />

      <main className="mx-auto w-full max-w-[1240px] px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pt-9">
        <div key={loc.pathname} className="animate-entree">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Secretariat() {
  const groupes = useMenuSecretariat();
  const notifications = useNotificationsSecretariat();
  return (
    <CadreEspace
      config={{
        libelle: 'Espace secrétariat',
        court: 'Secrétariat',
        accueil: '/secretariat',
        groupes,
        notifications,
        liensCompte: [{ label: 'Mon compte', to: '/secretariat/compte', icone: UserRound }, { label: 'Mon activité', to: '/secretariat/activite', icone: History }],
      }}
    />
  );
}

export default function EspaceSecretaire() {
  return (
    <SecretariatProvider>
      <Secretariat />
    </SecretariatProvider>
  );
}

/**
 * Protection d'une page par un droit.
 * Taper l'adresse d'une page sans le droit affiche « Accès refusé » (le menu ne suffit pas).
 */
export function Garde({ droit, children }: { droit: string | string[]; children: ReactNode }) {
  const peut = useDroit();
  const nav = useNavigate();
  const loc = useLocation();
  const { journaliser } = useSecretariat();
  const droits = [droit].flat();
  const autorise = droits.some(peut);
  const nomDroit = droits.map(libelleDroit).join(' » ou « ');
  const note = useRef(false);
  // La tentative est inscrite au journal : l'administrateur la verra
  useEffect(() => {
    if (autorise || note.current) return;
    note.current = true;
    journaliser({ operation: 'Accès refusé', module: nomDroit, element: `Tentative d’ouverture de ${loc.pathname}` });
  }, [autorise, nomDroit, loc.pathname, journaliser]);
  if (autorise) return children;
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-stylo-50 text-stylo">
        <Lock className="size-7" aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-[28px] font-bold tracking-[-0.02em]">Accès refusé</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-encre-doux">
        Vous n’avez pas le droit « {nomDroit} ». Seul l’administrateur de l’établissement peut vous l’attribuer.
      </p>
      <p className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 text-[13px] text-encre-pale">
        <ShieldCheck className="size-4" aria-hidden /> Cette tentative n’a rien modifié. Elle est notée dans le journal.
      </p>
      <Button className="mt-7" onClick={() => nav(chemin(''))}>Retour à l’accueil</Button>
    </div>
  );
}
