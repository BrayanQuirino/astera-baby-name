#!/usr/bin/env python3
"""Enrich Astera with licensed official *usage* data; never infer cultural origin.

Sources:
  SSA (US, public domain) names.zip; national records 1880–2025.
  ONS (England and Wales, OGL v3.0) official first-name XLSX, optional.
  INE (Spain, public open statistical data) official XLS/CSV, optional.
  Wikidata (CC0) query for clearly typed given names, optional.

No guessed etymologies, no synthetic invented first names, no international
usage -> linguistic origin conflation. Existing source-backed and reviewed
records always prevail. Exact normalized collisions merge their usage and
source evidence; spelling variants remain separate unless curated.
"""
from __future__ import annotations
import collections, csv, hashlib, io, json, os, re, sys, unicodedata, urllib.request, urllib.parse, zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"public/names"
REVIEW=ROOT/"src/data/name_corrections.json"
USER_AGENT="AsteraBabyName/0.6 (Open baby name data; https://github.com/BrayanQuirino/astera-baby-name)"
def key(text):
    return unicodedata.normalize("NFC",str(text)).casefold().strip()
def cleaned(text):
    return unicodedata.normalize("NFC",str(text or "")).strip()
def valid(name):
    if not (2<=len(name)<=64):return False
    if not any(c.isalpha() for c in name):return False
    if any(c.isdigit() for c in name):return False
    if any(unicodedata.category(c)[0]=="C" for c in name):return False
    if any(c in '<>{}[]|\\/\\@*_#%~^=+&;:!?()' for c in name):return False
    if re.search(r"\\s{2,}",name):return False
    if re.search(r"^\\s|\\s$",name):return False
    # Exclude opaque initialisms or CSV artifacts, not legitimate compound names.
    parts=name.split()
    if any(len(part.strip(".-"))<2 for part in parts):return False
    if len(parts)>4:return False
    return True

def fetch(url,timeout=120):
    request=urllib.request.Request(url,headers={"User-Agent":USER_AGENT,"Accept":"*/*"})
    with urllib.request.urlopen(request,timeout=timeout) as response:
        return response.read()
def load(path):
    return json.loads(path.read_text(encoding="utf-8"))
def dump(path,obj,pretty=False):
    path.write_text(json.dumps(obj,ensure_ascii=False,indent=2 if pretty else None,
                               separators=None if pretty else (",",":"))+("\\n" if pretty else ""),encoding="utf-8")
PHRASES=[
 "una historia llena de posibilidades","la luz de los nuevos comienzos",
 "un encuentro que transforma la vida","un sueño que empieza a florecer",
 "un camino de descubrimientos","el cariño que une generaciones",
 "la belleza de un nuevo capítulo","un horizonte de esperanza",
 "la alegría de descubrir el mundo","un lazo que trasciende fronteras",
 "la magia de los pequeños momentos","la fuerza de los sueños",
 "un viaje hacia lo extraordinario","la ternura de un nuevo hogar",
 "el brillo de las primeras estrellas","un universo por explorar",
 "la promesa de un mañana hermoso","el comienzo de una gran aventura",
 "una conexión entre culturas","la calidez de los recuerdos",
 "la serenidad de un amanecer","la libertad de imaginar",
 "la confianza de caminar juntos","un instante que se vuelve eterno",
 "la energía de una nueva etapa","el refugio de los abrazos",
 "la armonía de un cielo tranquilo","el valor de ser uno mismo",
 "la curiosidad por lo desconocido","el eco de una historia familiar",
 "un deseo compartido","la dulzura de lo inesperado"
]
def poetic(name):
    digest=hashlib.sha256(name.casefold().encode("utf-8")).digest()
    first=digest[0]%len(PHRASES)
    second=(first+1+digest[1]%(len(PHRASES)-1))%len(PHRASES)
    return f"Evoca {PHRASES[first]} y {PHRASES[second]}."
catalog=load(OUT/"extended.json")
indexed={key(e["name"]):dict(e) for e in catalog}
initial=len(indexed)
# Explicit curated merges prevent M Carmen / María del Carmen shadow duplicates.
aliases={key(a):key(item["name"]) for item in load(REVIEW) for a in item.get("merge",[])}
source_counters=collections.Counter()
usage_counts=collections.Counter()
skipped=collections.Counter()
origin_notes={}
def merge(name,gender,country,source,frequency=0,native=None,origin=None,source_url=None):
    name=cleaned(name)
    if not valid(name):
        skipped["invalid"]+=1;return
    k=aliases.get(key(name),key(name))
    entry=indexed.get(k)
    if entry is None:
        entry={
            "name":name,"gender":gender if gender in ("girl","boy") else "unisex",
            "country":country,"countries":[country],"origin":origin or "Origen por verificar",
            "meaning":poetic(name),"native":native or "","variants":[],
            "source":source,"meaningType":"creative",
            "meaningStatus":"poetic_interpretation","meaningSource":None,
            "meaningSourceUrl":None,"reviewStatus":"requires_etymological_source",
            "nativeStatus":"documented" if native else "not_available",
        }
        indexed[k]=entry
        source_counters[source]+=1
    else:
        # Never clobber reviewed origin, gender or meaning; merge supporting usage.
        if country not in entry.get("countries",[]):
            entry["countries"]=sorted(set(entry.get("countries",[])+[country]))
        if gender in ("girl","boy") and entry.get("gender")!=gender:
            entry["gender"]="unisex" if entry.get("gender") in ("girl","boy","unisex") and entry.get("gender")!=gender else gender
        skipped["existing_reused"]+=1
    observed=entry.setdefault("usageSources",[])
    if source not in observed:
        observed.append(source)
    if frequency:
        entry.setdefault("usageCount",{})[country]=max(int(frequency),int(entry.get("usageCount",{}).get(country,0)))
    usage_counts[source]+=1

# SSA official: 145 annual files, rows are first names, sexes and counts.
# Use sum >= 50 births AND at least two observed years for new names; no
# arbitrary popularity claims. Keep all existing low-frequency names intact.
ssa_url="https://www.ssa.gov/oact/babynames/names.zip"
ssa_bytes=fetch(ssa_url)
tally=collections.defaultdict(lambda:{"F":0,"M":0,"years":set()})
with zipfile.ZipFile(io.BytesIO(ssa_bytes)) as archive:
    for path in archive.namelist():
        match=re.fullmatch(r"yob(\\d{4})\\.txt",path)
        if not match:continue
        for row in csv.reader(io.StringIO(archive.read(path).decode("utf-8-sig"))):
            if len(row)<3:continue
            name,sex,number=row[:3]
            if sex not in ("F","M"):continue
            try:count=int(number)
            except ValueError:continue
            entry=tally[name];entry[sex]+=count;entry["years"].add(match.group(1))
for name,totals in tally.items():
    num=totals["F"]+totals["M"]
    if key(name) not in indexed and (num<50 or len(totals["years"])<2):
        skipped["ssa_below_minimum"]+=1;continue
    gender="girl" if totals["F"]>totals["M"]*1.5 else "boy" if totals["M"]>totals["F"]*1.5 else "unisex"
    merge(name,gender,"US","ssa-us-national",frequency=num,source_url=ssa_url)
print("SSA processed",len(tally),"candidate names; newly added",source_counters["ssa-us-national"],flush=True)

# Wikidata CC0: official public endpoint with stable Wikibase entities. Query only
# actual instances of "given name" with Latin-script English or language label.
# Limit each request and cap runtime; do not invent etymologies from labels.
SPARQL='''SELECT ?item ?itemLabel ?gender WHERE {
  ?item wdt:P31 wd:Q202444.
  ?item rdfs:label ?itemLabel.
  FILTER(LANG(?itemLabel)="en").
  OPTIONAL { ?item wdt:P21 ?gender. }
} ORDER BY ?item LIMIT 5000 OFFSET %s'''
wikidata_added=0
for offset in (0,5000,10000):
    query=SPARQL%offset
    url="https://query.wikidata.org/sparql?"+urllib.parse.urlencode({"query":query,"format":"json"})
    try:
        data=json.loads(fetch(url,timeout=80))
    except Exception as exc:
        print("Optional Wikidata unavailable:",str(exc)[:130],flush=True)
        break
    bindings=data.get("results",{}).get("bindings",[])
    for b in bindings:
        label=b.get("itemLabel",{}).get("value","")
        if not label or not valid(label):continue
        before=len(indexed)
        gender_uri=b.get("gender",{}).get("value","")
        gender="girl" if gender_uri.endswith("/Q6581072") else "boy" if gender_uri.endswith("/Q6581097") else "unisex"
        merge(label,gender,"ZZ","wikidata-cc0",origin=None)
        if len(indexed)>before:wikidata_added+=1
    if len(bindings)<5000:break
print("Wikidata new",wikidata_added,flush=True)

# The official ONS 1996-2025 workbook / INE census and IBGE 2022 are not
# inferred as origins. Import only when the format is independently validated;
# none is silently replaced by an unrelated third-party scrape.
# Official-source ingestion can be added using separate reviewed adapters.
results=sorted(indexed.values(),key=lambda item:item["name"].casefold())
for row in results:
    row["countries"]=sorted(set(row.get("countries",[])))
    row["variants"]=sorted(set(row.get("variants",[])),key=str.casefold)
    if "usageSources" in row:row["usageSources"]=sorted(set(row["usageSources"]))
with_meaning=sum(x.get("meaningType")=="published" for x in results)
creative=len(results)-with_meaning
manifest=load(OUT/"manifest.json")
manifest.update(count=len(results),populatedCount=len(results),meaningCount=with_meaning,
                missingMeaningCount=creative,
                nativeScriptCount=sum(bool(x.get("native")) for x in results),
                variantCount=sum(bool(x.get("variants")) for x in results),
                enrichment={"sources":["SSA national births (public domain)","Wikidata given-name labels (CC0)"],
                            "newNames":len(results)-initial,"skipped":dict(skipped),
                            "newBySource":dict(source_counters)})
coverage=load(OUT/"coverage.json")
sourced=collections.Counter(e.get("meaningSource") or "creative" for e in results)
unknown=collections.Counter(e["origin"] for e in results if e.get("meaningType")=="creative")
coverage.update(totalNames=len(results),meaningDocumented=with_meaning,meaningPending=creative,
                meaningSources=dict(sorted(sourced.items())),
                pendingByOrigin=[{"origin":o,"count":c} for o,c in
                    sorted(unknown.items(),key=lambda z:(-z[1],z[0].casefold()))])
dump(OUT/"extended.json",results)
dump(OUT/"manifest.json",manifest,pretty=True)
dump(OUT/"coverage.json",coverage,pretty=True)
print("ENRICHED",len(results),"unique first names (+",len(results)-initial,")",flush=True)
