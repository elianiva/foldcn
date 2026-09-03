"""Regenerate the raster icon assets from the brand tile.

Outputs (all under packages/web/public):
  apple-touch-icon.png 180x180 iOS icon (full-bleed, no transparency)
  favicon-48x48.png    48x48 tab icon
  favicon-32x32.png    32x32 tab icon
  favicon.ico          16/32/48 multi-size fallback for browsers and validators

Social cards live under dist/client/og/ and render at build time via
scripts/og-image.ts (takumi), one per page. They are not checked in.

Needs Pillow and the macOS system Arial faces.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
PUBLIC_DIR = HERE.parent / "public"
SUPPLEMENTAL = Path("/System/Library/Fonts/Supplemental")

INK = "#fafafa"
ICON_BG = "#181818"

ARIAL_BOLD = str(SUPPLEMENTAL / "Arial Bold.ttf")


def tile(side: int) -> Image.Image:
    img = Image.new("RGB", (side, side), ICON_BG)
    draw = ImageDraw.Draw(img)
    draw.text(
        (side / 2, side / 2),
        "F",
        font=ImageFont.truetype(ARIAL_BOLD, int(side * 0.56)),
        fill=INK,
        anchor="mm",
    )
    return img


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    tile(180).save(PUBLIC_DIR / "apple-touch-icon.png")
    tile(48).save(PUBLIC_DIR / "favicon-48x48.png")
    tile(32).save(PUBLIC_DIR / "favicon-32x32.png")
    tile(48).save(
        PUBLIC_DIR / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )
    print(f"wrote icon assets to {PUBLIC_DIR}")


if __name__ == "__main__":
    main()
