import { createContext, useContext, useState, type ReactNode } from 'react';
import { TOUS_DROITS_SECRETAIRE } from './lib/permissions';

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
  // Secrétaire avec presque tous les droits (sauf « Supprimer »)
  'secretaire@etoiles.cm': { espace: 'secretaire', nom: 'Nadine Ekotto', fonction: 'Secrétaire', permissions: TOUS_DROITS_SECRETAIRE.filter((d) => d !== 'supprimer') },
  // Seconde secrétaire, droits limités : sert à tester les permissions
  'paul.b@etoiles.cm': { espace: 'secretaire', nom: 'Paul Biyong', fonction: 'Secrétaire (droits limités)', permissions: ['eleves', 'classes', 'bulletins', 'caisse'] },
  'prof@etoiles.cm': { espace: 'prof', nom: 'M. ESSOMBA Paul', fonction: 'Professeur titulaire, Tle C', permissions: ['profil:essomba', 'classe_principale:Tle C'] },
  'prof.fotso@etoiles.cm': { espace: 'prof', nom: 'M. FOTSO Alain', fonction: 'Professeur', permissions: ['profil:fotso'] },
  'parent@etoiles.cm': { espace: 'parent', nom: 'Mme Mbarga Odile', fonction: 'Parent', permissions: [] },
};

export const accueilParEspace: Record<Espace, string> = {
  super: '/plateforme',
  admin: '/etablissement',
  secretaire: '/secretariat',
  prof: '/enseignant',
  parent: '/parent',
};

const Ctx = createContext<{ session: Session | null; connexion: (email: string) => Session | null; deconnexion: () => void }>(null!);

function lire(): Session | null {
  try {
    const v = localStorage.getItem('fs.session');
    if (!v) return null;
    const s = JSON.parse(v) as Session;
    // Démo : on reprend les droits à jour du compte de test (ils ont pu changer depuis la dernière connexion)
    return Object.values(comptesDemo).find((c) => c.nom === s.nom && c.espace === s.espace) ?? s;
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
