import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Authentification de démonstration (sans API).
 * Sera remplacée par Laravel Sanctum : le rôle et les permissions viendront du backend.
 */
export type Espace = 'super' | 'admin' | 'secretaire' | 'prof' | 'parent';

export interface Session {
  espace: Espace;
  nom: string;
  fonction: string;
  permissions: string[];
}

const TOUTES = ['eleves', 'classes', 'professeurs', 'notes', 'bulletins', 'caisse', 'remboursements.decider', 'utilisateurs', 'parametres', 'emplois', 'absences'];

export const comptesDemo: Record<string, Session> = {
  'super@franckschool.cm': { espace: 'super', nom: 'Franck Ebong', fonction: 'Super Administrateur', permissions: [] },
  'admin@etoiles.cm': { espace: 'admin', nom: 'Jean-Pierre Manga', fonction: "Administrateur d'établissement", permissions: TOUTES },
  'secretaire@etoiles.cm': { espace: 'secretaire', nom: 'Nadine Ekotto', fonction: 'Secrétaire', permissions: ['eleves', 'caisse', 'absences'] },
  'prof@etoiles.cm': { espace: 'prof', nom: 'M. ESSOMBA Paul', fonction: 'Professeur principal — Tle C', permissions: [] },
  'parent@etoiles.cm': { espace: 'parent', nom: 'Mme Mbarga Odile', fonction: 'Parent', permissions: [] },
};

export const accueilParEspace: Record<Espace, string> = {
  super: '/plateforme',
  admin: '/etablissement',
  secretaire: '/etablissement',
  prof: '/enseignant',
  parent: '/parent',
};

const Ctx = createContext<{ session: Session | null; connexion: (email: string) => Session | null; deconnexion: () => void }>(null!);

function lire(): Session | null {
  try {
    const v = localStorage.getItem('fs.session');
    return v ? (JSON.parse(v) as Session) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(lire);
  const connexion = (email: string) => {
    const s = comptesDemo[email.trim().toLowerCase()] ?? null;
    setSession(s);
    try {
      if (s) localStorage.setItem('fs.session', JSON.stringify(s));
    } catch {
      /* stockage indisponible : session en mémoire seulement */
    }
    return s;
  };
  const deconnexion = () => {
    setSession(null);
    try {
      localStorage.removeItem('fs.session');
    } catch {
      /* rien */
    }
  };
  return <Ctx.Provider value={{ session, connexion, deconnexion }}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx);

// eslint-disable-next-line react-refresh/only-export-components
export const peut = (s: Session | null, permission: string) => !!s && (s.espace === 'admin' || s.permissions.includes(permission));
