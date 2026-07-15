from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGB', (size, size), color = (59, 130, 246)) # primary blue
    d = ImageDraw.Draw(img)
    d.text((size//3, size//2.5), "Sense", fill=(255,255,255))
    img.save(filename)

create_icon(192, 'public/pwa-192x192.png')
create_icon(512, 'public/pwa-512x512.png')
create_icon(512, 'public/apple-touch-icon.png')
create_icon(512, 'public/masked-icon.png')
