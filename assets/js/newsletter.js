/* Weekly digest: subscribe, confirm, change topics and unsubscribe, all inside the book.
   Backend: ~/dev/arch-newsletter (newsletter-api). Nothing here navigates away: every
   action is a fetch() and the result is shown in place.

   Email links land on the book as #newsletter=<action>&t=<token>. The head script moves
   them into window.__nl and strips the fragment before analytics loads, so a token never
   reaches Google Analytics or the page's history. Tokens live in memory only: this origin
   (oleksiyp.github.io) is shared with other sites, so nothing is written to storage. */
(function () {
    'use strict';
    var script = document.currentScript;
    var API = (script && script.dataset.api || '').replace(/\/$/, '');
    if (!API) return;
    var CHAPTER = parseInt(script.dataset.chapter || '0', 10) || 0;
    var PRIVACY = new URL('../../privacy/', script.src).href; // this file lives in <site>/assets/js/

    var TAGS = [
        ['foundations', 'Foundations & trade-offs'], ['styles', 'Architecture styles'], ['ddd', 'Domain-driven design'],
        ['distributed', 'Distributed systems'], ['microservices', 'Microservices'], ['events', 'Events & streaming'],
        ['apis', 'APIs'], ['frontend', 'Frontend architecture'], ['data', 'Data architecture'],
        ['security', 'Security & zero trust'], ['cloud-native', 'Cloud-native operations'], ['ai', 'AI systems'],
        ['economics', 'Build vs buy & cost'], ['saas', 'Multi-tenant SaaS'], ['platform', 'Platform engineering']
    ];
    var ALL = TAGS.map(function (t) { return t[0]; });
    var defaultTags = CHAPTER >= 1 && CHAPTER <= TAGS.length ? [TAGS[CHAPTER - 1][0]] : ALL.slice();

    function track(name) { if (window.gtag) window.gtag('event', name); }

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }

    function call(path, body) {
        return fetch(API + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (data) {
                if (!r.ok) throw new Error(data.error || (r.status === 429 ? 'Too many attempts. Please wait a minute.' : 'Something went wrong. Please try again.'));
                return data;
            });
        }, function () { throw new Error('Could not reach the newsletter service. Please try again later.'); });
    }

    /* Topic chips: toggle buttons with aria-pressed, under a header with a count and a
       select-all / clear switch. */
    function chips(selected) {
        var node = el('div', 'nl-topics');
        var head = el('div', 'nl-topics-head');
        var label = el('span', 'nl-topics-label', 'Topics');
        var count = el('span', 'nl-topics-count');
        var all = el('button', 'nl-mini');
        all.type = 'button';
        head.appendChild(label);
        head.appendChild(count);
        head.appendChild(all);
        node.appendChild(head);
        var wrap = el('div', 'nl-chips');
        wrap.setAttribute('role', 'group');
        wrap.setAttribute('aria-label', 'Topics');
        node.appendChild(wrap);
        var set = {};
        selected.forEach(function (t) { set[t] = true; });
        var buttons = TAGS.map(function (t, i) {
            var b = el('button', 'nl-chip', t[1]);
            b.type = 'button';
            b.dataset.tag = t[0];
            b.title = 'Chapter ' + (i + 1);
            b.setAttribute('aria-pressed', set[t[0]] ? 'true' : 'false');
            b.addEventListener('click', function () {
                b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
                sync();
            });
            wrap.appendChild(b);
            return b;
        });
        function picked() { return buttons.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).length; }
        function sync() {
            var n = picked();
            count.textContent = (n === buttons.length ? 'all ' + n : n + ' of ' + buttons.length) + ' selected';
            all.textContent = n === buttons.length ? 'Clear' : 'Select all';
        }
        all.addEventListener('click', function () {
            var on = picked() !== buttons.length;
            buttons.forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
            sync();
        });
        sync();
        return {
            node: node,
            value: function () {
                return buttons.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })
                    .map(function (b) { return b.dataset.tag; });
            }
        };
    }

    function status(box, text, kind) {
        var s = box.querySelector('.nl-status');
        if (!s) { s = el('p', 'nl-status'); s.setAttribute('role', 'status'); box.appendChild(s); }
        s.className = 'nl-status' + (kind ? ' nl-status--' + kind : '');
        s.textContent = text;
    }

    function topicNames(ids) {
        return TAGS.filter(function (t) { return ids.indexOf(t[0]) >= 0; }).map(function (t) { return t[1]; });
    }

    /* ---- views; each renders into a container box ---- */

    function subscribeView(box, tags, typed) {
        box.textContent = '';
        box.classList.remove('nl-box--preview');
        box.appendChild(el('p', 'nl-lead', 'Every Monday: the articles, talks and releases worth an architect\'s time, picked from 500 sources, each with why it matters and the key takeaways. Only your topics.'));
        var form = el('form', 'nl-form');
        form.noValidate = true;
        var picker = chips(tags);
        form.appendChild(picker.node);
        var row = el('div', 'nl-row');
        var email = el('input', 'nl-email');
        email.type = 'email';
        email.name = 'email';
        email.required = true;
        email.autocomplete = 'email';
        email.placeholder = 'you@example.com';
        email.setAttribute('aria-label', 'Email address');
        if (typed) email.value = typed;
        var trap = el('input', 'nl-trap');
        trap.type = 'text';
        trap.name = 'website';
        trap.tabIndex = -1;
        trap.autocomplete = 'off';
        trap.setAttribute('aria-hidden', 'true');
        var submit = el('button', 'nl-btn nl-btn--accent', 'Subscribe');
        submit.type = 'submit';
        row.appendChild(email);
        row.appendChild(submit);
        form.appendChild(row);
        form.appendChild(trap);
        var fine = el('p', 'nl-fine', 'You confirm by email first. One-click unsubscribe in every issue. No tracking by us. ');
        var privacy = el('a', 'nl-privacy', 'Privacy');
        privacy.href = PRIVACY;
        fine.appendChild(privacy);
        form.appendChild(fine);
        var peek = el('button', 'nl-btn nl-btn--quiet nl-peek', 'Preview this week\'s issue');
        peek.type = 'button';
        peek.addEventListener('click', function () {
            var picked = picker.value();
            if (!picked.length) { status(box, 'Pick at least one topic.', 'error'); return; }
            var show = function (b) { previewView(b, picked, email.value); };
            if (box.closest('.nl-modal')) show(box); else open(show);
        });
        form.insertBefore(peek, row);
        var lost = el('button', 'nl-link nl-link--foot', 'Already subscribed? Change topics or unsubscribe');
        lost.type = 'button';
        lost.addEventListener('click', function () { manageLinkView(box); });
        form.appendChild(lost);
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var picked = picker.value();
            if (!picked.length) { status(box, 'Pick at least one topic.', 'error'); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { status(box, 'Please enter a valid email address.', 'error'); email.focus(); return; }
            submit.disabled = true;
            status(box, 'Sending…');
            call('/v1/subscribe', { email: email.value.trim(), tags: picked, website: trap.value }).then(function () {
                track('newsletter_subscribe');
                box.textContent = '';
                box.appendChild(el('p', 'nl-done', 'Almost there. Check your inbox for a confirmation link.'));
                box.appendChild(el('p', 'nl-fine', 'Nothing will be sent until you confirm. The link opens right here in the book.'));
            }, function (err) {
                submit.disabled = false;
                status(box, err.message, 'error');
            });
        });
        box.appendChild(form);
    }

    // A sample of this week's issue, rendered by the API and cached a day at the CDN; tags
    // go in chapter order so each combination is one cache entry.
    function previewView(box, tags, typed) {
        track('newsletter_preview');
        box.textContent = '';
        var back = el('button', 'nl-link', '← Back to subscribing');
        back.type = 'button';
        back.addEventListener('click', function () { subscribeView(box, tags, typed); });
        box.appendChild(back);
        var frame = el('iframe', 'nl-preview');
        frame.title = 'Sample issue of the weekly digest';
        frame.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
        frame.src = API + '/v1/preview-email?tags=' + ALL.filter(function (t) { return tags.indexOf(t) >= 0; }).join(',');
        box.appendChild(frame);
        box.classList.add('nl-box--preview');
        back.focus();
    }

    function manageView(box, token, intro) {
        box.textContent = '';
        status(box, 'Loading your subscription…');
        call('/v1/manage', { token: token }).then(function (sub) {
            box.textContent = '';
            if (intro) box.appendChild(el('p', 'nl-done', intro));
            var active = sub.status === 'active';
            box.appendChild(el('p', 'nl-lead', active
                ? 'Topics for ' + sub.email + '. The digest comes on Mondays.'
                : sub.email + ' is unsubscribed. Pick topics to start again.'));
            var picker = chips(sub.tags && sub.tags.length ? sub.tags : defaultTags);
            box.appendChild(picker.node);
            var row = el('div', 'nl-row');
            var save = el('button', 'nl-btn nl-btn--accent', active ? 'Save topics' : 'Subscribe again');
            save.type = 'button';
            row.appendChild(save);
            if (active) {
                var unsub = el('button', 'nl-btn nl-btn--quiet', 'Unsubscribe');
                unsub.type = 'button';
                unsub.addEventListener('click', function () { unsubscribeView(box, token, sub.email); });
                row.appendChild(unsub);
            }
            box.appendChild(row);
            if (active) box.appendChild(el('p', 'nl-fine', 'Topic changes apply from next Monday\'s digest.'));
            var del = el('button', 'nl-link', 'Delete my address entirely');
            del.type = 'button';
            del.addEventListener('click', function () { forgetView(box, token, sub.email); });
            box.appendChild(del);
            save.addEventListener('click', function () {
                var picked = picker.value();
                if (!picked.length) { status(box, 'Pick at least one topic, or unsubscribe.', 'error'); return; }
                save.disabled = true;
                call('/v1/preferences', { token: token, tags: picked }).then(function (res) {
                    track('newsletter_topics');
                    save.disabled = false;
                    if (!active) { manageView(box, token, 'Welcome back. You are subscribed again.'); return; }
                    status(box, 'Saved: ' + topicNames(res.tags).join(', ') + '.', 'ok');
                }, function (err) { save.disabled = false; status(box, err.message, 'error'); });
            });
        }, function (err) { box.textContent = ''; status(box, err.message, 'error'); });
    }

    // "I lost my emails": the service mails a fresh manage link if the address is on the list.
    function manageLinkView(box) {
        box.textContent = '';
        box.appendChild(el('p', 'nl-lead', 'Enter the address you subscribed with. If it is on the list, we will email you a link to change topics, unsubscribe or delete your address.'));
        var form = el('form', 'nl-form');
        form.noValidate = true;
        var row = el('div', 'nl-row');
        var email = el('input', 'nl-email');
        email.type = 'email';
        email.autocomplete = 'email';
        email.placeholder = 'you@example.com';
        email.setAttribute('aria-label', 'Email address');
        if (typed) email.value = typed;
        var send = el('button', 'nl-btn nl-btn--accent', 'Email me a link');
        send.type = 'submit';
        row.appendChild(email);
        row.appendChild(send);
        form.appendChild(row);
        var back = el('button', 'nl-link', 'Back to subscribing');
        back.type = 'button';
        back.addEventListener('click', function () { subscribeView(box, defaultTags); });
        form.appendChild(back);
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { status(box, 'Please enter a valid email address.', 'error'); return; }
            send.disabled = true;
            call('/v1/manage-link', { email: email.value.trim() }).then(function () {
                track('newsletter_manage_link');
                box.textContent = '';
                box.appendChild(el('p', 'nl-done', 'Check your inbox. If that address is subscribed, a link is on its way.'));
            }, function (err) { send.disabled = false; status(box, err.message, 'error'); });
        });
        box.appendChild(form);
        email.focus();
    }

    function forgetView(box, token, emailMasked) {
        box.textContent = '';
        box.appendChild(el('p', 'nl-lead', 'Delete ' + (emailMasked || 'your address') + ' and everything stored about it? This also unsubscribes you. To come back later you would subscribe again from scratch.'));
        var row = el('div', 'nl-row');
        var yes = el('button', 'nl-btn', 'Delete my address');
        yes.type = 'button';
        var no = el('button', 'nl-btn nl-btn--quiet', 'Cancel');
        no.type = 'button';
        row.appendChild(yes);
        row.appendChild(no);
        box.appendChild(row);
        no.addEventListener('click', function () { manageView(box, token); });
        yes.addEventListener('click', function () {
            yes.disabled = true;
            call('/v1/forget', { token: token }).then(function () {
                track('newsletter_forget');
                box.textContent = '';
                box.appendChild(el('p', 'nl-done', 'Done. Your address and everything about it is deleted.'));
            }, function (err) { yes.disabled = false; status(box, err.message, 'error'); });
        });
    }

    function unsubscribeView(box, token, emailMasked) {
        box.textContent = '';
        box.appendChild(el('p', 'nl-lead', 'Stop the weekly digest' + (emailMasked ? ' for ' + emailMasked : '') + '?'));
        var row = el('div', 'nl-row');
        var yes = el('button', 'nl-btn', 'Unsubscribe');
        yes.type = 'button';
        var keep = el('button', 'nl-btn nl-btn--quiet', 'Keep it, change topics instead');
        keep.type = 'button';
        row.appendChild(yes);
        row.appendChild(keep);
        box.appendChild(row);
        keep.addEventListener('click', function () { manageView(box, token); });
        yes.addEventListener('click', function () {
            yes.disabled = true;
            call('/v1/unsubscribe', { token: token }).then(function () {
                track('newsletter_unsubscribe');
                box.textContent = '';
                box.appendChild(el('p', 'nl-done', 'You are unsubscribed. No more emails.'));
                var back = el('button', 'nl-btn nl-btn--quiet', 'Changed your mind? Subscribe again');
                back.type = 'button';
                back.addEventListener('click', function () { manageView(box, token); });
                box.appendChild(back);
            }, function (err) { yes.disabled = false; status(box, err.message, 'error'); });
        });
    }

    function confirmView(box, token) {
        box.textContent = '';
        status(box, 'Confirming your subscription…');
        call('/v1/confirm', { token: token }).then(function (res) {
            track('newsletter_confirm');
            // The confirm response carries a fresh manage token, so topics can be changed
            // right away without waiting for an email.
            manageView(box, res.token, 'You are subscribed. The first digest arrives on Monday.');
        }, function (err) { box.textContent = ''; status(box, err.message, 'error'); });
    }

    /* ---- the dialog (same overlay and frame as Reading Statistics) ---- */

    var overlay = null, escHandler = null, lastFocus = null;
    function close() {
        if (!overlay) return;
        overlay.remove();
        overlay = null;
        document.removeEventListener('keydown', escHandler);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function open(render) {
        close();
        lastFocus = document.activeElement;
        overlay = el('div', 'stats-overlay nl-overlay');
        var modal = el('div', 'stats-modal nl-modal');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Weekly digest');
        var head = el('div', 'stats-head');
        head.appendChild(el('h3', null, 'Arch Book weekly'));
        var x = el('button', 'stats-close', '×');
        x.setAttribute('aria-label', 'Close');
        x.addEventListener('click', close);
        head.appendChild(x);
        modal.appendChild(head);
        var body = el('div', 'stats-body nl-box');
        modal.appendChild(body);
        overlay.appendChild(modal);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        escHandler = function (e) { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', escHandler);
        document.body.appendChild(overlay);
        render(body);
        var first = body.querySelector('input.nl-email, button');
        (first || x).focus();
    }

    window.openNewsletter = function (tags) {
        track('newsletter_open');
        open(function (box) { subscribeView(box, tags || defaultTags); });
    };

    function init() {
        // Inline card at the end of every page: the same form, no dialog.
        document.querySelectorAll('.nl-inline').forEach(function (card) {
            var box = card.querySelector('.nl-box');
            if (box) subscribeView(box, defaultTags);
            card.hidden = false;
        });
        document.querySelectorAll('[data-newsletter-open]').forEach(function (b) {
            b.hidden = false;
            b.addEventListener('click', function (e) { e.preventDefault(); window.openNewsletter(); });
        });
        // Arrived from an email link (captured and stripped by the head script).
        handleLink(window.__nl);
        window.__nl = null;
        // The same link opened while the book is already loaded in this tab changes only
        // the fragment: no reload, so the head script never sees it.
        window.addEventListener('hashchange', function () {
            var m = location.hash.match(/^#newsletter=(confirm|manage|unsubscribe)&t=([A-Za-z0-9_%-]{20,100})$/);
            if (!m) return;
            history.replaceState(null, '', location.pathname + location.search);
            handleLink({ action: m[1], token: decodeURIComponent(m[2]) });
        });
    }

    function handleLink(nl) {
        if (!nl || !nl.token) return;
        track('newsletter_link_' + nl.action);
        open(function (box) {
            if (nl.action === 'confirm') confirmView(box, nl.token);
            else if (nl.action === 'unsubscribe') unsubscribeView(box, nl.token);
            else manageView(box, nl.token);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
