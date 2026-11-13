#!/usr/bin/env python3
"""Generate a small client catalog representation from Astera's authoritative JSON.

The full extended.json retains every provenance/frequency/review field.
The UI consumes the derived columnar catalog to avoid transferring those
metadata fields for 100k+ records on every phone. Data is generated, not edited.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"public/names/extended.json"
TARGET=ROOT/"public/names/search-index.json"
FIELDS=["name","gender","origin","meaning","native","variants","country","countries",
        "meaningType","meaningSource","meaningSourceUrl","source","components","reading","meaningLanguage"]
items=json.loads(SOURCE.read_text(encoding="utf-8"))
rows=[[item.get(field) if item.get(field) is not None else ( [] if field in ("variants","countries","components") else "" ) for field in FIELDS] for item in items]
payload={"version":1,"fields":FIELDS,"count":len(items),"rows":rows}
TARGET.write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
print(f"Client index {len(rows):,} names, {TARGET.stat().st_size/1e6:.1f} MB vs {SOURCE.stat().st_size/1e6:.1f} MB original")
