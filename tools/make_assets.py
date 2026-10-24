"""Builds src/data/{layout.js,fonts.css,sounds.js} from the extracted blueprint + media.
Usage: python3 -I make_assets.py <layout2.json> <media_dir> <fonts_node_modules>"""
import json, sys, os, base64, subprocess, re
LAY, MEDIA, FONTS = sys.argv[1], sys.argv[2], sys.argv[3]
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
L = json.load(open(LAY))

def r1(v): return round(v, 1) if isinstance(v, float) else v
def adjnum(f):
    m = re.search(r'val (-?\d+)', f or ''); return int(m.group(1)) if m else None

def compact_fill(f):
    if not f: return None
    if f.get('none'): return {'n': 1}
    if 'blip' in f: return None
    if 'grad' in f:
        return {'g': [[round(s['pos'], 3), s['c'], round(s.get('a', 1), 3)] for s in f['grad']], 'ang': r1(f['ang']), 'path': 1 if f['path'] else 0}
    d = {'c': f['c']}
    if 'a' in f: d['a'] = round(f['a'], 3)
    return d

def compact_line(l):
    if l is None: return None
    if l.get('none'): return {'n': 1}
    d = {'w': round(l['w'], 2)}
    if 'c' in l: d['c'] = l['c']
    if 'a' in l: d['a'] = round(l['a'], 3)
    return d

slides = {}
for n, sl in L.items():
    out = []
    for s in sl['shapes']:
        art = None
        if s['kind'] == 'pic' and not (s.get('img') or '').endswith(('image24.png', 'image20.png', 'image21.png', 'image22.png', 'image23.png')):
            art = 'pic'                   # wheel art + logos get redrawn as vectors at runtime
        if (s.get('fill') or {}).get('blip'):
            art = 'blip'
        o = {'k': {'sp': 's', 'pic': 'p', 'group': 'g', 'cxnSp': 'c', 'graphicFrame': 'f'}[s['kind']], 'n': s['name'], 'x': r1(s['x']), 'y': r1(s['y']), 'w': r1(s['w']), 'h': r1(s['h'])}
        if s.get('par'): o['p'] = s['par']
        if s['kind'] == 'group': o['id'] = s['id']
        if s.get('rot'): o['r'] = r1(s['rot'])
        if s.get('flipH'): o['fx'] = 1
        if s.get('flipV'): o['fy'] = 1
        if s.get('hidden') or (s['kind'] == 'group' and s.get('hidden')): o['hid'] = 1
        if s.get('geom'): o['g'] = s['geom']
        if s.get('adj'):
            o['adj'] = {k: adjnum(v) for k, v in s['adj'].items() if adjnum(v) is not None}
        if s.get('paths'): o['paths'] = s['paths']
        f = compact_fill(s.get('fill'));  l = compact_line(s.get('line'))
        if f: o['f'] = f
        if art: o['art'] = art; o.pop('img', None)
        if art == 'blip': o['ba'] = s['fill'].get('alpha', 1)
        if l: o['l'] = l
        if s.get('glow'): o['gl'] = [round(s['glow']['rad'], 1), s['glow']['c'], round(s['glow'].get('a', 1), 2)]
        if s.get('fontColor'): o['fc'] = s['fontColor']
        if s.get('img') and not art: o['img'] = os.path.basename(s['img'])
        if s.get('text'):
            def rp(r):
                return {k: v for k, v in {'t': r.get('t'), 'sz': r.get('sz'), 'b': r.get('b'), 'i': r.get('i'), 'col': (r.get('col') or {}).get('c'), 'font': r.get('font'), 'sh': r.get('sh'), 'spc': r.get('spc')}.items() if v is not None}
            o['t'] = []
            for p in s['text']:
                pp = {'al': p['al'], 'r': [rp(r) for r in p['runs']]}
                if p.get('e') and not p['runs']: pp['e'] = rp(p['e'])
                o['t'].append(pp)
            for k, kk in (('anchor', 'an'), ('vert', 'vt'), ('ins', 'ins'), ('wrap', 'wr'), ('fscale', 'fs')):
                if s.get(k) is not None: o[kk] = [round(v, 2) for v in s[k]] if k == 'ins' else s[k]
        a = s.get('act')
        if a:
            act = a.get('action') or ''
            m = re.search(r'macro\?name=(.+)', act)
            if m: o['m'] = m.group(1)
            elif 'hlinksldjump' in act and a.get('target'): o['j'] = int(re.search(r'slide(\d+)', a['target']).group(1))
            elif 'lastslideviewed' in act: o['j'] = 'back'
            elif 'jump=nextslide' in act: o['j'] = 'next'
            elif 'jump=previousslide' in act: o['j'] = 'prev'
            elif 'endshow' in act: o['j'] = 'end'
            elif a.get('target', '').startswith('http'): o['u'] = a['target']
        out.append(o)
    slides[n] = out
# ---- Web Edition wording: nothing from the original slideshow's PowerPoint-only screens, update links,
# macro warnings, "more projects" promo or end-of-development notice ships in the layout data.
def shape(sid, name):
    return next((o for o in slides[sid] if o['n'] == name), None)

def set_text(sid, name, lines):
    o = shape(sid, name)
    if not o or not o.get('t'): return
    first = next(r for p in o['t'] for r in p['r'])
    al = o['t'][0]['al']
    o['t'] = [{'al': al, 'r': [dict(first, t=ln)]} for ln in ([lines] if isinstance(lines, str) else lines)]

def retire(sid, name, method=None):
    # hide a shape but keep its slot, so saved games (which record shapes by position) still line up
    for o in slides[sid]:
        if o['n'] == name and (method is None or o.get('m') == method):
            o['hid'] = 1
            for k in ('m', 'u', 'j'): o.pop(k, None)
            for p in o.get('t', []):
                for r in p.get('r', []): r['t'] = ''

def drop(sid, *names):
    slides[sid] = [o for o in slides[sid] if o['n'] not in names]

slides.pop('26', None)                                   # the original's "Important Notice" (end of development) page
drop('1', 'MacroDisabledText', 'MacroBlocker')           # "Macros/active content are disabled" warning
drop('19', 'TextBox 13')                                 # "Before you start your game..." banner
drop('25', 'TextBox 1')                                  # the "Important Notice" button
retire('2', 'GamesByTimButton')
retire('9', 'TextBox 127'); retire('9', 'GamesByTimAttribution'); retire('9', 'Help', 'ExplainGamesByTimAttribution')
set_text('1', 'TextBox 29', 'Web Edition')
set_text('1', 'TextBox 32', 'Web Edition by Avi Lindenboim')
set_text('1', 'TextBox 33', 'Based on © Games by Tim  ~  Credits')
set_text('18', 'TextBox 11', ['Thank you for using', 'Wheel of Fortune Web Edition'])
set_text('18', 'TextBox 12', 'Your game saves automatically in this browser.')
set_text('24', 'TextBox 6', 'Use an up-to-date Chrome, Edge, Firefox or Safari.')
set_text('24', 'TextBox 9', ['Everything runs inside your browser.', 'Nothing is uploaded anywhere.'])
set_text('25', 'TextBox 33', 'Wheel of Fortune Web Edition')
set_text('25', 'TextBox 37', ['Legal', '\u201CWheel of Fortune\u201D is a registered trademark of Califon Productions, Inc, which was not involved in the production of, and does not endorse, this product. For more information about the game show, visit www.wheeloffortune.com.'])
set_text('25', 'TextBox 36', 'Developer: Avi Lindenboim')
set_text('25', 'TextBox 34', 'The Original')
set_text('25', 'TextBox 35', 'Special Thanks')
set_text('25', 'TextBox 39', 'Wheel of Fortune Web Edition is an adaptation of Wheel of Fortune for PowerPoint by Timothy Hsu (Games by Tim), © Games by Tim, and is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.')
for sid, shapes in slides.items():                       # no links out to the original author's site
    for o in shapes:
        if 'gamesbytim' in o.get('u', ''): del o['u']

js = 'window.WOF_LAYOUT=' + json.dumps(slides, separators=(',', ':'), ensure_ascii=False) + ';\n'
open(os.path.join(OUT, 'layout.js'), 'w', encoding='utf8').write(js)
print('layout.js', len(js) // 1024, 'KB', {k: len(v) for k, v in slides.items()})

# ---- fonts (base64 woff2)
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
css = ''
for fam, folder, weights, subs in (('Josefin Sans', 'josefin-sans', (400, 700), ('latin', 'latin-ext')), ('Alfa Slab One', 'alfa-slab-one', (400,), ('latin',))):
    for w in weights:
        for sub in subs:
            p = os.path.join(FONTS, '@fontsource', folder, 'files', '%s-%s-%d-normal.woff2' % (folder, sub, w))
            if not os.path.exists(p): continue
            rng = {'latin': 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
                   'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'}[sub]
            css += "@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s;}\n" % (fam, w, b64(p), rng)
open(os.path.join(OUT, 'fonts.css'), 'w').write(css)
print('fonts.css', len(css) // 1024, 'KB')

# ---- sounds (wav -> mp3, base64)
names = {1: 'GuessLetterCorrect', 2: 'LoadPuzzleChime', 3: 'GuessLetterWrong', 4: 'SpinWheel', 5: 'FinalSpinAlert', 6: 'BonusCountdown', 7: 'SolvePuzzleChime', 8: 'TripleTossUpSolve'}
snd = {}
tmp = os.path.join(os.path.dirname(__file__), '_tmp'); os.makedirs(tmp, exist_ok=True)
for i, nm in names.items():
    src = os.path.join(MEDIA, 'audio%d.wav' % i); dst = os.path.join(tmp, nm + '.mp3')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-ac', '2', '-b:a', '96k', dst], check=True)
    snd[nm] = 'data:audio/mpeg;base64,' + b64(dst)
js = 'window.WOF_SOUNDS=' + json.dumps(snd) + ';\n'
open(os.path.join(OUT, 'sounds.js'), 'w').write(js)
print('sounds.js', len(js) // 1024, 'KB')

# ---- images kept as bitmaps: How-To screenshots (20-23, replaced by fresh web screenshots when tools/screens/*.png exist) + CC badge (24)
imgs = {}
SHOTS = os.path.join(os.path.dirname(__file__), 'screens')
for n in (20, 21, 22, 23, 24):
    name = 'image%d.png' % n
    p = os.path.join(SHOTS, name) if os.path.exists(os.path.join(SHOTS, name)) else os.path.join(MEDIA, name)
    if n == 24:
        imgs[name] = 'data:image/png;base64,' + b64(p)
    else:
        import io
        from PIL import Image
        buf = io.BytesIO(); Image.open(p).convert('RGB').resize((960, 540), Image.LANCZOS).save(buf, 'JPEG', quality=86, optimize=True)
        imgs[name] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
js = 'window.WOF_IMAGES=' + json.dumps(imgs) + ';\n'
open(os.path.join(OUT, 'images.js'), 'w').write(js)
print('images.js', len(js) // 1024, 'KB')
