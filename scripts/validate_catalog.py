#!/usr/bin/env python3
"""Fast, deterministic JSON quality gates for Astera's global catalog."""
import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
catalog=json.loads((root/"public/names/extended.json").read_text(encoding="utf-8"))
countries=json.loads((root/"public/names/countries.json").read_text(encoding="utf-8"))
manifest=json.loads((root/"public/names/manifest.json").read_text(encoding="utf-8"))
assert isinstance(catalog,list) and catalog, "Catalog must not be empty"
assert manifest["count"]==len(catalog), "Manifest count differs from JSON"
assert manifest["countryCount"]==len(countries), "Country count differs"
assert manifest["meaningCount"]==sum(bool(item.get("meaning")) for item in catalog), "Meaning count differs"
assert catalog==sorted(catalog,key=lambda item:item["name"].casefold()), "Alphabetical order changed"
assert countries==sorted(countries,key=lambda item:item["code"]), "Country code order changed"
seen=set()
for row in catalog:
    assert all(key in row for key in ("name","gender","country","countries","origin","meaning","native","variants","source")), row
    key=row["name"].casefold().strip()
    assert key not in seen, f"Duplicate name: {row['name']}"
    seen.add(key)
    assert row["gender"] in ("boy","girl","unisex")
    assert isinstance(row["countries"],list) and row["countries"]==sorted(set(row["countries"]))
    assert row["meaning"] is None or isinstance(row["meaning"],str)
    if row.get("meaning"):
        assert row.get("meaningSource"), f"Missing meaning provenance for {row['name']}"
print(f"VALIDATED {len(catalog):,} names; {manifest['meaningCount']:,} sourced meanings; {len(countries)} countries")
