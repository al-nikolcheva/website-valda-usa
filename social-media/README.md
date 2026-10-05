# VALDA social media, Oct to Nov 2026

Three posts a week (Tue, Thu, Fri), blended: products, educational, blog carousels, Reels, news and projects. Projects run every three weeks. A new article goes live on the website on alternate Mondays, and the Tuesday after it is the blog carousel.

- `Instagram/` 1080 x 1350 (4:5). Upload the slides in order as one carousel (Reels: `Reel.mp4`).
- `LinkedIn/` 1080 x 1080. Carousels go up as `Carousel.pdf` (document post). Reels go up as native video.
- `Instagram/Parked/`, `LinkedIn/Parked/` posts not in the current plan, kept for later months.
- `Extras/` source Reels.

Folders are named `MM.DD Day - NN Title`, so they sort in posting order. Each one has:

- `Caption.txt` keyword-first caption with hashtags
- `First comment.txt` (LinkedIn) the link to post as the first comment
- `Posting notes.txt` posting time, tags, location, collaborator, document title and alt text per slide

## Posting times (US Eastern)

| Day | LinkedIn | Instagram |
|---|---|---|
| Tue | 10:00 AM | 12:00 PM |
| Thu | 11:00 AM | 12:00 PM, Reels 6:00 PM |
| Fri | 10:00 AM | 11:00 AM |

## Caption and hashtag rules (2026)

- Instagram allows 5 hashtags per post, caption and comments combined. More than 5 can block publishing or hide the post from Explore. We use 4 topic tags plus #VALDA.
- LinkedIn: 3 topic tags plus #VALDA. Hashtags do little for reach there; the text is what gets read.
- The first line carries the main keyword. Instagram search and Google (which now indexes public business accounts) read it like a title.
- No links in the LinkedIn post body. The article link goes in the first comment.
- Instagram: put the article in the bio link that week and share the post to Stories with a link sticker.
- End with a question. Comments count for more than likes on both platforms.
- Add the alt text from `Posting notes.txt` to every image.
- US spelling (aluminum, center), sentence case, hyphens not em dashes, no emoji.

These files are generated. To change anything, edit `social/posts/posts.js` and run `node build.mjs` in `social/posts/` (add post numbers to rebuild only those, e.g. `node build.mjs 3 6`).
