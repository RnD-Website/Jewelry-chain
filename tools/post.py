# Photographic finish for raw three.js renders: crop, tilt-shift, vignette, grade, grain.
import sys, glob, os
import numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
rng = np.random.default_rng(7)
def finish(im, tilt=True, vig=0.35, grain=5.0, warm=1.0):
    im = im.convert('RGB')
    w, h = im.size
    if tilt:
        blur = im.filter(ImageFilter.GaussianBlur(7))
        y = np.linspace(0, 1, h)[:, None]
        m = np.clip((0.28 - y) / 0.28, 0, 1) ** 1.2 + np.clip((y - 0.86) / 0.14, 0, 1) * 0.7
        m = np.repeat(m, w, 1)
        a = np.array(im, float) * (1 - m[..., None]) + np.array(blur, float) * m[..., None]
    else:
        a = np.array(im, float)
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    a *= (1 - vig * np.clip(r - 0.45, 0, 1) ** 1.6)[..., None]
    a[..., 0] *= 1.0 + 0.03 * warm; a[..., 2] *= 1.0 - 0.04 * warm
    a += rng.normal(0, grain, a.shape)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
for f in sorted(glob.glob(src + '/*.png')):
    n = os.path.basename(f)[:-4]
    im = Image.open(f)
    if n.startswith('prod_'):
        im = finish(im.crop((50, 110, 1050, 1290)), tilt=True)
        im.save(f'{dst}/{n}.jpg', quality=86, optimize=True, progressive=True)
    elif n.startswith('dark_'):
        im = finish(im, tilt=True, vig=0.5)
        im.save(f'{dst}/{n}.jpg', quality=84, optimize=True, progressive=True)
    else:  # tiles: light finish
        im = finish(im, tilt=False, vig=0.08, grain=2.5, warm=0.4).resize((640, 640), Image.LANCZOS)
        im.save(f'{dst}/{n}.jpg', quality=88, optimize=True, progressive=True)
    print(n, im.size)
