#!/usr/bin/env python3
"""Conservative source-backed origin-country enrichment.

Origin-country codes are from linguistic/cultural evidence (existing annotated
origins or Wikidata P407), NEVER census/birth/usage countries. Name spellings
may have several independent origins. A language-country mapping provides
a cultural *search category*, not proof of historical birthplace.
"""
import collections,json,re,time,unicodedata,urllib.parse,urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"public/names"
RULES=json.loads((ROOT/"src/data/cultural_origin_rules.json").read_text(encoding="utf-8"))["rules"]
def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD',str(s or '').casefold()) if unicodedata.category(c)!='Mn')
def tokens(s):
    return ' '+re.sub(r'[^\w]+',' ',norm(s),flags=re.UNICODE).strip()+' '
def codes_for(value):
    text=tokens(value)
    found=set()
    for rule in RULES:
        if any(' '+tokens(term).strip()+' ' in text for term in rule["terms"]):
            found.update(rule["codes"])
    return sorted(found)
def key(s):
    return unicodedata.normalize("NFC",str(s)).casefold().strip()
names=json.loads((BASE/"extended.json").read_text(encoding="utf-8"))
index={key(row["name"]):row for row in names}
existing_sources=collections.Counter()
source_map={}
for row in names:
    legacy=codes_for(row.get("origin"))
    existing=set(row.get("originCountryCodes") or [])
    row["originCountryCodes"]=sorted(existing|set(legacy))
    if legacy:
        row["originCountrySource"]=row.get("originCountrySource") or "recorded-linguistic-origin"
        existing_sources["recorded-linguistic-origin"]+=1

# Wikidata is an optional source of independent attestations. P407 is the
# Wikidata property "language of work or name". If it is temporarily blocked,
# publication continues with already recorded cultural origins.
sparql='''SELECT DISTINCT ?item ?name ?langLabel WHERE {
 VALUES ?class { wd:Q202444 wd:Q11879590 wd:Q12308941 wd:Q3409032 wd:Q3409027 }
 ?item wdt:P31 ?class ; wdt:P407 ?language ; rdfs:label ?name .
 FILTER(LANG(?name) = "en")
 ?language rdfs:label ?langLabel .
 FILTER(LANG(?langLabel) = "en")
} ORDER BY ?item LIMIT 2500 OFFSET %d'''
api="https://query.wikidata.org/sparql"
seen=set()
retrieved=0
for offset in range(0,10000,2500):
    q=sparql%offset
    url=api+'?'+urllib.parse.urlencode({"query":q,"format":"json"})
    try:
        request=urllib.request.Request(url,headers={"User-Agent":"Astera Baby Name/0.6 (research project; https://github.com/BrayanQuirino/astera-baby-name)","Accept":"application/sparql-results+json"})
        with urllib.request.urlopen(request,timeout=25) as response:
            result=json.load(response)
    except Exception as exc:
        print("Wikidata P407 query interrupted after",retrieved,":",str(exc)[:160],flush=True)
        break
    bindings=result.get("results",{}).get("bindings",[])
    if not bindings:break
    for item in bindings:
        name=item.get("name",{}).get("value","")
        language=item.get("langLabel",{}).get("value","")
        codes=codes_for(language)
        if not codes:continue
        row=index.get(key(name))
        if not row:continue
        entity=item.get("item",{}).get("value","")
        qid=entity.rsplit("/",1)[-1] if entity.startswith("http") else ""
        evidence=(key(name),qid,language)
        if evidence in seen:continue
        seen.add(evidence)
        row["originCountryCodes"]=sorted(set(row["originCountryCodes"])|set(codes))
        languages=set(row.get("originLanguages") or [])
        languages.add(language)
        row["originLanguages"]=sorted(languages)
        sources=set(row.get("originCountrySources") or [])
        sources.add("wikidata-P407")
        row["originCountrySources"]=sorted(sources)
        if "verificar" in norm(row.get("origin")):
            row["origin"]=' / '.join(row["originLanguages"])
        retrieved+=1
    print("Wikidata P407 offset",offset,"rows",len(bindings),"matched",retrieved,flush=True)
    if len(bindings)<2500:break
    time.sleep(1)

# Preserve explicit origin from editorial Japanese review regardless of whether
# the Wikidata endpoint supplies this name.
for row in names:
    if 'Japonés' in row.get("origin","") and "JP" not in row["originCountryCodes"]:
        raise RuntimeError("Japanese source origin lost: "+row["name"])
    if row["originCountryCodes"]!=sorted(set(row["originCountryCodes"])):
        raise RuntimeError("Duplicate code: "+row["name"])
count=collections.Counter(code for row in names for code in row["originCountryCodes"])
report={
    "total":len(names),"classified":sum(bool(x["originCountryCodes"]) for x in names),
    "unclassified":sum(not x["originCountryCodes"] for x in names),
    "WikidataNamesMatched":retrieved,
    "countries":dict(sorted(count.items())),
    "notes":"Country codes are language/culture search categories, NOT countries of birth or record usage."
}
(BASE/"origin-coverage.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
(BASE/"extended.json").write_text(json.dumps(names,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
print("Origin coverage:",json.dumps(report,ensure_ascii=False),flush=True)
