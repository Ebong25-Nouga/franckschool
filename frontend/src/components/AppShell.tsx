import clsx from 'clsx';
import {
  Banknote,
  Bell,
  BookMarked,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  ClipboardPen,
  CreditCard,
  FileBadge2,
  GraduationCap,
  History,
  Home,
  LineChart,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Undo2,
  UserCog,
  Users2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { peut, useAuth, type Session } from '../auth';
import { ecole, notifications } from '../data/demo';
import { Avatar } from './ui';

interface Item {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  badge?: number;
}
interface Groupe {
  titre?: string;
  items: Item[];
}

function navigation(s: Session): Groupe[] {
  switch (s.espace) {
    case 'super':
      return [
        { items: [{ to: '/plateforme', label: 'Vue d’ensemble', icon: Home }] },
        {
          titre: 'Plateforme',
          items: [
            { to: '/plateforme/etablissements', label: 'Établissements', icon: Building2 },
            { to: '/plateforme/statistiques', label: 'Statistiques', icon: LineChart },
            { to: '/plateforme/journal', label: 'Journal d’activités', icon: History },
            { to: '/plateforme/abonnements', label: 'Abonnements', icon: CreditCard },
          ],
        },
      ];
    case 'prof':
      return [
        { items: [{ to: '/enseignant', label: 'Ma journée', icon: Home }] },
        {
          titre: 'Enseignement',
          items: [
            { to: '/enseignant/notes', label: 'Saisie des notes', icon: ClipboardPen },
            { to: '/enseignant/classes', label: 'Mes classes', icon: Users2 },
            { to: '/enseignant/emploi-du-temps', label: 'Emploi du temps', icon: CalendarDays },
          ],
        },
      ];
    case 'parent':
      return [
        { items: [{ to: '/parent', label: 'Mes enfants', icon: Home }] },
        {
          titre: 'Suivi',
          items: [
            { to: '/parent/paiements', label: 'Paiements et reçus', icon: Receipt },
            { to: '/parent/ecole', label: 'L’établissement', icon: Building2 },
          ],
        },
      ];
    default: {
      const g: Groupe[] = [
        { items: [{ to: '/etablissement', label: 'Tableau de bord', icon: Home }] },
        {
          titre: 'Scolarité',
          items: [
            { to: '/etablissement/eleves', label: 'Élèves', icon: GraduationCap, permission: 'eleves' },
            { to: '/etablissement/classes', label: 'Classes et matières', icon: BookMarked, permission: 'classes' },
            { to: '/etablissement/professeurs', label: 'Professeurs', icon: Users2, permission: 'professeurs' },
            { to: '/etablissement/absences', label: 'Absences et retards', icon: CalendarCheck2, permission: 'absences' },
          ],
        },
        {
          titre: 'Évaluations',
          items: [
            { to: '/etablissement/notes', label: 'Validation des notes', icon: ClipboardCheck, permission: 'notes', badge: 2 },
            { to: '/etablissement/bulletins', label: 'Bulletins', icon: FileBadge2, permission: 'bulletins' },
          ],
        },
        {
          titre: 'Finances',
          items: [
            { to: '/etablissement/caisse', label: 'Caisse', icon: Banknote, permission: 'caisse' },
            { to: '/etablissement/remboursements', label: 'Remboursements', icon: Undo2, permission: 'caisse', badge: 2 },
          ],
        },
        {
          titre: 'Administration',
          items: [
            { to: '/etablissement/utilisateurs', label: 'Utilisateurs et droits', icon: UserCog, permission: 'utilisateurs' },
            { to: '/etablissement/parametres', label: 'Paramètres', icon: Settings2, permission: 'parametres' },
          ],
        },
      ];
      return g.map((gr) => ({ ...gr, items: gr.items.filter((i) => !i.permission || peut(s, i.permission)) })).filter((gr) => gr.items.length);
    }
  }
}

const libelleEspace = { super: 'Administration centrale', admin: 'Administration', secretaire: 'Secrétariat', prof: 'Espace enseignant', parent: 'Espace parent' };

function Sidebar({ s, onNavigate }: { s: Session; onNavigate?: () => void }) {
  return (
    <div className="seyes relative flex h-full flex-col bg-brand-950 text-brand-100">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(120%_80%_at_0%_0%,rgb(var(--brand-700)/0.55),transparent_70%)]" />
      <div className="relative flex items-center gap-3 px-5 pb-5 pt-6">
        <img src="/logo.svg" alt="" className="size-10 rounded-xl shadow-[0_0_0_1px_rgb(255_255_255/0.12)]" />
        <div className="min-w-0 leading-tight">
          <p className="font-display text-[17px] font-extrabold tracking-[-0.01em] text-white">Franck School</p>
          <p className="truncate text-xs font-medium text-brand-300">{libelleEspace[s.espace]}</p>
        </div>
      </div>

      {s.espace !== 'super' && (
        <div className="relative mx-4 mb-5 rounded-xl bg-white/[0.06] px-3.5 py-3 ring-1 ring-inset ring-white/10">
          <p className="truncate text-[13px] font-semibold text-white">{ecole.nom}</p>
          <p className="mt-0.5 text-xs text-brand-300">
            Année {ecole.annee}, séquence 2
          </p>
        </div>
      )}

      <nav aria-label="Navigation principale" className="relative flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {navigation(s).map((g, i) => (
          <div key={g.titre ?? i}>
            {g.titre && <p className="mb-1.5 px-3 text-xs font-semibold text-brand-400">{g.titre}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      clsx(
                        'group relative flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-[14px] font-medium transition-colors duration-150',
                        isActive ? 'bg-white text-brand-900 shadow-[0_6px_16px_-8px_rgb(0_0_0/0.5)]' : 'text-brand-100/90 hover:bg-white/[0.07] hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <it.icon className={clsx('size-[18px] shrink-0', isActive ? 'text-brand-700' : 'text-brand-300 group-hover:text-white')} strokeWidth={2} aria-hidden />
                        <span className="flex-1 truncate">{it.label}</span>
                        {it.badge ? (
                          <span className="grid min-w-5 place-items-center rounded-full bg-feutre px-1.5 text-[11px] font-bold leading-5 text-encre" aria-label={`${it.badge} en attente`}>
                            {it.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {s.espace === 'secretaire' && (
        <div className="relative mx-4 mb-4 flex gap-2.5 rounded-xl bg-white/[0.06] p-3 text-xs leading-relaxed text-brand-200 ring-1 ring-inset ring-white/10">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-feutre" aria-hidden />
          Votre menu affiche uniquement les modules que l’administrateur vous a ouverts.
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const [ouvert, setOuvert] = useState(false);
  const [lues, setLues] = useState<number[]>(notifications.filter((n) => n.lu).map((n) => n.id));
  const ref = useRef<HTMLDivElement>(null);
  const nonLues = notifications.filter((n) => !lues.includes(n.id)).length;

  useEffect(() => {
    if (!ouvert) return;
    const f = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOuvert(false);
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    document.addEventListener('mousedown', f);
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', f);
      document.removeEventListener('keydown', k);
    };
  }, [ouvert]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        className="relative grid size-10 cursor-pointer place-items-center rounded-[10px] text-encre-doux transition-colors hover:bg-papier-2 hover:text-encre"
        aria-label={`Notifications, ${nonLues} non lues`}
      >
        <Bell className="size-5" aria-hidden />
        {nonLues > 0 && <span className="absolute right-1.5 top-1.5 grid min-w-[18px] place-items-center rounded-full bg-stylo px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">{nonLues}</span>}
      </button>
      {ouvert && (
        <div className="absolute right-0 top-12 z-40 w-[min(380px,calc(100vw-2rem))] animate-pop overflow-hidden rounded-2xl bg-white shadow-leve">
          <div className="flex items-center justify-between border-b border-papier-ligne/70 px-5 py-4">
            <p className="font-display text-[17px] font-semibold">Notifications</p>
            <button onClick={() => setLues(notifications.map((n) => n.id))} className="cursor-pointer text-[13px] font-semibold text-brand-700 hover:underline">
              Tout marquer comme lu
            </button>
          </div>
          <ul className="max-h-[60vh] divide-y divide-papier-ligne/70 overflow-y-auto">
            {notifications.map((n) => {
              const lu = lues.includes(n.id);
              return (
                <li key={n.id}>
                  <button onClick={() => setLues([...lues, n.id])} className={clsx('flex w-full cursor-pointer gap-3 px-5 py-3.5 text-left transition-colors hover:bg-papier', !lu && 'bg-brand-50/40')}>
                    <span className={clsx('mt-1.5 size-2 shrink-0 rounded-full', lu ? 'bg-transparent' : 'bg-brand-600')} aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-encre">{n.titre}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-encre-doux">{n.texte}</span>
                      <span className="mt-1 block text-xs text-encre-pale">{n.quand}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AppShell() {
  const { session, deconnexion } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    setOuvert(false);
    setMenu(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [ouvert]);

  if (!session) return null;

  return (
    <div className="min-h-dvh lg:pl-[272px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] lg:block">
        <Sidebar s={session} />
      </aside>

      {ouvert && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 cursor-default bg-encre/50" aria-label="Fermer le menu" tabIndex={-1} onClick={() => setOuvert(false)} />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[86vw] animate-entree shadow-leve">
            <Sidebar s={session} onNavigate={() => setOuvert(false)} />
            <button onClick={() => setOuvert(false)} className="absolute right-3 top-6 grid size-10 cursor-pointer place-items-center rounded-lg text-brand-200 hover:bg-white/10" aria-label="Fermer le menu">
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-papier-ligne/80 bg-papier/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3 px-4 sm:px-6 lg:px-10">
          <button onClick={() => setOuvert(true)} className="grid size-10 cursor-pointer place-items-center rounded-[10px] text-encre-doux hover:bg-papier-2 lg:hidden" aria-label="Ouvrir le menu">
            <Menu className="size-5" />
          </button>
          <label className="relative hidden max-w-md flex-1 md:block">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-encre-pale" aria-hidden />
            <input
              type="search"
              placeholder={session.espace === 'super' ? 'Rechercher un établissement…' : 'Rechercher un élève, un matricule, un reçu…'}
              className="h-10 w-full rounded-[10px] border border-transparent bg-white pl-10 pr-14 text-sm shadow-feuille placeholder:text-encre-pale focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/[0.12]"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-papier-ligne bg-papier px-1.5 text-[11px] font-semibold text-encre-pale">Ctrl K</kbd>
          </label>

          <div className="ml-auto flex items-center gap-1.5">
            <Notifications />
            <div className="relative">
              <button onClick={() => setMenu(!menu)} aria-expanded={menu} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] py-1 pl-1 pr-2 transition-colors hover:bg-papier-2">
                <Avatar name={session.nom} />
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold text-encre">{session.nom}</span>
                  <span className="block text-xs text-encre-doux">{session.fonction}</span>
                </span>
                <ChevronDown className="hidden size-4 text-encre-pale sm:block" aria-hidden />
              </button>
              {menu && (
                <div className="absolute right-0 top-12 z-40 w-60 animate-pop overflow-hidden rounded-xl bg-white p-1.5 shadow-leve">
                  <div className="px-3 py-2.5 sm:hidden">
                    <p className="text-sm font-semibold">{session.nom}</p>
                    <p className="text-xs text-encre-doux">{session.fonction}</p>
                  </div>
                  <button
                    onClick={() => {
                      deconnexion();
                      nav('/connexion');
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-stylo hover:bg-stylo-50"
                  >
                    <LogOut className="size-4" aria-hidden /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-7 sm:px-6 lg:px-10 lg:pt-10">
        <div key={loc.pathname} className="animate-entree">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
