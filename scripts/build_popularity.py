#!/usr/bin/env python3
"""Derive a country-aware name-frequency index from licensed Onomaverse records.
Shares are fractions of recorded given names within each country, NOT global
population shares or birth statistics. This is an indicative index only.
"""
import csv, io, json, math, urllib.request, unicodedata
from pathlib import Path

URL="https://github.com/onomaverse/datasets/releases/download/v2026.10/given-name-frequency.csv"
ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/"public/names/extended.json"
OUTPUT=ROOT/"public/names/popularity.json"
def key(text):
    return unicodedata.normalize("NFD",text).casefold().strip()
names={key(item["name"]) for item in json.loads(CATALOG.read_text(encoding="utf-8"))}
counts={}
request=urllib.request.Request(URL,headers={"User-Agent":"AsteraBabyName/0.4"})
with urllib.request.urlopen(request,timeout=90) as response:
    csv_stream=io.TextIOWrapper(response,encoding="utf-8-sig",newline="")
    for item in csv.DictReader(csv_stream):
        name=key(item["name"])
        if name not in names:continue
        country=item["country_code"].upper()
        try: share=float(item["pct_in_country"])
        except (ValueError,TypeError):continue
        if not (0<share<=1):continue
        counts.setdefault(name,{})[country]=round(share,8)
# 0.00001% = nearly unknown; 5% = very widespread in a sampled country.
# Logarithmic scaling represents very uneven frequency without implying 100%
# means every citizen has the name. This is an index, never a literal percentage.
def index(share):
    return max(1,min(100,round(100*(math.log10(max(share,1e-7))+7)/(math.log10(.05)+7))))
result={
 "version":"onomaverse-v2026.10",
 "metric":"relative_record_frequency_index",
 "description":"0–100 logarithmic index based on share of first-name records for the indicated country; NOT a worldwide birth or population percentage.",
 "source":"https://onomaverse.com/datasets",
 "license":"CC BY 4.0",
 "names":{name:{country:[index(share),share] for country,share in sorted(countries.items())}
          for name,countries in sorted(counts.items())}
}
OUTPUT.write_text(json.dumps(result,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
print(f"Generated {OUTPUT}: {len(counts)} names with observed frequency")
