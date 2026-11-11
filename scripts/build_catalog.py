#!/usr/bin/env python3
"""Reproducible name catalog build. Requires only Python's standard library.

Onomaverse v2026.10 datasets: CC BY 4.0; attribution in DATA_SOURCES.md.
The source does NOT include name meanings. We deliberately mark meanings
unknown instead of inventing etymologies or suggesting transliteration = origin.
"""
import csv
import io
import json
import re
import time
import urllib.request
from collections import defaultdict
from pathlib import Path

VERSION="v2026.10"
BASE=f"https://github.com/onomaverse/datasets/releases/download/{VERSION}"
OUTPUT=Path("public/names")
OUTPUT.mkdir(parents=True,exist_ok=True)
HEADERS={"User-Agent":"AsteraBabyName/0.3 (open-source name discovery; data credit Onomaverse)"}
def get(filename):
    request=urllib.request.Request(f"{BASE}/{filename}",headers=HEADERS)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request,timeout=90) as response:
                return io.TextIOWrapper(response,encoding="utf-8-sig",newline="")
        except Exception as exc:
            if attempt==3:
                raise RuntimeError(f"Could not download {filename}") from exc
            time.sleep(2**attempt)
def rows(filename):
    with get(filename) as stream:
        yield from csv.DictReader(stream)
def dedupe_key(value):
    return value.casefold().strip()
names={}
countries={}
for row in rows("given-name-frequency.csv"):
    name=row["name"].strip()
    code=row["country_code"].strip().upper()
    if not name or not code:
        continue
    key=dedupe_key(name)
    entry=names.setdefault(key,{"name":name,"countries":set(),"gender":set(),"origin":"","rank":0.0,"native":""})
    entry["countries"].add(code)
    if row.get("country_name"):
        countries[code]=row["country_name"]
    for gender in row.get("gender","").split(";"):
        if gender in ("M","F"):
            entry["gender"].add(gender)
    if not entry["origin"] and row.get("origin"):
        entry["origin"]=row["origin"].strip()
    try: entry["rank"]=max(entry["rank"],float(row.get("pct_in_country") or 0))
    except ValueError: pass
print("Unique names loaded:",len(names),flush=True)
# Choose genuine non-Latin forms; do not pretend every transliteration is a birth spelling.
script=re.compile(r"[^\u0000-\u024f\u1e00-\u1eff\s\-'.]")
natives=defaultdict(list)
for row in rows("name-transliterations.csv"):
    if row.get("type")!="forename":
        continue
    key=dedupe_key(row.get("name",""))
    spelling=(row.get("localized_form") or "").strip()
    if key in names and spelling and script.search(spelling):
        language=row.get("lang_code","")
        natives[key].append((language,spelling))
print("Names with native forms:",len(natives),flush=True)
# Match the representative writing to the attested origin when possible.
PREFER={"Japanese":("ja",),"Korean":("ko",),"Arabic":("ar",),"Hebrew":("he",),"Greek":("el",),"Hindi":("hi",),"Russian":("ru",),"Persian":("fa",),"Chinese":("zh",),"Sanskrit":("hi",),"Thai":("th",),"Bengali":("bn",),"Tamil":("ta",),"Ukrainian":("uk",)}
items=[]
for key,entry in names.items():
    origin=entry["origin"]
    choices=natives.get(key,[])
    pref=next((langs for tag,langs in PREFER.items() if tag.casefold() in origin.casefold()),())
    chosen=next((form for lang,form in choices if any(lang.startswith(p) for p in pref)),None) if pref else None
    # Only label the script if the dataset itself supports a valid matching form.
    genders=entry["gender"]
    gender="unisex" if len(genders)>1 or not genders else ("boy" if "M" in genders else "girl")
    items.append({"name":entry["name"],"gender":gender,"country":sorted(entry["countries"])[0],
        "countries":sorted(entry["countries"]),"origin":origin or "Origen por verificar",
        "meaning":None,"native":chosen or "","variants":[],"source":"onomaverse-v2026.10"})
items.sort(key=lambda x:x["name"].casefold())
(OUTPUT/"extended.json").write_text(json.dumps(items,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
(OUTPUT/"countries.json").write_text(json.dumps([{"code":c,"name":label} for c,label in sorted(countries.items())],ensure_ascii=False),encoding="utf-8")
(OUTPUT/"manifest.json").write_text(json.dumps({"version":VERSION,"count":len(items),"countryCount":len(countries),
    "meaningStatus":"not provided by source; do not invent","attribution":"Names data from Onomaverse (https://onomaverse.com/datasets), licensed CC BY 4.0."},ensure_ascii=False,indent=2),encoding="utf-8")
print(f"Built {len(items)} unique names, {len(countries)} countries.",flush=True)
