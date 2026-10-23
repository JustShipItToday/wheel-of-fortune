/* dialog.js — replaces VBA InputBox / MsgBox with in-page dialogs (Promise based) */
(function () {
  'use strict';
  var root, open = false, queue = [];
  function ensure() {
    if (root) return root;
    root = document.createElement('div'); root.id = 'dlg';
    root.innerHTML = '<div class="box"><div class="tt"></div><div class="tx"></div><input type="text" spellcheck="false" autocomplete="off"><div class="bt"></div></div>';
    document.getElementById('stage').appendChild(root);
    return root;
  }
  function show(opts) {
    return new Promise(function (resolve) {
      ensure();
      var box = root.querySelector('.box'), tt = box.querySelector('.tt'), tx = box.querySelector('.tx'), inp = box.querySelector('input'), bt = box.querySelector('.bt');
      tt.textContent = opts.title || 'Wheel of Fortune';
      tx.textContent = opts.text || '';
      if (opts.node) { tx.textContent = ''; tx.appendChild(opts.node); }
      inp.style.display = opts.input ? 'block' : 'none';
      inp.value = opts.value != null ? opts.value : '';
      bt.innerHTML = '';
      function done(v) { root.classList.remove('open'); document.removeEventListener('keydown', onKey, true); open = false; resolve(v); }
      function onKey(e) {
        if (e.key === 'Enter' && e.target && e.target.tagName === 'TEXTAREA') { e.stopPropagation(); return; }
        if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (opts.choices) { var f = document.activeElement; if (f && f.tagName === 'BUTTON') f.click(); return; } done(opts.input ? inp.value : (opts.kind === 'confirm' ? true : undefined)); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(opts.choices ? -1 : opts.input ? null : (opts.kind === 'confirm' ? false : undefined)); }
        e.stopPropagation();
      }
      function btn(label, cls, val) { var b = document.createElement('button'); b.textContent = label; if (cls) b.className = cls; b.onclick = function () { done(val); }; bt.appendChild(b); return b; }
      var focusBtn;
      if (opts.choices) { opts.choices.forEach(function (c, i) { var b = btn(c, i === opts.choices.length - 1 ? 'sec' : '', i); if (i === 0) focusBtn = b; }); }
      else if (opts.input) { btn('Cancel', 'sec', null); btn('OK', '', '__ok__').onclick = function () { done(inp.value); }; }
      else if (opts.kind === 'confirm') {
        var yes = btn(opts.yes || 'Yes', '', true), no = btn(opts.no || 'No', 'sec', false);
        focusBtn = opts.defaultNo ? no : yes;
        if (opts.defaultNo) { bt.innerHTML = ''; bt.appendChild(yes); bt.appendChild(no); }
      } else btn('OK', '', undefined);
      root.classList.add('open'); open = true;
      document.addEventListener('keydown', onKey, true);
      setTimeout(function () { if (opts.input) { inp.focus(); inp.select(); } else (focusBtn || bt.lastChild).focus(); }, 30);
      if (opts.kind === 'confirm' && opts.defaultNo) {
        // Enter should trigger the default (No)
        document.removeEventListener('keydown', onKey, true);
        document.addEventListener('keydown', function k2(e) {
          if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); document.removeEventListener('keydown', k2, true); done(false); }
          else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); document.removeEventListener('keydown', k2, true); done(false); }
          e.stopPropagation();
        }, true);
      }
    });
  }
  var Dlg = {
    msg: function (text, title) { return show({ text: text, title: title }); },
    confirm: function (text, title, o) { o = o || {}; return show({ text: text, title: title, kind: 'confirm', defaultNo: !!o.defaultNo, yes: o.yes, no: o.no }); },
    /* returns string, or null if cancelled */
    input: function (text, title, def) { return show({ text: text, title: title, input: true, value: def }); },
    /* buttons: array of labels; resolves to the index clicked (-1 on Escape) */
    choose: function (text, title, choices) { return show({ text: text, title: title, choices: choices }); },
    /* arbitrary content node instead of text; resolves like choose */
    custom: function (node, title, choices) { return show({ node: node, title: title, choices: choices || ['Close'] }); },
    isOpen: function () { return open; }
  };
  window.Dlg = Dlg;
  var tt;
  window.toast = function (t) {
    var el = document.getElementById('toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; document.getElementById('stage').appendChild(el); }
    el.textContent = t; el.style.display = 'block'; clearTimeout(tt); tt = setTimeout(function () { el.style.display = 'none'; }, 2200);
  };
})();
