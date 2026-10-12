import csv
import hashlib
import math
import struct
import sys
from pathlib import Path


SOURCE_SHA256 = "d9f69fd86bbf90a4e4d52b4c5c53eacfa6dfc0bfdef85bfd94f095e0bebe4ebd"
LIMITING_MAGNITUDE = 5.0


def encode(value, minimum, maximum, bits):
    return round((value - minimum) / (maximum - minimum) * ((1 << bits) - 1))


def main(source_path, output_path):
    source = Path(source_path).read_bytes()
    if hashlib.sha256(source).hexdigest() != SOURCE_SHA256:
        raise ValueError("The HYG v4.1 source differs from the pinned catalogue")

    stars = []
    with Path(source_path).open(newline="") as source_file:
        for row in csv.DictReader(source_file):
            if row["proper"] == "Sol" or not row["mag"] or not row["ci"]:
                continue
            magnitude = float(row["mag"])
            if magnitude > LIMITING_MAGNITUDE:
                continue
            ra = float(row["ra"])
            dec = float(row["dec"])
            color_index = float(row["ci"])
            if not all(map(math.isfinite, (ra, dec, magnitude, color_index))):
                continue
            stars.append((ra, dec, magnitude, color_index))

    stars.sort(key=lambda star: star[2])
    payload = bytearray(b"HYG4")
    payload.extend(struct.pack("<H", len(stars)))
    for ra, dec, magnitude, color_index in stars:
        payload.extend(
            struct.pack(
                "<HHBB",
                encode(ra, 0, 24, 16),
                encode(dec, -90, 90, 16),
                encode(max(-2, min(6, magnitude)), -2, 6, 8),
                encode(max(-0.4, min(2.4, color_index)), -0.4, 2.4, 8),
            )
        )

    Path(output_path).write_bytes(payload)
    print(f"{len(stars)} stars, {len(payload)} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build-star-catalog.py HYG_V41_CSV OUTPUT_BIN")
    main(sys.argv[1], sys.argv[2])
