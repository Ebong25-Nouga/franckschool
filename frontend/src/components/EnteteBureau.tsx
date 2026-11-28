import { cn } from '@/lib/utils';
import { Bell, ChevronDown, ChevronRight, CornerDownLeft, Home, LogOut, Search, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from './kit';

/**
 * En-tête des espaces sur ordinateur (proposition A, validée le 28/11/2026).
 * Fil d'Ariane · recherche (Ctrl K) · notifications · menu du compte.
 * Masqué sur téléphone et tablette : l'en-tête mobile de chaque espace reste inchangé.
 */
export interface ResultatRecherche {
  id: string;
  groupe: string;
  label: string;
  detail?: string;
  to: string;
  icone: LucideIcon;
}
export interface NotificationEntete {
  id: string;
  titre: string;
  texte: string;
  quand?: string;
  to?: string;
}
export interface LienCompte {
  label: string;
  to: string;
  icone: LucideIcon;
}

interface Props {
  espace: string;
  accueil: string;
  page: string;
  placeholder: string;
  rechercher: (q: string) => ResultatRecherche[];
  notifications: NotificationEntete[];
  toutesNotifications?: string;
  nom: string;
  fonction: string;
  liens: LienCompte[];
  onDeconnexion: () => void;
  /** Même largeur que le contenu de la page */
  largeur?: string;
}

/** Ferme un menu ouvert quand on clique ailleurs ou qu'on appuie sur Échap. */
function useFermeture(ouvert: boolean, fermer: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && fermer();
    const touche = (e: KeyboardEvent) => e.key === 'Escape' && fermer();
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', touche);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', touche);
    };
  }, [ouvert, fermer]);
  return ref;
}

const Panneau = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('absolute right-0 top-[calc(100%+8px)] z-40 animate-pop overflow-hidden rounded-2xl bg-white shadow-leve ring-1 ring-papier-ligne/70', className)}>{children}</div>
);

export default function EnteteBureau(p: Props) {
  return (
    <header className="sticky top-0 z-20 hidden border-b border-papier-ligne/80 bg-papier/85 backdrop-blur-md lg:block">
      <div className={cn('mx-auto flex h-[68px] items-center gap-4 px-10', p.largeur ?? 'max-w-[1240px]')}>
        <nav aria-label="Fil d’Ariane" className="flex min-w-0 items-center gap-2 text-sm text-encre-doux">
          <Link to={p.accueil} className="flex shrink-0 items-center gap-2 rounded-lg py-1 hover:text-encre">
            <Home className="size-4 text-encre-pale" aria-hidden />
            {p.espace}
          </Link>
          {p.page && (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-encre-pale" aria-hidden />
              <span className="truncate font-semibold text-encre" aria-current="page">{p.page}</span>
            </>
          )}
        </nav>
        <div className="flex-1" />
        <Recherche placeholder={p.placeholder} rechercher={p.rechercher} />
        <span className="h-7 w-px bg-papier-ligne" aria-hidden />
        <Cloche notifications={p.notifications} toutes={p.toutesNotifications} />
        <Compte nom={p.nom} fonction={p.fonction} liens={p.liens} onDeconnexion={p.onDeconnexion} />
      </div>
    </header>
  );
}

/* ---------- Recherche (Ctrl K) ---------- */
function Recherche({ placeholder, rechercher }: { placeholder: string; rechercher: (q: string) => ResultatRecherche[] }) {
  const [q, setQ] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const champ = useRef<HTMLInputElement>(null);
  const nav = useNavigate();
  const fermer = () => {
    setOuvert(false);
    setQ('');
  };
  const ref = useFermeture(ouvert, () => setOuvert(false));
  const res = q.trim().length >= 2 ? rechercher(q.trim().toLowerCase()).slice(0, 8) : [];

  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        champ.current?.focus();
        setOuvert(true);
      }
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);

  const aller = (r: ResultatRecherche) => {
    nav(r.to);
    fermer();
    champ.current?.blur();
  };
  let groupe = '';

  return (
    <div ref={ref} className="relative w-full max-w-[440px]">
      <label className="relative block">
        <span className="sr-only">Rechercher</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-encre-pale" aria-hidden />
        <input
          ref={champ}
          type="search"
          value={q}
          role="combobox"
          aria-expanded={ouvert && res.length > 0}
          aria-controls="resultats-recherche"
          onFocus={() => setOuvert(true)}
          onChange={(e) => (setQ(e.target.value), setActif(0), setOuvert(true))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActif((a) => Math.min(a + 1, res.length - 1));
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActif((a) => Math.max(a - 1, 0));
            }
            if (e.key === 'Enter' && res[actif]) aller(res[actif]);
          }}
          placeholder={placeholder}
          className="h-[42px] w-full truncate rounded-[11px] border border-transparent bg-white pl-10 pr-16 text-sm shadow-feuille placeholder:text-encre-pale focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/[0.12]"
        />
        {!q && <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-papier-ligne bg-papier px-1.5 text-[11px] font-semibold text-encre-pale">Ctrl K</kbd>}
      </label>
      {ouvert && q.trim().length >= 2 && (
        <Panneau className="left-0 right-auto w-full">
          {res.length === 0 ? (
            <p className="px-4 py-5 text-sm text-encre-doux">Aucun résultat pour « {q.trim()} ».</p>
          ) : (
            <ul id="resultats-recherche" role="listbox" className="max-h-[60vh] overflow-y-auto p-1.5">
              {res.map((r, i) => {
                const titre = r.groupe !== groupe ? (groupe = r.groupe) : null;
                return (
                  <li key={r.id} role="option" aria-selected={i === actif}>
                    {titre && <p className="px-3 pb-1 pt-2.5 text-xs font-semibold text-encre-pale">{titre}</p>}
                    <button
                      type="button"
                      onMouseEnter={() => setActif(i)}
                      onClick={() => aller(r)}
                      className={cn('flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left', i === actif ? 'bg-brand-50' : 'hover:bg-papier')}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-papier-2 text-brand-700"><r.icone className="size-4" aria-hidden /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-encre">{r.label}</span>
                        {r.detail && <span className="block truncate text-xs text-encre-doux">{r.detail}</span>}
                      </span>
                      {i === actif && <CornerDownLeft className="size-4 shrink-0 text-encre-pale" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panneau>
      )}
    </div>
  );
}

/* ---------- Notifications ---------- */
function Cloche({ notifications, toutes }: { notifications: NotificationEntete[]; toutes?: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [lues, setLues] = useState<string[]>([]);
  const ref = useFermeture(ouvert, () => setOuvert(false));
  const nav = useNavigate();
  const nonLues = notifications.filter((n) => !lues.includes(n.id)).length;
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        aria-label={`Notifications, ${nonLues} non lues`}
        className="relative grid size-[42px] cursor-pointer place-items-center rounded-[11px] text-encre-doux transition-colors hover:bg-white hover:text-encre"
      >
        <Bell className="size-5" aria-hidden />
        {nonLues > 0 && <span className="absolute right-1.5 top-1.5 grid min-w-[18px] place-items-center rounded-full bg-stylo px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-papier">{nonLues}</span>}
      </button>
      {ouvert && (
        <Panneau className="w-[380px]">
          <div className="flex items-center justify-between border-b border-papier-ligne/70 px-5 py-4">
            <p className="font-display text-[17px] font-semibold">Notifications</p>
            {nonLues > 0 && <button onClick={() => setLues(notifications.map((n) => n.id))} className="cursor-pointer text-[13px] font-semibold text-brand-700 hover:underline">Tout marquer comme lu</button>}
          </div>
          {notifications.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-encre-doux">Rien de nouveau.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-papier-ligne/70 overflow-y-auto">
              {notifications.map((n) => {
                const lu = lues.includes(n.id);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        setLues((l) => [...l, n.id]);
                        if (n.to) {
                          nav(n.to);
                          setOuvert(false);
                        }
                      }}
                      className={cn('flex w-full cursor-pointer gap-3 px-5 py-3.5 text-left transition-colors hover:bg-papier', !lu && 'bg-brand-50/40')}
                    >
                      <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', lu ? 'bg-transparent' : 'bg-brand-600')} aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-encre">{n.titre}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-encre-doux">{n.texte}</span>
                        {n.quand && <span className="mt-1 block text-xs text-encre-pale">{n.quand}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {toutes && (
            <Link to={toutes} onClick={() => setOuvert(false)} className="block border-t border-papier-ligne/70 px-5 py-3 text-center text-[13px] font-semibold text-brand-700 hover:bg-papier">
              Voir toutes les notifications
            </Link>
          )}
        </Panneau>
      )}
    </div>
  );
}

/* ---------- Menu du compte ---------- */
function Compte({ nom, fonction, liens, onDeconnexion }: { nom: string; fonction: string; liens: LienCompte[]; onDeconnexion: () => void }) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useFermeture(ouvert, () => setOuvert(false));
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert} className="flex cursor-pointer items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-white">
        <Avatar name={nom} />
        <span className="max-w-44 text-left leading-tight">
          <span className="block truncate text-sm font-semibold text-encre">{nom}</span>
          <span className="block truncate text-xs text-encre-doux">{fonction}</span>
        </span>
        <ChevronDown className={cn('size-4 text-encre-pale transition-transform', ouvert && 'rotate-180')} aria-hidden />
      </button>
      {ouvert && (
        <Panneau className="w-60 p-1.5">
          {liens.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOuvert(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-encre hover:bg-papier">
              <l.icone className="size-4 text-encre-doux" aria-hidden /> {l.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-papier-ligne/70" />
          <button onClick={onDeconnexion} className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-stylo hover:bg-stylo-50">
            <LogOut className="size-4" aria-hidden /> Se déconnecter
          </button>
        </Panneau>
      )}
    </div>
  );
}
