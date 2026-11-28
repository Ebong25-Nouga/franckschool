import { cn } from '@/lib/utils';
import {
  Bell,
  BookMarked,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  ClipboardPen,
  Gauge as IconeJauge,
  Home,
  Hourglass,
  LineChart,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareWarning,
  Settings,
  Star,
  UserRound,
  Users2,
  X,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth';
import EnteteBureau, { type ResultatRecherche } from '@/components/EnteteBureau';
import { Avatar } from '@/components/kit';
import { ecole } from '@/data/demo';
import { demandesCorrection, elevesDe, notificationsEnseignant, profils, type ProfilEnseignant } from '@/data/enseignant';

/* =========================================================
 * Enseignant connecté et permissions
 * Une seule interface : les menus du titulaire apparaissent selon les permissions.
 * (Les permissions seront vérifiées côté Laravel : ici, on ne fait qu'afficher.)
 * ======================================================= */
type Ctx = { profil: ProfilEnseignant; cle: 'essomba' | 'fotso'; titulaire: string | null };
const EnseignantCtx = createContext<Ctx>(null!);
// eslint-disable-next-line react-refresh/only-export-components
export const useEnseignant = () => useContext(EnseignantCtx);

interface Lien {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

function ListeLiens({ liens, sombre, onNavigate }: { liens: Lien[]; sombre?: boolean; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {liens.map((it) => (
        <li key={it.to}>
          <NavLink
            to={it.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex min-h-11 items-center gap-3.5 rounded-xl px-3.5 text-[15px] font-medium lg:min-h-10 transition-colors duration-150',
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
                {it.badge ? <span className="grid min-w-5 place-items-center rounded-full bg-stylo px-1.5 text-[11px] font-bold leading-5 text-white" aria-label={`${it.badge} à traiter`}>{it.badge}</span> : null}
                {!sombre && <ChevronRight className="size-4 text-encre-pale" aria-hidden />}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default function EspaceEnseignant() {
  const { session, deconnexion } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);

  const perms = session?.permissions ?? [];
  const cle = (perms.find((p) => p.startsWith('profil:'))?.slice(7) as 'essomba' | 'fotso') ?? 'essomba';
  const profil = profils[cle];
  const titulaire = perms.find((p) => p.startsWith('classe_principale:'))?.slice(18) ?? (perms.length ? null : profil.classePrincipale);

  const corrections = demandesCorrection.filter((d) => d.prof === cle && d.statut === 'a_traiter').length;
  const nonLues = notificationsEnseignant.filter((n) => (n.prof === cle || n.prof === 'tous') && !n.lu).length;

  const communs: Lien[] = [
    { to: '/enseignant', label: 'Accueil', icon: Home },
    { to: '/enseignant/profil', label: 'Mon profil', icon: UserRound },
    { to: '/enseignant/classes', label: 'Mes classes', icon: BookMarked },
    { to: '/enseignant/matieres', label: 'Mes matières', icon: ListChecks },
    { to: '/enseignant/eleves', label: 'Listes des élèves', icon: Users2 },
    { to: '/enseignant/notes', label: 'Saisie des notes', icon: ClipboardPen },
    { to: '/enseignant/notes-soumises', label: 'Notes soumises', icon: ClipboardCheck },
    { to: '/enseignant/corrections', label: 'Demandes de correction', icon: MessageSquareWarning, badge: corrections },
    { to: '/enseignant/emploi-du-temps', label: 'Emploi du temps', icon: CalendarDays },
    { to: '/enseignant/notifications', label: 'Notifications', icon: Bell, badge: nonLues },
    { to: '/enseignant/parametres', label: 'Paramètres', icon: Settings },
  ];
  const classePrincipale: Lien[] = titulaire
    ? [
        { to: '/enseignant/classe-principale', label: 'Résultats de la classe', icon: LineChart },
        { to: '/enseignant/classe-principale/moyennes', label: 'Moyennes par matière', icon: BarChart3 },
        { to: '/enseignant/classe-principale/saisies', label: 'Suivi des saisies', icon: IconeJauge },
        { to: '/enseignant/classe-principale/attente', label: 'En attente de validation', icon: Hourglass },
      ]
    : [];

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
  const nomComplet = `${profil.civilite} ${profil.nom} ${profil.prenom}`;

  const blocTitulaire = (sombre: boolean) =>
    titulaire && (
      <div className="mt-5">
        <p className={cn('mb-1.5 flex items-center gap-1.5 px-3.5 text-xs font-semibold', sombre ? 'text-feutre' : 'text-feutre-700')}>
          <Star className="size-3.5" aria-hidden /> Ma classe principale · {titulaire}
        </p>
        <ListeLiens liens={classePrincipale} sombre={sombre} onNavigate={() => setMenu(false)} />
      </div>
    );

  return (
    <EnseignantCtx.Provider value={{ profil, cle, titulaire }}>
      <div className="min-h-dvh bg-papier lg:pl-[288px]">
        {/* Barre latérale (ordinateur) */}
        <aside className="seyes fixed inset-y-0 left-0 z-30 hidden w-[288px] flex-col bg-brand-950 lg:flex">
          <div className="flex items-center gap-3 px-6 pb-5 pt-7">
            <img src="/logo.svg" alt="" className="size-12 rounded-2xl shadow-[0_0_0_1px_rgb(255_255_255/0.12)]" />
            <div className="leading-tight">
              <p className="font-display text-[19px] font-extrabold text-white">Franck School</p>
              <p className="text-[13px] text-brand-300">Espace enseignant</p>
            </div>
          </div>
          <div className="mx-4 mb-4 rounded-xl bg-white/[0.06] px-4 py-3 ring-1 ring-inset ring-white/10">
            <p className="truncate text-[13px] font-semibold text-white">{ecole.nom}</p>
            <p className="mt-0.5 text-xs text-brand-300">Année {ecole.annee} · séquence 2</p>
          </div>
          <nav aria-label="Navigation de l’espace enseignant" className="flex-1 overflow-y-auto px-3 pb-4">
            <ListeLiens liens={communs} sombre />
            {blocTitulaire(true)}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={nomComplet} />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-white">{nomComplet}</p>
                <p className="truncate text-xs text-brand-300">{titulaire ? `Titulaire de la ${titulaire}` : 'Professeur'}</p>
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
            <NavLink to="/enseignant/notifications" className="relative grid size-11 place-items-center rounded-xl text-encre hover:bg-papier" aria-label={`Notifications, ${nonLues} non lues`}>
              <Bell className="size-[22px]" />
              {nonLues > 0 && <span className="absolute right-2 top-2 grid min-w-[18px] place-items-center rounded-full bg-stylo px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">{nonLues}</span>}
            </NavLink>
            <NavLink to="/enseignant/profil" className="grid size-11 place-items-center rounded-xl hover:bg-papier" aria-label="Mon profil">
              <Avatar name={nomComplet} size="sm" />
            </NavLink>
          </div>
        </header>

        {/* Menu (téléphone) en liste */}
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
                <span className="rounded-full bg-papier-2 px-2.5 py-1 text-xs font-semibold text-encre-doux">{titulaire ? 'Titulaire' : 'Enseignant'}</span>
              </div>
              <nav aria-label="Navigation de l’espace enseignant" className="flex-1 overflow-y-auto px-3 pb-4">
                <ListeLiens liens={communs} onNavigate={() => setMenu(false)} />
                {blocTitulaire(false)}
              </nav>
              <div className="flex items-center gap-3 border-t border-papier-ligne p-4">
                <Avatar name={nomComplet} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-semibold">{nomComplet}</p>
                  <p className="text-xs text-encre-doux">{profil.specialite}</p>
                </div>
                <button onClick={sortir} className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-stylo hover:bg-stylo-50">
                  <LogOut className="size-4" aria-hidden /> Sortir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* En-tête (ordinateur) */}
        <EnteteBureau
          espace="Espace enseignant"
          largeur="max-w-[1160px]"
          accueil="/enseignant"
          page={[...communs, ...classePrincipale].find((l) => l.to === loc.pathname && l.to !== '/enseignant')?.label ?? ''}
          placeholder="Rechercher un élève, une classe, une page…"
          rechercher={(q): ResultatRecherche[] => {
            const r: ResultatRecherche[] = [...communs, ...classePrincipale].filter((l) => l.label.toLowerCase().includes(q)).map((l) => ({ id: 'p' + l.to, groupe: 'Pages', label: l.label, to: l.to, icone: l.icon }));
            const classes = [...new Set(profil.affectations.map((a) => a.classe))];
            classes.filter((c) => c.toLowerCase().includes(q)).forEach((c) => r.push({ id: 'c' + c, groupe: 'Mes classes', label: c, detail: profil.affectations.filter((a) => a.classe === c).map((a) => a.matiere).join(', '), to: `/enseignant/eleves?classe=${encodeURIComponent(c)}`, icone: BookMarked }));
            classes.forEach((c) =>
              elevesDe(c)
                .filter((e) => `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(q))
                .slice(0, 4)
                .forEach((e) => r.push({ id: `e${c}${e.id}`, groupe: 'Élèves', label: `${e.nom} ${e.prenom}`, detail: `${e.matricule} · ${c}`, to: `/enseignant/eleves?classe=${encodeURIComponent(c)}`, icone: Users2 })),
            );
            return r;
          }}
          notifications={notificationsEnseignant.filter((n) => (n.prof === cle || n.prof === 'tous') && !n.lu).map((n) => ({ id: String(n.id), titre: n.titre, texte: n.texte, quand: n.jour, to: '/enseignant/notifications' }))}
          toutesNotifications="/enseignant/notifications"
          nom={nomComplet}
          fonction={titulaire ? `Titulaire de la ${titulaire}` : 'Professeur'}
          liens={[{ label: 'Mon profil', to: '/enseignant/profil', icone: UserRound }, { label: 'Paramètres', to: '/enseignant/parametres', icone: Settings }]}
          onDeconnexion={sortir}
        />

        <main className="mx-auto w-full max-w-[1160px] px-4 pb-20 pt-6 sm:px-6 lg:px-10 lg:pt-9">
          <div key={loc.pathname} className="animate-entree">
            <Outlet />
          </div>
        </main>
      </div>
    </EnseignantCtx.Provider>
  );
}
