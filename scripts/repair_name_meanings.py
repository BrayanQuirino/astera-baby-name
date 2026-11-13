#!/usr/bin/env python3
"""Upgrade Astera's display meanings without pretending to know undocumented etymologies.

Order of precedence:
  1) Already sourced catalog meanings remain untouched.
  2) Curated writing/meaning pairs (incl. suggested kanji) replace placeholders.
  3) A meaning is assembled from Japanese kanji only when ALL symbols have
     approved, manually reviewed Spanish glosses.
  4) Other unsourced entries receive a brief individually-composed literary
     interpretation, honestly kept in meaningType='creative'.

This maintains explicit provenance. A poetic meaning is not presented as
a dictionary or historical etymology.
"""
import collections
import hashlib
import json
import re
import unicodedata
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"public/names"

def read(path):
    return json.loads(path.read_text(encoding="utf-8"))

def write(path, data, pretty=False):
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2 if pretty else None,
                               separators=None if pretty else (",",":"))+"\n",encoding="utf-8")

def fold(value):
    return unicodedata.normalize("NFC",str(value or "")).strip().casefold()

def japanese(row):
    origin=str(row.get("origin") or "").casefold()
    return "japon" in origin or "japanese" in origin

# Reference glosses: actual character semantics, never guessed based on romaji.
# Literal glosses are a suggested interpretation, not proof of a person's
# registered name spelling or a canonical 'meaning of the name'.
KANJI={
 "愛":"amor","光":"luz","明":"claridad","陽":"sol","日":"día","朝":"mañana",
 "月":"luna","星":"estrella","空":"cielo","天":"cielo","海":"mar",
 "波":"ola","水":"agua","泉":"manantial","川":"río","河":"río",
 "湊":"puerto","港":"puerto","瀬":"corriente","雪":"nieve","雨":"lluvia",
 "風":"viento","涼":"frescura","晴":"cielo despejado",
 "春":"primavera","夏":"verano","秋":"otoño","冬":"invierno",
 "花":"flor","華":"esplendor","桜":"cerezo","咲":"florecer",
 "菜":"verdor","芽":"brote","莉":"jazmín","蓮":"loto","葵":"malva",
 "桃":"durazno","柚":"yuzu","梨":"pera","楓":"arce","樹":"árbol",
 "木":"árbol","林":"bosque","森":"bosque","葉":"hoja","草":"hierba",
 "香":"fragancia","美":"belleza","麗":"elegancia","彩":"color",
 "音":"música","奏":"melodía","琴":"cítara","歌":"canción","詩":"poesía",
 "文":"letras","絵":"arte","書":"escritura",
 "優":"gentileza","結":"unión","絆":"vínculo","和":"armonía",
 "平":"paz","安":"calma","悠":"serenidad","穏":"tranquilidad",
 "心":"corazón","思":"pensamiento","夢":"sueño","希":"esperanza",
 "望":"deseo","幸":"felicidad","福":"bendición","喜":"alegría",
 "健":"salud","康":"bienestar","真":"verdad","誠":"sinceridad",
 "直":"rectitud","正":"justicia","義":"honradez","信":"confianza",
 "勇":"coraje","武":"valentía","力":"fuerza","勝":"victoria",
 "大":"grandeza","太":"fortaleza","高":"altura","隆":"prosperidad",
 "広":"amplitud","弘":"abundancia","浩":"inmensidad","豊":"abundancia",
 "翔":"vuelo","飛":"volar","翼":"alas","鳥":"ave","隼":"halcón",
 "龍":"dragón","竜":"dragón","虎":"tigre",
 "輝":"resplandor","晶":"brillo","亮":"claridad","煌":"fulgor",
 "一":"uno","二":"dos","三":"tres","七":"siete","千":"mil","百":"cien",
 "人":"humanidad","子":"niñez","男":"hombre","郎":"hijo",
 "里":"hogar","地":"tierra","陸":"tierra","山":"montaña","田":"campo",
 "歩":"pasos","道":"camino","路":"sendero","新":"nuevo comienzo",
 "実":"fruto","果":"fruto","恵":"gracia","仁":"benevolencia",
 "智":"sabiduría","知":"conocimiento","聡":"inteligencia","俊":"talento",
 "匠":"habilidad","理":"razón","介":"ayuda","司":"guía","也":"ser",
 "衣":"vestimenta","奈":"eco delicado","依":"confianza","麻":"tejido",
 "鈴":"campanilla","環":"círculo","萌":"germinación","栞":"guía",
 "尋":"búsqueda","瞳":"mirada","流":"flujo","青":"azul",
 "蒼":"azul profundo","碧":"jade azul","斗":"constelación",
 "紫":"violeta","白":"blancura","紅":"rojo","夕":"atardecer",
 "来":"porvenir","生":"vida","紬":"tejido","凛":"dignidad"
}
def kanji_gloss(native):
    # Complex names, kana, unreviewed characters and slash-separated
    # alternatives are intentionally excluded rather than guessed.
    if not native or not re.fullmatch(r"[\u3400-\u9fff]{1,3}",native):
        return None
    meanings=[]
    for character in native:
        gloss=KANJI.get(character)
        if not gloss:
            return None
        if gloss not in meanings:
            meanings.append(gloss)
    if len(meanings)==1:
        return meanings[0][0].upper()+meanings[0][1:]
    if len(meanings)==2:
        return meanings[0].capitalize()+" y "+meanings[1]
    return ", ".join(meanings[:-1]).capitalize()+" y "+meanings[-1]

# Literal 18×16×12 combinations. These descriptions are literary suggestions
# explicitly tagged creative, NOT a substitute for verified name meanings.
IMAGES=[
 "Una estrella","Una flor","Un amanecer","Una llama serena","Un jardín",
 "Una constelación","Una luz","Un horizonte","Un río","Una semilla",
 "Un lazo","Un corazón","Una montaña","Un cielo","Un bosque",
 "Una brisa","Una melodía","Un pequeño universo","Un lucero",
 "Una luna","Un camino","Una raíz","Una aurora","Una chispa"]
QUALITIES=[
 "de esperanza","de ternura","de valentía","de luz","de alegría",
 "de armonía","de sueños","de coraje","de belleza","de sabiduría",
 "de calma","de creatividad","de bondad","de nuevos comienzos",
 "de libertad","de fortaleza","de gratitud","de confianza"]
ACTIONS=[
 "que ilumina cada nuevo comienzo","que florece con cada aventura",
 "que conecta generaciones y culturas","que invita a descubrir el mundo",
 "que acompaña los sueños más grandes","que transforma pequeños instantes",
 "que encuentra su brillo en la vida","que nace para abrir caminos",
 "que abraza los recuerdos más dulces","que crece bajo un cielo infinito",
 "que inspira a mirar más allá","que guarda una historia única",
 "que anuncia tiempos luminosos","que celebra todo lo que está por venir",
 "que transmite alegría y serenidad","que invita a caminar con confianza"]
def imaginative_text(name):
    h=hashlib.sha256(f"astera:meaning:v3:{name.casefold()}".encode()).digest()
    return f"{IMAGES[h[0]%len(IMAGES)]} {QUALITIES[h[1]%len(QUALITIES)]} {ACTIONS[h[2]%len(ACTIONS)]}."

catalog=read(BASE/"extended.json")
japanese_curated={fold(n["name"]):n for n in read(ROOT/"src/data/japanese_curated.json")}
international={fold(n["name"]):n for n in read(ROOT/"src/data/international.json")}
stats=collections.Counter()
for row in catalog:
    # Existing source-matched published meanings must never be overwritten.
    if row.get("meaningType")=="published" and row.get("meaningSource"):
        stats["existing_sourced"]+=1
        continue
    k=fold(row["name"])
    choice=japanese_curated.get(k)
    if choice and choice.get("meaning") and japanese(row):
        row["meaning"]=choice["meaning"]
        row["meaningLanguage"]="es"
        row["meaningType"]=choice.get("meaningType","creative")
        row["meaningStatus"]="documented" if row["meaningType"]=="published" else "poetic_interpretation"
        row["reviewStatus"]="source_matched" if row["meaningType"]=="published" else "requires_etymological_source"
        row["meaningSource"]=choice.get("meaningSource") if row["meaningType"]=="published" else None
        row["meaningSourceUrl"]=choice.get("meaningSourceUrl") if row["meaningType"]=="published" else None
        if choice.get("native"):
            if row.get("native") and row["native"]!=choice["native"]:
                row["nativeVariants"]=sorted(set(row.get("nativeVariants") or [])|{row["native"]},key=str.casefold)
            row["native"]=choice["native"]
            row["nativeStatus"]="documented"
        if choice.get("reading"):
            row["reading"]=choice["reading"]
        if choice.get("kanjiStatus"):
            row["kanjiStatus"]=choice["kanjiStatus"]
            row["meaningNote"]=choice.get("meaningNote")
        row.pop("meaningCaveat",None)
        stats["reviewed_japanese"]+=1
        continue
    alternate=international.get(k)
    if alternate and alternate.get("meaning") and (
        alternate.get("country")==row.get("country") or
        str(alternate.get("origin","")).casefold()==str(row.get("origin","")).casefold()
    ):
        row["meaning"]=alternate["meaning"]
        row["meaningLanguage"]="es"
        row["meaningType"]="creative"
        row["meaningStatus"]="poetic_interpretation"
        row["meaningSource"]=None
        row["meaningSourceUrl"]=None
        row["reviewStatus"]="requires_etymological_source"
        if alternate.get("native") and not row.get("native"):
            row["native"]=alternate["native"]
            row["nativeStatus"]="documented"
        row.pop("meaningCaveat",None)
        stats["editorial_international"]+=1
        continue
    literal=kanji_gloss(row.get("native")) if japanese(row) else None
    if literal:
        row["meaning"]=literal
        row["meaningLanguage"]="es"
        row["meaningNote"]="Lectura artística de los caracteres mostrados; la escritura de cada persona puede variar."
        stats["kanji_interpreted"]+=1
    else:
        row["meaning"]=imaginative_text(row["name"])
        row["meaningLanguage"]="es"
        row.pop("meaningNote",None)
        stats["creative_specific"]+=1
    row["meaningType"]="creative"
    row["meaningStatus"]="poetic_interpretation"
    row["reviewStatus"]="requires_etymological_source"
    row["meaningSource"]=None
    row["meaningSourceUrl"]=None
    row.pop("meaningCaveat",None)

catalog.sort(key=lambda r:r["name"].casefold())
manifest=read(BASE/"manifest.json")
coverage=read(BASE/"coverage.json")
published=sum(n.get("meaningType")=="published" for n in catalog)
pending=len(catalog)-published
manifest.update(count=len(catalog),populatedCount=len(catalog),
                meaningCount=published,missingMeaningCount=pending,
                nativeScriptCount=sum(bool(n.get("native")) for n in catalog),
                variantCount=sum(bool(n.get("variants")) for n in catalog),
                meaningEditorialReview={"version":"2026-11-13","method":"Sourced meanings preserved; suggested kanji and literary alternatives are labeled creative.","stats":dict(stats)})
sources=collections.Counter(n.get("meaningSource") or "creative" for n in catalog)
origins=collections.Counter(n["origin"] for n in catalog if n.get("meaningType")=="creative")
coverage.update(totalNames=len(catalog),meaningDocumented=published,meaningPending=pending,
                meaningSources=dict(sorted(sources.items())),
                pendingByOrigin=[{"origin":origin,"count":count} for origin,count in sorted(origins.items(),key=lambda p:(-p[1],p[0].casefold()))])
write(BASE/"extended.json",catalog)
write(BASE/"manifest.json",manifest,True)
write(BASE/"coverage.json",coverage,True)
print("Repaired name descriptions:",dict(stats),"total",len(catalog))
