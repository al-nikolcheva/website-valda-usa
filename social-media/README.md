# VALDA social media

Ready-to-post files, one folder per post:

| Folder | Post | Slot |
|---|---|---|
| Post 1 - Aluminium or PVC | Educational carousel, 5 slides | |
| Post 2 - VALDA Vista | What we have, 5 slides | Thu 08 Oct |
| Post 3 - GORA project | Projects, photo + 2 slides | Fri 09 Oct |

Each post folder contains:

- `LinkedIn/` square 1080 x 1080 PNGs plus a PDF. Upload the PDF as a LinkedIn document post to get a swipeable carousel.
- `Instagram/` portrait 1080 x 1350 (4:5) PNGs, the size that fills the most screen in the feed. Upload them in order as one carousel.
- `Caption LinkedIn.txt` and `Caption Instagram.txt` (Instagram version has hashtags and "link in bio").

Before posting: fill in the GORA architect (Post 3 slide 3 and captions) and confirm the Vista approval numbers on Post 2 slide 5.

These files are generated. Edit the source in `social/` and run `node export.mjs` there to rebuild this folder.
