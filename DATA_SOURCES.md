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

## Catálogo editorial inicial

- `src/lib/names.js` y `src/data/international.json`: nombres seleccionados manualmente con significados y grafías; requieren revisión editorial continua de entradas ambiguas.

## Regeneración

`python scripts/build_catalog.py` descarga las fuentes públicas y regenera `public/names/extended.json`, `public/names/countries.json` y `public/names/manifest.json`. El flujo `catalog.yml` genera y guarda los archivos en `develop_brayan`.

No se inventan significados para completar huecos. El catálogo no debe presentarse como exhaustivo de todas las culturas ni como validación lingüística académica.
