/* ==========================================================================
   Share button.

   Three tiers, in order of what the device actually supports:
     native     the OS share sheet, where navigator.share exists (most phones)
     clipboard  copy the URL and say so
     manual     tell the reader to copy it themselves

   Reports through TBP_ANALYTICS as share_click, with share_method naming which
   tier fired — the split is the interesting part, since it doubles as a read
   on how mobile the audience is.

   Shared verbatim with the release page, the same way analytics.js is: one
   implementation of the fallback chain, so a fix like the clipboard .catch()
   below cannot end up present on one site and missing on the other — which is
   exactly how that bug survived. Edit here, copy across.

   Labels are passed in rather than hardcoded, since the release page draws
   its UI strings from site.config.js.
   ========================================================================== */
window.TBP_SHARE = (function (window, document) {
  'use strict';

  var DEFAULTS = {
    idle: 'Share',
    copied: 'Link copied',
    manual: 'Copy the URL'
  };

  function bind(button, options) {
    if (!button) return;

    var opts = options || {};
    var labels = {
      idle: opts.idleLabel || DEFAULTS.idle,
      copied: opts.copiedLabel || DEFAULTS.copied,
      manual: opts.manualLabel || DEFAULTS.manual
    };

    /* Fall back to the button itself so this still works on a bare
       <button>share</button> with no inner span. */
    var labelEl = button.querySelector('[data-share-label]') || button;
    var timer = null;

    function report(method) {
      if (window.TBP_ANALYTICS) {
        window.TBP_ANALYTICS.track('share_click', { share_method: method });
      }
    }

    function say(text, revert) {
      labelEl.textContent = text;
      if (timer) clearTimeout(timer);
      if (revert) {
        timer = setTimeout(function () { labelEl.textContent = labels.idle; }, 2000);
      }
    }

    button.addEventListener('click', function () {
      var url = location.href;

      if (navigator.share) {
        report('native');
        navigator.share({
          title: opts.title || document.title,
          text: opts.text || '',
          url: url
        }).catch(function () { /* user dismissed the sheet */ });
        return;
      }

      /* clipboard is absent on insecure origins. */
      if (!navigator.clipboard) {
        report('manual');
        say(labels.manual, false);
        return;
      }

      navigator.clipboard.writeText(url).then(function () {
        report('clipboard');
        say(labels.copied, true);
      }).catch(function () {
        /* writeText rejects when the document is not focused or permission is
           refused. Without this branch the button reads as broken: no copy,
           no message, nothing. */
        report('manual');
        say(labels.manual, false);
      });
    });
  }

  return { bind: bind };
})(window, document);
