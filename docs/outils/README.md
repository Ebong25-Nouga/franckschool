# Génération des PDF

Script utilisé pour produire `docs/pdf/` à partir des sources Markdown (schémas Mermaid compris).

Prérequis : `pandoc`, Node.js, `playwright` (avec Chromium) et `mermaid@11.4.1` installés dans ce dossier.

```bash
cd docs/outils && npm install mermaid@11.4.1 playwright
node build.js ../base-de-donnees/audit-bd-v1.md ../pdf/FRANCK_SCHOOL_Audit_BD_V1.pdf
```
