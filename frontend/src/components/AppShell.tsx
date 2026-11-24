import clsx from 'clsx';
import {
  Banknote,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Bell,
  Settings,
  ShieldCheck,
  Undo2,
  UserCog,
  X,
  type LucideIcon,
  Layers,
  UserCheck,
  History,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { peut, useAuth, type Session } from '../auth';
import { ecole } from '../data/demo';
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
        { items: [{ to: '/plateforme', label: 'Tableau de bord', icon: LayoutDashboard }] },
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
        { items: [{ to: '/enseignant', label: 'Tableau de bord', icon: LayoutDashboard }] },
        {
          titre: 'Enseignement',
          items: [
            { to: '/enseignant/classes', label: 'Mes classes', icon: Layers },
            { to: '/enseignant/notes', label: 'Saisie des notes', icon: ClipboardList },
            { to: '/enseignant/emploi-du-temps', label: 'Emploi du temps', icon: CalendarDays },
          ],
        },
      ];
    case 'parent':
      return [
        { items: [{ to: '/parent', label: 'Tableau de bord', icon: LayoutDashboard }] },
        {
          titre: 'Mes enfants',
          items: [
            { to: '/parent/paiements', label: 'Paiements et reçus', icon: Banknote },
            { to: '/parent/ecole', label: 'L’établissement', icon: Building2 },
          ],
        },
      ];
    default: {
      const g: Groupe[] = [
        { items: [{ to: '/etablissement', label: 'Tableau de bord', icon: LayoutDashboard }] },
        {
          titre: 'Scolarité',
          items: [
            { to: '/etablissement/eleves', label: 'Élèves', icon: GraduationCap, permission: 'eleves' },
            { to: '/etablissement/classes', label: 'Classes et matières', icon: Layers, permission: 'classes' },
            { to: '/etablissement/professeurs', label: 'Professeurs', icon: UserCheck, permission: 'professeurs' },
            { to: '/etablissement/absences', label: 'Absences et retards', icon: CalendarDays, permission: 'absences' },
          ],
        },
        {
          titre: 'Pédagogie',
          items: [
            { to: '/etablissement/notes', label: 'Notes', icon: ClipboardList, permission: 'notes' },
            { to: '/etablissement/bulletins', label: 'Bulletins', icon: FileText, permission: 'bulletins' },
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
            { to: '/etablissement/parametres', label: 'Paramètres', icon: Settings, permission: 'parametres' },
          ],
        },
      ];
      return g
        .map((gr) => ({ ...gr, items: gr.items.filter((i) => !i.permission || peut(s, i.permission)) }))
        .filter((gr) => gr.items.length);
    }
  }
}

const titreEspace = { super: 'Administration centrale', admin: 'Administration', secretaire: 'Administration', prof: 'Espace enseignant', parent: 'Espace parent' };

function Sidebar({ s, onNavigate }: { s: Session; onNavigate?: () => void }) {
  const groupes = navigation(s);
  return (
    <div className="flex h-full flex-col bg-brand-950 text-brand-100">
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <img src="/logo.svg" alt="" className="size-9 rounded-lg ring-1 ring-white/10" />
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold tracking-wide text-white">FRANCK SCHOOL</p>
          <p className="truncate text-xs text-brand-300">{titreEspace[s.espace]}</p>
        </div>
      </div>
      {s.espace !== 'super' && (
        <div className="mx-4 mb-4 rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
          <p className="truncate text-[13px] font-semibold text-white">{ecole.nom}</p>
          <p className="text-xs text-brand-300">Année {ecole.annee} · {ecole.periodeCourante}</p>
        </div>
      )}
      <nav aria-label="Navigation principale" className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {groupes.map((g, i) => (
          <div key={g.titre ?? i}>
            {g.titre && <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-400">{g.titre}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      clsx(
                        'group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150',
                        isActive ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-100 hover:bg-white/10 hover:text-white',
                      )
                    }
                  >
                    <it.icon className="size-[18px] shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge ? (
                      <span className="rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-amber-950" aria-label={`${it.badge} en attente`}>
                        {it.badge}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {s.espace === 'secretaire' && (
        <div className="mx-4 mb-4 flex gap-2 rounded-lg bg-white/5 p-3 text-xs text-brand-200 ring-1 ring-white/10">
          <ShieldCheck className="size-4 shrink-0 text-brand-300" aria-hidden />
          Menu limité aux permissions attribuées par l’administrateur.
        </div>
      )}
    </div>
  );
}

export default function AppShell() {
  const { session, deconnexion } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => setOuvert(false), [loc.pathname]);
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [ouvert]);

  if (!session) return null;

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Barre latérale bureau */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar s={session} />
      </aside>

      {/* Tiroir mobile */}
      {ouvert && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 cursor-pointer bg-slate-900/50" aria-label="Fermer le menu" onClick={() => setOuvert(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-fade-up shadow-pop">
            <Sidebar s={session} onNavigate={() => setOuvert(false)} />
            <button onClick={() => setOuvert(false)} className="absolute right-2 top-5 grid size-10 cursor-pointer place-items-center rounded-lg text-brand-200 hover:bg-white/10" aria-label="Fermer le menu">
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
        <button onClick={() => setOuvert(true)} className="grid size-10 cursor-pointer place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Ouvrir le menu">
          <Menu className="size-5" />
        </button>
        <div className="hidden min-w-0 items-center gap-2 text-sm text-slate-500 md:flex">
          <BookOpen className="size-4" aria-hidden />
          <span className="truncate">{session.espace === 'super' ? 'Plateforme FRANCK SCHOOL' : `${ecole.nom} · ${ecole.annee}`}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button className="relative grid size-10 cursor-pointer place-items-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Notifications, 3 non lues">
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="flex items-center gap-3 rounded-lg py-1 pl-1 pr-2">
            <Avatar name={session.nom} />
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-900">{session.nom}</p>
              <p className="text-xs text-slate-500">{session.fonction}</p>
            </div>
          </div>
          <button
            onClick={() => {
              deconnexion();
              nav('/connexion');
            }}
            className="grid size-10 cursor-pointer place-items-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="animate-fade-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

