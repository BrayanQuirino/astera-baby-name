#!/usr/bin/env python3
"""Extend verified etymological origins from Wiktionary's explicit name-origin categories.

Use only categories of the exact form 'X [gender] given names from Y': the
category asserts that the given-name form is derived from language Y, unlike
country-of-use/census records. No suggestion based on phonetics or birthplace.
Wikipedia/Wiktionary names may legitimately belong to several source cultures.
These extracted name-origin associations remain CC BY-SA (Wiktionary).
"""
import json, re, time, urllib.parse, urllib.request, urllib.error, unicodedata, collections
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"public/names"
RULES=json.loads((ROOT/"src/data/cultural_origin_rules.json").read_text(encoding="utf-8"))["rules"]
TARGETS=[
 ("Japanese","JP"),("Korean","KR"),("Chinese","CN"),("Spanish","ES"),
 ("French","FR"),("Italian","IT"),("German","DE"),("English","GB"),
 ("Irish","IE"),("Portuguese","PT"),("Arabic","SA"),("Turkish","TR"),
 ("Persian","IR"),("Russian","RU"),("Greek","GR"),("Hebrew","IL"),
 ("Polish","PL"),("Dutch","NL"),("Finnish","FI"),("Swedish","SE"),
 ("Yoruba","NG"),("Sanskrit","IN"),("Hindi","IN"),("Swahili","KE"),
 ("Welsh","GB"),("Scottish Gaelic","GB"),("Basque","ES"),("Nahuatl","MX"),
 ("Mayan","MX"),("Hawaiian","US"),("Thai","TH"),("Vietnamese","VN"),
 ("Tagalog","PH"),("Igbo","NG"),("Tamil","IN"),("Bengali","BD"),
 ("Latin",None),("Old Norse","NO"),("Old English","GB"),("Germanic","DE")]
# Host language is not used as origin, even for borrowed names.
HOSTS=["English","French","Spanish","German","Italian","Portuguese"]
SEXES=["male","female"]
def key(s):return unicodedata.normalize("NFC",str(s or "")).strip().casefold()
def norm(s):return ''.join(c for c in unicodedata.normalize("NFD",str(s or "").casefold()) if unicodedata.category(c)!="Mn")
dataset=json.loads((BASE/"extended.json").read_text(encoding="utf-8"))
names={key(n["name"]):n for n in dataset}
stats=collections.Counter()
failures=collections.Counter()
cache={}
def pages(category):
 if category in cache:return cache[category]
 result=[]
 continuation=None
 for page in range(6):
  params={"action":"query","list":"categorymembers","cmtitle":"Category:"+category,
          "cmtype":"page","cmlimit":"500","format":"json","formatversion":"2"}
  if continuation:params["cmcontinue"]=continuation
  url="https://en.wiktionary.org/w/api.php?"+urllib.parse.urlencode(params)
  try:
   with urllib.request.urlopen(urllib.request.Request(url,headers={
       "User-Agent":"AsteraBabyName/0.9 (https://github.com/BrayanQuirino/astera-baby-name; multilingual first-name research)",
       "Accept":"application/json"}),timeout=18) as response:
    payload=json.load(response)
  except (urllib.error.URLError,TimeoutError,ValueError) as exc:
   failures[type(exc).__name__]+=1
   break
  result += [i["title"] for i in payload.get("query",{}).get("categorymembers",[]) if i.get("ns")==0]
  continuation=payload.get("continue",{}).get("cmcontinue")
  if not continuation:break
 cache[category]=result
 return result
for origin,code in TARGETS:
 if not code:continue
 for host in HOSTS:
  for sex in SEXES:
   category=f"{host} {sex} given names from {origin}"
   candidates=pages(category)
   if not candidates:continue
   touched=0
   for label in candidates:
    row=names.get(key(label))
    if row is None:continue
    current=set(row.get("originCountryCodes") or [])
    if code in current:continue
    row["originCountryCodes"]=sorted(current|{code})
    source="Wiktionary category:"+category
    row["originCountrySources"]=sorted(set(row.get("originCountrySources") or [])|{source})
    row["originLanguages"]=sorted(set(row.get("originLanguages") or [])|{origin})
    if "verificar" in norm(row.get("origin")):
     row["origin"]=" / ".join(row["originLanguages"])
    touched+=1
   stats[origin]+=touched
   if touched:print(category,"matched",touched,flush=True)
   time.sleep(.06)
print("Wiktionary new attested origin links",sum(stats.values()),"by origin",dict(stats),"failures",dict(failures),flush=True)
if not sum(stats.values()):
 print("No source-backed origins recovered; keeping existing data intact",flush=True)
 raise SystemExit(0)
(BASE/"extended.json").write_text(json.dumps(dataset,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
(ROOT/"reports/wiktionary_origin_enrichment.json").write_text(json.dumps({
 "source":"English Wiktionary / Wiktextract categories (CC BY-SA)",
 "method":"Direct only: language X given names from language Y",
 "linksAdded":sum(stats.values()),"byOrigin":dict(stats),"failures":dict(failures)
},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
