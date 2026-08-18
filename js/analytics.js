/* ==========================================================================
   Shared analytics — the SAME file ships in tbp-links and the release page.

   Both sites report into one GA4 property (G-1SMYFR876Y), so event names have
   to be identical or the two pages become two dialects and cross-site funnels
   stop working. Edit here, then copy across. Do not fork it.

   Everything degrades to a silent no-op when gtag is missing — ad blockers,
   opening the file straight off disk — so nothing in here can break a page.

   Events emitted
     link_click      any tracked anchor        link_id, link_section, link_url
     service_click   a streaming service       link_id, link_section, link_url
     buy_click       buy-from-artist           link_id, link_section, link_url
     audio_play      first play of a track     track_title
     audio_progress  25 / 50 / 75% reached     audio_percent, track_title
     audio_complete  played to the end         track_title
     share_click     share button used         share_method

   link_id, link_section, link_url, audio_percent, track_title and share_method
   are custom parameters. They flow into GA4 immediately but stay unchartable
   until registered under Admin -> Custom definitions.
   ========================================================================== */
window.TBP_ANALYTICS = (function (window, document) {
  'use strict';

  function track(name, params) {
    if (typeof window.gtag !== 'function') return false;
    window.gtag('event', name, params || {});
    return true;
  }

  /* --- link clicks -------------------------------------------------------

     Delegated off the document rather than bound per element, so anchors
     rendered after load — which on the release page is all of them — are
     covered with no extra wiring.

     Markup contract:
       data-track          event name, defaults to link_click
       data-track-id       stable slug: 'spotify', 'substack', 'care'
       data-track-section  where on the page it sits: 'follow', 'support'   */
  function bindLinks() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') return;

      var link = target.closest('[data-track]');
      if (!link) return;

      track(link.getAttribute('data-track') || 'link_click', {
        link_id: link.getAttribute('data-track-id') || '',
        link_section: link.getAttribute('data-track-section') || '',
        link_url: link.href || ''
      });
    });
  }

  /* --- audio -------------------------------------------------------------

     GA4's enhanced measurement covers embedded YouTube only, so an <audio>
     element is completely invisible unless we report it ourselves. Play rate
     tells you they pressed the button; completion rate tells you the song
     held them.

     `titleFor` is a function, not a string: the release page swaps src as it
     moves down a tracklist, and we want whatever is loaded right now.        */
  var MILESTONES = [25, 50, 75];

  function bindAudio(audio, titleFor) {
    if (!audio) return;

    var fired = {};
    var lastSrc = '';

    function title() {
      try { return (typeof titleFor === 'function' ? titleFor() : titleFor) || ''; }
      catch (err) { return ''; }
    }

    /* Keyed off the source rather than a loadstart/play ordering guard. The
       two events do not fire in a dependable order once audio is streaming,
       and a guard that loadstart could clear mid-playback would let an
       ordinary pause-and-resume re-count as a fresh play. Comparing src is
       ordering-independent: same track resuming is never a new play, a
       different track always is. */
    audio.addEventListener('play', function () {
      var src = audio.currentSrc || audio.src || '';
      if (src === lastSrc) return;
      lastSrc = src;
      fired = {};
      track('audio_play', { track_title: title() });
    });

    audio.addEventListener('timeupdate', function () {
      if (!isFinite(audio.duration) || !audio.duration) return;

      var percent = (audio.currentTime / audio.duration) * 100;

      for (var i = 0; i < MILESTONES.length; i++) {
        var mark = MILESTONES[i];
        /* timeupdate fires several times a second — the flag is what keeps
           this from emitting the same milestone on every tick. */
        if (percent >= mark && !fired[mark]) {
          fired[mark] = true;
          track('audio_progress', { audio_percent: mark, track_title: title() });
        }
      }
    });

    audio.addEventListener('ended', function () {
      track('audio_complete', { track_title: title() });
      /* Clearing lastSrc means replaying the same track counts as a new play,
         which is what a repeat listen actually is. */
      lastSrc = '';
      fired = {};
    });
  }

  bindLinks();

  return {
    track: track,
    bindAudio: bindAudio
  };
})(window, document);
