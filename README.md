# Your personal site

A no-build-tools personal site. Design lives in `style.css`, content lives in Markdown.

## Publish a new blog post (2 steps)

1. Write your post as plain Markdown and save it as `posts/my-new-post.md`
   (lowercase letters, numbers, and hyphens only in the filename).
2. Add one entry to `posts.json`:

```json
{
  "slug": "my-new-post",
  "title": "My new post",
  "date": "2026-08-08",
  "tag": "research notes"
}
```

That's it. The homepage list sorts itself by date, and the post page renders
the Markdown with your site's typography automatically. Headings, code blocks,
blockquotes, lists, and images all work.

Tip: start the post with one italic line (`*Like this.*`) — it renders as a
styled standfirst under the title.

## Edit everything else

- Your name, bio, and links: `index.html` (hero section)
- Your papers: `index.html` (research section)
- Colors and fonts: top of `style.css` (the `:root` variables)

## The Off-hours section

- **Your portrait** — hidden by design. Clicking your name in the header
  (note the footnote dagger †) reveals it as "Fig. 0 — The author"; clicking
  again, pressing Escape, or clicking elsewhere dismisses it. Overwrite
  `images/portrait.jpg` with your photo (keep the filename; a 4:5-ish crop
  looks best) and edit the Fig. 0 caption in `index.html` to taste.

Everything personal lives between the `OFF-HOURS` comments in `index.html`:

- **Pets** — overwrite `images/pet-dog.jpg` and `images/pet-cat.jpg` with real
  photos (keep the filenames and nothing else changes), then edit the two
  figcaptions with their names.
- **Now list** — three one-liners for reading / learning / exploring. Update it
  whenever; it doubles as a sign the site is alive.
- **Field notes strip** — overwrite `images/trip-1.jpg` … `trip-4.jpg` and the
  place/date captions. Add more photos by copying a `<figure>` line; the strip
  scrolls horizontally.

Square-ish crops look best in the strip; any landscape photo works for pets.
The current images are placeholders that show you exactly which file to replace.

## Visitor analytics ("step N · still descending")

The site uses [GoatCounter](https://www.goatcounter.com) — free, open source,
no cookies, and it only records visitors at country level, so there's no
consent banner needed and nothing creepy stored.

Setup (5 minutes):

1. Sign up at goatcounter.com and pick a code, e.g. `adalin`
   (your dashboard becomes `adalin.goatcounter.com`).
2. In `index.html` and `post.html`, replace both occurrences of `YOURCODE`
   with your code (one in the counter script, one in the tracking snippet
   near the bottom).
3. In GoatCounter: Settings → check **"Allow adding visitor counts on your
   website"** — this is what lets the homepage fetch the total.

After that, the caption under the loss curve reads `step 12,481 · still
descending`, where the number is your all-time visit total: every visitor is
one more gradient update. If analytics ever fail to load, it silently falls
back to plain "still descending" — the design never breaks.

Where to see locations: your GoatCounter dashboard shows visits by country
and by page. You can keep it private, or flip Settings → "Make statistics
public" to share the dashboard as a living logbook.

## Changelog

A one-line-per-entry log of your own state changes, versioned like software
(CalVer: `v2026.07` = July 2026). The discipline: record the *change*, not
the details — "Started climbing again", not where or with whom. Newest entry
on top; add a `log-row` block in `index.html` whenever something shifts.

## Preview locally

Browsers block `fetch` on files opened directly, so run a tiny server:

```
python3 -m http.server
```

Then open http://localhost:8000

## Deploy free on GitHub Pages

1. Create a repo named `yourusername.github.io`
2. Upload all these files to it
3. Settings → Pages → deploy from the `main` branch

Your site is live at `https://yourusername.github.io` a minute later.
Publishing a post afterwards = commit a `.md` file + the `posts.json` line.
You can even do it from your phone in the GitHub web editor.
