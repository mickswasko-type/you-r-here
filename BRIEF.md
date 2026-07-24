# Build Brief: You /r/ Here — A Mallworld Directory

**Tagline (locked):** Compiling the geography of Mallworld — on Reddit and beyond.

**For: Claude Code**
**Owner: Mick Swasko**
**Status: MVP spec, v2**

The title and tagline are settled. Do not propose alternates. "Directory" is doing deliberate triple duty — the mall kiosk, a web index, and a listing of the people who made these. The `/r/` is the Reddit nod. The tagline should appear on the homepage and in the `<title>` / meta description.

---

## What this is

A static, hand-curated directory of community-created Mallworld maps, sketches, and diagrams.

Mallworld is a shared-dream phenomenon. Thousands of people independently report dreaming of the same impossible mall — endless stairwells, a food court hub, upper floors that get more abandoned the higher you go, adjacent "University World" and "Library World" and airports. It surfaced on the Godlike Productions forum around 2016, moved to 4chan's /x/ board in 2019, then to Reddit (r/TheMallWorld, r/mallworld) and TikTok. The New York Times, Forbes, and Fast Company all covered it in late 2025.

This site indexes what the community has drawn. It does not explain, interpret, or claim the phenomenon.

The measure of success: someone finds this in 2035 and thinks *somebody cared enough to preserve this without trying to own it.*

---

## Non-negotiables

1. **Content survives the site.** All entries live as flat Markdown + JSON in the repo. If the generator is abandoned in three years, the archive is still readable and portable. The site is the disposable layer.
2. **Every entry links to its original source.** Local image copies exist for preservation. The link is the point.
3. **The curator never assigns judgments he can't source.** No medium labels, no authenticity ratings, no quality tiers, unless the creator said it themselves.
4. **Removal requests are honored, fast, no questions.**
5. **No scraping at volume.** Every entry is added by hand. This is an ethical position and a Reddit-ToS position.

---

## Stack

- **Eleventy (11ty)** — markdown-native, minimal config, outputs plain static HTML. Lighter than Astro for a site this size and produces cleaner artifacts for long-term preservation.
- **GitHub Pages** via GitHub Actions on push to `main`.
- **No JS framework.** Vanilla JS only where needed (filtering, search).
- **No backend, database, accounts, comments, or voting.**
- Total dependency count should stay small enough to `npm audit` without dread.

Owner already runs GitHub Pages for another archive project, so mirror that deployment pattern where it makes sense.

---

## Repo structure

```
/src
  /content
    /entries        # one .md per entry, frontmatter + curator note
    /locations      # one .md per recurring location
    /pages          # about, removal, before-reddit
  /images
    /entries        # local preservation copies, original filename preserved
    /thumbs         # generated at build
  /_includes        # layouts
  /css
/scripts
  new-entry.js      # CLI scaffold for a new entry
  check-links.js    # reports dead original-source links
```

---

## Content schema

Each entry is a Markdown file with YAML frontmatter:

```yaml
title: "Third Floor and the Locked Wing"
creator: "u/ExampleUser"
creator_platform: "reddit"
source_url: "https://reddit.com/r/TheMallWorld/comments/..."
source_community: "r/TheMallWorld"
posted_date: "2024-08-14"        # or null
archived_date: "2026-07-23"       # date you saved it
wayback_url: "https://web.archive.org/..."   # or null
source_status: "live"             # live | deleted | unknown
image: "third-floor-locked-wing.jpg"
image_credit_note: null
medium_as_stated: "Not stated"    # verbatim from creator, or "Not stated"
locations: ["food-court", "upper-floors", "locked-wing"]
tags: ["hand-drawn", "floorplan", "annotated"]
permission: "opt-out"             # opt-out | creator-approved | creator-submitted
featured_ok: false                # true only when permission is not opt-out
---
Curator note in plain prose. What's notable about this map.
Descriptive only. No interpretation of what Mallworld "means."
```

### On `medium_as_stated`

The original brief had an "Authenticity" field with values like *Hand Drawn* and *Sketch + AI Assisted*. Kill that. Guessing whether someone used AI is an accusation dressed as metadata, and it is the one field that cannot be sourced. This field takes the creator's own words or `"Not stated"`. Nothing else.

### On `permission`

- `opt-out` — archived in good faith, creator not contacted. Default.
- `creator-approved` — creator was asked and said yes.
- `creator-submitted` — creator sent it in.

Only `creator-approved` and `creator-submitted` entries are eligible for homepage placement. This is the small structural rule that keeps "credit-first" from being a slogan.

---

## Location pages — the actual reason this site exists

A grid of maps is a gallery. What makes this a *directory* is cross-reference.

Build a `/locations/` index. Each recurring location gets a page: the food court, the upper floors, the lower/secret floor, the endless stairwell, the toy store, the airport, University World, Library World, the water park.

Each location page shows:

- A short, plain description drawn from how the community describes it, with links to representative posts.
- **Every archived map that depicts it.**
- A count. "Nine archived maps show a lower floor."

This is descriptive scholarship. It adds something the subreddit itself cannot produce, and it does it without a single interpretive claim. Build the schema so a map can belong to many locations.

Location slugs live in `/content/locations/`. An entry referencing a slug that doesn't exist should fail the build loudly.

---

## The "Before Reddit" page

Non-optional. A directory that only covers Reddit accidentally implies the phenomenon started there. It didn't.

One page, plainly written, covering the documented pre-Reddit trail: the Godlike Productions thread (~2016), the 4chan /x/ post (2019), and the move to Reddit and TikTok in the early 2020s. Link to archived copies where they exist. Note clearly what is documented and what is secondhand.

Nobody has built this page. It will be the most-linked thing on the site.

---

## Pages, MVP

| Page | Purpose |
|---|---|
| Home | What this is, in four sentences. Recently added. A random entry. Link to locations index. |
| Gallery | Grid of all entries. Filter by location, community, tag, permission status. |
| Entry | Image, creator, source link, locations, curator note, attribution block. |
| Locations index | List of recurring locations with map counts. |
| Location | Description plus every map depicting it. |
| Before Reddit | Origin trail. |
| About | See below. |
| Removal & Corrections | Email address, plain promise, no form. |

**No "Featured" section.** Featuring is ranking, and ranking is the authority claim this project is trying to avoid. Use "Recently added" and "Random entry."

---

## The About page

Written in the owner's voice, short declarative sentences, no manifesto register. It must include:

1. What the site is. An index of community-created maps.
2. **Curator disclosure.** The owner has been dreaming this world for roughly twenty years and has drawn his own maps. That belongs on the page in a sentence or two. A stranger archiving a phenomenon reads as detached. A participant archiving it reads as earned. It also explains why the site is careful.
3. Creators own their work. Every entry links to its source.
4. How to get something corrected or removed.
5. **What happens if this stops.** The repo is public. Content is portable Markdown. Anyone can fork and continue it. State this plainly — it is the "someone cared" principle made into an actual guarantee instead of a mood.

The About page should not say "preservation over ownership" or "curation over authority." Just do those things and let the reader notice.

---

## Visual direction

Institutional. Boring on purpose.

- **Reference points:** printed mall directories, library catalog cards, municipal signage, early-internet plain HTML.
- **Avoid entirely:** neon, VHS grain, backrooms/liminal-horror styling, creepypasta typography, dark mode as default aesthetic. The maps themselves carry the eeriness. The frame should be a plexiglass kiosk.
- **Type:** one workhorse sans (system stack is fine), one mono for metadata fields. No display face.
- **Palette:** off-white background, warm light gray panels, near-black text, one directory blue for links and one muted amber accent used sparingly.
- Entry metadata should render like a catalog record — labeled fields, mono, aligned.
- Fully responsive. Images lazy-loaded. Should load fast on a bad connection.

---

## Scripts

**`new-entry.js`** — prompts for source URL, title, creator, then scaffolds the markdown file with `archived_date` filled in and image path stubbed. Does not fetch anything. The owner downloads the image by hand.

**`check-links.js`** — runs on demand, HEADs every `source_url`, reports non-200s so `source_status` can be updated. Never auto-edits content.

Both scripts stay dumb on purpose. Any future ingestion assistance produces a draft for human review and never publishes.

---

## Build order

1. Repo, 11ty scaffold, GitHub Pages Action, deploy a blank site. Confirm the pipeline before any content.
2. Content schema, entry layout, three sample entries with placeholder images.
3. Gallery with filtering.
4. Locations index and location pages, including build-time validation of location slugs.
5. About, Removal, Before Reddit.
6. Home.
7. `new-entry.js` and `check-links.js`.
8. CSS pass — do this last, and do it in one sitting.

---

## Communities to cover

Both r/TheMallWorld and r/mallworld exist and are active, plus Discord and TikTok activity. The `source_community` field should never be hardcoded to one. Build the gallery filter so new communities can be added by dropping a new value in, with no code change.

---

## Out of scope

Wiki. ARG. Lore. Interpretation. Dream analysis. Paranormal investigation. Social features. Merch. Anything that requires the site to have a theory.
