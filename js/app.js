/* ==========================================================================
   Renders the page from window.SITE and drives the single shared <audio>.
   ========================================================================== */
(function () {
  'use strict';

  var SITE = window.SITE || {};
  var ICONS = window.ICONS || {};
  var BRAND = window.BRAND_COLORS || {};

  var $ = function (sel) { return document.querySelector(sel); };

  /* All user-facing strings live here so nothing is hard-coded in markup.
     Overridable via SITE.labels. */
  var LABELS = {
    getTheMusic: 'Get the music:',
    upcoming: 'Out {date}',
    released: 'Released {year}',
    share: 'share',
    shareCopied: 'link copied',
    shareCopyManually: 'copy the URL',
    follow: 'Follow'
  };

  (function mergeLabels() {
    var overrides = SITE.labels || {};
    for (var key in overrides) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) LABELS[key] = overrides[key];
    }
  })();

  var audio = $('[data-audio]');
  var tracksList = $('[data-tracks-list]');
  var coverOverlay = $('[data-cover-overlay]');

  /* Index of the track currently loaded into <audio>; -1 when nothing is. */
  var currentIndex = -1;

  /* Per-track DOM handles, filled during render. */
  var rows = [];

  /* ------------------------------------------------------------------ utils */

  function icon(name) {
    return ICONS[name] || '';
  }

  /* Applies a brand's official colour to an element, and flags the near-black
     marks so the dark theme can reverse them out. Brands we have no
     shippable mark for simply fall through with no icon at all. */
  function applyBrand(el, id) {
    var brand = BRAND[id];
    if (!brand) return;
    el.style.setProperty('--brand', brand.hex);
    if (brand.mono) el.setAttribute('data-mono', '');
  }

  function fillTemplate(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
    });
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  /* Reads duration from the file when the config doesn't supply one. */
  function probeDuration(src, onLoad) {
    var probe = new Audio();
    probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', function () {
      onLoad(formatTime(probe.duration));
    });
    probe.src = src;
  }

  /* ---------------------------------------------------------------- banner */

  function renderBanner() {
    var backdrop = SITE.backgroundImage || SITE.coverImage;
    if (backdrop) {
      $('[data-backdrop]').style.backgroundImage = 'url("' + backdrop + '")';
    }

    var coverImage = $('[data-cover-image]');
    coverImage.src = SITE.coverImage || '';
    coverImage.alt = 'Cover art for ' + (SITE.albumTitle || '');

    /* Play glyph only. The cover is a hover affordance, not a transport —
       the track row below carries the real play/pause toggle. */
    coverOverlay.innerHTML = icon('play');
  }

  /* ---------------------------------------------------------------- tracks */

  function renderTracks() {
    var tracks = SITE.tracks || [];
    var isSingle = tracks.length === 1;

    tracksList.parentNode.classList.add(isSingle ? 'tracks--single' : 'tracks--multi');

    tracks.forEach(function (track, index) {
      var li = document.createElement('li');
      li.className = 'track';

      li.innerHTML =
        '<div class="track__number">' + (index + 1) + '</div>' +
        '<button class="track__play" type="button" aria-label="Play ' + track.title + '">' +
          icon('play') + icon('pause') +
        '</button>' +
        '<div class="track__progress"><div class="track__progress-bg"></div>' +
          '<div class="track__progress-fill"></div></div>' +
        '<div class="track__meta">' +
          '<div class="track__name">' + track.title +
            (track.clip ? ' <span class="track__clip">(clip)</span>' : '') +
          '</div>' +
          '<div class="track__duration">' + (track.duration || '') + '</div>' +
        '</div>';

      tracksList.appendChild(li);

      var handle = {
        playButton: li.querySelector('.track__play'),
        progress: li.querySelector('.track__progress'),
        fill: li.querySelector('.track__progress-fill'),
        duration: li.querySelector('.track__duration')
      };
      rows.push(handle);

      if (!track.duration && track.src) {
        probeDuration(track.src, function (value) { handle.duration.textContent = value; });
      }

      handle.playButton.addEventListener('click', function () { toggle(index); });
      handle.progress.addEventListener('click', function (event) { seek(index, event); });
    });
  }

  /* ---------------------------------------------------------------- player */

  function toggle(index) {
    var track = (SITE.tracks || [])[index];
    if (!track || !track.src) return;

    if (currentIndex === index) {
      if (audio.paused) { audio.play(); } else { audio.pause(); }
      return;
    }

    currentIndex = index;
    audio.src = track.src;
    audio.play();
    syncPlayState();
  }

  function seek(index, event) {
    if (currentIndex !== index || !isFinite(audio.duration)) return;
    var box = rows[index].progress.getBoundingClientRect();
    var ratio = (event.clientX - box.left) / box.width;
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
  }

  function syncPlayState() {
    var playing = currentIndex >= 0 && !audio.paused;

    rows.forEach(function (row, index) {
      row.playButton.classList.toggle('is-playing', playing && index === currentIndex);
    });

    /* The glyph stays a play triangle, so the label is what tells assistive
       tech which action the click actually performs. */
    coverOverlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function syncProgress() {
    if (currentIndex < 0 || !isFinite(audio.duration) || audio.duration === 0) return;
    var percent = (audio.currentTime / audio.duration) * 100;
    rows[currentIndex].fill.style.width = percent + '%';
  }

  function bindPlayer() {
    /* Report whatever track is loaded right now, not a snapshot from bind
       time — the player walks down the tracklist as songs end. */
    if (window.TBP_ANALYTICS) {
      window.TBP_ANALYTICS.bindAudio(audio, function () {
        var list = SITE.tracks || [];
        var current = currentIndex >= 0 ? list[currentIndex] : null;
        return current ? current.title : (SITE.albumTitle || '');
      });
    }

    audio.addEventListener('play', syncPlayState);
    audio.addEventListener('pause', syncPlayState);
    audio.addEventListener('timeupdate', syncProgress);

    audio.addEventListener('ended', function () {
      rows[currentIndex].fill.style.width = '0%';
      var next = currentIndex + 1;
      if (next < (SITE.tracks || []).length) {
        toggle(next);
      } else {
        currentIndex = -1;
        syncPlayState();
      }
    });

    /* Clicking the cover controls whatever is loaded, or starts track 1. */
    coverOverlay.addEventListener('click', function () {
      toggle(currentIndex >= 0 ? currentIndex : 0);
    });
  }

  /* ------------------------------------------------------------------- main */

  function renderTitles() {
    var title = SITE.albumTitle || '';
    var artist = SITE.artistName || '';
    var pageTitle = artist ? artist + ' - ' + title : title;
    var blurb = SITE.shareDescription || SITE.notes || '';

    document.title = pageTitle;
    $('[data-semantic-title]').textContent = title + (artist ? ' by ' + artist : '');
    $('[data-album-title]').textContent = title;

    /* Keep the share-card metadata in step with the config so a link posted
       to socials carries the release, not an empty preview. */
    $('[data-meta-description]').setAttribute('content', blurb);
    $('[data-meta-og-title]').setAttribute('content', pageTitle);
    $('[data-meta-og-description]').setAttribute('content', blurb);
    if (SITE.coverImage) $('[data-meta-og-image]').setAttribute('content', SITE.coverImage);

    var link = $('[data-artist-link]');
    link.textContent = artist;
    if (SITE.artistUrl) {
      link.href = SITE.artistUrl;
      link.target = '_blank';
      link.rel = 'noopener';
    } else {
      /* No destination — swap the anchor for plain text so it isn't a dead link. */
      var text = document.createTextNode(artist);
      link.parentNode.replaceChild(text, link);
    }
  }

  function renderServices() {
    var grid = $('[data-services-grid]');
    var active = (SITE.services || []).filter(function (s) { return s.url; });

    $('[data-services-label]').textContent = LABELS.getTheMusic;

    /* A string overrides the label outright, so a release can say "Out this
       fall" instead of the generic wording without touching labels. */
    var upcoming = SITE.comingSoon;
    var upcomingText = typeof upcoming === 'string' ? upcoming : LABELS.comingSoon;

    active.forEach(function (service) {
      var a = document.createElement('a');
      a.className = 'service-button service-button--' + service.id;
      a.href = service.url;
      a.target = '_blank';
      a.rel = 'noopener';

      /* Prefer the brand's own mark. `service.icon` names a generic glyph to
         fall back on where we have no shippable logo (see README on Amazon).
         With neither, the label centres on its own. */
      var glyph = icon(service.id) || icon(service.icon);

      a.classList.toggle('service-button--label-only', !glyph);
      a.innerHTML =
        (glyph ? '<span class="service-button__icon">' + glyph + '</span>' : '') +
        '<span class="service-button__label">' + service.label + '</span>';

      /* Only colour it if the mark is genuinely that brand's — a stand-in
         glyph stays Locust like the rest of the UI. */
      if (ICONS[service.id]) applyBrand(a.querySelector('.service-button__icon'), service.id);

      /* Its own event name, not link_click — GA4 marks key events by name, and
         a stream click is the conversion here while a social click is not. */
      if (upcoming) {
        /* Drop the href entirely rather than just styling it dead: a link you
           cannot honour should not be a link to a keyboard or a screen reader
           either. No data-track, so nothing logs a stream click for a record
           that cannot be streamed. */
        a.removeAttribute('href');
        a.removeAttribute('target');
        a.removeAttribute('rel');
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('tabindex', '-1');
      } else {
        a.setAttribute('data-track', 'service_click');
        a.setAttribute('data-track-id', service.id);
        a.setAttribute('data-track-section', 'services');
      }

      grid.appendChild(a);
    });

    if (upcoming && active.length) {
      $('[data-services-stack]').classList.add('services--upcoming');
      var badge = $('[data-services-badge]');
      badge.hidden = false;
      badge.textContent = upcomingText;
    }

    var physical = SITE.physical;
    var physicalHost = $('[data-services-physical]');

    if (physical && physical.url) {
      var button = document.createElement('a');
      button.className = 'service-button service-button--physical';
      button.href = physical.url;
      button.target = '_blank';
      button.rel = 'noopener';
      button.innerHTML =
        '<span class="service-button__icon">' + icon('physical') + '</span>' +
        '<span class="service-button__label">' + physical.label + '</span>';
      button.setAttribute('data-track', 'buy_click');
      button.setAttribute('data-track-id', 'physical');
      button.setAttribute('data-track-section', 'services');
      physicalHost.appendChild(button);

      /* The divider only earns its place when there is something on both sides. */
      if (active.length) $('[data-services-divider]').hidden = false;
    }

    /* With no services at all, the "Get the music:" label is noise. */
    if (!active.length && !(physical && physical.url)) {
      $('[data-services-label]').hidden = true;
    }
  }

  function renderNotes() {
    var notes = $('[data-notes]');
    if (SITE.notes) {
      notes.textContent = SITE.notes;
    } else {
      notes.hidden = true;
    }

    /* Optional pointer at whatever the release came out of — an essay, a
       video, a longer write-up. The notes card itself is textContent only,
       so a bare URL pasted in there would render as dead text; this is the
       supported way to make it clickable. */
    var notesLink = $('[data-notes-link]');
    if (SITE.notesLink && SITE.notesLink.url) {
      notesLink.hidden = false;
      notesLink.href = SITE.notesLink.url;
      notesLink.textContent = SITE.notesLink.label || 'Read more';
    }

    var host = $('[data-release-date]');
    if (!SITE.releaseDate) {
      host.hidden = true;
      return;
    }

    /* Parse as local midnight so the displayed date doesn't shift by timezone. */
    var parts = String(SITE.releaseDate).split('-');
    var date = new Date(+parts[0], +parts[1] - 1, +parts[2]);

    if (date > new Date()) {
      host.classList.add('release-date--upcoming');
      host.textContent = fillTemplate(LABELS.upcoming, {
        date: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
        year: date.getFullYear()
      });
    } else {
      host.textContent = fillTemplate(LABELS.released, { year: date.getFullYear() });
    }
  }

  function renderShareRail() {
    var follow = $('[data-follow-button]');
    if (SITE.spotifyFollowUrl) {
      follow.hidden = false;
      follow.href = SITE.spotifyFollowUrl;
      /* Deliberately not brand-coloured: the chip sits on a dark scrim, where
         Spotify's guidelines call for the reversed-out white mark. It inherits
         white from --chip-fg. */
      follow.innerHTML = icon('spotify') + '<span>' + LABELS.follow + '</span>';
    }

    var share = $('[data-share-button]');
    if (!SITE.showShareButton) {
      share.hidden = true;
    } else {
      /* data-share-label marks the text node so the module retitles it without
         clobbering the icon beside it. */
      share.innerHTML = icon('share') + '<span data-share-label>' + LABELS.share + '</span>';

      if (window.TBP_SHARE) {
        window.TBP_SHARE.bind(share, {
          text: SITE.albumTitle + ' by ' + SITE.artistName,
          idleLabel: LABELS.share,
          copiedLabel: LABELS.shareCopied,
          manualLabel: LABELS.shareCopyManually
        });
      }
    }

    if (!SITE.spotifyFollowUrl && !SITE.showShareButton) {
      $('[data-share-rail]').hidden = true;
    }
  }

  /* Link back to the artist's hub page (tbp-links). Hidden unless configured,
     so the page still stands alone without one. */
  function renderHubLink() {
    var hub = SITE.hub;
    if (!hub || !hub.url) return;

    var link = $('[data-hub-link]');
    link.hidden = false;
    link.href = hub.url;
    $('[data-hub-text]').textContent = hub.label || 'All my links';

    var mark = $('[data-hub-mark]');
    if (hub.mark) {
      mark.src = hub.mark;
    } else {
      mark.remove();
    }
  }

  function renderFooter() {
    $('[data-footer-note]').textContent = SITE.footerNote || '';
  }

  /* Scales the title down so a long album name fits the column on one line,
     mirroring the reference. Measuring has to happen with nowrap on: once the
     text is allowed to wrap, scrollWidth collapses to clientWidth and there is
     nothing left to measure against. */
  function fitTitle() {
    var el = $('[data-album-title]');
    var MAX = 40;
    var MIN = 24;

    el.style.whiteSpace = 'nowrap';
    el.style.fontSize = MAX + 'px';

    var available = el.clientWidth;
    var needed = el.scrollWidth;

    /* Called before layout settles — leave it at the default and wait for the
       fonts.ready / resize pass rather than acting on a zero measurement. */
    if (!available || !needed) {
      el.style.whiteSpace = '';
      return;
    }

    var size = needed > available ? Math.floor(MAX * available / needed) : MAX;

    if (size < MIN) {
      /* Too long to shrink gracefully — hold the floor and let it wrap. */
      size = MIN;
      el.style.whiteSpace = 'normal';
    }

    el.style.fontSize = size + 'px';
  }

  /* ------------------------------------------------------------------- boot */

  function init() {
    renderBanner();
    renderTracks();
    renderTitles();

    /* Deliberately after renderTitles: the markup ships a "Loading…"
       placeholder title, and gtag's own pageview in the head would have
       captured that instead of the release name. */
    if (window.TBP_ANALYTICS) {
      window.TBP_ANALYTICS.track('page_view', {
        page_title: document.title,
        page_location: location.href
      });
    }

    renderServices();
    renderNotes();
    renderShareRail();
    renderHubLink();
    renderFooter();
    bindPlayer();

    fitTitle();
    window.addEventListener('resize', fitTitle);
    /* Web fonts land after first paint and change the measurement. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);
  }

  init();
})();
