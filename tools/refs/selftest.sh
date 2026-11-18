#!/usr/bin/env bash
# Self-test for refs.py on a synthetic video (no film material involved).
# Usage: tools/refs/selftest.sh      -> prints PASS/FAIL lines, exits non-zero on failure.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
export GOLDSTEIN_ROOT="$T"; mkdir -p "$T/reference"
R="python3 $HERE/refs.py"
fail=0; ok(){ echo "PASS $1"; }; ko(){ echo "FAIL $1"; fail=1; }

# 12 s, 1920x804 (2.39:1), 24 fps, three hard cuts every 4 s.
ffmpeg -v error -f lavfi -i "testsrc2=s=1920x804:r=24:d=4" -f lavfi -i "smptebars=s=1920x804:r=24:d=4" \
  -f lavfi -i "rgbtestsrc=s=1920x804:r=24:d=4" -filter_complex "[0][1][2]concat=n=3:v=1[v]" -map "[v]" \
  -c:v libx264 -pix_fmt yuv420p -t 12 "$T/test.mp4"

$R add-source --id TEST --kind video --title "synthetic" --origin "ffmpeg lavfi" --rights "generated" --path "$T/test.mp4" >/dev/null && ok add-source || ko add-source
$R extract --source TEST --at 00:00:02.000 --at 0:09.5 --scene SC41 --category "fireplace;lighting" >/dev/null && ok extract || ko extract
f=$(ls "$T"/reference/frames/SC41/*.png | head -1)
python3 -c "from PIL import Image;import sys;im=Image.open(sys.argv[1]);sys.exit(0 if im.size==(1920,804) else 1)" "$f" && ok "native resolution kept" || ko "native resolution kept"
grep -q "00:00:09.500" "$T/reference/catalogue.csv" && grep -q ",228," "$T/reference/catalogue.csv" && ok "timecode + frame number logged" || ko "timecode + frame number logged"
$R scan --source TEST --from 0 --to 6 --every 2 >/dev/null && [ "$(ls "$T"/reference/scans/TEST/*/ | wc -l)" -eq 4 ] && ok scan || ko scan
out=$($R shots --source TEST --from 0 --to 12 --min-len 1)
echo "$out" | grep -q "^3 shots" && ok "shots finds 3 shots" || { ko "shots finds 3 shots"; echo "$out"; }
$R import-stills --source TEST --scene PROMO --tier 3 --category decor "$f" >/dev/null && ok import-stills || ko import-stills
$R tag --frame F00001 --status key --setup A-wide >/dev/null && ok tag || ko tag
$R tag --frame F99999 --status key >/dev/null 2>&1 && ko "tag rejects unknown id" || ok "tag rejects unknown id"
$R extract --source TEST --at 1 --scene LIVING >/dev/null 2>&1 && ko "scene id validated" || ok "scene id validated"
$R extract --source TEST --at 1 --scene SC41 --category sofa >/dev/null 2>&1 && ko "category validated" || ok "category validated"
$R sheet --scene SC41 >/dev/null && [ -f "$T/reference/sheets/sheet_SC41.jpg" ] && ok sheet || ko sheet
$R similar | grep -q "group 1: F00001" && ok "similar groups duplicate framing" || ko "similar groups duplicate framing"
exit $fail
