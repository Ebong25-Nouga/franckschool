import {
  Archive,
  Banknote,
  BarChart3,
  Bell,
  BookMarked,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  FileBadge2,
  FileText,
  GraduationCap,
  History,
  Home,
  Receipt,
  Settings2,
  UserCog,
  UserPlus,
  UserRound,
  Users,
  Users2,
  Undo2,
  Vault,
} from 'lucide-react';
import type { NotificationEntete } from '@/components/EnteteBureau';
import { CadreEspace, type Groupe } from '../secretariat/EspaceSecretaire';
import { aujourdhui, SecretariatProvider, useSecretariat, visibles } from '../secretariat/store';

/**
 * Espace de l'administrateur d'établissement (cahier des fonctionnalités du 28/11/2026).
 * Il partage les données de l'école avec le secrétariat, avec tous les droits,
 * plus la direction : validation des notes, publication des bulletins, secrétaires,
 * décisions de caisse, années scolaires, historique et paramètres.
 */

/** Ce qui attend une décision de l'administrateur (tableau de bord, menu, notifications). */
// eslint-disable-next-line react-refresh/only-export-components
export function useADecider() {
  const { etat } = useSecretariat();
  const notes = etat.releves.filter((r) => r.statut === 'soumise').length;
  const corrections = etat.releves.filter((r) => r.statut === 'correction').length;
  const remboursements = etat.remboursements.filter((r) => r.statut === 'en_attente');
  const ecarts = etat.clotures.filter((c) => c.ecart !== 0 && !c.vu);
  // Classes entièrement validées dont les bulletins ne sont pas encore publiés (séquence 2)
  const classes = visibles(etat.classes).map((c) => c.nom);
  const aPublier = classes.filter((c) => {
    const mats = visibles(etat.matieres).filter((m) => m.classe === c);
    const pret = mats.length > 0 && mats.every((m) => etat.releves.find((r) => r.classe === c && r.matiere === m.nom && r.sequence === 2)?.statut === 'validee');
    return pret && etat.bulletins[`${c}|Séquence 2`]?.statut !== 'publie';
  });
  const retires = [...etat.eleves, ...etat.parents, ...etat.enseignants, ...etat.classes, ...etat.matieres, ...etat.absences, ...etat.annonces].filter((x) => x.etat !== 'actif').length;
  return { notes, corrections, remboursements, ecarts, aPublier, retires };
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationsDirection(): NotificationEntete[] {
  const { etat } = useSecretariat();
  const d = useADecider();
  const n: NotificationEntete[] = [];
  if (d.notes) n.push({ id: 'n' + d.notes, titre: 'Notes à valider', texte: `${d.notes} saisie(s) soumise(s) par les enseignants.`, to: '/direction/notes' });
  if (d.aPublier.length) n.push({ id: 'b' + d.aPublier.join(), titre: 'Bulletins à publier', texte: `Générés automatiquement : ${d.aPublier.join(', ')}.`, to: '/direction/resultats' });
  d.remboursements.forEach((r) => n.push({ id: 'r' + r.id, titre: 'Remboursement à décider', texte: `${r.demandeur} demande ${r.montant.toLocaleString('fr-FR')} FCFA pour ${r.eleve}.`, to: '/direction/caisse' }));
  d.ecarts.forEach((c) => n.push({ id: 'e' + c.id, titre: 'Écart de caisse', texte: `${c.ecart.toLocaleString('fr-FR')} FCFA à la clôture du ${c.date.split('-').reverse().join('/')} (${c.auteur}).`, to: '/direction/caisse' }));
  etat.journal.filter((j) => j.operation === 'Accès refusé').slice(0, 2).forEach((j) => n.push({ id: 'a' + j.id, titre: 'Accès refusé', texte: `${j.utilisateur} : ${j.element}`, to: '/direction/historique' }));
  if (!etat.clotures.some((c) => c.date === aujourdhui())) n.push({ id: 'cl', titre: 'Caisse non clôturée', texte: 'La caisse du jour n’est pas encore clôturée.', to: '/direction/cloture' });
  return n;
}

function Direction() {
  const d = useADecider();
  const notifications = useNotificationsDirection();
  const groupes: Groupe[] = [
    { liens: [{ to: '/direction', label: 'Tableau de bord', icon: Home }] },
    {
      titre: 'Établissement',
      liens: [
        { to: '/direction/eleves', label: 'Élèves', icon: GraduationCap },
        { to: '/direction/enseignants', label: 'Enseignants', icon: Users2 },
        { to: '/direction/secretaires', label: 'Secrétaires', icon: UserCog },
        { to: '/direction/classes', label: 'Classes', icon: BookMarked },
        { to: '/direction/matieres', label: 'Matières', icon: ClipboardList },
        { to: '/direction/parents', label: 'Parents', icon: Users },
      ],
    },
    {
      titre: 'Évaluations',
      liens: [
        { to: '/direction/notes', label: 'Notes et validation', icon: ClipboardCheck, badge: d.notes },
        { to: '/direction/resultats', label: 'Résultats et bulletins', icon: FileBadge2, badge: d.aPublier.length },
      ],
    },
    {
      titre: 'Direction',
      liens: [
        { to: '/direction/caisse', label: 'Caisse', icon: Banknote, badge: d.remboursements.length + d.ecarts.length },
        { to: '/direction/annees-scolaires', label: 'Années scolaires', icon: CalendarRange },
        { to: '/direction/notifications', label: 'Notifications', icon: Bell, badge: notifications.length },
        { to: '/direction/historique', label: 'Historique des activités', icon: History },
        { to: '/direction/parametres', label: 'Paramètres', icon: Settings2 },
        { to: '/direction/profil', label: 'Mon profil', icon: UserRound },
      ],
    },
    {
      titre: 'Gestion quotidienne',
      liens: [
        { to: '/direction/inscriptions', label: 'Inscriptions', icon: UserPlus },
        { to: '/direction/absences', label: 'Absences et retards', icon: CalendarCheck2 },
        { to: '/direction/emplois-du-temps', label: 'Emplois du temps', icon: CalendarDays },
        { to: '/direction/depenses', label: 'Dépenses', icon: Receipt },
        { to: '/direction/remboursements', label: 'Remboursements', icon: Undo2 },
        { to: '/direction/cloture', label: 'Clôture de caisse', icon: Vault },
        { to: '/direction/documents', label: 'Documents', icon: FileText },
        { to: '/direction/statistiques', label: 'Statistiques', icon: BarChart3 },
        { to: '/direction/annees', label: 'Anciennes années', icon: Archive },
      ],
    },
  ];
  return (
    <CadreEspace
      config={{
        libelle: 'Espace direction',
        court: 'Direction',
        accueil: '/direction',
        groupes,
        notifications,
        toutesNotifications: '/direction/notifications',
        liensCompte: [{ label: 'Mon profil', to: '/direction/profil', icone: UserRound }, { label: 'Paramètres', to: '/direction/parametres', icone: Settings2 }],
      }}
    />
  );
}

export default function EspaceDirection() {
  return (
    <SecretariatProvider>
      <Direction />
    </SecretariatProvider>
  );
}
