import sys
from PIL import Image, ImageDraw, ImageFilter
src=Image.open(sys.argv[1]).convert('RGB'); out=sys.argv[2]
S=1024
TOP=src.getpixel((140,11)); BOT=src.getpixel((140,301))
def bg():
    g=Image.new('RGB',(S,S)); d=ImageDraw.Draw(g)
    for y in range(S):
        t=y/(S-1); d.line([(0,y),(S,y)],fill=tuple(int(TOP[i]*(1-t)+BOT[i]*t) for i in range(3)))
    return g
def feather(size,r):
    m=Image.new('L',size,0); ImageDraw.Draw(m).rectangle([r,r,size[0]-r,size[1]-r],fill=255)
    return m.filter(ImageFilter.GaussianBlur(r/2))
def build(scale_h):
    c=src.crop((6,6,284,312)); w,h=c.size; nh=int(S*scale_h); nw=int(w*nh/h)
    c=c.resize((nw,nh),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,60,2))
    o=bg(); o.paste(c,((S-nw)//2,(S-nh)//2),feather((nw,nh),max(8,int(28*scale_h)))); return o
full=build(0.97); mask=build(0.74)
def save(img,px,name): img.resize((px,px),Image.LANCZOS).save(f'{out}/{name}','PNG',optimize=True)
save(full,512,'icon-512.png'); save(full,192,'icon-192.png'); save(full,180,'apple-touch-icon.png')
save(full,72,'icon-72.png'); save(full,64,'favicon.png')
save(mask,512,'icon-512-maskable.png'); save(mask,192,'icon-192-maskable.png')
print('ok')
