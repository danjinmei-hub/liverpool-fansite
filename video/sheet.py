import sys,glob
from PIL import Image
files=sys.argv[2:]; out=sys.argv[1]
cols=2; w,h=960,540
rows=(len(files)+cols-1)//cols
s=Image.new("RGB",(w*cols,h*rows))
for i,f in enumerate(files):
    s.paste(Image.open(f).convert("RGB").resize((w,h)),((i%cols)*w,(i//cols)*h))
s.save(out)
