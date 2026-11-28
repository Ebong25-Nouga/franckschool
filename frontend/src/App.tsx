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
import { EnAttenteValidation, MoyennesMatiere, ResultatsClasse, SuiviSaisies } from './pages/enseignant/ClassePrincipale';
import EspaceEnseignant from './pages/enseignant/EspaceEnseignant';
import * as Ens from './pages/enseignant/PagesEnseignant';
import EspaceParent from './pages/parent/EspaceParent';
import { Accueil as AccueilParent, InformationsScolaires, MesEnfants, NotesBulletins, Notifications as NotificationsParent, PaiementsHistorique, ParametresCompte, Recus } from './pages/parent/PagesParent';
import { Abonnements, Journal, ListeEtablissements, Statistiques, TableauPlateforme } from './pages/plateforme/Plateforme';
import Accueil from './pages/public/Accueil';
import AccueilSecretariat from './pages/secretariat/Accueil';
import { Annonces, Documents, Statistiques as StatistiquesSecretariat } from './pages/secretariat/Communication';
import { MonActivite, MonCompte } from './pages/secretariat/Compte';
import ElevesSecretariat from './pages/secretariat/Eleves';
import EspaceSecretaire, { Garde } from './pages/secretariat/EspaceSecretaire';
import { Bulletins as BulletinsSecretariat, Notes as NotesSecretariat } from './pages/secretariat/Evaluations';
import { Caisse as CaisseSecretariat, Cloture, Depenses, Remboursements as RemboursementsSecretariat } from './pages/secretariat/Finances';
import Inscriptions from './pages/secretariat/Inscriptions';
import { Enseignants, Parents } from './pages/secretariat/Personnes';
import { Annees, Classes as ClassesSecretariat, Matieres } from './pages/secretariat/Structure';
import { Absences as AbsencesSecretariat, Discipline, EmploisDuTemps } from './pages/secretariat/VieScolaire';
import Connexion from './pages/public/Connexion';
import ConnexionEcole from './pages/public/ConnexionEcole';
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
            <Route path="/reinitialiser" element={<MotDePasseOublie key="lien" depuisLien />} />

            {/* Interface 2 — Administration centrale */}
            <Route element={<Protege espaces={['super']}><AppShell /></Protege>}>
              <Route path="/plateforme" element={<TableauPlateforme />} />
              <Route path="/plateforme/etablissements" element={<ListeEtablissements page />} />
              <Route path="/plateforme/statistiques" element={<Statistiques />} />
              <Route path="/plateforme/journal" element={<Journal />} />
              <Route path="/plateforme/abonnements" element={<Abonnements />} />
            </Route>

            {/* Interface 3a — Espace secrétariat (séparé, chaque page protégée par son droit) */}
            <Route element={<Protege espaces={['secretaire']}><EspaceSecretaire /></Protege>}>
              <Route path="/secretariat" element={<AccueilSecretariat />} />
              <Route path="/secretariat/eleves" element={<Garde droit="eleves"><ElevesSecretariat /></Garde>} />
              <Route path="/secretariat/inscriptions" element={<Garde droit="inscriptions"><Inscriptions /></Garde>} />
              <Route path="/secretariat/parents" element={<Garde droit="parents"><Parents /></Garde>} />
              <Route path="/secretariat/enseignants" element={<Garde droit="enseignants"><Enseignants /></Garde>} />
              <Route path="/secretariat/classes" element={<Garde droit="classes"><ClassesSecretariat /></Garde>} />
              <Route path="/secretariat/matieres" element={<Garde droit="matieres"><Matieres /></Garde>} />
              <Route path="/secretariat/annees" element={<Garde droit="archives"><Annees /></Garde>} />
              <Route path="/secretariat/absences" element={<Garde droit="absences"><AbsencesSecretariat /></Garde>} />
              <Route path="/secretariat/discipline" element={<Garde droit="discipline"><Discipline /></Garde>} />
              <Route path="/secretariat/emplois-du-temps" element={<Garde droit="emplois"><EmploisDuTemps /></Garde>} />
              <Route path="/secretariat/notes" element={<Garde droit="notes"><NotesSecretariat /></Garde>} />
              <Route path="/secretariat/bulletins" element={<Garde droit="bulletins"><BulletinsSecretariat /></Garde>} />
              <Route path="/secretariat/caisse" element={<Garde droit="caisse"><CaisseSecretariat /></Garde>} />
              <Route path="/secretariat/depenses" element={<Garde droit="depenses"><Depenses /></Garde>} />
              <Route path="/secretariat/remboursements" element={<Garde droit="remboursements"><RemboursementsSecretariat /></Garde>} />
              <Route path="/secretariat/cloture" element={<Garde droit="clotures"><Cloture /></Garde>} />
              <Route path="/secretariat/documents" element={<Garde droit="documents"><Documents /></Garde>} />
              <Route path="/secretariat/annonces" element={<Garde droit="annonces"><Annonces /></Garde>} />
              <Route path="/secretariat/statistiques" element={<Garde droit="statistiques"><StatistiquesSecretariat /></Garde>} />
              <Route path="/secretariat/activite" element={<MonActivite />} />
              <Route path="/secretariat/compte" element={<MonCompte />} />
            </Route>

            {/* Interface 3b — Administration de l'établissement (sera refaite après validation du secrétariat) */}
            <Route element={<Protege espaces={['admin']}><AppShell /></Protege>}>
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

            {/* Interface 4 — Espace enseignant (structure validée le 25/11/2026) */}
            <Route element={<Protege espaces={['prof']}><EspaceEnseignant /></Protege>}>
              <Route path="/enseignant" element={<Ens.Accueil />} />
              <Route path="/enseignant/profil" element={<Ens.MonProfil />} />
              <Route path="/enseignant/classes" element={<Ens.MesClasses />} />
              <Route path="/enseignant/matieres" element={<Ens.MesMatieres />} />
              <Route path="/enseignant/eleves" element={<Ens.ListesEleves />} />
              <Route path="/enseignant/notes" element={<Ens.SaisieNotes />} />
              <Route path="/enseignant/notes-soumises" element={<Ens.NotesSoumises />} />
              <Route path="/enseignant/corrections" element={<Ens.DemandesCorrection />} />
              <Route path="/enseignant/emploi-du-temps" element={<Ens.EmploiDuTemps />} />
              <Route path="/enseignant/notifications" element={<Ens.Notifications />} />
              <Route path="/enseignant/parametres" element={<Ens.Parametres />} />
              {/* Professeur titulaire : visible selon les permissions */}
              <Route path="/enseignant/classe-principale" element={<ResultatsClasse />} />
              <Route path="/enseignant/classe-principale/moyennes" element={<MoyennesMatiere />} />
              <Route path="/enseignant/classe-principale/saisies" element={<SuiviSaisies />} />
              <Route path="/enseignant/classe-principale/attente" element={<EnAttenteValidation />} />
            </Route>

            {/* Interface 5 — Espace parent (structure validée le 25/11/2026) */}
            <Route element={<Protege espaces={['parent']}><EspaceParent /></Protege>}>
              <Route path="/parent" element={<AccueilParent />} />
              <Route path="/parent/enfants" element={<MesEnfants />} />
              <Route path="/parent/informations" element={<InformationsScolaires />} />
              <Route path="/parent/notes" element={<NotesBulletins />} />
              <Route path="/parent/paiements" element={<PaiementsHistorique />} />
              <Route path="/parent/recus" element={<Recus />} />
              <Route path="/parent/notifications" element={<NotificationsParent />} />
              <Route path="/parent/compte" element={<ParametresCompte />} />
            </Route>

            {/* Lien propre à chaque école, partagé dans le groupe WhatsApp des parents (décision 022) */}
            <Route path="/:ecole" element={<ConnexionEcole />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="bottom-right" theme="light" />
      </ToastProvider>
    </AuthProvider>
  );
}
