#!/usr/bin/env python3
"""Review and merge Japanese first-name candidates into Astera's canonical catalog.

Idempotent, no inferred characters or 'Japanese' etymology from JP usage.
Only approved Japanese names in src/data/japanese_curated.json are touched.
An authentic 2025 kanji spelling/reading may be attached with citation.
Unverified meanings remain labeled as *creative*, never published.
"""
import collections,hashlib,json,unicodedata
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"public/names"
CURATED=ROOT/"src/data/japanese_curated.json"
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
def key(s):return unicodedata.normalize("NFC",str(s)).casefold().strip()
def load(path):return json.loads(path.read_text(encoding="utf-8"))
def save(path,obj,pretty=False):
 path.write_text(json.dumps(obj,ensure_ascii=False,indent=2 if pretty else None,separators=None if pretty else (",",":"))+"\n",encoding="utf-8")
def poem(name):
 digest=hashlib.sha256(name.casefold().encode("utf-8")).digest()
 a=digest[0]%len(PHRASES);b=(a+1+digest[1]%(len(PHRASES)-1))%len(PHRASES)
 return f"Evoca {PHRASES[a]} y {PHRASES[b]}."
def culture(origin):
 o=str(origin or "").casefold()
 return "japanese" in o or "japon" in o
catalog=load(BASE/"extended.json")
names={key(n["name"]):n for n in catalog}
reviewed=load(CURATED)
added=0; enriched=0
for entry in reviewed:
 name=entry["name"];k=key(name);existing=names.get(k)
 if existing is None:
  item=dict(entry)
  item["meaning"]=item.get("meaning") or poem(name)
  item["meaningType"]=entry.get("meaningType","creative")
  item["meaningStatus"]="documented" if item["meaningType"]=="published" else "poetic_interpretation"
  item["meaningSource"]=entry.get("meaningSource") if item["meaningType"]=="published" else None
  item["meaningSourceUrl"]=entry.get("meaningSourceUrl") if item["meaningType"]=="published" else None
  item["reviewStatus"]="source_matched" if item["meaningType"]=="published" else "requires_etymological_source"
  item["country"]="JP";item["countries"]=["JP"]
  item["origin"]="Japonés";item["nativeStatus"]="documented" if item.get("native") else "not_available"
  item["variants"]=sorted(set(item.get("variants") or []),key=str.casefold)
  names[k]=item;added+=1
 else:
  # A surname/country of usage cannot prove origin. Here the distinct Japanese
  # name comes from editorial review and, where specified, source rankings.
  origin=existing.get("origin","")
  if not culture(origin):
   existing["origin"]="Japonés" if not origin or "verificar" in origin.casefold() else origin+" / Japonés"
  existing["countries"]=sorted(set(existing.get("countries",[]))|{"JP"})
  existing["usageSources"]=sorted(set(existing.get("usageSources",[]))|{"astera-japanese-review-2026"})
  if entry.get("native") and not existing.get("native"):
   existing["native"]=entry["native"]
   existing["nativeStatus"]="documented"
  if entry.get("reading") and not existing.get("reading"):
   existing["reading"]=entry["reading"]
  if entry.get("meaningType")=="published" and existing.get("meaningType")!="published":
   existing["meaning"]=entry["meaning"]
   existing["meaningType"]="published"
   existing["meaningStatus"]="documented"
   existing["meaningSource"]=entry["meaningSource"]
   existing["meaningSourceUrl"]=entry["meaningSourceUrl"]
   existing["meaningLanguage"]="es"
   existing["reviewStatus"]="source_matched"
  # Don't erase a documented meaning from another language or force a
  # potentially genuinely unisex name to a single gender.
  enriched+=1
items=sorted(names.values(),key=lambda n:n["name"].casefold())
coverage=load(BASE/"coverage.json")
manifest=load(BASE/"manifest.json")
documented=sum(x["meaningType"]=="published" for x in items)
coverage["totalNames"]=len(items)
coverage["meaningDocumented"]=documented
coverage["meaningPending"]=len(items)-documented
coverage["meaningSources"]=dict(sorted(collections.Counter(x.get("meaningSource") or "creative" for x in items).items()))
origins=collections.Counter(x["origin"] for x in items if x["meaningType"]=="creative")
coverage["pendingByOrigin"]=[{"origin":k,"count":v} for k,v in sorted(origins.items(),key=lambda x:(-x[1],x[0].casefold()))]
manifest.update(count=len(items),populatedCount=len(items),meaningCount=documented,missingMeaningCount=len(items)-documented,
 nativeScriptCount=sum(bool(x.get("native")) for x in items),variantCount=sum(bool(x.get("variants")) for x in items),
 japaneseReview={"reviewed":len(reviewed),"added":added,"existingEnriched":enriched,"source":"Meiji Yasuda 2025 and editorial Japanese-name review"})
save(BASE/"extended.json",items)
save(BASE/"manifest.json",manifest,True)
save(BASE/"coverage.json",coverage,True)
print(f"Japanese review: {len(reviewed)} names; new {added}; enriched {enriched}; total {len(items)}")
