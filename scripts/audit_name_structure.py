#!/usr/bin/env python3
"""Read-only quality audit for compound, abbreviated and malformed baby-name records.

Never expand an initial automatically: M could mean María, Maria, Marie,
Mohamed, etc. Preserve source names and report human-review candidates.
"""
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/"public/names/extended.json"
CURATED=ROOT/"src/data/international.json"
REPORT=ROOT/"reports/name_structure_audit.json"
REPORT.parent.mkdir(exist_ok=True)

def fold(text):
    return "".join(c for c in unicodedata.normalize("NFD",text.casefold()) if unicodedata.category(c)!="Mn")
def compact(text):
    return re.sub(r"[^a-z0-9]+","",fold(text))
def info(item):
    return {k:item.get(k) for k in ("name","gender","origin","meaning","meaningType","source")}
def record(group,item):
    groups[group].append(info(item))

names=json.loads(CATALOG.read_text(encoding="utf-8"))
curated=json.loads(CURATED.read_text(encoding="utf-8"))
groups=defaultdict(list)
lookups=defaultdict(list)
by_key=defaultdict(list)
for item in names:
    name=item["name"]
    normalized=fold(name)
    lookups[normalized].append(item)
    by_key[compact(name)].append(item)
    words=name.split()
    if len(words)>=2:
        record("multiple_words",item)
    if len(words)>=3:
        record("three_or_more_words",item)
    if re.match(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]\.?\s+\S",name):
        record("leading_single_initial",item)
    if re.search(r"(?<=\s)[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]\.?(?=\s|$)",name):
        record("middle_or_trailing_single_initial",item)
    if re.match(r"^(?:M|M\.|Ma|Ma\.|Mª|Mª\.)\s+",name,re.I):
        record("possible_maria_abbreviation",item)
    if re.match(r"^(?:J|J\.|Jº|Jº\.)\s+",name,re.I):
        record("ambiguous_j_initial",item)
    if re.search(r"[0-9*?/#@\\]",name):
        record("non_name_symbols",item)
    if re.search(r"(?<!\w)[A-Za-z]\.(?!\w)",name):
        record("period_abbreviations",item)
    if re.search(r"\s{2,}",name) or name!=name.strip():
        record("whitespace_anomalies",item)
    if re.search(r"[,:;()\[\]]",name):
        record("separator_or_annotation",item)
    if re.search(r"[-–]",name):
        record("hyphenated_names",item)
    if re.match(r"^(?:Maria|María|José|Jose|Ana|Juan|Jean|Abd|Abdul)\s+",name,re.I):
        record("common_compound_prefixes",item)
    if len(name)<=2 and name.isalpha():
        record("short_names_review_not_necessarily_invalid",item)
for key,items in lookups.items():
    if len(items)>1:
        groups["diacritic_fold_collisions"].append([info(i) for i in items])
for key,items in by_key.items():
    if len(items)>1:
        groups["punctuation_or_space_collisions"].append([info(i) for i in items])
freq=Counter(item["name"].split()[0].casefold() for item in names if len(item["name"].split())>1)
suspicious_initials=groups["leading_single_initial"]
summary={
    "totalCatalogRecords":len(names),
    "totalCuratedInternational":len(curated),
    "present":{n:[info(x) for x in lookups.get(fold(n),[])] for n in
       ["M Carmen","Maria","María","Maria del Carmen","María del Carmen","María Carmen",
        "Ma Carmen","Mª Carmen","M. Carmen","José María","Jose Maria","M Jose","M José",
        "M Dolores","M Pilar","M Teresa","M Isabel","M Angeles"]},
    "countByCategory":{k:len(v) for k,v in groups.items()},
    "commonCompoundFirstWords":freq.most_common(40),
    "curatedExactMaria":any(fold(x["name"])=="maria" for x in curated),
    "warning":"Categorization detects possible abbreviations and formatting anomalies, not definitively incorrect legal names.",
    "policy":"Retain source name and native form; expansion requires corroboration. Independently index genuine compounds and their components."
}
payload={"summary":summary,"groups":dict(sorted(groups.items()))}
REPORT.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding="utf-8")
print("Total records:",len(names))
for key,count in sorted(summary["countByCategory"].items(),key=lambda p:-p[1]):
    print(f"{key}: {count}")
print("Observed variants:", {k:[x["name"] for x in v] for k,v in summary["present"].items() if v})
print("Curated exact Maria:",summary["curatedExactMaria"])
print("Audit saved:",REPORT)

# Small machine-readable digest for quick review; detailed report stays intact.
summary_path=ROOT/"reports/name_structure_summary.json"
summary_path.write_text(json.dumps({
  **summary,
  "examples":{k:([x.get("name") if isinstance(x,dict) else [y["name"] for y in x] for x in v[:24]]) for k,v in sorted(groups.items())},
},ensure_ascii=False,indent=2),encoding="utf-8")
print("Compact summary:",summary_path)
