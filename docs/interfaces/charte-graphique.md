# Charte graphique des interfaces — V1

Choix établis avec le skill de design UI/UX Pro Max, puis adaptés aux demandes du propriétaire.

| Élément | Choix | Raison |
|---|---|---|
| Style | Minimaliste et structuré (« Swiss style ») | Recommandé pour les applications de gestion et les tableaux de bord : clair, lisible, sobre |
| Couleur principale | **Bleu** (`#1E3A8A` marine, `#1E40AF` boutons) | Couleur de l'école, demandée par le propriétaire |
| Couleur par école | Variables CSS `--brand-*` dans `frontend/src/index.css` | Chaque établissement peut avoir sa teinte (`etablissements.couleur_principale`) |
| Couleurs d'état | Vert = payé/validé, ambre = en attente, rouge = impayé/refusé | Toujours accompagnées d'un texte : la couleur seule ne porte jamais l'information |
| Police | Plus Jakarta Sans (intégrée, sans appel à Google) | Moderne, très lisible, fonctionne hors connexion |
| Icônes | Lucide (SVG) | Pas d'émojis comme icônes |
| Graphiques | Recharts | Barres pour comparer les mois et les écoles |

## Règles appliquées

- Contraste du texte d'au moins 4,5:1.
- Zones cliquables d'au moins 44 px de haut, focus clavier visible.
- Mise en page pensée pour le téléphone d'abord : menu en tiroir sur mobile, pas de défilement horizontal de la page.
- Les animations respectent le réglage « réduire les animations » du système.
- Champs de formulaire avec étiquette visible et erreur affichée sous le champ.
- Écran de connexion : aucun rôle exposé, message d'erreur neutre.
