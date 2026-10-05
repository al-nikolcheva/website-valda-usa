# VALDA social posts

Every post uses `site.css`, which mirrors the website design system in `src/app/globals.css`: white pages, #222224 charcoal, soft greys, Inter Tight medium headings with tight tracking, plain muted labels, /NN markers, rounded photos and grey cards, chips like the project pages, and VALDA blue as a small accent only.

Each post folder has `carousel.html` (one `<section class="slide">` per frame) and `caption.md` (sources and checks). Shared images live in `assets/`, fonts in `fonts/`.

Run `node export.mjs` here to render every post into `../social-media/`: square LinkedIn PNGs + PDF, and 4:5 Instagram PNGs (the `.ig` class switches slides to 1080 x 1350).
