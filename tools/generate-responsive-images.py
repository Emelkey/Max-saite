#!/usr/bin/env python3
"""Generate tracked responsive AVIF/WebP derivatives for public raster assets.

The source image is never upscaled. Widths larger than the source are omitted and
the original width is included as the final candidate when needed.
"""

from __future__ import annotations

import hashlib
import re
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
OUTPUT = ASSETS / "responsive"
TARGET_WIDTHS = (480, 768, 1200, 1600)
PUBLIC_HTML_SKIP = {".git", ".github", "node_modules", "release", "artifacts", "docs", "tools", "tests", "seo"}
RASTER_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".avif"}


def public_html_files(directory: Path):
    for child in directory.iterdir():
        if child.name in PUBLIC_HTML_SKIP:
            continue
        if child.is_dir():
            yield from public_html_files(child)
        elif child.suffix == ".html":
            yield child


def resolve_asset(html_file: Path, src: str) -> Path | None:
    clean = re.split(r"[?#]", src, maxsplit=1)[0]
    if clean.startswith(("http://", "https://", "data:")):
        return None
    candidate = ROOT / clean.lstrip("/") if clean.startswith("/") else (html_file.parent / clean)
    try:
        candidate = candidate.resolve()
        candidate.relative_to(ASSETS.resolve())
    except (ValueError, OSError):
        return None
    return candidate if candidate.suffix.lower() in RASTER_SUFFIXES and candidate.exists() else None


def referenced_sources() -> set[Path]:
    sources: set[Path] = set()
    for html_file in public_html_files(ROOT):
        html = html_file.read_text(encoding="utf-8")
        for match in re.finditer(r"<img\b[^>]*\bsrc=[\"']([^\"']+)[\"'][^>]*>", html, flags=re.I):
            source = resolve_asset(html_file, match.group(1))
            if source:
                sources.add(source)
    return sources


def candidate_widths(source_width: int) -> tuple[int, ...]:
    widths = [width for width in TARGET_WIDTHS if width <= source_width]
    if not widths or widths[-1] != source_width:
        widths.append(source_width)
    return tuple(sorted(set(widths)))


def output_path(source: Path, width: int, suffix: str) -> Path:
    relative = source.relative_to(ASSETS).with_suffix("")
    return OUTPUT / relative.parent / f"{relative.name}-{width}.{suffix}"


def sha256(file: Path) -> str:
    """Bind the manifest to bytes, not checkout-dependent filesystem times."""
    return hashlib.sha256(file.read_bytes()).hexdigest()


def save_variant(image: Image.Image, destination: Path, width: int, source_width: int, source_height: int):
    height = max(1, round(source_height * width / source_width))
    resized = image if width == source_width else image.resize((width, height), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.suffix == ".avif":
        resized.save(destination, "AVIF", quality=58, speed=6)
    else:
        resized.save(destination, "WEBP", quality=82, method=6)


def main() -> None:
    sources = sorted(referenced_sources())
    generated = 0
    manifest_rows = []
    for source in sources:
        with Image.open(source) as raw:
            image = ImageOps.exif_transpose(raw)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            source_width, source_height = image.size
            widths = candidate_widths(source_width)
            variant_hashes = {}
            for width in widths:
                for suffix in ("avif", "webp"):
                    destination = output_path(source, width, suffix)
                    save_variant(image, destination, width, source_width, source_height)
                    variant_hashes[destination.relative_to(ROOT).as_posix()] = sha256(destination)
                    generated += 1
            manifest_rows.append(
                {
                    "source": source.relative_to(ROOT).as_posix(),
                    "sourceSha256": sha256(source),
                    "width": source_width,
                    "height": source_height,
                    "candidates": list(widths),
                    "variantSha256": variant_hashes,
                }
            )

    import json

    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {generated} files for {len(sources)} referenced raster sources.")


if __name__ == "__main__":
    main()
