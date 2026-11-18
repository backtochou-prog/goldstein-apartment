#!/usr/bin/env python3
"""Reference-library tool for the Goldstein apartment project.

Pulls frames from a video file you are allowed to use, builds contact sheets,
and records every image with its source and timestamp in
reference/catalogue.csv.

Needs Python 3.10+, Pillow, and ffmpeg/ffprobe on PATH. Works on Linux and
Windows. It never decrypts, never downloads and never edits the source video.

Commands (run `refs.py <command> -h` for details):
  add-source     register a video, a web page or a set of stills in reference/sources.csv
  extract        save single frames at exact timecodes, full resolution, lossless PNG
  scan           sample a time range every N seconds into a scratch folder + contact sheet
  shots          detect camera cuts in a range, save one frame per shot + contact sheet
  import-stills  add existing images (promo stills, set photos, your screenshots) to the catalogue
  tag            change the categories, camera setup, visible areas, status or note of catalogued frames
  sheet          build a contact sheet from catalogued frames (filter by scene, category or setup)
  similar        group catalogued frames that look like the same camera setup
  list           print the catalogue, filtered
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: pip install Pillow")

# GOLDSTEIN_ROOT lets the self-test run in a throwaway folder.
ROOT = Path(os.environ.get("GOLDSTEIN_ROOT") or Path(__file__).resolve().parents[2]).resolve()
REF = ROOT / "reference"
SOURCES = REF / "sources.csv"
CATALOGUE = REF / "catalogue.csv"

SOURCE_FIELDS = ["source_id", "kind", "title", "origin", "url_or_path", "rights_note",
                 "width", "height", "fps", "duration_s", "sar", "color_transfer",
                 "size_bytes", "sha256_head", "registered", "note"]
FRAME_FIELDS = ["frame_id", "source_id", "scene", "timecode", "seconds", "frame_number",
                "width", "height", "file", "categories", "setup", "views", "status",
                "evidence_tier", "note", "created"]

CATEGORIES = {
    "architecture", "layout", "doors", "windows", "walls", "ceiling", "floor", "rugs",
    "furniture", "fireplace", "kitchen", "bedroom", "lighting", "practicals", "decor",
    "props", "textiles", "exterior", "window-view", "queenie-costume", "queenie-hair",
    "queenie-motion", "queenie-face", "tina", "sound-source", "scale-anchor", "other",
}
STATUSES = {"unreviewed", "useful", "key", "rejected"}
# 1 = visible in a film frame or an official film still; 2 = described in the screenplay;
# 3 = documented by an independent / production source (set photo, interview, prop maker);
# 4 = unknown or inferred (must never drive modelling on its own).
TIERS = {"1", "2", "3", "4"}
SCENE_RE = re.compile(r"^(SC\d{2,3}[A-Z]?|SET|PROMO|BTS|OTHER)$")


# ---------------------------------------------------------------- helpers
def die(msg: str) -> None:
    sys.exit(f"refs: {msg}")


def need(tool: str) -> str:
    path = shutil.which(tool)
    if not path:
        die(f"{tool} not found on PATH")
    return path


def now() -> str:
    return dt.datetime.now().replace(microsecond=0).isoformat()


def read_csv(path: Path, fields: list[str]) -> list[dict]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    for r in rows:
        for f in fields:
            r.setdefault(f, "")
    return rows


def write_csv(path: Path, fields: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    tmp.replace(path)


def parse_tc(text: str) -> float:
    """Accept 1:02:03.5, 02:03.5, 123.5, or 01:02:03:12@24 (frames after last colon with @fps)."""
    text = text.strip()
    m = re.fullmatch(r"(\d+):(\d{1,2}):(\d{1,2}):(\d{1,2})@([\d.]+)", text)
    if m:
        h, mi, s, f, fps = m.groups()
        return int(h) * 3600 + int(mi) * 60 + int(s) + int(f) / float(fps)
    parts = text.split(":")
    try:
        nums = [float(p) for p in parts]
    except ValueError:
        die(f"bad timecode '{text}'")
    secs = 0.0
    for n in nums:
        secs = secs * 60 + n
    return secs


def fmt_tc(secs: float) -> str:
    h = int(secs // 3600)
    m = int(secs % 3600 // 60)
    s = secs - h * 3600 - m * 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def tc_slug(secs: float) -> str:
    return fmt_tc(secs).replace(":", "-").replace(".", "_")


def check_categories(text: str) -> str:
    if not text:
        return ""
    cats = [c.strip() for c in text.split(";") if c.strip()]
    bad = [c for c in cats if c not in CATEGORIES]
    if bad:
        die(f"unknown categories {bad}; allowed: {sorted(CATEGORIES)}")
    return ";".join(cats)


def check_scene(scene: str) -> str:
    if not SCENE_RE.match(scene):
        die("scene must be SC<number> (screenplay scene, e.g. SC41), SET, PROMO, BTS or OTHER")
    return scene


def probe(path: Path) -> dict:
    need("ffprobe")
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate,avg_frame_rate,sample_aspect_ratio,color_transfer,codec_name"
         ":format=duration,size", "-of", "json", str(path)],
        capture_output=True, text=True)
    if out.returncode != 0:
        die(f"ffprobe failed: {out.stderr.strip()}")
    data = json.loads(out.stdout)
    if not data.get("streams"):
        die("no video stream found")
    st, fm = data["streams"][0], data.get("format", {})
    num, den = (st.get("avg_frame_rate") or st.get("r_frame_rate") or "0/1").split("/")
    fps = float(num) / float(den) if float(den) else 0.0
    return {
        "width": st.get("width", ""), "height": st.get("height", ""),
        "fps": f"{fps:.6g}", "duration_s": fm.get("duration", ""),
        "sar": st.get("sample_aspect_ratio", "1:1"),
        "color_transfer": st.get("color_transfer", ""),
        "size_bytes": fm.get("size", ""), "codec": st.get("codec_name", ""),
    }


def sha_head(path: Path, limit: int = 64 * 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        h.update(fh.read(limit))
    return h.hexdigest()[:16]


def get_source(source_id: str) -> dict:
    for r in read_csv(SOURCES, SOURCE_FIELDS):
        if r["source_id"] == source_id:
            return r
    die(f"unknown source '{source_id}' (run add-source first)")
    return {}


def video_path(src: dict) -> Path:
    if src["kind"] != "video":
        die(f"source {src['source_id']} is not a video")
    p = Path(src["url_or_path"])
    if not p.exists():
        die(f"video not found at {p} (moved? re-run add-source with --path)")
    return p


def grab(video: Path, secs: float, out: Path, square: bool) -> None:
    """One frame, accurate seek (input seek + decode), lossless PNG, native size."""
    need("ffmpeg")
    out.parent.mkdir(parents=True, exist_ok=True)
    vf = ["-vf", "scale=iw*sar:ih,setsar=1"] if square else []
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{secs:.3f}", "-i", str(video),
           "-frames:v", "1", *vf, "-pix_fmt", "rgb24", str(out)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not out.exists():
        die(f"ffmpeg could not read a frame at {fmt_tc(secs)}: {r.stderr.strip()}")


def font(size: int):
    for name in ("DejaVuSansMono.ttf", "consola.ttf", "Menlo.ttc", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def contact_sheet(items: list[tuple[Path, str]], out: Path, title: str, cols: int = 4,
                  thumb_w: int = 480) -> Path:
    """Sheet = downscaled copies with labels. Originals are never touched."""
    if not items:
        die("nothing to put on the sheet")
    thumbs = []
    for path, label in items:
        im = Image.open(path).convert("RGB")
        im.thumbnail((thumb_w, thumb_w * 2))
        thumbs.append((im, label))
    cell_h = max(t.height for t, _ in thumbs) + 44
    rows = (len(thumbs) + cols - 1) // cols
    pad, head = 12, 56
    sheet = Image.new("RGB", (cols * (thumb_w + pad) + pad, head + rows * (cell_h + pad) + pad), (24, 22, 20))
    draw = ImageDraw.Draw(sheet)
    draw.text((pad, 16), title, fill=(232, 224, 210), font=font(22))
    small = font(15)
    for i, (im, label) in enumerate(thumbs):
        x = pad + (i % cols) * (thumb_w + pad)
        y = head + (i // cols) * (cell_h + pad)
        sheet.paste(im, (x, y))
        draw.text((x, y + im.height + 6), label[:58], fill=(214, 204, 186), font=small)
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=90)
    return out


def next_frame_id(rows: list[dict]) -> str:
    n = 0
    for r in rows:
        m = re.match(r"F(\d+)$", r["frame_id"])
        if m:
            n = max(n, int(m.group(1)))
    return f"F{n + 1:05d}"


def rel(p: Path) -> str:
    try:
        return p.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return str(p)


# ---------------------------------------------------------------- commands
def cmd_add_source(a) -> None:
    rows = read_csv(SOURCES, SOURCE_FIELDS)
    if any(r["source_id"] == a.id for r in rows) and not a.replace:
        die(f"source {a.id} already exists (use --replace to update it)")
    rows = [r for r in rows if r["source_id"] != a.id]
    row = {f: "" for f in SOURCE_FIELDS}
    row.update(source_id=a.id, kind=a.kind, title=a.title, origin=a.origin,
               rights_note=a.rights, registered=now(), note=a.note or "")
    if a.kind == "video":
        if not a.path:
            die("--path is required for a video")
        p = Path(a.path).expanduser().resolve()
        if not p.exists():
            die(f"no such file: {p}")
        info = probe(p)
        row.update({k: info[k] for k in ("width", "height", "fps", "duration_s", "sar",
                                          "color_transfer", "size_bytes")})
        row.update(url_or_path=str(p), sha256_head=sha_head(p))
        if info["color_transfer"] in ("smpte2084", "arib-std-b67"):
            print("note: HDR video. Extracted PNGs will look flat/washed out; colour work must use an SDR source or a proper tone-map.")
        if info["sar"] not in ("1:1", "", "0:1"):
            print(f"note: non-square pixels (SAR {info['sar']}). Use --square with extract/scan to get the true shape.")
    else:
        row["url_or_path"] = a.url or a.path or ""
    rows.append(row)
    write_csv(SOURCES, SOURCE_FIELDS, rows)
    print(f"registered {a.id}: {a.title}")


def cmd_extract(a) -> None:
    src = get_source(a.source)
    video = video_path(src)
    scene = check_scene(a.scene)
    cats = check_categories(a.category or "")
    rows = read_csv(CATALOGUE, FRAME_FIELDS)
    fps = float(src["fps"] or 0) or None
    for tc in a.at:
        secs = parse_tc(tc)
        fid = next_frame_id(rows)
        out = REF / "frames" / scene / f"{fid}_{a.source}_{tc_slug(secs)}.png"
        grab(video, secs, out, a.square)
        with Image.open(out) as im:
            w, h = im.size
        rows.append({
            "frame_id": fid, "source_id": a.source, "scene": scene, "timecode": fmt_tc(secs),
            "seconds": f"{secs:.3f}", "frame_number": str(round(secs * fps)) if fps else "",
            "width": w, "height": h, "file": rel(out), "categories": cats, "setup": a.setup or "",
            "views": a.views or "", "status": "unreviewed", "evidence_tier": "1",
            "note": a.note or "", "created": now()})
        print(f"{fid}  {fmt_tc(secs)}  {w}x{h}  {rel(out)}")
    write_csv(CATALOGUE, FRAME_FIELDS, rows)


def cmd_scan(a) -> None:
    src = get_source(a.source)
    video = video_path(src)
    t0, t1 = parse_tc(a.start), parse_tc(a.end)
    if t1 <= t0:
        die("--to must be after --from")
    folder = REF / "scans" / a.source / f"{tc_slug(t0)}__{tc_slug(t1)}"
    folder.mkdir(parents=True, exist_ok=True)
    items, t = [], t0
    while t <= t1 + 1e-6:
        out = folder / f"{tc_slug(t)}.png"
        grab(video, t, out, a.square)
        items.append((out, fmt_tc(t)))
        t += a.every
    sheet = REF / "sheets" / f"scan_{a.source}_{tc_slug(t0)}__{tc_slug(t1)}.jpg"
    contact_sheet(items, sheet, f"{a.source}  scan {fmt_tc(t0)} - {fmt_tc(t1)} every {a.every}s", a.cols)
    print(f"{len(items)} frames in {rel(folder)}\nsheet: {rel(sheet)}\n"
          "Keep the good ones with:  refs.py extract --source ... --at <timecode> --scene ...")


def cmd_shots(a) -> None:
    src = get_source(a.source)
    video = video_path(src)
    t0, t1 = parse_tc(a.start), parse_tc(a.end)
    need("ffmpeg")
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}", "-i", str(video),
         "-an", "-vf", f"scdet=threshold={a.threshold}", "-f", "null", "-"],
        capture_output=True, text=True)
    cuts = [t0 + float(m) for m in re.findall(r"lavfi\.scd\.time:\s*([\d.]+)", r.stderr)]
    bounds = [t0] + [c for c in cuts if t0 < c < t1] + [t1]
    folder = REF / "scans" / a.source / f"shots_{tc_slug(t0)}__{tc_slug(t1)}"
    folder.mkdir(parents=True, exist_ok=True)
    items, table = [], []
    for i in range(len(bounds) - 1):
        s, e = bounds[i], bounds[i + 1]
        if e - s < a.min_len:
            continue
        mid = (s + e) / 2
        out = folder / f"shot{i + 1:03d}_{tc_slug(mid)}.png"
        grab(video, mid, out, a.square)
        items.append((out, f"#{i + 1} {fmt_tc(s)} +{e - s:.1f}s"))
        table.append({"shot": i + 1, "start": fmt_tc(s), "end": fmt_tc(e), "length_s": f"{e - s:.2f}",
                      "middle": fmt_tc(mid), "file": rel(out)})
    write_csv(folder / "shots.csv", ["shot", "start", "end", "length_s", "middle", "file"], table)
    sheet = REF / "sheets" / f"shots_{a.source}_{tc_slug(t0)}__{tc_slug(t1)}.jpg"
    contact_sheet(items, sheet, f"{a.source}  shots {fmt_tc(t0)} - {fmt_tc(t1)}  ({len(items)} shots)", a.cols)
    print(f"{len(items)} shots (threshold {a.threshold}). list: {rel(folder / 'shots.csv')}\nsheet: {rel(sheet)}")


def cmd_import_stills(a) -> None:
    get_source(a.source)
    scene = check_scene(a.scene)
    cats = check_categories(a.category or "")
    if a.tier not in TIERS:
        die("--tier must be 1, 2, 3 or 4")
    rows = read_csv(CATALOGUE, FRAME_FIELDS)
    for f in a.files:
        p = Path(f)
        if not p.exists():
            die(f"no such file: {p}")
        fid = next_frame_id(rows)
        dest = REF / ("stills" if scene in ("SET", "PROMO", "BTS", "OTHER") else "frames") / scene / f"{fid}_{a.source}_{p.name}"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, dest)  # byte-for-byte copy, resolution untouched
        with Image.open(dest) as im:
            w, h = im.size
        rows.append({
            "frame_id": fid, "source_id": a.source, "scene": scene, "timecode": a.timecode or "",
            "seconds": f"{parse_tc(a.timecode):.3f}" if a.timecode else "", "frame_number": "",
            "width": w, "height": h, "file": rel(dest), "categories": cats, "setup": a.setup or "",
            "views": a.views or "", "status": "unreviewed", "evidence_tier": a.tier,
            "note": a.note or "", "created": now()})
        print(f"{fid}  {w}x{h}  {rel(dest)}")
    write_csv(CATALOGUE, FRAME_FIELDS, rows)


def cmd_tag(a) -> None:
    rows = read_csv(CATALOGUE, FRAME_FIELDS)
    hit = 0
    for r in rows:
        if r["frame_id"] in a.frame:
            hit += 1
            if a.category is not None:
                r["categories"] = check_categories(a.category)
            if a.add_category:
                cur = [c for c in r["categories"].split(";") if c]
                r["categories"] = check_categories(";".join(cur + [a.add_category]))
            if a.setup is not None:
                r["setup"] = a.setup
            if a.views is not None:
                r["views"] = a.views
            if a.status is not None:
                if a.status not in STATUSES:
                    die(f"status must be one of {sorted(STATUSES)}")
                r["status"] = a.status
            if a.tier is not None:
                if a.tier not in TIERS:
                    die("tier must be 1-4")
                r["evidence_tier"] = a.tier
            if a.note is not None:
                r["note"] = a.note
    if hit != len(set(a.frame)):
        die(f"only {hit} of {len(set(a.frame))} frame ids found; nothing written")
    write_csv(CATALOGUE, FRAME_FIELDS, rows)
    print(f"updated {hit} frame(s)")


def filtered(a) -> list[dict]:
    rows = read_csv(CATALOGUE, FRAME_FIELDS)
    out = []
    for r in rows:
        if a.scene and r["scene"] != a.scene:
            continue
        if a.category and a.category not in r["categories"].split(";"):
            continue
        if a.setup and r["setup"] != a.setup:
            continue
        if a.status and r["status"] != a.status:
            continue
        out.append(r)
    return out


def cmd_sheet(a) -> None:
    rows = filtered(a)
    items = [(ROOT / r["file"], f"{r['frame_id']} {r['scene']} {r['timecode'] or r['source_id']}") for r in rows]
    parts = [x for x in (a.scene, a.category, a.setup, a.status) if x]
    name = "sheet_" + ("_".join(parts) if parts else "all")
    out = contact_sheet(items, REF / "sheets" / f"{name}.jpg", f"{name}  ({len(items)} images)", a.cols)
    print(f"sheet: {rel(out)}")


def dhash(path: Path, size: int = 16) -> int:
    im = Image.open(path).convert("L").resize((size + 1, size), Image.LANCZOS)
    px = list(im.getdata())
    bits = 0
    for y in range(size):
        for x in range(size):
            bits = (bits << 1) | (px[y * (size + 1) + x] > px[y * (size + 1) + x + 1])
    return bits


def cmd_similar(a) -> None:
    rows = filtered(a)
    hashes = [(r, dhash(ROOT / r["file"])) for r in rows]
    groups: list[list[dict]] = []
    used = set()
    for i, (r, h) in enumerate(hashes):
        if i in used:
            continue
        g = [r]
        used.add(i)
        for j in range(i + 1, len(hashes)):
            if j not in used and bin(h ^ hashes[j][1]).count("1") <= a.max_distance:
                g.append(hashes[j][0])
                used.add(j)
        groups.append(g)
    multi = [g for g in groups if len(g) > 1]
    print(f"{len(rows)} frames, {len(multi)} group(s) that probably share a camera setup "
          f"(distance <= {a.max_distance} of 256 bits).")
    print("This catches near-identical framing only. Overlap between different angles still needs a human eye.")
    for k, g in enumerate(multi, 1):
        print(f"  group {k}: " + ", ".join(f"{r['frame_id']}({r['timecode'] or r['scene']})" for r in g))


def cmd_list(a) -> None:
    rows = filtered(a)
    for r in rows:
        print(f"{r['frame_id']}  T{r['evidence_tier']}  {r['scene']:<6} {r['timecode'] or '-':<13} "
              f"{r['status']:<10} {r['categories']:<40} {r['note'][:60]}")
    print(f"{len(rows)} frame(s)")


# ---------------------------------------------------------------- CLI
def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(prog="refs.py", description=__doc__.split("\n\n")[0])
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("add-source", help="register a source")
    s.add_argument("--id", required=True, help="short id, e.g. FILM-BD, WW-FACTFILE, SCRIPT-2015")
    s.add_argument("--kind", required=True, choices=["video", "web", "stills", "book", "screenplay", "other"])
    s.add_argument("--title", required=True)
    s.add_argument("--origin", required=True, help="where it came from and how you have it (e.g. 'own Blu-ray, DRM-free digital copy')")
    s.add_argument("--rights", required=True, help="why you may use it privately")
    s.add_argument("--path")
    s.add_argument("--url")
    s.add_argument("--note")
    s.add_argument("--replace", action="store_true")
    s.set_defaults(fn=cmd_add_source)

    s = sub.add_parser("extract", help="keep frames at exact timecodes")
    s.add_argument("--source", required=True)
    s.add_argument("--at", required=True, action="append", help="timecode; repeat for several")
    s.add_argument("--scene", required=True, help="SC41, SC45, ... or SET/PROMO/BTS/OTHER")
    s.add_argument("--category", help="semicolon list, e.g. 'fireplace;lighting'")
    s.add_argument("--setup", help="camera setup label you choose, e.g. A-wide-from-door")
    s.add_argument("--views", help="what the frame shows, e.g. 'north wall;pocket doors;sink'")
    s.add_argument("--note")
    s.add_argument("--square", action="store_true", help="convert non-square pixels to square")
    s.set_defaults(fn=cmd_extract)

    for name, fn, helptext in (("scan", cmd_scan, "sample a range every N seconds"),
                               ("shots", cmd_shots, "one frame per detected shot")):
        s = sub.add_parser(name, help=helptext)
        s.add_argument("--source", required=True)
        s.add_argument("--from", dest="start", required=True)
        s.add_argument("--to", dest="end", required=True)
        s.add_argument("--cols", type=int, default=4)
        s.add_argument("--square", action="store_true")
        if name == "scan":
            s.add_argument("--every", type=float, default=1.0, help="seconds between samples")
        else:
            s.add_argument("--threshold", type=float, default=10.0, help="scdet threshold 0-100 (lower = more cuts)")
            s.add_argument("--min-len", type=float, default=0.3, help="ignore shots shorter than this (s)")
        s.set_defaults(fn=fn)

    s = sub.add_parser("import-stills", help="add existing image files")
    s.add_argument("--source", required=True)
    s.add_argument("--scene", required=True)
    s.add_argument("--tier", required=True, help="1 film still, 2 screenplay, 3 production/independent, 4 unknown")
    s.add_argument("--category")
    s.add_argument("--setup")
    s.add_argument("--views")
    s.add_argument("--timecode", help="film timecode if you know it")
    s.add_argument("--note")
    s.add_argument("files", nargs="+")
    s.set_defaults(fn=cmd_import_stills)

    s = sub.add_parser("tag", help="edit catalogue rows")
    s.add_argument("--frame", required=True, action="append")
    s.add_argument("--category")
    s.add_argument("--add-category")
    s.add_argument("--setup")
    s.add_argument("--views")
    s.add_argument("--status")
    s.add_argument("--tier")
    s.add_argument("--note")
    s.set_defaults(fn=cmd_tag)

    for name, fn in (("sheet", cmd_sheet), ("similar", cmd_similar), ("list", cmd_list)):
        s = sub.add_parser(name)
        s.add_argument("--scene")
        s.add_argument("--category")
        s.add_argument("--setup")
        s.add_argument("--status")
        if name == "sheet":
            s.add_argument("--cols", type=int, default=4)
        if name == "similar":
            s.add_argument("--max-distance", type=int, default=40)
        s.set_defaults(fn=fn)

    a = p.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    main()
