import type { ReactNode } from 'react';
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, accueilParEspace, useAuth, type Espace } from './auth';
import AppShell from './components/AppShell';
import { ToastProvider } from './components/kit';
import { Toaster } from './components/ui/sonner';
import { Parametres, Utilisateurs } from './pages/etablissement/Administration';
import Caisse from './pages/etablissement/Caisse';
import { Classes, Professeurs } from './pages/etablissement/ClassesProfesseurs';
import Eleves from './pages/etablissement/Eleves';
import { Absences, Bulletins, ValidationNotes } from './pages/etablissement/Evaluations';
import Remboursements from './pages/etablissement/Remboursements';
import TableauDeBord from './pages/etablissement/TableauDeBord';
import { EmploiDuTemps, MesClasses, SaisieNotes, TableauEnseignant } from './pages/enseignant/Enseignant';
import { EcoleParent, PaiementsParent, TableauParent } from './pages/parent/Parent';
import { Abonnements, Journal, ListeEtablissements, Statistiques, TableauPlateforme } from './pages/plateforme/Plateforme';
import Accueil from './pages/public/Accueil';
import Connexion from './pages/public/Connexion';
import MotDePasseOublie from './pages/public/MotDePasseOublie';

function Protege({ espaces, children }: { espaces: Espace[]; children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/connexion" replace />;
  if (!espaces.includes(session.espace)) return <Navigate to={accueilParEspace[session.espace]} replace />;
  return children;
}

// La démo en ligne (page unique) utilise des adresses en « #/… »
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter;

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Interface 1 — Accueil public et authentification */}
            <Route path="/" element={<Accueil />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />

            {/* Interface 2 — Administration centrale */}
            <Route element={<Protege espaces={['super']}><AppShell /></Protege>}>
              <Route path="/plateforme" element={<TableauPlateforme />} />
              <Route path="/plateforme/etablissements" element={<ListeEtablissements page />} />
              <Route path="/plateforme/statistiques" element={<Statistiques />} />
              <Route path="/plateforme/journal" element={<Journal />} />
              <Route path="/plateforme/abonnements" element={<Abonnements />} />
            </Route>

            {/* Interface 3 — Administration de l'établissement (admin + secrétaires) */}
            <Route element={<Protege espaces={['admin', 'secretaire']}><AppShell /></Protege>}>
              <Route path="/etablissement" element={<TableauDeBord />} />
              <Route path="/etablissement/eleves" element={<Eleves />} />
              <Route path="/etablissement/classes" element={<Classes />} />
              <Route path="/etablissement/professeurs" element={<Professeurs />} />
              <Route path="/etablissement/absences" element={<Absences />} />
              <Route path="/etablissement/notes" element={<ValidationNotes />} />
              <Route path="/etablissement/bulletins" element={<Bulletins />} />
              <Route path="/etablissement/caisse" element={<Caisse />} />
              <Route path="/etablissement/remboursements" element={<Remboursements />} />
              <Route path="/etablissement/utilisateurs" element={<Utilisateurs />} />
              <Route path="/etablissement/parametres" element={<Parametres />} />
            </Route>

            {/* Interface 4 — Espace enseignant */}
            <Route element={<Protege espaces={['prof']}><AppShell /></Protege>}>
              <Route path="/enseignant" element={<TableauEnseignant />} />
              <Route path="/enseignant/classes" element={<MesClasses />} />
              <Route path="/enseignant/notes" element={<SaisieNotes />} />
              <Route path="/enseignant/emploi-du-temps" element={<EmploiDuTemps />} />
            </Route>

            {/* Interface 5 — Espace parent */}
            <Route element={<Protege espaces={['parent']}><AppShell /></Protege>}>
              <Route path="/parent" element={<TableauParent />} />
              <Route path="/parent/paiements" element={<PaiementsParent />} />
              <Route path="/parent/ecole" element={<EcoleParent />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="bottom-right" theme="light" />
      </ToastProvider>
    </AuthProvider>
  );
}
