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

## Significados e interpretaciones para todas las fichas

Astera diferencia explícitamente dos categorías:

- **Significado publicado** (`meaningType: "published"`, `meaningStatus: "documented"`): una definición/interpretación previamente documentada en una fuente externa, con `meaningSource` y `meaningSourceUrl`. Algunas aparecen en inglés porque ese es el idioma original de la fuente. No se presentan como una verdad universal para todos los idiomas donde se usa el nombre.
- **Interpretación poética original** (`meaningType: "creative"`, `meaningStatus: "poetic_interpretation"`): texto evocador escrito por Astera cuando no existe una fuente publicada suficientemente compatible. **No afirma ser el significado etimológico ni cultural del nombre**. Se etiqueta así en las tarjetas y en la vista estelar.

Esta distinción es obligatoria incluso si posteriormente se encuentran fuentes nuevas. La regeneración intenta primero coincidencias de significados publicados, y solamente después completa el espacio de presentación con texto creativo estable para el mismo nombre. El archivo `coverage.json` separa estas poblaciones y `manifest.json` expone `populatedCount`.

La fuente Nurturepedia se amplió con sus colecciones de nombres por países, respetando la compatibilidad de origen; los títulos de las colecciones no se utilizan como prueba de la etimología de un nombre.

## Ampliación oficial de nombres y control de duplicados — noviembre de 2026

El importador reproducible `scripts/enrich_official_names.py` amplía el catálogo de nombres **sin interpretar que un país de uso sea el país de origen**. Los nuevos registros conservan `origin: "Origen por verificar"` salvo que exista una fuente independiente y validada. `countries` y `usageCount` son evidencia de uso y frecuencia, no de etimología.

Fuentes para los nombres adicionales:

- **US Social Security Administration (SSA):** registros de nombres de nacidos de 1880 a 2025, considerados de dominio público como obra del gobierno federal estadounidense. Fuente original: https://www.ssa.gov/oact/babynames/. Debido a restricciones HTTP 403 del servidor SSA para GitHub Actions, se usa el archivo CSV de datos oficiales redistribuido por Nameling: https://www.nameling.co.uk/names/data. Nameling también publica rangos propios; Astera importa exclusivamente los recuentos y nombres de la fuente estadística, no sus significados editoriales. Se aplica un umbral de 50 nacimientos acumulados y al menos dos años para nombres totalmente nuevos.
- **Reino Unido — ONS, NRS y NISRA:** nombres de 1996–2025 con licencia [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), agregados por Nameling en la misma página anterior. Astera importa nombres y conteos, sin significados ni deducciones culturales. Para nombres nuevos exige al menos 25 registros acumulados y dos años.
- **Instituto Brasileiro de Geografia e Estatística (IBGE):** registros públicos agregados de nombres de pila del Censo 2022, recopilados y reestructurados por Gabriel Lobo (@olob0), bajo **CC BY 4.0** para la compilación. El importador utiliza exclusivamente `name_type=given` (excluye apellidos) con frecuencia de al menos 100 registros para nombres nuevos y conserva el recuento por sexo cuando está disponible. Fuente original: https://censo2022.ibge.gov.br/nomes/ ; archivo: https://huggingface.co/datasets/olob0/ibge-nomes-no-brasil-2022.
- **Wikidata:** nombres etiquetados como instancias de nombre de pila, obtenidos del punto de consulta SPARQL público con licencia **CC0**: https://www.wikidata.org/ ; https://query.wikidata.org/. Se importa el nombre, no los significados, y se deja el origen cultural por verificar.

Al fusionar se usa normalización Unicode NFC, mayúsculas/minúsculas, las variantes compuestas ya verificadas y un índice de nombres únicos. No se fusionan grafías diferentes por una etimología supuesta. Los duplicados exactos mantienen los datos editoriales preexistentes y solamente enriquecen los países de uso, las fuentes y las frecuencias. Los nombres sin significado documentado reciben únicamente la **interpretación poética etiquetada** que ya usa el sitio.

El archivo `public/names/manifest.json` contiene las métricas actuales, un desglose por fuente y los descartes. `python scripts/validate_catalog.py` verifica conteos, orden alfabético, fuentes y ausencia de duplicados exactos.

- **Instituto Nacional de Estadística (INE, España):** censo anual de población a 1 de enero de 2025. Archivo Excel oficial `nombres_por_edad_media.xlsx`, separado en hojas `Hombres` y `Mujeres`. Astera importa únicamente columnas verificadas de nombre y frecuencia; para entradas nuevas exige al menos 30 registros. Fuente: https://www.ine.es/daco/daco42/nombyapel/nombres_por_edad_media.xlsx. La residencia en España no implica etimología española.

El catálogo completo se conserva en `public/names/extended.json`; el índice derivado `public/names/search-index.json` elimina campos de procedencia y frecuencia innecesarios para agilizar la carga de la página. El índice no sustituye la base original ni la atribución de fuentes.

**Pendiente de futuras fuentes:** ampliar la cobertura histórica de países sin publicaciones oficiales reutilizables. No se atribuyen a Astera datos de fuentes no integradas.

## Origen cultural documentado vs. países de uso — corrección noviembre de 2026

- `countries` y `usageCount`: países donde el nombre está documentado en estadísticas; **no prueban su procedencia cultural**.
- `origin`: origen lingüístico documentado, cuando la fuente lo ofrece. `Origen por verificar` se conserva cuando no existe evidencia.
- `originCountryCodes`: países de referencia cultural asociados **únicamente** a orígenes lingüísticos registrados; no se derivan de frecuencias ni de los países de nacimiento. Pueden contener varios códigos en nombres con varias tradiciones independientes (p. ej. un nombre de origen árabe y francés).
- `originCountrySource` y `originCountrySources`: fuentes para clasificar nombres; `originLanguages` conserva lenguas adicionales registradas directamente por Wikidata P407 cuando este servicio está disponible.
- `public/names/origin-coverage.json`: auditoría de cobertura real por categoría, incluidas las entradas de origen desconocido. Los nombres sin pruebas de origen quedan fuera de los filtros culturales en lugar de asignarles una nacionalidad falsa.

**Importante:** los países del filtro representan culturas/idiomas históricamente asociados a un país, no una afirmación de lugar de nacimiento. «Inglés» se relaciona con Inglaterra, pero no todas las personas llamadas John son inglesas. «Árabe» trasciende muchos países y no implica que el nombre naciera en Arabia Saudita. No se multiplican orígenes simplemente porque el nombre circule internacionalmente.

### Japón: JMnedict (EDRDG)

- Proyecto: [Electronic Dictionary Research and Development Group, JMnedict / ENAMDICT](https://www.edrdg.org/wiki/index.php/JMnedict-ENAMDICT_Dictionary_Project).
- Descarga: https://www.edrdg.org/pub/Nihongo/JMnedict.xml.gz.
- **Licencia**: [EDRDG licencia de diccionarios, CC BY-SA](https://www.edrdg.org/edrdg/licence.html). Se exige reconocimiento visible de EDRDG y preservar la licencia de los datos derivados. Los datos originales siguen siendo de EDRDG; Astera no reclama autoría de ese diccionario.
- La importación `scripts/enrich_jmnedict.py` incorpora solamente entradas que JMnedict identifica como nombres de pila japoneses. No importa apellidos, topónimos ni nombres de productos. La lectura kana se romaniza mediante `pykakasi`; múltiples escrituras kanji se agrupan como variantes de **un mismo nombre romanizado**, no se publican como nombres distintos.
- La escritura japonesa puede alterar por completo el significado de un nombre. Por ello, la romanización sola no autoriza una etimología: las interpretaciones poéticas siguen diferenciándose de los significados verificados.

### Orígenes procedentes de categorías etimológicas de Wiktionary

El importador incremental `scripts/enrich_wiktionary_origins.py` usa exclusivamente categorías del tipo **«[idioma de la forma] male/female given names from [idioma de origen]»**. La parte «from» documenta explícitamente la procedencia lingüística de la variante, a diferencia de una categoría de uso como «French female given names», que por sí sola no prueba etimología. Un nombre puede tener varias procedencias atestiguadas.

- Fuente: [English Wiktionary, categorías de nombres propios](https://en.wiktionary.org/wiki/Category:Given_names_by_language).
- Licencia de datos: Creative Commons Attribution-ShareAlike (CC BY-SA) de Wiktionary; los datos derivados de esas categorías conservan atribución y condiciones de compartir igual. El texto original, los orígenes y sus categorías siguen perteneciendo a los autores colaborativos de Wiktionary.
- Procedencia por registro: `originCountrySources` añade la categoría exacta y `originLanguages` conserva los orígenes originales. Las etiquetas de país son una **referencia cultural de la lengua**; no afirman lugar de nacimiento ni uso exclusivo en ese país.
- Auditoría: `reports/wiktionary_origin_enrichment.json` contiene asociaciones nuevas por cultura. El proceso es incremental e idempotente: vuelve a incluir lo documentado y no duplica nombres ni países ya asociados.
- Cuando no se encuentra prueba de origen, **no** se asigna uno ficticio. Esta regla es esencial para evitar clasificaciones engañosas de los nombres importados desde censos nacionales.

### Filtros sincronizados

La exploración libre y «Descubrir nombre» utilizan el mismo estado de selección: género, cultura, estilo, inicial exacta, rango de iniciales y apellidos. El mismo filtrado de `src/lib/recommend.js` determina los resultados; los apellidos afectan solo a la puntuación de armonía y el orden de los nombres. Los botones A–E, F–K, L–P, Q–U y V–Z permanecen visibles y son mutuamente excluyentes con la inicial exacta.
