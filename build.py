#!/usr/bin/env python3
"""Assembles dist/wheel-of-fortune.html (single offline file) from src/."""
import os, re, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
S = lambda *p: os.path.join(ROOT, 'src', *p)
def rd(p): return open(p, encoding='utf8').read()
order = ['data/layout.js', 'data/sounds.js', 'data/images.js', 'js/render.js', 'js/dialog.js', 'js/app.js']
extra = sorted(f for f in os.listdir(S('js')) if f.endswith('.js') and ('js/' + f) not in order)
# explicit order for the rest
rest = [f for f in ['core.js', 'fit.js', 'ppt.js', 'art.js', 'audio.js', 'wheel.js', 'anim.js', 'vba.js', 'persist.js', 'extras.js', 'main.js'] if f in extra]
rest += [f for f in extra if f not in rest]
order = order + ['js/' + f for f in rest]
js = '\n;\n'.join(rd(S(p)) for p in order)
css = rd(S('data', 'fonts.css')) + '\n' + rd(S('css', 'app.css'))
NOTICE = ('<!-- Wheel of Fortune Web Edition. Developer: Avi Lindenboim (2026). Based on "Wheel of Fortune for PowerPoint" v6.4 by '
          'Timothy Hsu (Games by Tim), (c) Games by Tim, https://github.com/TimTree/wheel-of-fortune-ppt . Licensed under CC BY-NC-SA 4.0: '
          'https://creativecommons.org/licenses/by-nc-sa/4.0/ . Changes: rebuilt as a browser app, redrawn wheel and logo, new features. '
          '"Wheel of Fortune" is a registered trademark of Califon Productions, Inc, which is not involved with and does not endorse this project. -->')
html = ('<!doctype html>' + NOTICE + '<html lang="en"><head><meta charset="utf-8">'
        '<meta name="author" content="Avi Lindenboim"><meta name="description" content="A free browser version of the Wheel of Fortune classroom game, based on Games by Tim.">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Wheel of Fortune Web Edition</title><style>' + css + '</style></head>'
        '<body><div id="app"><div id="stage"></div></div><script>' + js + '</script></body></html>')
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
out = os.path.join(ROOT, 'dist', 'wheel-of-fortune.html')
open(out, 'w', encoding='utf8').write(html)
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf8').write(html)   # GitHub Pages serves this file
open(os.path.join(ROOT, '.nojekyll'), 'w').write('')
print('built', out, len(html) // 1024, 'KB; modules:', len(order))

# artifact variant: the host wraps the page in its own document skeleton
art = ('<title>Wheel of Fortune Web Edition</title><style>:root{color-scheme:dark}' + css + '</style>'
       '<div id="app"><div id="stage"></div></div><script>' + js + '</script>')
open(os.path.join(ROOT, 'dist', 'artifact.html'), 'w', encoding='utf8').write(art)
print('built artifact.html', len(art) // 1024, 'KB')
