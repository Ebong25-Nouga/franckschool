import { cn } from '@/lib/utils';
import {
  Bell,
  ChevronRight,
  FileBadge2,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Users2,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth';
import { Avatar } from '@/components/kit';
import { ecole } from '@/data/demo';
import { enfants, notificationsParent, parent, type Enfant } from '@/data/parent';

/* =========================================================
 * Enfant sélectionné, partagé par toutes les pages de l'espace
 * ======================================================= */
const EnfantCtx = createContext<{ enfant: Enfant; choisir: (id: number) => void }>(null!);
// eslint-disable-next-line react-refresh/only-export-components
export const useEnfant = () => useContext(EnfantCtx);

/* =========================================================
 * Navigation (structure validée par le propriétaire, 25/11/2026)
 * ======================================================= */
const nonLues = notificationsParent.filter((n) => !n.lu).length;
const navigation: { to: string; label: string; icon: LucideIcon; badge?: number }[] = [
  { to: '/parent', label: 'Accueil', icon: Home },
  { to: '/parent/enfants', label: 'Mes enfants', icon: Users2 },
  { to: '/parent/informations', label: 'Informations scolaires', icon: GraduationCap },
  { to: '/parent/notes', label: 'Notes et bulletins', icon: FileBadge2 },
  { to: '/parent/paiements', label: 'Paiements et historique', icon: Wallet },
  { to: '/parent/recus', label: 'Reçus', icon: Receipt },
  { to: '/parent/notifications', label: 'Notifications', icon: Bell, badge: nonLues },
  { to: '/parent/compte', label: 'Paramètres du compte', icon: Settings },
];

function ListeNavigation({ onNavigate, sombre }: { onNavigate?: () => void; sombre?: boolean }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {navigation.map((it) => (
        <li key={it.to}>
          <NavLink
            to={it.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex min-h-12 items-center gap-3.5 rounded-xl px-3.5 text-[15px] font-medium transition-colors duration-150',
                sombre
                  ? isActive
                    ? 'bg-white text-brand-900 shadow-[0_6px_16px_-8px_rgb(0_0_0/0.5)]'
                    : 'text-brand-100/90 hover:bg-white/[0.07] hover:text-white'
                  : isActive
                    ? 'bg-brand-50 text-brand-900'
                    : 'text-encre hover:bg-papier',
              )
            }
          >
            {({ isActive }) => (
              <>
                <it.icon className={cn('size-5 shrink-0', sombre ? (isActive ? 'text-brand-700' : 'text-brand-300') : isActive ? 'text-brand-700' : 'text-encre-doux')} strokeWidth={1.9} aria-hidden />
                <span className="flex-1 truncate">{it.label}</span>
                {it.badge ? (
                  <span className="grid min-w-5 place-items-center rounded-full bg-stylo px-1.5 text-[11px] font-bold leading-5 text-white" aria-label={`${it.badge} non lues`}>{it.badge}</span>
                ) : null}
                {!sombre && <ChevronRight className="size-4 text-encre-pale" aria-hidden />}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/* Sélecteur d'enfant : visible en haut de chaque page */
function ChoixEnfant() {
  const { enfant, choisir } = useEnfant();
  return (
    <div role="tablist" aria-label="Choisir l’enfant" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {enfants.map((e) => {
        const actif = e.id === enfant.id;
        return (
          <button
            key={e.id}
            role="tab"
            aria-selected={actif}
            onClick={() => choisir(e.id)}
            className={cn(
              'flex shrink-0 cursor-pointer items-center gap-3 rounded-2xl py-2 pl-2 pr-4 text-left transition-[background-color,box-shadow] duration-150',
              actif ? 'bg-brand-700 text-white shadow-encre' : 'bg-white shadow-feuille hover:ring-1 hover:ring-brand-200',
            )}
          >
            <Avatar name={`${e.prenom} ${e.nom}`} className={actif ? 'ring-2 ring-white/30' : ''} />
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold">{e.prenom}</span>
              <span className={cn('block text-xs', actif ? 'text-brand-100' : 'text-encre-doux')}>{e.classe}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function EspaceParent() {
  const { deconnexion } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [enfantId, setEnfantId] = useState(() => {
    try {
      return Number(localStorage.getItem('fs.parent.enfant')) || enfants[0].id;
    } catch {
      return enfants[0].id;
    }
  });
  const [menu, setMenu] = useState(false);
  const enfant = enfants.find((e) => e.id === enfantId) ?? enfants[0];

  const choisir = (id: number) => {
    setEnfantId(id);
    try {
      localStorage.setItem('fs.parent.enfant', String(id));
    } catch {
      /* stockage indisponible */
    }
  };

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

  const sortir = () => {
    deconnexion();
    nav('/connexion');
  };
  const pageSansChoix = ['/parent/enfants', '/parent/compte', '/parent/notifications'].includes(loc.pathname);

  return (
    <EnfantCtx.Provider value={{ enfant, choisir }}>
      <div className="min-h-dvh bg-papier lg:pl-[288px]">
        {/* Barre latérale (ordinateur) */}
        <aside className="seyes fixed inset-y-0 left-0 z-30 hidden w-[288px] flex-col bg-brand-950 lg:flex">
          <div className="flex items-center gap-3 px-6 pb-6 pt-7">
            <img src="/logo.svg" alt="" className="size-12 rounded-2xl shadow-[0_0_0_1px_rgb(255_255_255/0.12)]" />
            <div className="leading-tight">
              <p className="font-display text-[19px] font-extrabold text-white">Franck School</p>
              <p className="text-[13px] text-brand-300">Espace parent</p>
            </div>
          </div>
          <div className="mx-4 mb-5 rounded-xl bg-white/[0.06] px-4 py-3 ring-1 ring-inset ring-white/10">
            <p className="truncate text-[13px] font-semibold text-white">{ecole.nom}</p>
            <p className="mt-0.5 text-xs text-brand-300">Année {ecole.annee}</p>
          </div>
          <nav aria-label="Navigation de l’espace parent" className="flex-1 overflow-y-auto px-3">
            <ListeNavigation sombre />
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={parent.nom} />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-white">{parent.nom}</p>
                <p className="text-xs text-brand-300">Parent / Tuteur</p>
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
              <span className="truncate font-display text-[17px] font-extrabold tracking-[-0.01em]">Franck School</span>
            </div>
            <NavLink to="/parent/notifications" className="relative grid size-11 place-items-center rounded-xl text-encre hover:bg-papier" aria-label={`Notifications, ${nonLues} non lues`}>
              <Bell className="size-[22px]" />
              {nonLues > 0 && <span className="absolute right-2 top-2 grid min-w-[18px] place-items-center rounded-full bg-stylo px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">{nonLues}</span>}
            </NavLink>
          </div>
        </header>

        {/* Menu (téléphone) : liste de navigation */}
        {menu && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="menu-titre">
            <button className="absolute inset-0 cursor-default bg-encre/45" aria-label="Fermer le menu" tabIndex={-1} onClick={() => setMenu(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[330px] max-w-[88vw] animate-entree flex-col bg-white shadow-leve">
              <div className="flex items-center gap-3 border-b border-papier-ligne px-5 py-4">
                <img src="/logo.svg" alt="" className="size-10 rounded-xl" />
                <span className="flex-1 font-display text-lg font-extrabold">Franck School</span>
                <button onClick={() => setMenu(false)} className="grid size-10 cursor-pointer place-items-center rounded-lg text-encre-doux hover:bg-papier" aria-label="Fermer le menu">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex items-center justify-between px-5 pb-2 pt-5">
                <h2 id="menu-titre" className="font-display text-lg font-bold">Navigation</h2>
                <span className="rounded-full bg-papier-2 px-2.5 py-1 text-xs font-semibold text-encre-doux">Parent / Tuteur</span>
              </div>
              <nav aria-label="Navigation de l’espace parent" className="flex-1 overflow-y-auto px-3 pb-4">
                <ListeNavigation onNavigate={() => setMenu(false)} />
              </nav>
              <div className="flex items-center gap-3 border-t border-papier-ligne p-4">
                <Avatar name={parent.nom} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-semibold">{parent.nom}</p>
                  <p className="text-xs text-encre-doux">{ecole.court}</p>
                </div>
                <button onClick={sortir} className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-stylo hover:bg-stylo-50">
                  <LogOut className="size-4" aria-hidden /> Sortir
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-[1040px] px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          {!pageSansChoix && (
            <div className="mb-7">
              <ChoixEnfant />
            </div>
          )}
          <div key={loc.pathname + enfant.id} className="animate-entree">
            <Outlet />
          </div>
        </main>
      </div>
    </EnfantCtx.Provider>
  );
}
