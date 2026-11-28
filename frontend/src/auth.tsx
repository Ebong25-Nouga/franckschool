import { createContext, useContext, useState, type ReactNode } from 'react';
import { TOUS_DROITS_SECRETAIRE } from './lib/permissions';

/**
 * Authentification de démonstration (sans API).
 * Sera remplacée par Laravel Sanctum : le rôle et les permissions viendront du backend.
 */
export type Espace = 'super' | 'admin' | 'secretaire' | 'prof' | 'parent';

export interface Session {
  espace: Espace;
  email?: string;
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
  admin: '/direction',
  secretaire: '/secretariat',
  prof: '/enseignant',
  parent: '/parent',
};

const Ctx = createContext<{ session: Session | null; connexion: (email: string) => Session | null; deconnexion: () => void }>(null!);

/**
 * Démo : les comptes secrétaires sont gérés par l'administrateur (données de l'école, dans le navigateur).
 * Ses droits et l'état actif / désactivé remplacent ceux du compte de test.
 * Avec Laravel, le serveur renverra directement les droits à la connexion.
 */
function compteEcole(email: string): { actif: boolean; droits: string[] } | null {
  try {
    const v = localStorage.getItem('fs.secretariat');
    if (!v) return null;
    const c = (JSON.parse(v) as { comptes?: { email: string; actif: boolean; droits: string[] }[] }).comptes?.find((x) => x.email === email);
    return c ? { actif: c.actif, droits: c.droits } : null;
  } catch {
    return null;
  }
}
function avecDroitsEcole(email: string, s: Session): Session | null {
  if (s.espace !== 'secretaire') return { ...s, email };
  const c = compteEcole(email);
  if (!c) return { ...s, email };
  return c.actif ? { ...s, email, permissions: c.droits } : null;
}

function lire(): Session | null {
  try {
    const v = localStorage.getItem('fs.session');
    if (!v) return null;
    const s = JSON.parse(v) as Session;
    // Démo : on reprend les droits à jour (l'administrateur a pu les changer depuis la dernière connexion)
    const email = s.email ?? Object.entries(comptesDemo).find(([, c]) => c.nom === s.nom && c.espace === s.espace)?.[0];
    const base = email ? comptesDemo[email] : undefined;
    return email && base ? avecDroitsEcole(email, base) : s;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(lire);
  const connexion = (email: string) => {
    const cle = email.trim().toLowerCase();
    const s = comptesDemo[cle] ? avecDroitsEcole(cle, comptesDemo[cle]) : null;
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
