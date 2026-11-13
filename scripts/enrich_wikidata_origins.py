#!/usr/bin/env python3
"""Incrementally enrich under-documented origin from Wikidata (CC0) P407.

QLever indexes Wikidata and exposes SPARQL; query only *given-name entities*
and their stated languages. Never infer origins from a person's birthplace,
their usage country, or similarity of spelling. Can be rerun and extended.
"""
from pathlib import Path
import collections,json,os,re,time,unicodedata,urllib.parse,urllib.request
ROOT=Path(__file__).resolve().parents[1]
CAT=ROOT/"public/names/extended.json"
RULES=json.loads((ROOT/"src/data/cultural_origin_rules.json").read_text(encoding="utf-8"))["rules"]
def fold(s):
 return ''.join(c for c in unicodedata.normalize("NFD",str(s or "").casefold()) if unicodedata.category(c)!="Mn")
def codes_for(s):
 text=' '+re.sub(r'[^\w]+',' ',fold(s)).strip()+' '
 return sorted({code for rule in RULES if any(' '+fold(t)+' ' in text for t in rule["terms"]) for code in rule["codes"]})
def key(s):return unicodedata.normalize("NFC",str(s)).strip().casefold()
rows=json.loads(CAT.read_text(encoding="utf-8"))
index={key(r["name"]):r for r in rows}
before=sum(bool(r.get("originCountryCodes")) for r in rows)
# Q202444 = given name, Q11879590 / Q12308941 = gendered given names.
query='''PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?name ?language ?entity WHERE {
 VALUES ?type { wd:Q202444 wd:Q11879590 wd:Q12308941 }
 ?entity wdt:P31 ?type .
 ?entity wdt:P407 ?lang .
 ?entity rdfs:label ?name .
 ?lang rdfs:label ?language .
 FILTER(LANG(?name)="en" && LANG(?language)="en")
} LIMIT 25000'''
request=urllib.request.Request("https://qlever.dev/api/wikidata",data=urllib.parse.urlencode({"query":query,"action":"sparql_json_export"}).encode(),headers={"User-Agent":"AsteraBabyName/0.8 (https://github.com/BrayanQuirino/astera-baby-name)","Accept":"application/sparql-results+json","Content-Type":"application/x-www-form-urlencoded"})
try:
 with urllib.request.urlopen(request,timeout=80) as response:
  payload=json.load(response)
except Exception as exc:
 print("QLever unavailable: no data modified",type(exc).__name__,str(exc)[:200],flush=True)
 raise SystemExit(0)
values=payload.get("results",{}).get("bindings",[])
if not values:
 print("QLever responded without matches; no data modified",flush=True)
 raise SystemExit(0)
matched=0
for item in values:
 name=item.get("name",{}).get("value")
 lang=item.get("language",{}).get("value","")
 codes=codes_for(lang)
 if not codes:continue
 row=index.get(key(name))
 if not row:continue
 current=set(row.get("originCountryCodes") or [])
 if set(codes).issubset(current):continue
 row["originCountryCodes"]=sorted(current|set(codes))
 row["originLanguages"]=sorted(set(row.get("originLanguages") or [])|{lang})
 row["originCountrySources"]=sorted(set(row.get("originCountrySources") or [])|{"wikidata-P407-qlever"})
 if "verificar" in fold(row.get("origin")):
  row["origin"]=' / '.join(row["originLanguages"])
 matched+=1
after=sum(bool(r.get("originCountryCodes")) for r in rows)
if matched:
 CAT.write_text(json.dumps(rows,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
print("Wikidata P407 matches",matched,"classified",before,"->",after,"from",len(values),"attested entities",flush=True)
