# js-csv
JavaScript project for reading a CSV file from an URL and mapping its entries into HTML template clones

# Lector de CSV amb JavaScript

Aquest projecte llegeix dades d'un arxiu CSV publicat en una URL (p.e. des de Google Sheets) i les mostra a la pàgina mitjançant un sistema preestablert de plantilla HTML.

## 🔧 Com funciona

- El fitxer `script.js` fa `fetch` al CSV i el converteix a objectes JavaScript.
- Detecta automàticament tots els contenidors amb la classe `.lector-csv`.
- Cada contenidor ha de tenir els atributs:
  - `data-url`: URL pública del CSV.
  - `data-template`: l’ID del `<template>` HTML que s’utilitzarà per renderitzar les dades.
- S'usa un `<template>` HTML per mostrar cada ítem.
- Permet tenir múltiples contenidors a la mateixa pàgina, cadascun amb el seu CSV i plantilla.

## 🧪 Exemple d'ús en HTML

```html
<!-- Contenidor que carregarà el CSV i aplicarà la plantilla -->
<div class="lector-csv"
     data-url="https://docs.google.com/spreadsheets/d/e/EXEMPLE/pub?output=csv"
     data-template="item-template">
</div>

<!-- Plantilla HTML per mostrar cada ítem -->
<template id="item-template">
  <div class="item">
    <h3 class="nom"></h3>
    <p class="descripcio"></p>
  </div>
</template>

<!-- Script principal -->
<script type="module" src="script.js"></script>

## Exemple de CSV

Els noms de les columnes han de coincidir amb les classes dins del template.

## Crèdits

Projecte generat amb ajuda de [ChatGPT](https://chat.openai.com), però tot el codi és d'ús lliure.

## Llicència

Vegeu el fitxer [LICENSE](./LICENSE).
