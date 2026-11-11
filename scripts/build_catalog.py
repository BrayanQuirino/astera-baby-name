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
            response=urllib.request.urlopen(request,timeout=90)
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
# Additional open MIT names and etymology descriptions (English source text).
# Only apply an etymology when the name's cultural origin appears compatible;
# identical spellings can have unrelated meanings in different languages.
MEANING_BASE="https://raw.githubusercontent.com/Nurturepedia/baby-names-dataset/main/datasets/origin"
MEANING_SOURCES=["arabic","english","hebrew","hindi","latin","sanskrit","spanish","urdu","french","irish","germanic"]
ORIGIN_HINTS={"arabic":["arab","urdu"],"english":["english","anglo"],"hebrew":["hebrew","hebr"],"hindi":["hindi","india"],"latin":["latin","roman"],"sanskrit":["sanskrit","india"],"spanish":["spanish","espa"],"urdu":["urdu","persian"],"french":["french","fran"],"irish":["irish","gaelic"],"germanic":["german","germán"]}
index={dedupe_key(n["name"]):n for n in items}
meaning_count=0
for origin_slug in MEANING_SOURCES:
    url=f"{MEANING_BASE}/{origin_slug}.json"
    try:
        with urllib.request.urlopen(urllib.request.Request(url,headers=HEADERS),timeout=35) as response:
            origin_rows=json.load(response)
    except Exception as exc:
        print("Optional meanings unavailable:",origin_slug,str(exc),flush=True)
        continue
    if not isinstance(origin_rows,list):continue
    for row in origin_rows:
        if not isinstance(row,dict):continue
        name=(row.get("name") or "").strip()
        meaning=(row.get("meaning") or "").strip()
        if not name or not meaning or len(meaning)>250:continue
        existing=index.get(dedupe_key(name))
        if not existing:
            # Genuine additional first names from the independent MIT-licensed catalog.
            # Do not infer nationality from a name's linguistic origin.
            raw_gender=str(row.get("gender") or "").strip().casefold()
            gender={"male":"boy","female":"girl","boy":"boy","girl":"girl","unisex":"unisex"}.get(raw_gender,"unisex")
            origin_value=row.get("origin") or origin_slug
            if isinstance(origin_value,list):
                origin_value=" / ".join(str(v).title() for v in origin_value if v)
            existing={"name":name[:1].upper()+name[1:],"gender":gender,
                "country":"ZZ","countries":[],"origin":str(origin_value).title(),
                "meaning":meaning,"native":"","variants":[],"source":f"nurturepedia/{origin_slug}",
                "meaningLanguage":"en","meaningSource":f"nurturepedia/{origin_slug}"}
            items.append(existing)
            index[dedupe_key(name)]=existing
            meaning_count+=1
            continue
        if existing and not existing["meaning"]:
            origin=existing["origin"].casefold()
            if origin and not any(h in origin for h in ORIGIN_HINTS[origin_slug]):
                continue
            existing.update(meaning=meaning,meaningLanguage="en",meaningSource=f"nurturepedia/{origin_slug}")
            meaning_count+=1
print("Meanings added from MIT source:",meaning_count,flush=True)
# Wiktionary meanings: CC BY-SA 4.0. Source collection provides literal glosses,
# not a meaning for every name. Only apply when the documented language root
# matches the existing declared origin; avoid homographs from other languages.
WIKTIONARY_DATA="https://raw.githubusercontent.com/suhxnitiwari/baby-name-maker/main/data/meanings.json"
try:
    with urllib.request.urlopen(urllib.request.Request(WIKTIONARY_DATA,headers=HEADERS),timeout=50) as response:
        wiktionary=json.load(response)
except Exception as exc:
    print("Optional Wiktionary collection unavailable:",exc,flush=True)
    wiktionary={}
WIKTIONARY_COMPATIBLE={
    "german":["german","germán","english","anglo"],"old norse":["norse","nordic","scandinavian"],
    "arabic":["arab","urdu"],"hebrew":["hebrew","hebr"],"greek":["greek","griego"],
    "latin":["latin","latín","roman","romano"],"sanskrit":["sanskrit","hindi","india"],
    "japanese":["japanese","japon"],"korean":["korean","corean"],"french":["french","franc"],
    "irish":["irish","gaelic","irland"],"persian":["persian","persa"],
    "spanish":["spanish","espa"],"italian":["italian","ital"],"slavic":["slavic","eslav"],
    "swahili":["swahili","suaj"],"hindi":["hindi","india"]
}
wiktionary_added=0
for name,details in wiktionary.items():
    if not isinstance(details,dict) or not isinstance(details.get("m"),str):
        continue
    meaning=details["m"].strip()
    if not meaning or len(meaning)>180:
        continue
    existing=index.get(dedupe_key(name))
    if not existing or existing.get("meaning"):
        continue
    language=str(details.get("root") or "").casefold()
    origin=existing["origin"].casefold()
    # Strong conservative match, not simply identical Latin letters.
    acceptable=any(h in origin for k,hints in WIKTIONARY_COMPATIBLE.items() if k in language for h in hints)
    if not acceptable:
        continue
    existing.update(meaning=meaning,meaningLanguage="en",meaningSource="wiktionary-en",meaningLicense="CC BY-SA 4.0")
    wiktionary_added+=1
print("Meanings added from Wiktionary:",wiktionary_added,flush=True)

# Native-script Wiktionary entries fill gaps when both name and linguistic root agree.
# The collection records word-level glosses, not guessed kanji/hanja interpretations.
NATIVE_MEANINGS="https://raw.githubusercontent.com/suhxnitiwari/baby-name-maker/main/data/native-meanings.json"
try:
    with urllib.request.urlopen(urllib.request.Request(NATIVE_MEANINGS,headers=HEADERS),timeout=50) as response:
        native_meanings=json.load(response)
except Exception as exc:
    print("Optional native meanings unavailable:",exc,flush=True)
    native_meanings={}
native_meaning_count=0
for key,details in native_meanings.items():
    if not isinstance(details,dict):
        continue
    meaning=details.get("m")
    if not isinstance(meaning,str) or not (meaning:=meaning.strip()) or len(meaning)>180:
        continue
    existing=index.get(dedupe_key(key))
    if not existing or existing.get("meaning"):
        continue
    root=str(details.get("root") or "").casefold()
    origin=existing["origin"].casefold()
    compatible=any(h in origin for r,hints in WIKTIONARY_COMPATIBLE.items() if r in root for h in hints)
    if not compatible:
        continue
    existing.update(meaning=meaning,meaningLanguage="en",
                    meaningSource="wiktionary-native-en",meaningLicense="CC BY-SA 4.0")
    native_meaning_count+=1
print("Native-script meanings added:",native_meaning_count,flush=True)

# The name equivalence graph supplies attested alternate spellings; do not treat
# merely similar strings as actual variants, or confuse cultural equivalents.
variant_links=defaultdict(set)
for edge in rows("name-equivalence.csv"):
    if edge.get("type")!="forename" or edge.get("relation")!="variant":
        continue
    first=edge.get("name","").strip()
    related=edge.get("related_name","").strip()
    if first and related and dedupe_key(first)!=dedupe_key(related):
        variant_links[dedupe_key(first)].add(related)
for item in items:
    variants=sorted(variant_links.get(dedupe_key(item["name"]),set()),key=str.casefold)
    item["variants"]=variants[:12]
print("Names with attested variants:",sum(bool(item["variants"]) for item in items),flush=True)
items.sort(key=lambda x:x["name"].casefold())
(OUTPUT/"extended.json").write_text(json.dumps(items,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
(OUTPUT/"countries.json").write_text(json.dumps([{"code":c,"name":label} for c,label in sorted(countries.items())],ensure_ascii=False),encoding="utf-8")
(OUTPUT/"manifest.json").write_text(json.dumps({"version":VERSION,"count":len(items),"countryCount":len(countries),"meaningCount":sum(bool(item.get("meaning")) for item in items),"missingMeaningCount":sum(not bool(item.get("meaning")) for item in items),"nativeScriptCount":sum(bool(item.get("native")) for item in items),"variantCount":sum(bool(item.get("variants")) for item in items),"wiktionaryLicense":"CC BY-SA 4.0",
    "meaningStatus":"source-backed meanings only; null when not verified","attribution":"Names data from Onomaverse (https://onomaverse.com/datasets), licensed CC BY 4.0."},ensure_ascii=False,indent=2),encoding="utf-8")
print(f"Built {len(items)} unique names, {len(countries)} countries.",flush=True)
