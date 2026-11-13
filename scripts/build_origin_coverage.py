#!/usr/bin/env python3
"""Fast integrity summary of cultural-origin codes after a verified import."""
import collections,json
from pathlib import Path
base=Path("public/names")
rows=json.loads((base/"extended.json").read_text(encoding="utf-8"))
counts=collections.Counter(code for row in rows for code in row.get("originCountryCodes",[]))
report={
 "total":len(rows),
 "classified":sum(bool(row.get("originCountryCodes")) for row in rows),
 "unclassified":sum(not row.get("originCountryCodes") for row in rows),
 "countries":dict(sorted(counts.items())),
 "notes":"Cultural/language-origin evidence only; never residency or birth country."
}
(base/"origin-coverage.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Origin coverage:",report)
