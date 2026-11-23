import sys
from PIL import Image, ImageDraw, ImageFont
for n in (192, 512):
    im = Image.new('RGB', (n, n), '#0f2f5c'); d = ImageDraw.Draw(im)
    f = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', int(n * 0.3))
    w = d.textlength('EVAU', font=f); d.text(((n - w) / 2, n * 0.33), 'EVAU', fill='white', font=f)
    d.rectangle([n * 0.2, n * 0.7, n * 0.8, n * 0.74], fill='#f5a300')
    im.save(f'{sys.argv[1]}/icons/icon-{n}.png')
