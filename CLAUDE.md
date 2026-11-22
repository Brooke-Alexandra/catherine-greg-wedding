# Catherine & Greg — wedding website

Read this first in any session that touches this repo.

## What this is
- Wedding website for Catherine Honeycutt & Greg Fontana. Wedding Wednesday, July 7, 2027, Hotel Signum, Malfa, Salina (Aeolian Islands, Sicily).
- Week: Mon Jul 5 welcome reception, Tue Jul 6 boat day + lunch on Lipari, Wed Jul 7 ceremony & reception, Thu Jul 8 farewell lunch.
- Built and maintained by Brooke Betterton (client work). Static site in `site/` (`site/index.html` + `site/images/`). No build step. Netlify publishes only `site/` (see `netlify.toml`), so repo files like this one are never served.
- Hosted on Cloudflare Pages (project `catherine-greg`, live at catherine-greg.pages.dev, production branch `main`, output directory `site`, no build command). Every push to `main` goes live in about a minute; every other branch gets its own preview URL at `<branch>.catherine-greg.pages.dev`. For visual changes, push to a branch first and share that preview link; merge to `main` only when Brooke says "push it live". (Moved off Netlify Nov 15 after the free plan ran out of deploy credits; the old Netlify site is retired.)
- `version-pool-hero` branch = the earlier design with the Hotel Signum pool photo as the hero. Keep it; it is the fallback if Catherine prefers that hero.

## Hard rules
- Never mention Claude, AI, Anthropic or claude.ai anywhere in the published site (copy, code, comments, alt text, meta tags). The client must not see that the site was built with AI. Repo commits authored as Claude are fine (Brooke, Nov 15): the repo is private.
- Keep `<meta name="robots" content="noindex, nofollow">` until Brooke says the site is final.
- Repo is private: it contains the couple's photos and phone number. Never make it public.
- Passwords and API keys never go in the repo or the chat.

## RSVP
- RSVPs are collected by the site's own form (`#rsvp-form`), not Joy (Catherine asked to leave Joy, Nov 15).
- The form POSTs to a Google Apps Script web app (`RSVP_ENDPOINT_URL` in `site/index.html`). Source of that script: `rsvp/apps-script.gs`. Each reply appends a row to a Google Sheet shared with Catherine and emails her.
- Questions mirror her Joy form: wedding (Jul 7), welcome reception (Jul 5), boat day on Lipari (Jul 6), farewell luncheon (Jul 8), optional note. One reply per guest, adults only. If "No" to the wedding, the other events are skipped and recorded as No.
- RSVP deadline: January 7, 2027 (Catherine, Nov 20).
- Plus ones: optional on the form; the plus one gets their own row (same answers, Note = "Plus one of <name>").
- Every RSVP is also copied to Brooke's private backup sheet (script property BACKUP_SHEET_ID); emails go to Catherine + Brooke (NOTIFY).
- To update the script: paste `rsvp/apps-script.gs`, Save, then Deploy > Manage deployments > pencil > New version (never "New deployment": it changes the URL). Never click Run.

## Guest dashboard (catherine-greg.com/guests)
- Password-protected page served by a Cloudflare Pages Function (`functions/guests.js`). Template: `rsvp/dashboard.html`; after editing it, regenerate `lib/dashboard-template.js` (JSON-escaped copy of the HTML exporting TEMPLATE).
- The function fetches rows from the Apps Script `doGet` with `?key=DATA_KEY`. Secrets live only in Cloudflare (DASHBOARD_PASSWORD, DATA_KEY, Production + Preview) and Apps Script properties (DATA_KEY, BACKUP_SHEET_ID). Never put them in the repo or the chat.
- Login cookie lasts 30 days; changing DASHBOARD_PASSWORD logs everyone out. Dashboard counts only each person's latest reply (by name).

## Design (locked, "Lagoon & Limestone")
- Neutral grounds; color comes from photos. Limestone #F3EFE7 page, paper #FBFAF6, ink #121212, caper #5E6440 for small labels, sand #E8E0D2 sparingly.
- Footer is a solid ink (#121212) band: ivory C&G monogram, thin rule, date line (blue-grey wash dropped Nov 15). Couple section and RSVP sit on the lace texture; the RSVP form sits on a solid paper card over the lace.
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
- Hero: Catherine chose the photos-of-us-two hero (main), Nov 20. Keep `version-pool-hero` as a backup.
- Welcome section holds Greg's "Why Salina" note verbatim (Nov 20).
- Couple's own photos: coming via a shared Google Drive folder.
- Custom domain: catherine-greg.com (Catherine's pick, Nov 20), registered in Brooke's Cloudflare account; transfer to the couple on request. Bill them the renewal ($11.17/yr). Connected Nov 20 as a Pages custom domain (apex + www); site URLs (og tags, .ics, Google Calendar link) use https://catherine-greg.com.
