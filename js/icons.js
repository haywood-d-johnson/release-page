/* Generic UI icons — drawn for this project, no third-party artwork.
   Brand marks live in brand-icons.js (Simple Icons, CC0) and are merged in
   below so callers only ever need one lookup.

   Everything here paints with `fill: currentColor`. Brand marks instead carry
   their official colour, applied by app.js from BRAND_COLORS. */
(function () {
  'use strict';

  var GENERIC = {

    /* Disc with the glyph knocked out via evenodd. */
    play: '<svg viewBox="0 0 64 64" class="icon-play" aria-hidden="true"><path fill-rule="evenodd" d="M32 2a30 30 0 1 0 0 60 30 30 0 1 0 0-60M25 17l22 15-22 15z"/></svg>',

    pause: '<svg viewBox="0 0 64 64" class="icon-pause" aria-hidden="true"><path fill-rule="evenodd" d="M32 2a30 30 0 1 0 0 60 30 30 0 1 0 0-60M22 17h8v30h-8zm12 0h8v30h-8z"/></svg>',

    /* Three nodes joined by two links. */
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08a2.9 2.9 0 0 0-1.96.77L8.91 12.7a3 3 0 0 0 0-1.4l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .24.04.47.09.7L8.04 9.81a3 3 0 1 0 0 4.38l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92"/></svg>',

    /* Shopping cart, for the "buy from artist" button. */
    physical: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 2h3.2l1 4H22l-2.6 9.2H7.4L6 10 4.6 4.6H2zm6.2 6 1 5h8.6l1.4-5zM9 18.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5m8 0a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5"/></svg>',

    /* House, for a generic artist website link. */
    homepage: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6 1.5 12.1h3v9.3h6v-6.2h3v6.2h6v-9.3h3z"/></svg>',

    /* Beamed note — a neutral stand-in for services whose logo we can't
       ship. The button's text label does the identifying; this is just an
       affordance so it doesn't read as a broken row. */
    stream: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3.5 8.5 5.8v10.4a3.2 3.2 0 1 0 1.8 2.9V9.1l8-1.6v6.4a3.2 3.2 0 1 0 1.7 2.9z"/></svg>',

    /* Envelope, for a mailto link. */
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h20v16H2zm2.4 2L12 12.2 19.6 6zM4 8.3V18h16V8.3l-8 6.5z"/></svg>'
  };

  var ICONS = {};
  var key;

  for (key in GENERIC) {
    if (Object.prototype.hasOwnProperty.call(GENERIC, key)) ICONS[key] = GENERIC[key];
  }

  var brand = window.BRAND_ICONS || {};
  for (key in brand) {
    if (Object.prototype.hasOwnProperty.call(brand, key)) ICONS[key] = brand[key];
  }

  window.ICONS = ICONS;
})();
