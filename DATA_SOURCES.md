# Fuentes de datos y atribución

## Catálogo global

- **Onomaverse Names Datasets v2026.10**: nombres de pila, países, sexo registrado, origen general y transliteraciones.
- Datos: https://onomaverse.com/datasets
- Fuente: https://github.com/onomaverse/datasets
- Licencia: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Atribución requerida: **Names data from Onomaverse (https://onomaverse.com/datasets), licensed CC BY 4.0.**

El campo `native` solamente se completa cuando se encuentra una escritura no latina compatible con el origen declarado. Las traducciones de nombres entre escrituras **no equivalen necesariamente a una etimología**.

## Significados complementarios

- **Nurturepedia/baby-names-dataset**: descripciones de significados en inglés añadidas únicamente si el origen declarado resulta compatible.
- Fuente: https://github.com/Nurturepedia/baby-names-dataset
- Licencia del proyecto de origen: MIT.
- Un significado inferido de la coincidencia superficial entre palabras no es fiable, por lo que se conserva `meaning: null` cuando no hay evidencia compatible.

## Significados de Wiktionary (CC BY-SA 4.0)

- Colección de etimologías derivada de Wiktionary a través de `suhxnitiwari/baby-name-maker/data/meanings.json`.
- Fuente original: https://en.wiktionary.org/
- Colección: https://github.com/suhxnitiwari/baby-name-maker/blob/main/data/meanings.json
- Licencia: https://creativecommons.org/licenses/by-sa/4.0/
- Los significados conservan `meaningSource: "wiktionary-en"` y `meaningLicense: "CC BY-SA 4.0"`; las adaptaciones de esos textos requieren atribución y compartir igual.
- La importación exige coincidencia compatible de raíz etimológica y origen, para evitar mezclar homónimos de distintas culturas.

## Catálogo editorial inicial

- `src/lib/names.js` y `src/data/international.json`: nombres seleccionados manualmente con significados y grafías; requieren revisión editorial continua de entradas ambiguas.

## Regeneración

`python scripts/build_catalog.py` descarga las fuentes públicas y regenera `public/names/extended.json`, `public/names/countries.json` y `public/names/manifest.json`. El flujo `catalog.yml` valida orden alfabético, esquema y procedencia, y guarda los JSON en `develop_brayan`. Validación local: `python scripts/validate_catalog.py`.

No se inventan significados para completar huecos. El catálogo no debe presentarse como exhaustivo de todas las culturas ni como validación lingüística académica.

## Cobertura de la revisión de etimologías

El archivo `public/names/manifest.json` es el informe reproducible con `meaningCount`, `missingMeaningCount`, `nativeScriptCount` y `variantCount`.

- Los significados confirmados de Wiktionary en inglés provienen de las colecciones públicas `data/meanings.json` y `data/native-meanings.json` de Lullabyte, derivados de entradas de Wiktionary, con atribución y licencia CC BY-SA 4.0.
- Cuando el registro base no tiene origen, solamente se asigna una etimología cuyo origen específico aparece explícitamente en la fuente, y se anota el alcance interpretativo.
- Las variantes proceden de la relación `variant` en el grafo de equivalencia de Onomaverse (CC BY 4.0). No se confunden con meras semejanzas ni con equivalentes de otras culturas.
- No se asignan significados automáticos a partir de transliteraciones ni por copiar la etimología de un nombre parecido.
- Los nombres sin suficiente documentación mantienen `meaning: null`; no significa que carezcan de significado, sino que el catálogo todavía no posee una referencia segura.

**Estado de la revisión (11 noviembre de 2026):** 18,433 registros internacionales, 1,991 significados documentados, 16,442 por documentar. Estas métricas cambian cuando se regenera el catálogo; el JSON manifest prevalece sobre esta instantánea.

Fuentes: https://en.wiktionary.org/ · https://github.com/suhxnitiwari/baby-name-maker/blob/main/docs/name-sources.md · https://onomaverse.com/datasets.

## Auditoría final de todos los JSON — 11 de noviembre de 2026

- `public/names/extended.json`: **todos los registros** mantienen sus campos de origen, significado o `null`, estado de significado, estado de escritura original, variantes y fuente. Los elementos están ordenados por nombre sin duplicados.
- `public/names/coverage.json`: informe de cobertura por fuente y por origen, incluyendo los nombres que todavía necesitan evidencia.
- `public/names/manifest.json`: cifras verificables de la importación y las escrituras originales.
- `src/data/international.json` y los nombres editoriales de `src/lib/names.js`: tienen un estado distinto (`editorial_pending_verification`); no se presentan como lingüísticamente verificados por el simple hecho de tener un significado redactado.
- También se consultaron 20 archivos de lenguas/culturas de `suhxnitiwari/baby-name-maker`, utilizando exclusivamente entradas con significado textual explícito y referencias a **Wiktionary**; se descartan etimologías ambiguas y nombres inventados. Fuente: https://github.com/suhxnitiwari/baby-name-maker/blob/main/docs/name-sources.md. Licencia de contenido derivado de Wiktionary: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Los orígenes se comparan antes de importar significados. Si un mismo nombre tiene traducciones incompatibles en diferentes lenguas, el dato queda pendiente en lugar de escoger una arbitrariamente.

**Limitación:** no existe una correspondencia documentada en las fuentes abiertas para todos los nombres. `meaning: null` refleja esa limitación, no una afirmación sobre el nombre. Un campo rellenado por una conjetura sería peor que uno correctamente clasificado como pendiente.

La regeneración y revisión de calidad se ejecuta con `python scripts/build_catalog.py` y `python scripts/validate_catalog.py`. No se autoriza el uso de inferencias automáticas para sustituir fuentes lexicográficas.
