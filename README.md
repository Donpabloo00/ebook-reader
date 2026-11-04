# Folio — eBook Reader 3D (demo)

Reader de cărți digitale cu aspect fizic, construit ca prototip de prezentare funcțional:

- **Import PDF** — buton sau drag & drop; paginile sunt randate cu **PDF.js** și afișate pe hârtie.
- **Răsfoire realistă** — **react-pageflip**: curling 3D, umbre, tragere de colțuri, swipe.
- **Carte demo** — 8 pagini + coperte, text integral în română.
- **Ecran complet**, bară de progres, pagină curentă / total.
- **Responsive** — două pagini pe desktop, o pagină pe mobil (mod portrait automat).

## Rulează

```bash
npm install
npm run dev
```

Deschide http://localhost:3000.

## Comenzi rapide

- `←` / `→` — răsfoire
- clic sau tragere de colț — întoarce pagina
- `Importă PDF` sau trage fișierul în fereastră

## Note tehnice

- Workerul PDF.js este copiat în `public/pdf.worker.min.mjs` (vezi scriptul `postinstall`).
- Paginile PDF sunt randate asincron (întâi cele din jurul paginii curente), la rezoluție supraprobată.
- `reactStrictMode` este dezactivat pentru că `react-pageflip` nu suportă dubla montare din Strict Mode.
