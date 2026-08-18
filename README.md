# Tall, Black & Propagated — release page

A one-page music release site: blurred cover backdrop, frosted cover card with
an inline player, then a centred column of streaming buttons, notes, and a
link back to the hub at <https://tbp-links.vercel.app>.

The layout follows the HearNow promo-page structure. The visual language is
TBP's, shared with the links site — same palette, same frosted-glass cards,
same type system — so the two pages read as one property.

Static HTML/CSS/JS — no build step, no dependencies, no third-party requests.

## Running it

Any static server works:

```bash
npx serve HearNowClone
```

Then open <http://localhost:3000>. Opening `index.html` directly from disk
mostly works, but audio and the share button behave better over `http://`.

## Editing it

Everything on the page comes from **`js/site.config.js`** — title, artist,
notes, release date, tracks, service links, the notes link, the hub button, and
every UI string. That's the only file you need for a normal release.

To swap in a new release:

1. Drop the square cover art in `assets/` and point `coverImage` at it.
2. Drop the audio clip in `assets/` and set the track's `src`.
3. Fill in the `url` for each service you're actually on. Any service left
   with an empty `url` is hidden rather than rendered as a dead button.

### Colours

The palette lives in the `:root` block of `css/styles.css`:

| Token | Hex | Usage |
|---|---|---|
| `--woodsmoke` | `#0F1110` | Background |
| `--charcoal` | `#2A2D2B` | Secondary background |
| `--everglade` | `#1F3A2E` | Headers / hover states |
| `--axolotl` | `#4E6B4A` | Accents / buttons |
| `--walnut-brown` | `#6B4F3A` | Warm contrast |
| `--shadow` | `#8A6A4F` | Warm contrast |
| `--locust` | `#A3B18A` | Subtle highlights |
| `--cararra` | `#EDECE8` | Text |

Semantic tokens (`--card-bg`, `--card-hover-bg`, `--card-border`, …) are
derived from these and match the links site verbatim, so a change to the
palette propagates everywhere.

### Tracks

`duration` is optional — leave it out and it's read from the audio file's
metadata on load.

With one track the list shows just the player and duration (the album title is
already the track title). With two or more it becomes a numbered list with
track names.

### The notes link

`notesLink` renders a quiet anchor under the notes card, for whatever the
release came out of — an essay, a video, a longer write-up. It currently points
at the Substack piece CARE was written from.

The notes card itself is set with `textContent`, so a URL pasted into `notes`
would render as dead, unclickable text. This is the supported way to make it a
link. Set `notesLink.url` to `''` or delete the block to hide it.

### The hub button

The `hub` block in the config is what ties this page back to tbp-links, and it
is now the only route there — the social icon row that used to sit above it was
removed so the two sites do not duplicate each other. The links page owns the
socials; this page owns the release. Set `hub.url` to `''` to hide the button
entirely and let the page stand alone.

## What's mocked out

The config ships with example service URLs so the page renders complete —
Spotify/Apple/Amazon/etc. point at **search pages**. Replace them with the real
release links once it's live. The Ko-fi and hub links are real.

`artistUrl` currently points at the hub, on the assumption Haywood D and TBP
are the same person. Change it if that's wrong.

## Analytics

GA4 (`G-1SMYFR876Y`) — the **same property as tbp-links**, deliberately. The two
sites are one funnel, and splitting them into separate properties would make
the links -> release hop unrecoverable.

`js/analytics.js` and `js/share.js` are both shared verbatim with the links
repo, so neither event names nor the share fallback chain can drift. Edit one,
copy to the other.

The share button is bound in `renderShareRail()` and takes its labels from
`site.config.js`, so the wording stays config-driven while the behaviour stays
shared. The text node carries `data-share-label` so the module can retitle it
without clobbering the icon beside it.

| Event            | Fires on                        | Parameters                            |
|------------------|---------------------------------|---------------------------------------|
| `service_click`  | a streaming service button      | link_id, link_section, link_url        |
| `buy_click`      | buy from artist                 | link_id, link_section, link_url        |
| `link_click`     | follow chip, essay link, hub    | link_id, link_section, link_url        |
| `audio_play`     | first play of a track           | track_title                            |
| `audio_progress` | 25 / 50 / 75% of a track        | audio_percent, track_title             |
| `audio_complete` | played to the end               | track_title                            |
| `share_click`    | share button                    | share_method (native/clipboard/manual) |

Anchors opt in with `data-track`, `data-track-id` and `data-track-section`;
the handler is delegated off the document, so buttons rendered by `app.js`
after load need no extra wiring.

`audio_*` has to be custom: GA4 enhanced measurement covers embedded YouTube
only, so an `<audio>` element is otherwise invisible.

**Two things that must be done in the GA4 console**, not here:

1. **Cross-domain measurement.** `release-page-nu.vercel.app` and
   `tbp-links.vercel.app` are different hosts. Without both listed under Admin
   -> Data streams -> Configure tag settings -> Configure your domains, moving
   between them ends the session and logs a self-referral.
2. **Register the custom parameters** under Admin -> Custom definitions, or
   they collect but never chart. Mark `service_click` and `buy_click` as key
   events while you are in there.

## Structure

```
index.html            markup shell (static, no content)
css/fonts.css         self-hosted @font-face rules
css/styles.css        palette tokens + all styling
js/site.config.js     <- the file you edit
js/brand-icons.js     GENERATED brand marks + official colours
js/icons.js           hand-drawn generic UI icons; merges in brand marks
js/analytics.js       SHARED with tbp-links — keep the two copies identical
js/share.js           SHARED with tbp-links — keep the two copies identical
js/app.js             renders the page from config, drives the audio player
assets/fonts/         woff2 subsets + OFL license texts
assets/               cover art, audio, monstera mark, banner
```

## Asset provenance

Deliberate choices, so nobody has to re-derive them later.

**Fonts** — Inter and Dancing Script, matching the links site, self-hosted
rather than pulled from the Google Fonts CDN. Both are SIL Open Font License
1.1; the license texts in `assets/fonts/` must ship with the font files. Only
`latin` and `latin-ext` subsets are included, and both are variable fonts, so
one file per subset covers every weight. Regenerate by re-fetching the `css2`
URL for both families with a modern-browser User-Agent and downloading the
woff2 files it points at.

**Brand marks** — from [Simple Icons](https://simpleicons.org) (CC0 1.0),
generated into `js/brand-icons.js`. The icons are public domain; the underlying
trademarks are not, and are used here only to identify and link to those
services. Each ships in its official brand colour, unmodified — no recolouring,
which both Spotify's and Apple's brand guidelines prohibit. Near-black marks
(TikTok, Threads, X, Tidal) swap to the reversed-out white variant, which those
brands permit on a dark ground — and this page is always dark.

**Amazon Music uses a stand-in glyph, not Amazon's logo.** Amazon has been
removed from Simple Icons entirely — on a pinned version, `icons/amazon.svg`
returns 404 and the brand data contains zero Amazon entries. Amazon's
trademark policy requires written permission for logo use, unlike Spotify and
Apple, which explicitly allow it for linking.

> **Careful:** `simple-icons@latest/icons/amazon.svg` and `amazonmusic.svg`
> currently still return a file through the jsDelivr CDN. That's a stale
> cached artifact from a pre-removal version — it is exactly the asset that
> was pulled. Don't "fix" this by re-adding it.

The button instead uses the generic `stream` glyph in Locust, so it doesn't
pretend to be a brand mark. The text label does the identifying, which is
ordinary nominative use. Any service can do this via `icon:` in its config
entry; with neither a brand mark nor an `icon:`, the button degrades to a
centred label. If you get permission — Amazon Music for Artists issues
official badges — drop the mark into `brand-icons.js` and it takes precedence
automatically.

**Generic UI icons** (play, pause, share, cart, house, envelope) were drawn for
this project.

**`monstera-leaf.png` and `tbp-banner.jpg`** were copied from the links-site
project. `tbp-banner.jpg` is unused by default — set `backgroundImage` to it if
you'd rather have the hub banner behind the cover than the blurred art.

## Notes on the clone

Layout metrics follow the reference: 400px cover card, 50x40 play control,
360px main column, 167px service buttons, 850px footer width.

No HearNow copy, artwork, icon set, or typography survives in the build — the
structure is the only thing carried over, and layout is not protectable
expression. Keep "HearNow" out of the deployed name, `<title>` and domain too;
that's a trademark question independent of the layout.
