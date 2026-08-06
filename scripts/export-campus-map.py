from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parents[1]
TILE_ROOT = ROOT / "public" / "campus-map" / "2_5d" / "2"
OUTPUT_ROOT = ROOT.parent / "figma-assets"
TILE_SIZE = 512
SOURCE_SIZE = (1792, 908)
CANVAS_SIZE = (1920, 1080)


def stitch_tiles() -> Image.Image:
    canvas = Image.new("RGB", (4 * TILE_SIZE, 2 * TILE_SIZE), "#061225")
    for x in range(4):
        for y in range(2):
            tile_path = TILE_ROOT / str(x) / f"{y}.webp"
            with Image.open(tile_path) as tile:
                canvas.paste(tile.convert("RGB"), (x * TILE_SIZE, y * TILE_SIZE))
    return canvas.crop((0, 0, *SOURCE_SIZE))


def fit_1920(image: Image.Image) -> Image.Image:
    return ImageOps.fit(
        image,
        CANVAS_SIZE,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )


def cockpit_tint(image: Image.Image) -> Image.Image:
    toned = ImageEnhance.Color(image).enhance(0.88)
    toned = ImageEnhance.Contrast(toned).enhance(1.12)
    overlay = Image.new("RGBA", CANVAS_SIZE, (3, 25, 48, 54))
    return Image.alpha_composite(toned.convert("RGBA"), overlay).convert("RGB")


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    clean = fit_1920(stitch_tiles())
    clean.save(OUTPUT_ROOT / "real-campus-map-1920x1080.png", optimize=True)
    cockpit_tint(clean).save(
        OUTPUT_ROOT / "real-campus-map-cockpit-1920x1080.jpg",
        quality=92,
        optimize=True,
    )


if __name__ == "__main__":
    main()
