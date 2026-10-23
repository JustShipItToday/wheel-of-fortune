import sys, re, json, xml.etree.ElementTree as ET
ROOT = sys.argv[1]; OUT = sys.argv[2]
NS = {'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
A='{%s}'%NS['a']; P='{%s}'%NS['p']; R='{%s}'%NS['r']
E=9525.0
# theme colours
th = ET.parse(ROOT+'/ppt/theme/theme1.xml').getroot()
scheme={}
cs = th.find('.//a:clrScheme',NS)
for c in cs:
    tag=c.tag.replace(A,'')
    ch=c[0]
    scheme[tag]= ch.get('val') if ch.tag==A+'srgbClr' else ch.get('lastClr')
mapn={'bg1':'dk1','tx1':'lt1','bg2':'dk2','tx2':'lt2'}
def clr(el):
    if el is None: return None
    ch=el[0] if len(el) else None
    if ch is None: return None
    if ch.tag==A+'srgbClr': v=ch.get('val')
    elif ch.tag==A+'schemeClr':
        n=ch.get('val'); n=mapn.get(n,n); v=scheme.get(n,'888888')
    elif ch.tag==A+'sysClr': v=ch.get('lastClr') or '000000'
    else: return None
    alpha=None; lm=None; lo=None
    for m in ch:
        if m.tag==A+'alpha': alpha=int(m.get('val'))/100000
        if m.tag==A+'lumMod': lm=int(m.get('val'))/100000
        if m.tag==A+'lumOff': lo=int(m.get('val'))/100000
    if lm is not None or lo is not None:
        r,g,b=[int(v[i:i+2],16)/255 for i in (0,2,4)]
        import colorsys
        h,l,s=colorsys.rgb_to_hls(r,g,b)
        l=min(1,max(0,l*(lm if lm is not None else 1)+(lo or 0)))
        r,g,b=colorsys.hls_to_rgb(h,l,s); v='%02X%02X%02X'%(round(r*255),round(g*255),round(b*255))
    return {'c':'#'+v, **({'a':alpha} if alpha is not None else {})}
def fill(spPr):
    if spPr is None: return None
    if spPr.find('a:noFill',NS) is not None: return {'none':True}
    s=spPr.find('a:solidFill',NS)
    if s is not None: return clr(s)
    g=spPr.find('a:gradFill',NS)
    if g is not None:
        stops=[]
        for gs in g.findall('.//a:gs',NS):
            c=clr(gs); 
            if c: stops.append({'pos':int(gs.get('pos'))/100000, **c})
        lin=g.find('a:lin',NS)
        return {'grad':stops,'ang':int(lin.get('ang'))/60000 if lin is not None else 0,'path':g.find('a:path',NS) is not None}
    b=spPr.find('a:blipFill',NS)
    if b is not None:
        bl=b.find('a:blip',NS); am=bl.find('a:alphaModFix',NS)
        return {'blip':bl.get(R+'embed'),'alpha':(int(am.get('amt','100000'))/100000 if am is not None else 1)}
    return None
def line(spPr):
    if spPr is None: return None
    ln=spPr.find('a:ln',NS)
    if ln is None: return None
    if ln.find('a:noFill',NS) is not None: return {'none':True}
    s=ln.find('a:solidFill',NS)
    d={'w':int(ln.get('w','12700'))/E}
    if s is not None: d.update(clr(s) or {})
    return d

import math
def cust_path(spPr):
    cg=spPr.find('a:custGeom',NS)
    if cg is None: return None
    out=[]
    for p in cg.findall('.//a:path',NS):
        pw=float(p.get('w','0') or 0); ph=float(p.get('h','0') or 0)
        d=[]; cur=[0,0]
        def pt(e): return (float(e.get('x')),float(e.get('y')))
        for c in p:
            t=c.tag.replace(A,'')
            if t=='moveTo':
                x,y=pt(c[0]); d.append('M%g %g'%(x,y)); cur=[x,y]
            elif t=='lnTo':
                x,y=pt(c[0]); d.append('L%g %g'%(x,y)); cur=[x,y]
            elif t=='cubicBezTo':
                ps=[pt(e) for e in c]; d.append('C%g %g %g %g %g %g'%(ps[0]+ps[1]+ps[2])); cur=list(ps[2])
            elif t=='quadBezTo':
                ps=[pt(e) for e in c]; d.append('Q%g %g %g %g'%(ps[0]+ps[1])); cur=list(ps[1])
            elif t=='arcTo':
                wR=float(c.get('wR')); hR=float(c.get('hR')); st=float(c.get('stAng'))/60000; sw=float(c.get('swAng'))/60000
                def par(a):
                    a=math.radians(a); return math.atan2(wR*math.sin(a),hR*math.cos(a))
                t1=par(st); t2=par(st+sw)
                if sw>0 and t2<t1: t2+=2*math.pi
                if sw<0 and t2>t1: t2-=2*math.pi
                cx0=cur[0]-wR*math.cos(t1); cy0=cur[1]-hR*math.sin(t1)
                ex=cx0+wR*math.cos(t2); ey=cy0+hR*math.sin(t2)
                large=1 if abs(sw)>180 else 0; sweep=1 if sw>0 else 0
                d.append('A%g %g 0 %d %d %g %g'%(wR,hR,large,sweep,ex,ey)); cur=[ex,ey]
            elif t=='close': d.append('Z')
        out.append({'w':pw,'h':ph,'d':' '.join(d)})
    return out

def rprops(rp):
    d={}
    if rp is None: return d
    if rp.get('sz'): d['sz']=int(rp.get('sz'))/100
    if rp.get('b')=='1': d['b']=1
    if rp.get('i')=='1': d['i']=1
    if rp.get('spc'): d['spc']=int(rp.get('spc'))/100
    f=rp.find('a:solidFill',NS)
    if f is not None: d['col']=clr(f)
    lat=rp.find('a:latin',NS)
    if lat is not None: d['font']=lat.get('typeface')
    if rp.find('a:effectLst/a:outerShdw',NS) is not None: d['sh']=1
    return d
def text(tx):
    if tx is None: return None
    paras=[]
    for p in tx.findall('a:p',NS):
        runs=[]
        ppr=p.find('a:pPr',NS)
        al=ppr.get('algn') if ppr is not None else None
        for r in p.findall('a:r',NS):
            rp=r.find('a:rPr',NS); t=r.find('a:t',NS).text or ''
            d={'t':t}
            d.update(rprops(rp))
            if False:
                if rp.get('sz'): d['sz']=int(rp.get('sz'))/100
                if rp.get('b')=='1': d['b']=1
                if rp.get('i')=='1': d['i']=1
                f=rp.find('a:solidFill',NS)
                if f is not None: d['col']=clr(f)
                lat=rp.find('a:latin',NS)
                if lat is not None: d['font']=lat.get('typeface')
            runs.append(d)
        pd={'al':al,'runs':runs}
        ep=p.find('a:endParaRPr',NS)
        if ep is not None: pd['e']=rprops(ep)
        paras.append(pd)
    return paras
def walk(node, rels, out, tf, par=None):
    # tf: (ox,oy,sx,sy) maps child coords to slide px
    ox,oy,sx,sy=tf
    for el in node:
        tag=el.tag.replace(P,'')
        if tag not in ('sp','pic','grpSp','cxnSp','graphicFrame'): continue
        nv = el.find('.//p:cNvPr',NS)
        name=nv.get('name') if nv is not None else ''
        hidden = nv is not None and nv.get('hidden')=='1'
        sid = nv.get('id') if nv is not None else ''
        act=None
        if nv is not None:
            h=nv.find('a:hlinkClick',NS)
            if h is not None:
                act={'action':h.get('action'),'rid':h.get(R+'id')}
                if act['rid'] and act['rid'] in rels: act['target']=rels[act['rid']]
        if tag=='grpSp':
            gp=el.find('p:grpSpPr',NS); xf=gp.find('a:xfrm',NS)
            o=xf.find('a:off',NS); e=xf.find('a:ext',NS); co=xf.find('a:chOff',NS); ce=xf.find('a:chExt',NS)
            gx,gy,gw,gh=[int(v)/E for v in (o.get('x'),o.get('y'),e.get('cx'),e.get('cy'))]
            cx,cy,cw,ch=[int(v)/E for v in (co.get('x'),co.get('y'),ce.get('cx'),ce.get('cy'))]
            nsx=gw/cw if cw else 1; nsy=gh/ch if ch else 1
            ntf=(ox+(gx-cx*nsx)*sx, oy+(gy-cy*nsy)*sy, sx*nsx, sy*nsy)
            # absolute group box
            out.append({'kind':'group','name':name,'id':sid,'par':par,'hidden':hidden,'x':ox+gx*sx if False else ox+(gx)*sx,'y':oy+gy*sy,'w':gw*sx,'h':gh*sy,'rot':int(xf.get('rot','0'))/60000, **({'act':act} if act else {})})
            walk(el, rels, out, ntf, name+'#'+sid)
            continue
        spPr=el.find('p:spPr',NS)
        xf=spPr.find('a:xfrm',NS) if spPr is not None else None
        if xf is None: 
            continue
        o=xf.find('a:off',NS); e=xf.find('a:ext',NS)
        x=ox+int(o.get('x'))/E*sx; y=oy+int(o.get('y'))/E*sy
        w=int(e.get('cx'))/E*sx; h=int(e.get('cy'))/E*sy
        d={'kind':tag,'name':name,'id':sid,'par':par,'x':round(x,2),'y':round(y,2),'w':round(w,2),'h':round(h,2),
           'rot':int(xf.get('rot','0'))/60000,'flipH':xf.get('flipH')=='1','flipV':xf.get('flipV')=='1'}
        if hidden: d['hidden']=True
        fr=el.find('p:style/a:fontRef',NS)
        if fr is not None and len(fr):
            fc=clr(fr)
            if fc: d['fontColor']=fc['c']
        g=spPr.find('a:prstGeom',NS)
        if g is not None:
            d['geom']=g.get('prst')
            av={gd.get('name'):gd.get('fmla') for gd in g.findall('.//a:gd',NS)}
            if av: d['adj']=av
        elif spPr.find('a:custGeom',NS) is not None:
            d['geom']='cust'; d['paths']=cust_path(spPr)
        f=fill(spPr)
        if f: d['fill']=f
        l=line(spPr)
        if l: d['line']=l
        gw=spPr.find('a:effectLst/a:glow',NS)
        if gw is not None:
            gc=clr(gw)
            if gc: d['glow']={'rad':int(gw.get('rad','0'))/E,**gc}
        if tag=='pic':
            bl=el.find('.//a:blip',NS)
            if bl is not None:
                rid=bl.get(R+'embed'); d['img']=rels.get(rid)
            d['kind']='pic'
        tb=el.find('p:txBody',NS)
        if tb is not None:
            t=text(tb)
            if any(r['runs'] or r.get('e') for r in t):
                d['text']=t
                bp=tb.find('a:bodyPr',NS)
                if bp is not None:
                    d['anchor']=bp.get('anchor'); d['vert']=bp.get('vert')
                    d['ins']=[int(bp.get(k,dv))/E for k,dv in (('lIns','91440'),('tIns','45720'),('rIns','91440'),('bIns','45720'))]
                    d['wrap']=bp.get('wrap','square')
                    na=bp.find('a:normAutofit',NS)
                    if na is not None and na.get('fontScale'): d['fscale']=int(na.get('fontScale'))/100000
        if act: d['act']=act
        out.append(d)
slides={}
pres=ET.parse(ROOT+'/ppt/presentation.xml').getroot()
for n in range(1,27):
    f='%s/ppt/slides/slide%d.xml'%(ROOT,n)
    rel=ET.parse('%s/ppt/slides/_rels/slide%d.xml.rels'%(ROOT,n)).getroot()
    rels={r.get('Id'):r.get('Target') for r in rel}
    root=ET.parse(f).getroot()
    tree=root.find('p:cSld/p:spTree',NS)
    out=[]
    walk(tree, rels, out, (0,0,1,1))
    bg=root.find('p:cSld/p:bg',NS)
    slides[n]={'shapes':out,'bg':fill(bg.find('p:bgPr',NS)) if bg is not None and bg.find('p:bgPr',NS) is not None else None,
               'hiddenSlide': root.get('show')=='0'}
json.dump(slides,open(OUT,'w'))
print({k:len(v['shapes']) for k,v in slides.items()})
