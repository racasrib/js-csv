# js-csv
JavaScript project for reading a CSV file from an URL and mapping its entries into HTML template clones

# Lector de CSV amb JavaScript

Aquest projecte llegeix dades d'un arxiu CSV publicat en una URL (p.e. des de Google Sheets) i les mostra a la pàgina mitjançant un sistema preestablert de plantilla HTML.

## 🔧 Com funciona

- El fitxer `main.js` fa `fetch` al CSV i el converteix a objectes JavaScript.
- Detecta automàticament tots els contenidors amb la classe `.lector-csv`.
- Cada contenidor ha de tenir aquests atributs:
  - `data-url`: URL pública del CSV.
  - `data-template`: l’ID del `<template>` HTML que s’utilitzarà per renderitzar les dades.
  - `data-refresh` (opcional): interval en mil·lisegons per actualitzar automàticament les dades. Si no està present o és 0, no s’actualitza automàticament.
  - `data-filtrable` (opcional): llista separada per comes dels camps que es volen filtrar per aquest contenidor. Si no es defineix, es farà servir el `data-filtrable` del `<template>`.
- Cada contenidor es divideix en dos blocs interns creats automàticament:
  - Un div `.filtres` per als controls de filtratge.
  - Un div `.dades` on es mostrarà la informació carregada.
- S'usa un `<template>` HTML per definir l’estructura d’un registre (fila o ítem) que es vol mostrar.
- El template ha de contenir elements amb classes que coincideixin amb els noms dels camps del CSV (per exemple `.Nom`, `.Email`).
- Per cada fila del CSV, es clona el template i es substitueix el contingut dels elements segons els valors corresponents.
- Permet generar automàticament inputs per filtrar els camps indicats, basats en els valors únics del CSV.
- Permet tenir múltiples contenidors a la mateixa pàgina, cadascun amb el seu CSV, plantilla, filtres i interval d’actualització.

## 🧪 Exemple d'ús en HTML

```html
<!-- Contenidor que carregarà el CSV i aplicarà la plantilla -->
<div class="lector-csv"
      data-url="https://docs.google.com/spreadsheets/d/e/EXEMPLE/pub?output=csv"
      data-template="item-template"
      data-refresh="5000"
      data-filtrable="nom,descripcio">
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
```

## Exemple de CSV

Els noms de les columnes han de coincidir amb les classes dins del template.

## Crèdits

Projecte generat amb ajuda de [ChatGPT](https://chat.openai.com), però tot el codi és d'ús lliure.

## Llicència

Aquest projecte està disponible sota la [Llicència Pública de la Unió Europea (EUPL) v1.2](https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12).
