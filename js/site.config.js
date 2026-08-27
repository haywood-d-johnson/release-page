/* ==========================================================================
   EDIT THIS FILE — everything on the page comes from here.
   Nothing else needs touching for a normal release.

   Colours live in the :root block of css/styles.css (the TBP palette).
   ========================================================================== */
window.SITE = {

  /* ---------------------------------------------------------------- release */

  albumTitle: 'CARE',
  artistName: 'Haywood D (feat. Simon Barjona)',

  /* The artist name links here. Points at the hub by default. */
  artistUrl: 'https://tbp-links.vercel.app/',

  /* Square cover art. 1000x1000 or larger looks best. */
  coverImage: 'assets/cover.jpg',

  /* Optional separate backdrop behind the cover card. null blurs the cover
     art itself. 'assets/tbp-banner.jpg' uses the banner from the hub page. */
  backgroundImage: null,

  /* Short note under the buttons. Line breaks are preserved. */
  notes: "Written after an essay I published about keeping plants alive through a season I couldn't manage. Control only ever shapes the conditions. It never promises the outcome. What's left is care — showing up, over and over, for something you might still lose.",

  /* Optional link under the notes — the essay, video, or write-up the release
     came out of. Set url to '' (or delete the block) to hide it. */
  notesLink: {
    label: 'Read the essay',
    url: 'https://tallblackpropagated.substack.com/p/control-care-and-loss'
  },

  /* Used for the page description and social share cards.
     Falls back to `notes` if omitted. */
  shareDescription: 'CARE by Haywood D — out now. Listen wherever you stream.',

  /* ISO date. A future date renders the `upcoming` label, a past date the
     `released` one. Set to null to hide entirely. */
  releaseDate: null,

  /* Availability is per service — a store goes live as soon as its `url` is
     filled in below, and anything still blank groups under "Coming soon".
     This flag is the blunt override for the window before ANYTHING has
     landed: truthy forces every button into that group regardless of links.
     `true` uses labels.comingSoon; a string is used verbatim, e.g. 'Out this
     fall'. "Buy from Artist" is left alone, since Ko-fi works regardless. */
  comingSoon: false,

  /* ----------------------------------------------------------------- tracks */

  /* `duration` is optional — if omitted it is read from the audio file.
     `clip: true` appends "(clip)" next to the title. */
  tracks: [
    {
      title: 'CARE (feat. Simon Barjona)',
      src: 'assets/clip.mp3',
      duration: '3:26',
      clip: true
    }
  ],

  /* --------------------------------------------------------------- services */

  /* Buttons render in this order. A service with a `url` goes live; one with
     an empty `url` drops into the "coming soon" group below the live ones,
     so you can paste links in as the stores come back without touching
     anything else. Delete an entry outright to remove it from the page.

     Valid `id` values with a shippable brand mark: spotify, applemusic,
     itunes, pandora, deezer, bandcamp, soundcloud, tidal, youtubemusic,
     iheartradio.

     Any other id still works. Add `icon:` to fall back on a generic glyph
     ('stream', 'physical', 'homepage'); without one it renders as a centred
     text label. Amazon uses a stand-in — see README for why. */
  services: [
    { id: 'spotify',      label: 'Spotify',       url: 'https://open.spotify.com/track/2ao70YCWAtafV2vEaMGa0T' },
    { id: 'amazonmusic',  label: 'Amazon Music',  url: 'https://music.amazon.com/albums/B0HGHR21NV', icon: 'stream' },
    { id: 'youtubemusic', label: 'YouTube Music', url: 'https://music.youtube.com/watch?v=O6lv90HtHE0' },
    { id: 'tidal',        label: 'Tidal',         url: 'https://tidal.com/album/555526716' },
    { id: 'iheartradio',  label: 'iHeartRadio',   url: 'https://www.iheart.com/artist/haywood-d-52074869/songs/care-427548203' },

    /* Delivered, link not back yet — these render dimmed under "Coming soon".
       Paste the URL in and the button goes live on the next load. */
    { id: 'applemusic',   label: 'Apple Music',   url: '' },
    { id: 'pandora',      label: 'Pandora',       url: '' }
  ],

  /* Full-width button below the divider. Set url to '' to hide. */
  physical: { label: 'Buy from Artist', url: 'https://ko-fi.com/C8E221GLIB' },

  /* --------------------------------------------------------- follow / share */

  /* Spotify ARTIST URL for the "Follow" chip — not the release, so the
     chip carries over unchanged to the next one. '' hides the chip. */
  spotifyFollowUrl: 'https://open.spotify.com/artist/0wtq54p1D3BYXkoMO9BTC6',

  /* Show the share chip beside the cover. */
  showShareButton: true,

  /* ------------------------------------------------------------ link to hub */

  /* The "all my links" button at the bottom — this is what ties the release
     page back to tbp-links. Set url to '' to hide the whole button. */
  /* `mark` overrides the <img src> in index.html — set it here, not there.
     Omit it entirely to drop the image and show the label alone. */
  hub: {
    url: 'https://tbp-links.vercel.app/',
    label: 'Tall, Black, & Propagated',
    mark: 'assets/CARE250.png'
  },

  /* ----------------------------------------------------------------- footer */

  footerNote: '© 2026 BlackBox Soft · Tall, Black, and Propagated',

  /* ----------------------------------------------------------------- labels */

  /* Every piece of UI text on the page. Override any of them; anything you
     leave out keeps the default. {date} and {year} are substituted. */
  labels: {
    getTheMusic: 'Get the music',
    comingSoon: 'Coming soon',
    upcoming: 'Out {date}',
    released: 'Released {year}',
    share: 'share',
    shareCopied: 'link copied',
    shareCopyManually: 'copy the URL',
    follow: 'Follow'
  }
};
