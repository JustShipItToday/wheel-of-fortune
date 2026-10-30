/* share.js — share a game as a link. There is no server: the game is packed (compressed, then base64url) into the
   part of the address after the "#", which the browser never sends anywhere. Opening such a link asks first, then
   swaps the visitor's browser save for the shared game (the old save is kept as a backup they can switch back to).
   The sharer picks what travels: puzzles, settings and theme always; player names and scores; the current board
   and whose turn it is. Sounds the host uploaded themselves are stored per browser and cannot travel in a link. */
(function () {
  'use strict';
  var TAG = '#wof=';
  var SITE = 'https://justshipittoday.github.io/wheel-of-fortune/';
  var AFTER = 'wof-web-after-share';
  var PLAYER = /^(Player\d|NumPlayers$|AddPlayers$|RemovePlayers$|RoundTotals$|TextBox 30[12]$)/;   // slide 2 shapes that are players and scores
  var WARN_LEN = 6000, MAX_LEN = 250000;

  /* ---- packing ---- */
  function b64u(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unb64u(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '=';
    var bin = atob(str), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function pipe(bytes, stream) {
    return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
  }
  async function pack(obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) return 'z' + b64u(await pipe(bytes, new CompressionStream('deflate-raw')));
    return 'j' + b64u(bytes);
  }
  async function unpack(str) {
    var kind = str.charAt(0), bytes = unb64u(str.slice(1));
    if (kind === 'z') {
      if (!window.DecompressionStream) throw new Error('This browser is too old to open compressed share links.');
      bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    } else if (kind !== 'j') throw new Error('unknown link format');
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  /* links come from strangers: rebuild the data keeping only what a game file can legitimately hold */
  function validate(d) {
    if (!d || d.v !== 1 || !d.slides || typeof d.slides !== 'object') throw new Error('not a game');
    var out = { v: 1, pages: Math.max(1, Math.min(100, d.pages | 0 || 1)), slides: {}, extras: null, at: Date.now(), sh: { sc: !!(d.sh && d.sh.sc), bd: !!(d.sh && d.sh.bd) } };
    Object.keys(d.slides).forEach(function (id) {
      var n = +id; if (!(n >= 1 && n <= 1100) || !Array.isArray(d.slides[id])) return;
      out.slides[n] = d.slides[id].map(function (r) {
        if (!r || !(r.i >= 0 && r.i < 5000)) return null;
        var c = { i: r.i | 0 };
        if (typeof r.t === 'string') c.t = r.t.slice(0, 2000);
        if (typeof r.d === 'string') c.d = r.d.slice(0, 20);
        if (typeof r.n === 'string') c.n = r.n.slice(0, 120);
        if (r.s && typeof r.s === 'object' && !Array.isArray(r.s)) c.s = r.s;
        return c;
      }).filter(Boolean);
    });
    return out;
  }

  /* ---- making a link ---- */
  function base() { return location.protocol === 'file:' ? SITE : location.origin + location.pathname; }
  async function makeLink(opts) {
    var data = Persist.collect(function (id, el) {
      if (id !== 2) return false;
      return PLAYER.test(el.dataset.name || '') ? !opts.scores : !opts.board;
    });
    data.sh = { sc: !!opts.scores, bd: !!opts.board };
    data.extras = null;
    return base() + TAG + await pack(data);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { }
    try {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (e) { return false; }
  }
  function row(label, note, checked, locked) {
    var l = document.createElement('label');
    l.style.cssText = 'display:flex;gap:10px;align-items:flex-start;margin:7px 0;cursor:' + (locked ? 'default' : 'pointer');
    var c = document.createElement('input'); c.type = 'checkbox'; c.checked = checked; c.disabled = !!locked;
    c.style.cssText = 'width:18px;height:18px;margin:2px 0 0;padding:0;flex:none;display:inline-block';
    var t = document.createElement('span');
    t.innerHTML = '<b></b><br><span style="font-size:13px;opacity:.8"></span>';
    t.firstChild.textContent = label; t.lastChild.textContent = note;
    l.appendChild(c); l.appendChild(t);
    return { el: l, box: c };
  }

  async function share() {
    if (Dlg.isOpen()) return;
    Persist.save();
    var node = document.createElement('div');
    var intro = document.createElement('div');
    intro.textContent = 'Copy a link that opens your game on anyone’s computer. Choose what goes in it:';
    node.appendChild(intro);
    var r0 = row('Puzzles, settings, colors and rules', 'Always included.', true, true);
    var r1 = row('Player names and scores', 'Names, round and total scores, and who holds a Wild Card or Gift Tag.', false);
    var r2 = row('Current puzzle and whose turn', 'The board exactly as it is now, and the turn tracker.', false);
    [r0, r1, r2].forEach(function (r) { node.appendChild(r.el); });
    var size = document.createElement('div');
    size.style.cssText = 'margin-top:10px;font-size:13px;opacity:.85';
    node.appendChild(size);
    var note = document.createElement('div');
    note.style.cssText = 'margin-top:6px;font-size:12.5px;opacity:.7';
    note.textContent = 'Sound files you uploaded yourself can’t go in a link; the built-in sounds work for everyone. The link holds the whole game, so there’s no account and nothing stored online.';
    node.appendChild(note);
    var seq = 0;
    async function refresh() {
      var my = ++seq; size.textContent = 'Checking link size…';
      var len; try { len = (await makeLink({ scores: r1.box.checked, board: r2.box.checked })).length; } catch (e) { len = -1; }
      if (my !== seq) return;
      size.textContent = len < 0 ? '' : 'Link length: ' + len.toLocaleString() + ' characters' + (len > WARN_LEN ? ' (long: some chat apps may cut it off, so test it before relying on it)' : '');
      size.style.color = len > WARN_LEN ? '#9a2a00' : '';
    }
    r1.box.onchange = r2.box.onchange = refresh; refresh();
    var i = await Dlg.custom(node, 'Share Game', ['Copy link', 'Cancel']);
    if (i !== 0) return;
    var link;
    try { link = await makeLink({ scores: r1.box.checked, board: r2.box.checked }); } catch (e) { console.error(e); await Dlg.msg('Sorry, the link could not be made.', 'Share Game'); return; }
    if (link.length > MAX_LEN) { await Dlg.msg('This game is too big for a link. Use Save game file (⋯ menu) and send that file instead.', 'Share Game'); return; }
    if (await copy(link)) toast('Link copied! (' + link.length.toLocaleString() + ' characters)');
    else await Dlg.input('Your browser wouldn’t copy automatically. Select this link and copy it (Ctrl+C):', 'Share Game', link);
  }

  /* ---- opening a link ---- */
  var handling = false;
  async function incoming() {
    if (handling || location.hash.indexOf(TAG) !== 0) return;
    handling = true;
    var raw = location.hash.slice(TAG.length);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
    try {
      while (Dlg.isOpen() || App.busy) await new Promise(function (r) { setTimeout(r, 300); });
      var data;
      try { data = validate(await unpack(raw)); }
      catch (e) { await Dlg.msg('That share link looks damaged or cut off (some apps shorten long links). Ask for it again, or ask for a saved game file instead.', 'Shared Game'); return; }
      var own = false; try { own = !!localStorage.getItem(Persist.KEY); } catch (e) { }
      var has = ['Puzzles, settings and colors'].concat(data.sh.sc ? ['player names and scores'] : [], data.sh.bd ? ['the board and whose turn it is'] : []);
      var ok = await Dlg.confirm('This is someone else’s game.\n\nIt includes: ' + has.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.\n\n' +
        (own ? 'Opening it replaces the game in this browser. Your own game is kept, and you can switch back from the ⋯ menu.\n\n' : '') +
        'You can edit it freely. If you share it, you’ll get a new link and the original stays unchanged.', 'Open Shared Game', { yes: 'Open it', no: 'Not now' });
      if (!ok) return;
      try { Persist.adopt(data); sessionStorage.setItem(AFTER, data.sh.bd ? '2' : '1'); }
      catch (e) { await Dlg.msg('This browser wouldn’t let the game be saved (private window or full storage).', 'Shared Game'); return; }
      location.reload();
    } finally { handling = false; }
  }
  function afterBoot() {
    var go = null; try { go = sessionStorage.getItem(AFTER); sessionStorage.removeItem(AFTER); } catch (e) { }
    if (go) { App.show(+go); toast('Shared game loaded. Edit anything you like!'); }
    incoming();
    window.addEventListener('hashchange', incoming);
  }
  async function switchBack() {
    if (!Persist.hasBackup()) return;
    if (await Dlg.confirm('Switch to the game this browser had before? The game you have now is kept too, so you can switch back again.', 'Switch Game', { yes: 'Switch', no: 'Cancel' })) {
      if (Persist.swapBackup()) location.reload();
    }
  }

  App.M.XShare = share;
  window.Share = { share: share, afterBoot: afterBoot, switchBack: switchBack, pack: pack, unpack: unpack, validate: validate, makeLink: makeLink };
})();
