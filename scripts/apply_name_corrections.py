#!/usr/bin/env python3
"""Apply individually reviewed canonical names to the global JSON catalog.

Run after build_catalog.py; also usable directly on the committed catalog.
Merge only explicitly listed source spellings; preserve aliases for search,
keep distinct compounds (e.g., María Carmen vs María del Carmen), and update
manifest/coverage counts. Nothing is inferred from an arbitrary initial.
"""
import json
import unicodedata
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"public/names"
CORRECTIONS=ROOT/"src/data/name_corrections.json"

def exact(text):
    return unicodedata.normalize("NFC",text).casefold().strip()
def read(path):
    return json.loads(path.read_text(encoding="utf-8"))
def write(path,content):
    path.write_text(json.dumps(content,ensure_ascii=False,separators=(",",":")),encoding="utf-8")

def main():
    entries=read(OUT/"extended.json")
    overrides=read(CORRECTIONS)
    by_name={exact(row["name"]):row for row in entries}
    # Remove explicitly declared aliases first so none remain as duplicate cards.
    for preferred in overrides:
        canon=exact(preferred["name"])
        aliases=[exact(alias) for alias in preferred.get("merge",[])]
        existing=by_name.pop(canon,None)
        merged=[existing] if existing else []
        for alias in aliases:
            if alias!=canon:
                found=by_name.pop(alias,None)
                if found:merged.append(found)
        merged=[x for x in merged if x]
        item=dict(merged[0]) if merged else {
            "name":preferred["name"],"gender":preferred["gender"],
            "country":preferred["country"],"countries":[preferred["country"]],
            "origin":preferred["origin"],"native":"","variants":[],
            "source":"astera-curated-compound-2026"
        }
        variants=set(item.get("variants") or [])
        for prior in merged:
            variants.update(prior.get("variants") or [])
            variants.add(prior["name"])
        variants.update(preferred.get("variants") or [])
        variants.discard(preferred["name"])
        item.update(
            name=preferred["name"],gender=preferred["gender"],origin=preferred["origin"],
            country=preferred["country"],meaning=preferred["meaning"],meaningType="published",
            meaningLanguage=preferred.get("meaningLanguage","es"),
            meaningStatus="documented",meaningSource="astera-reviewed-compound",
            meaningSourceUrl=preferred["meaningSourceUrl"],reviewStatus="source_matched",
            nativeStatus="documented" if item.get("native") else "not_available",
            components=preferred.get("components",[]),
            variants=sorted(variants,key=str.casefold),
        )
        item["countries"]=sorted(set(item.get("countries",[]))|{preferred["country"]})
        by_name[canon]=item
    # Names that are unmistakable import artifacts rather than candidate names.
    # Leave ambiguous abbreviations unmodified until their meaning is verified.
    invalid_import_tokens={"A*I","Eg/J","F/I","G/I","Eg(Hd","F(Jd"}
    for invalid in invalid_import_tokens:
        by_name.pop(exact(invalid),None)
    sorted_items=sorted(by_name.values(),key=lambda row:row["name"].casefold())
    keys=[exact(row["name"]) for row in sorted_items]
    if len(keys)!=len(set(keys)):
        raise AssertionError("Conflicting canonical names after review")
    manifest=read(OUT/"manifest.json")
    documented=sum(row.get("meaningType")=="published" for row in sorted_items)
    pending=len(sorted_items)-documented
    manifest.update(count=len(sorted_items),meaningCount=documented,missingMeaningCount=pending,
                    populatedCount=len(sorted_items),
                    nativeScriptCount=sum(bool(row.get("native")) for row in sorted_items),
                    variantCount=sum(bool(row.get("variants")) for row in sorted_items))
    coverage=read(OUT/"coverage.json")
    sources=Counter(row.get("meaningSource") or "creative" for row in sorted_items)
    origins=Counter(row["origin"] for row in sorted_items if row["meaningType"]=="creative")
    coverage.update(totalNames=len(sorted_items),meaningDocumented=documented,
                    meaningPending=pending,meaningSources=dict(sorted(sources.items())),
                    pendingByOrigin=[{"origin":k,"count":v} for k,v in
                                     sorted(origins.items(),key=lambda pair:(-pair[1],pair[0].casefold()))])
    write(OUT/"extended.json",sorted_items)
    (OUT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (OUT/"coverage.json").write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Canonicalized {len(overrides)} reviewed entries; catalog {len(sorted_items)} names; {documented} sourced meanings")

if __name__=="__main__":
    main()
