# Orelle — Chain Atelier

Static e-commerce front-end for a fine gold chain brand. No build step.

```
python3 -m http.server 8000   # then open http://localhost:8000
```

- `index.html`, `css/styles.css`, `js/main.js` — page, scroll-driven hero, collections, showcase, shop grid, cart drawer.
- `js/stage.js` + `js/chain.js` — live three.js necklace carousel; chains are modelled procedurally (cable, curb, rope, paperclip, figaro, box).
- `assets/img/hero-pendant.png`, `model-pendant.jpg` — the client's own hero pendant + model photo.
- `assets/img/tile_* / prod_* / dark_*` — product renders produced by `tools/render.html` (`node tools/shot.js jobs.json`, then `python3 tools/post.py raw assets/img`).
- `vendor/` — three.js r160 and Lenis, vendored so the site runs offline.
