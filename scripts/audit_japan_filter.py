#!/usr/bin/env python3
"""Read-only diagnostic of Japan-related name coverage; source vs usage."""
import json,collections,unicodedata
from pathlib import Path
p=Path("public/names/extended.json")
items=json.loads(p.read_text(encoding="utf-8"))
def norm(s):
 return "".join(c for c in unicodedata.normalize("NFD",str(s or "").lower()) if unicodedata.category(c)!="Mn")
def jp_origin(n):
 return any(x in norm(n.get("origin")) for x in ["japan","japon","日本","nihon"])
def native_jp(n):
 return any('\u3040'<=ch<='\u30ff' or '\u3400'<=ch<='\u9fff' for ch in n.get("native",""))
groups=collections.defaultdict(list)
for n in items:
 if "JP" not in n.get("countries",[]) and n.get("country")!="JP" and not jp_origin(n):continue
 gender=n.get("gender")
 if jp_origin(n):groups["origin_"+gender].append(n["name"])
 if "JP" in n.get("countries",[]):
  groups["usage_"+gender].append(n["name"])
  if not jp_origin(n):
   groups["usage_not_origin_"+gender].append(n["name"])
   if native_jp(n):groups["usage_with_japanese_script_"+gender].append(n["name"])
   if norm(n.get("origin"))=="origen por verificar":groups["usage_unknown_origin_"+gender].append(n["name"])
report={"total":len(items),"counts":{k:len(v) for k,v in groups.items()},"samples":{k:v[:80] for k,v in groups.items()},"jpOriginAll":[{"name":n["name"],"gender":n["gender"],"origin":n.get("origin"),"countries":n.get("countries")} for n in items if jp_origin(n)][:130]}
Path("reports/japan_filter_audit.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(report,ensure_ascii=False,indent=2)[:10500])
