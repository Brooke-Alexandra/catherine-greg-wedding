# Catherine & Greg — wedding website

Read this first in any session that touches this repo.

## What this is
- Wedding website for Catherine Honeycutt & Greg Fontana. Wedding Wednesday, July 7, 2027, Hotel Signum, Malfa, Salina (Aeolian Islands, Sicily).
- Week: Mon Jul 5 welcome reception, Tue Jul 6 boat day + lunch on Lipari, Wed Jul 7 ceremony & reception, Thu Jul 8 farewell lunch.
- Built and maintained by Brooke Betterton (client work). Static site in `site/` (`site/index.html` + `site/images/`). No build step. Netlify publishes only `site/` (see `netlify.toml`), so repo files like this one are never served.
- Hosted on Netlify (project `catherine-and-greg`, catherine-and-greg.netlify.app). Every push to `main` goes live in about a minute. For visual changes, push to a branch first and share the preview link; merge to `main` only when Brooke says "push it live".

## Hard rules
- Never mention Claude, AI, Anthropic or claude.ai anywhere in the site (code, comments, alt text, meta tags, commit messages that might be shown to the client). The client must not see that the site was built with AI.
- Keep `<meta name="robots" content="noindex, nofollow">` until Brooke says the site is final.
- Repo is private: it contains the couple's photos and phone number. Never make it public.
- Passwords and API keys never go in the repo or the chat.

## RSVP
- RSVPs live on Joy, not on this site. The "RSVP now" button (`#rsvp-open`) opens https://withjoy.com/catherine-and-greg-jul-2027/rsvp in a pop-up `<dialog>` with an iframe, with a "open in a new tab" fallback link. Tested working in Chrome, Safari and mobile.
- Joy's own website is in Draft; its RSVP page is public. Don't link to the Joy homepage.
- Open question with Catherine: deadline says Dec 1 on this site, Jan 1 in her Joy RSVP question.

## Design (locked, "Lagoon & Limestone")
- Neutral grounds; color comes from photos. Limestone #F3EFE7 page, paper #FBFAF6, ink #121212, caper #5E6440 for small labels, sand #E8E0D2 sparingly.
- Footer sits on her save-the-date blue-grey wash; couple section and RSVP sit on the lace texture (bookends).
- Type: Cormorant Garamond (headings, names), Jost (body, labels, uppercase with letter-spacing), Pinyon Script only twice ("the wedding of" in hero, "benvenuti"). Google Fonts only. No Adobe Fonts on client sites.
- Ampersand: Garamond Premier Pro vector `images/gpp-amp.svg`.
- Headings upright (no half-italic). Wedding row has a lemon rule that appears only on hover.
- Parallax on hero and the cliffs band; gentle hover zoom on photos; respects prefers-reduced-motion.
- Collage ("la dolce vita") is a 12-column grid, two 300px rows; tiles are wrapper divs with explicit grid-area. On phones it collapses to 2 columns (see the media query).

## Photos
- Sources: the couple's own photos; Hotel Signum's photos (permission still to be confirmed with the hotel); free Unsplash photos (`images/unsplash-*.jpg`, no credit line (Unsplash license does not require attribution)).
- Never use Veggiewayfarer photos (she charges $250/image; all removed).
- Unconfirmed source, swap if not cleared before launch: `images/cliff-catamaran.jpg` (Travel) and `images/lipari-marina-corta.jpg` (Tue boat day).
- Never use Getty / stock-agency / magazine images.

## Open items
- Couple blurb (welcome section placeholder in brackets).
- Catherine's phone in Q&A shows as [phone].
- Custom domain: register in the couple's name.
