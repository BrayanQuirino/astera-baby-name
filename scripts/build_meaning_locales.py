#!/usr/bin/env python3
"""Build language-specific meaning JSON without changing original name provenance.

Creative associations are composed from 32 translated phrase fragments; sourced
meanings are translated in batches. Translations are presentation copies and
never replace original scholarly or source-language meanings.
The public Google Translate endpoint is an optional external dependency.
Missing translations are omitted and remain explicitly distinguishable in UI.
"""
import ast
import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/"public/names/extended.json"
OUTPUT=ROOT/"public/names/locales"
OUTPUT.mkdir(parents=True,exist_ok=True)
LANGUAGES=("en","fr","pt","de","it","ja","ko","zh")
TEMPLATES={
 "en":"Evokes {a} and {b}.",
 "fr":"Évoque {a} et {b}.",
 "pt":"Evoca {a} e {b}.",
 "de":"Erinnert an {a} und {b}.",
 "it":"Evoca {a} e {b}.",
 "ja":"{a}、そして{b}を思わせます。",
 "ko":"{a}, 그리고 {b}을(를) 떠올리게 합니다.",
 "zh":"令人联想到{a}与{b}。"
}
def poetic_fragments():
    tree=ast.parse((ROOT/"scripts/build_catalog.py").read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=="POETIC_ASSOCIATIONS" for t in node.targets):
            return ast.literal_eval(node.value)
    raise RuntimeError("The canonical poetic associations are missing")
def translate(text,lang,retries=3):
    if not text.strip():return ""
    params=urllib.parse.urlencode({"client":"gtx","sl":"auto","tl":lang,"dt":"t","q":text})
    request=urllib.request.Request("https://translate.googleapis.com/translate_a/single?"+params,
                                  headers={"User-Agent":"Mozilla/5.0 (compatible; Astera/0.5)"})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request,timeout=25) as response:
                payload=json.load(response)
            translated="".join(piece[0] or "" for piece in payload[0])
            if translated.strip():return translated.strip()
        except (ValueError,KeyError,IndexError,TypeError,TimeoutError,OSError) as exc:
            if attempt==retries-1:
                print(f"Translation unavailable ({lang}): {str(exc)[:90]}",flush=True)
                return None
            time.sleep(2**attempt)
    return None
def load_json(path,default):
    try:return json.loads(path.read_text(encoding="utf-8"))
    except (OSError,ValueError):return default
def save(path,data):
    path.write_text(json.dumps(data,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
def batch_translate(strings,lang):
    """Use predictable line delimiter; reject mismatched batches rather than misattribute."""
    marker="\n___ASTERA___\n"
    result={}
    for offset in range(0,len(strings),12):
        block=strings[offset:offset+12]
        composite=marker.join(block)
        translated=translate(composite,lang,retries=2)
        parts=translated.split("___ASTERA___") if translated else []
        if len(parts)==len(block):
            for source,part in zip(block,parts):
                cleaned=part.strip(" \n\r\t_")
                if cleaned:result[source]=cleaned
        else:
            # Conservative fallback: never assign one name's meaning to another.
            for source in block:
                single=translate(source,lang,retries=2)
                if single:result[source]=single
    return result

catalog=load_json(CATALOG,[])
if not catalog:raise RuntimeError("Catalog not found")
fragments=poetic_fragments()
published=sorted({n["meaning"] for n in catalog if n.get("meaningType")=="published" and n.get("meaning")})
# Curated meanings supplement catalog meaning lookup.
curated=load_json(ROOT/"src/data/international.json",[])
published=sorted(set(published)|{n["meaning"] for n in curated if isinstance(n,dict) and n.get("meaning")})
for lang in LANGUAGES:
    path=OUTPUT/(lang+".json")
    old=load_json(path,{})
    phrases=dict(old.get("phrases") or {})
    meanings=dict(old.get("meanings") or {})
    missing_fragments=[f for f in fragments if f not in phrases]
    if missing_fragments:
        phrases.update(batch_translate(missing_fragments,lang))
    save(path,{"lang":lang,"sourceLocale":"es","template":TEMPLATES[lang],
               "phrases":phrases,"meanings":meanings,"status":"partial"})
    remaining=[m for m in published if m not in meanings]
    # Incremental progress: build caches in small blocks and save frequently.
    for i in range(0,len(remaining),120):
        meanings.update(batch_translate(remaining[i:i+120],lang))
        save(path,{"lang":lang,"sourceLocale":"es","template":TEMPLATES[lang],
                   "phrases":phrases,"meanings":meanings,
                   "status":"complete" if len(phrases)==len(fragments) and len(meanings)>=len(published) else "partial"})
        print(lang,len(meanings),"/",len(published),flush=True)
    print(f"{lang}: {len(phrases)}/{len(fragments)} poetic phrases; {len(meanings)}/{len(published)} source meanings",flush=True)
