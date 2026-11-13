#!/usr/bin/env python3
"""Fast, deterministic JSON quality gates for Astera's global catalog."""
import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
catalog=json.loads((root/"public/names/extended.json").read_text(encoding="utf-8"))
countries=json.loads((root/"public/names/countries.json").read_text(encoding="utf-8"))
manifest=json.loads((root/"public/names/manifest.json").read_text(encoding="utf-8"))
coverage=json.loads((root/"public/names/coverage.json").read_text(encoding="utf-8"))
assert isinstance(catalog,list) and catalog, "Catalog must not be empty"
assert manifest["count"]==len(catalog), "Manifest count differs from JSON"
assert manifest["countryCount"]==len(countries), "Country count differs"
assert manifest.get("populatedCount")==len(catalog), "Not all names have a display meaning"
assert manifest["meaningCount"]==sum(item.get("meaningType")=="published" for item in catalog), "Meaning count differs"
assert coverage["totalNames"]==len(catalog) and coverage["meaningDocumented"]==manifest["meaningCount"] and coverage["meaningPending"]==manifest["missingMeaningCount"], "Coverage audit differs"
assert manifest["missingMeaningCount"]==sum(item.get("meaningType")=="creative" for item in catalog), "Missing meanings count differs"
assert manifest["nativeScriptCount"]==sum(bool(item.get("native")) for item in catalog), "Native writing count differs"
assert manifest["variantCount"]==sum(bool(item.get("variants")) for item in catalog), "Variant count differs"
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
    assert isinstance(row["meaning"],str) and row["meaning"].strip()
    assert row.get("meaningStatus") in ("documented","poetic_interpretation"), row["name"]
    assert row.get("meaningType") in ("published","creative"), row["name"]
    assert row.get("reviewStatus") in ("source_matched","requires_etymological_source"), row["name"]
    assert row.get("nativeStatus") in ("documented","not_available"), row["name"]
    assert (row["meaningStatus"]=="documented")==(row["meaningType"]=="published"), row["name"]
    assert (row["nativeStatus"]=="documented")==bool(row.get("native")), row["name"]
    assert (row.get("meaningSourceUrl") is not None)==(row["meaningType"]=="published"), row["name"]
    if row["meaningType"]=="published":
        assert row.get("meaningSource"), f"Missing meaning provenance for {row['name']}"
    else:
        assert row.get("meaningSource") is None, f"Creative interpretation incorrectly attributed for {row['name']}"
    assert isinstance(row["variants"],list)
    assert len(row["variants"])==len(set(row["variants"]))
    assert row["variants"]==sorted(row["variants"],key=str.casefold), f"Variant order changed for {row['name']}"
# The mobile search index is a generated projection, never a second data source.
client_index=root/"public/names/search-index.json"
if client_index.exists():
    index_data=json.loads(client_index.read_text(encoding="utf-8"))
    assert index_data["count"]==len(catalog)==len(index_data["rows"]), "Index size differs from source catalog"
    assert len(index_data["fields"])==len(index_data["rows"][0]), "Index field layout invalid"
    idx_name=index_data["fields"].index("name")
    assert all(row[idx_name]==item["name"] for row,item in zip(index_data["rows"],catalog)), "Name order in index differs from source"
print(f"VALIDATED {len(catalog):,} names; {manifest['meaningCount']:,} sourced meanings; {manifest['missingMeaningCount']:,} pending; {len(countries)} countries")
