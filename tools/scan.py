"""Measure a rendered mark and compare two of them by proportion.

The mark is calibrated against the original by scanning renders rather than by
eye.  Every number is scaled by the mark's own height and measured out from the
mast's centre line, so two renders at different sizes and positions compare
directly: a row reads as the spans of ink crossed at that height.

    # render both to PNG at the same size first (any headless browser will do)
    python3 tools/scan.py new.png 900 900 docs/original.png 900 900

Left column is the reference, right is the candidate.  Needs ImageMagick on
PATH; deliberately has no Python dependencies.
"""

import subprocess
import sys

# Sample rows: dense at the top and bottom, where the hooks and the hull are.
FRACTIONS = [.01, .03, .06, .10, .15, .20, .25, .30, .35, .40, .45, .50,
             .55, .60, .63, .66, .70, .75, .80, .85, .90, .95, .99]


def mask(path, width, height, threshold=180):
    """Ink/no-ink grid, from raw grey bytes piped out of ImageMagick."""
    raw = subprocess.run(
        ["magick", path, "-colorspace", "gray", "-depth", "8", "gray:-"],
        capture_output=True, check=True).stdout
    return [[raw[y * width + x] < threshold for x in range(width)]
            for y in range(height)]


def runs(row, width):
    """Contiguous ink spans in one scan line, as (start, end) pixel pairs."""
    spans, start = [], None
    for x in range(width):
        if row[x] and start is None:
            start = x
        elif not row[x] and start is not None:
            spans.append((start, x - 1))
            start = None
    if start is not None:
        spans.append((start, width - 1))
    return spans


def table(path, width, height):
    grid = mask(path, width, height)
    ink = [(x, y) for y in range(height) for x in range(width) if grid[y][x]]
    xs = [p[0] for p in ink]
    ys = [p[1] for p in ink]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    box_w, box_h = x1 - x0 + 1, y1 - y0 + 1

    # Origin: the mast's own centre at half height. The bounding box is set by
    # the hooks, which are exactly what a refinement moves.
    mast = runs(grid[int(y0 + 0.5 * (box_h - 1))], width)[0]
    centre = (mast[0] + mast[1]) / 2

    rows = {}
    for f in FRACTIONS:
        y = int(y0 + f * (box_h - 1))
        rows[f] = [((a - centre) / box_h, (b - centre) / box_h)
                   for a, b in runs(grid[y], width)]
    return box_w / box_h, rows


def show(spans):
    return " ".join(f"[{a:+.3f},{b:+.3f}]" for a, b in spans)


def main(argv):
    aspect_a, rows_a = table(argv[0], int(argv[1]), int(argv[2]))
    if len(argv) < 6:
        print(f"aspect W/H = {aspect_a:.3f}")
        for f in FRACTIONS:
            print(f"  {f:.2f}: {show(rows_a[f])}")
        return

    aspect_b, rows_b = table(argv[3], int(argv[4]), int(argv[5]))
    print(f"aspect W/H   reference {aspect_b:.3f}   candidate {aspect_a:.3f}")
    print(f"{'y':>5}  {'reference':<40} {'candidate':<40}")
    for f in FRACTIONS:
        print(f"{f:5.2f}  {show(rows_b[f]):<40} {show(rows_a[f]):<40}")


if __name__ == "__main__":
    main(sys.argv[1:])
