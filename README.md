# FranckSchool

Application de gestion scolaire adaptée au système éducatif camerounais (francophone).

## Stack technique

- **Backend** : Laravel (API REST, authentification Sanctum)
- **Frontend** : React + Vite + TypeScript + Tailwind CSS

## Fonctionnalités prévues

- Gestion des élèves, classes et matières (coefficients)
- Saisie des notes par séquence (6 séquences, 3 trimestres)
- Moyennes, rangs et appréciations
- Bulletins en PDF
- Suivi des frais scolaires (FCFA)
- Tableau de bord

## Lancer l'interface (frontend)

```bash
cd frontend
npm install
npm run dev
```

Puis ouvrir http://localhost:5173. En développement, l'écran de connexion propose des **comptes de démonstration** (Super Admin, administrateur, secrétaire, professeur, parent) : n'importe quel mot de passe fonctionne. Les données affichées sont des exemples, l'API Laravel n'est pas encore branchée.

Pour fabriquer la version de démonstration (une seule page, sans serveur) : `npx vite build --mode demo` (résultat dans `frontend/dist-demo/`).

## Documentation

Voir le dossier [`docs/`](docs/README.md) : audit de la base de données, schémas Mermaid, journal des décisions, charte graphique.
