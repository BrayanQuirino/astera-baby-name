#!/usr/bin/env python3
"""Import Japanese given names from the EDRDG JMnedict source dictionary.

EDRDG JMnedict; CC BY-SA with attribution and share-alike for derived names.
A Japanese name can have MANY kanji spellings for the same reading. Merge by
Hepburn reading, preserve alternative kanji without inventing meanings, and
never claim a foreign-used name was Japanese without given-name evidence.
"""
import collections,gzip,io,json,re,unicodedata,urllib.request
from pathlib import Path
from lxml import etree
from pykakasi import kakasi

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"public/names"
URL="https://www.edrdg.org/pub/Nihongo/JMnedict.xml.gz"
HEADERS={"User-Agent":"AsteraBabyName/0.7 (Japanese name dictionary research; https://github.com/BrayanQuirino/astera-baby-name)"}
def norm(s):return unicodedata.normalize("NFC",str(s)).casefold().strip()
def read(path):return json.loads(path.read_text(encoding="utf-8"))
def write(path,value,pretty=False):
 path.write_text(json.dumps(value,ensure_ascii=False,indent=2 if pretty else None,separators=None if pretty else (",",":"))+("\n" if pretty else ""),encoding="utf-8")
def valid_kana(value):
 return bool(value) and len(value)<=15 and all(0x3040<=ord(ch)<=0x30ff or ch in "ー・" for ch in value)
def clean_romanization(value):
 chunks=kakasi().convert(value)
 output=''.join(segment["hepburn"] for segment in chunks)
 output=output.replace(" ","").replace("-","").replace("'","")
 if not re.fullmatch(r"[a-zA-ZāīūēōĀĪŪĒŌ]+",output):return ""
 if len(output)<2 or len(output)>28:return ""
 # Restore familiar spellings for long vowels, while preserving kana as reading.
 return output[0].upper()+output[1:]
def gender_tag(tags):
 labels={re.sub(r'[^a-z ]','',x.casefold()).strip() for x in tags}
 female=any(x in ('female given name','female','fem','f') for x in labels)
 male=any(x in ('male given name','male','masc','m') for x in labels)
 common=any(x in ('given name','given','unclassified given name','g') for x in labels)
 if not (female or male or common):return None
 return "unisex" if female and male else "girl" if female else "boy" if male else "unisex"

with urllib.request.urlopen(urllib.request.Request(URL,headers=HEADERS),timeout=85) as response:
 blob=response.read()
if len(blob)<100000:raise RuntimeError("JMnedict archive unexpectedly small")
print("Downloaded JMnedict",len(blob),"compressed bytes",flush=True)
variants=collections.defaultdict(lambda:{"boy":False,"girl":False,"unisex":False,"native":set(),"readings":set(),"entities":set()})
parser=etree.iterparse(gzip.GzipFile(fileobj=io.BytesIO(blob)),events=("end",),tag="entry",resolve_entities=True,load_dtd=True,no_network=True,huge_tree=True)
scanned=0
for _,elem in parser:
 scanned+=1
 kana=[t.strip() for t in elem.xpath("./r_ele/reb/text()") if t and valid_kana(t.strip())]
 kanji=[t.strip() for t in elem.xpath("./k_ele/keb/text()") if t and len(t.strip())<=10]
 kind=[str(x).strip() for x in elem.xpath("./trans/name_type/text()")]
 gender=gender_tag(kind)
 if gender and kana:
  for reading in kana[:3]:
   romaji=clean_romanization(reading)
   if not romaji:continue
   item=variants[norm(romaji)]
   item[gender]=True
   item["readings"].add(reading)
   for kanji_spelling in kanji[:8]:
    item["native"].add(kanji_spelling)
   if len(item["entities"])<4:
    item["entities"].add(str(elem.findtext("ent_seq") or ""))
 elem.clear()
 while elem.getprevious() is not None:del elem.getparent()[0]
print("Scanned",scanned,"records, Japanese given-name readings",len(variants),flush=True)
if len(variants)<2000:
 raise RuntimeError("JMnedict name-type classification yielded too few genuine given names")

catalog=read(OUT/"extended.json")
indexed={norm(n["name"]):n for n in catalog}
new=0;merged=0;by_gender=collections.Counter()
for lookup,record in sorted(variants.items()):
 # Reconstruct from the romanization for a stable display name.
 kana=sorted(record["readings"],key=lambda x:(len(x),x))
 name=clean_romanization(kana[0])
 if not name:continue
 sexes=[sex for sex in ("boy","girl") if record[sex]]
 gender="unisex" if record["unisex"] or len(sexes)!=1 else sexes[0]
 options=sorted(record["native"],key=lambda x:(len(x),x))
 native=options[0] if options else kana[0]
 if norm(name) in indexed:
  row=indexed[norm(name)]
  if "japon" not in row.get("origin","").casefold() and "japanese" not in row.get("origin","").casefold():
   old=row.get("origin","")
   row["origin"]="Japonés" if not old or "verificar" in old.casefold() else old+" / Japonés"
  row["originCountryCodes"]=sorted(set(row.get("originCountryCodes",[]))|{"JP"})
  row["originCountrySources"]=sorted(set(row.get("originCountrySources",[]))|{"EDRDG-JMnedict"})
  row["countries"]=sorted(set(row.get("countries",[]))|{"JP"})
  row.setdefault("nativeVariants",[])
  row["nativeVariants"]=sorted(set(row["nativeVariants"])|set(options[:16]),key=str.casefold)
  if not row.get("native"):
   row["native"]=native
   row["nativeStatus"]="documented"
  if not row.get("reading"):row["reading"]=kana[0]
  merged+=1
 else:
  row={
   "name":name,"gender":gender,"origin":"Japonés","originCountryCodes":["JP"],
   "originCountrySources":["EDRDG-JMnedict"],"country":"JP","countries":["JP"],
   "native":native,"nativeVariants":options[:16],"nativeStatus":"documented",
   "reading":kana[0],"meaning":"Nombre japonés: su significado específico depende de los kanji elegidos.",
   "meaningType":"creative","meaningStatus":"poetic_interpretation",
   "meaningSource":None,"meaningSourceUrl":None,
   "reviewStatus":"requires_etymological_source","variants":[],"source":"EDRDG-JMnedict",
  }
  indexed[norm(name)]=row
  new+=1
 by_gender[gender]+=1
rows=sorted(indexed.values(),key=lambda row:row["name"].casefold())
if len(rows)!=len(indexed):raise RuntimeError("Duplicate names after JMnedict merge")
manifest=read(OUT/"manifest.json");coverage=read(OUT/"coverage.json")
documented=sum(x.get("meaningType")=="published" for x in rows)
manifest.update(count=len(rows),populatedCount=len(rows),meaningCount=documented,missingMeaningCount=len(rows)-documented,
 nativeScriptCount=sum(bool(x.get("native")) for x in rows),variantCount=sum(bool(x.get("variants")) for x in rows),
 jmnedict={"japaneseGivenNames":len(variants),"new":new,"merged":merged,"license":"CC BY-SA; EDRDG attribution","gender":dict(by_gender)})
coverage["totalNames"]=len(rows)
coverage["meaningDocumented"]=documented;coverage["meaningPending"]=len(rows)-documented
coverage["meaningSources"]=dict(sorted(collections.Counter(x.get("meaningSource") or "creative" for x in rows).items()))
origins=collections.Counter(x["origin"] for x in rows if x["meaningType"]=="creative")
coverage["pendingByOrigin"]=[{"origin":k,"count":v} for k,v in sorted(origins.items(),key=lambda z:(-z[1],z[0].casefold()))]
write(OUT/"extended.json",rows)
write(OUT/"manifest.json",manifest,True)
write(OUT/"coverage.json",coverage,True)
print("JMnedict merged",merged,"added",new,"total",len(rows),"japanese gender",dict(by_gender),flush=True)
