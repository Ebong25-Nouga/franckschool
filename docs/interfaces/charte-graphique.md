# Charte graphique des interfaces — V1

Choix établis avec le skill de design UI/UX Pro Max, puis adaptés aux demandes du propriétaire.

| Élément | Choix | Raison |
|---|---|---|
| Identité | « Le cahier d’écolier » : bleu encre, papier, rouge de correction, surligneur jaune pour ce qui demande une action | Tirée du monde scolaire camerounais, reconnaissable au premier coup d’œil |
| Élément signature | La frise de l’nnée (3 trimestres, 6 séquences) | Montre où en est l’école dans l’nnée, sur chaque tableau de bord |
| Couleur principale | **Bleu** (`#1E3A8A` marine, `#1E40AF` boutons) | Couleur de l'école, demandée par le propriétaire |
| Couleur par école | Variables CSS `--brand-*` dans `frontend/src/index.css` | Chaque établissement peut avoir sa teinte (`etablissements.couleur_principale`) |
| Couleurs d'état | Vert = payé/validé, ambre = en attente, rouge = impayé/refusé | Toujours accompagnées d'un texte : la couleur seule ne porte jamais l'information |
| Polices | Bricolage Grotesque (titres, chiffres), Figtree (texte), intégrées | Caractère affirmé pour les titres, grande lisibilité pour le texte, fonctionnent hors connexion |
| Icônes | Lucide (SVG) | Pas d'émojis comme icônes |
| Graphiques | Recharts | Barres pour comparer les mois et les écoles |

## Règles appliquées

- Contraste du texte d'au moins 4,5:1.
- Zones cliquables d'au moins 44 px de haut, focus clavier visible.
- Mise en page pensée pour le téléphone d'abord : menu en tiroir sur mobile, pas de défilement horizontal de la page.
- Les animations respectent le réglage « réduire les animations » du système.
- Champs de formulaire avec étiquette visible et erreur affichée sous le champ.
- Écran de connexion : aucun rôle exposé, message d'erreur neutre.
