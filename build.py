"""Build the static portfolio and its folder-driven gallery manifest."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
CONTENT = ROOT / "content"
OUT = ROOT / "_site"
CATEGORIES = ["events", "branding", "couples-family", "studio-portraits", "products"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
RAW_EXTENSIONS = {
    ".3fr", ".ari", ".arw", ".bay", ".cap", ".cr2", ".cr3", ".dcs", ".dcr",
    ".dng", ".drf", ".eip", ".erf", ".fff", ".gpr", ".iiq", ".k25", ".kdc",
    ".mdc", ".mef", ".mos", ".mrw", ".nef", ".nrw", ".obm", ".orf", ".pef",
    ".ptx", ".pxn", ".r3d", ".raf", ".raw", ".rwl", ".rw2", ".rwz", ".sr2",
    ".srf", ".srw", ".sti",
}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "shoot"


def read_fields(path: Path) -> dict[str, str]:
    fields: dict[str, str] = {}
    if not path.exists():
        return fields
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        fields[key.strip().lower()] = value.strip()
    return fields


def make_site() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for name in ("index.html", "styles.css", "app.js", "kalyan_reel_cover.png"):
        shutil.copy2(ROOT / name, OUT / name)

    gallery_data: dict[str, object] = {
        "about": (CONTENT / "about.txt").read_text(encoding="utf-8").strip(),
        "contact": read_fields(CONTENT / "contact.txt"),
        "shoots": {},
    }
    shoots: dict[str, list[dict[str, object]]] = {}
    for category in CATEGORIES:
        category_dir = CONTENT / category
        entries: list[dict[str, object]] = []
        if category_dir.is_dir():
            for shoot_dir in sorted(category_dir.iterdir(), key=lambda p: p.name.casefold()):
                if not shoot_dir.is_dir() or shoot_dir.name.startswith("_"):
                    continue
                fields = read_fields(shoot_dir / "shoot.txt")
                title = fields.get("title", shoot_dir.name.replace("-", " ").replace("_", " ").title())
                image_files = sorted(
                    (p for p in shoot_dir.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS | RAW_EXTENSIONS),
                    key=lambda p: str(p.relative_to(shoot_dir)).casefold(),
                )
                published_images: list[dict[str, str]] = []
                for image_file in image_files:
                    relative = image_file.relative_to(shoot_dir)
                    target_dir = OUT / "images" / category / slugify(shoot_dir.name) / relative.parent
                    target_dir.mkdir(parents=True, exist_ok=True)
                    if image_file.suffix.lower() in RAW_EXTENSIONS:
                        try:
                            import rawpy  # type: ignore[import-not-found]
                            from PIL import Image  # type: ignore[import-not-found]
                        except ImportError as error:
                            raise RuntimeError("RAW photos need rawpy and Pillow; install requirements.txt") from error
                        output_name = image_file.stem + ".jpg"
                        output_path = target_dir / output_name
                        with rawpy.imread(str(image_file)) as raw:
                            rgb = raw.postprocess(use_camera_wb=True, output_bps=8)
                        Image.fromarray(rgb).save(output_path, "JPEG", quality=92, optimize=True)
                    else:
                        output_name = image_file.name
                        output_path = target_dir / output_name
                        shutil.copy2(image_file, output_path)
                    site_path = output_path.relative_to(OUT).as_posix()
                    caption = ""
                    published_images.append({
                        "src": "/".join(quote(part) for part in site_path.split("/")),
                        "alt": f"{title} — {image_file.stem.replace('-', ' ').replace('_', ' ')}",
                        "caption": caption,
                    })
                entries.append({
                    "slug": slugify(shoot_dir.name),
                    "title": title,
                    "location": fields.get("location", ""),
                    "date": fields.get("date", ""),
                    "description": fields.get("description", ""),
                    "images": published_images,
                })
        shoots[category] = entries
    gallery_data["shoots"] = shoots
    serialized = json.dumps(gallery_data, ensure_ascii=False, indent=2)
    (OUT / "gallery-data.json").write_text(serialized, encoding="utf-8")
    (OUT / "gallery-data.js").write_text(f"window.SITE_DATA = {serialized};\n", encoding="utf-8")


if __name__ == "__main__":
    make_site()
