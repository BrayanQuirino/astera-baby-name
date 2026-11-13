#!/usr/bin/env python3
import json,collections
from pathlib import Path
rows=json.loads(Path('public/names/extended.json').read_text())
by=collections.Counter(x.get('origin','') for x in rows)
countries=collections.Counter(c for x in rows for c in x.get('countries',[]))
report={'total':len(rows),'origins':by.most_common(70),'usageCountries':countries.most_common(35),'jp':{'known':[(x['name'],x['origin']) for x in rows if 'japon' in x.get('origin','').lower() or 'japanese' in x.get('origin','').lower()][:30]}}
Path('reports/origin_audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False)[:9500])
