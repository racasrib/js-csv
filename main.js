window.addEventListener('DOMContentLoaded', processarTotsElsLectors);

// Magatzem central per a les dades més recents de cada contenidor.
const dadesPerContenidor = new Map();

/**
 * Troba tots els components lectors de CSV i els inicialitza.
 */
function processarTotsElsLectors() {
  const contenidors = document.querySelectorAll('.lector-csv');
  contenidors.forEach(contenidor => {
    // 1. Inicialitza la interfície de cada contenidor UNA SOLA VEGADA.
    inicialitzarContenidor(contenidor);

    // 2. Configura el refresc periòdic si està especificat.
    const refresh = parseInt(contenidor.getAttribute('data-refresh'), 10);
    if (!isNaN(refresh) && refresh > 0) {
      setInterval(async () => {
        try {
          const url = contenidor.getAttribute('data-url');
          if (!url) return;

          const novesDades = await llegirCSV(url);
          dadesPerContenidor.set(contenidor, novesDades); // Actualitza el magatzem central

          // Refresca la vista de dades i els suggeriments dels filtres
          refrescarVista(contenidor);
          const campsFiltrables = obtenirCampsFiltrables(contenidor);
          const divFiltres = contenidor.querySelector('.filtres');
          actualitzarDatalists(divFiltres, campsFiltrables, novesDades);
          
          console.log('Dades i filtres actualitzats en segon pla per:', contenidor.id);
        } catch (err) {
          console.error('Error en la recàrrega periòdica:', err);
        }
      }, refresh);
    }
  });
}

/**
 * Configura la interfície, filtres i event listeners del contenidor. S'executa UNA SOLA VEGADA per contenidor.
 */
async function inicialitzarContenidor(contenidor) {
  const url = contenidor.getAttribute('data-url');
  if (!url) return;

  try {
    prepararEstructuraContenidor(contenidor);
    const dadesInicials = await llegirCSV(url);
    dadesPerContenidor.set(contenidor, dadesInicials); // Guarda les dades inicials

    const campsFiltrables = obtenirCampsFiltrables(contenidor);
    const divFiltres = contenidor.querySelector('.filtres');

    // Genera els camps d'input per filtrar UNA SOLA VEGADA
    generarInputsFiltre(divFiltres, campsFiltrables, dadesInicials);

    // Afegeix l'event listener d'input UNA SOLA VEGADA.
    // La funció de callback només crida a 'refrescarVista', que sempre agafarà les dades més noves.
    divFiltres.addEventListener('input', () => {
      refrescarVista(contenidor);
    });

    // Realitza la primera càrrega visual de les dades
    refrescarVista(contenidor);
  } catch (err)
 {
    console.error('Error inicialitzant el contenidor:', contenidor.id, err);
  }
}

/**
 * Funció clau: Refresca la llista de dades basant-se en els filtres actuals i les DADES MÉS RECENTS.
 * És cridada tant per l'event listener de l'usuari com per el setInterval.
 */
function refrescarVista(contenidor) {
  const templateId = contenidor.getAttribute('data-template');
  const template = document.getElementById(templateId);
  if (!template) return;
  
  const campsFiltrables = obtenirCampsFiltrables(contenidor, template);

  // 1. SEMPRE agafa les dades més recents del magatzem central.
  const dadesActuals = dadesPerContenidor.get(contenidor) || [];
  // 2. Obté els valors actuals dels camps de filtre.
  const filtres = obtenirFiltresDelFormulari(contenidor);

  // 3. Aplica els filtres i torna a renderitzar la llista.
  const dadesFiltrades = aplicarFiltresDinamics(dadesActuals, filtres, campsFiltrables);
  omplirContenidor(dadesFiltrades, contenidor, template);
}

/**
 * Descarrega i processa el fitxer CSV fent servir l'opció de cache 'reload'.
 */
async function llegirCSV(url) {
  const resposta = await fetch(url, {
    cache: 'reload' // Demana al navegador que no faci servir la memòria cau.
  });

  if (!resposta.ok) throw new Error(`Error en fetch: ${resposta.status}`);
  const text = await resposta.text();
  const linies = text.trim().split('\n').map(l => l.trim());
  if (linies.length < 2) return [];
  const capceleres = linies[0].split(',').map(c => c.trim().replace(/"/g, ''));

  return linies.slice(1).map(linia => {
    const valors = linia.split(',').map(v => v.trim().replace(/"/g, ''));
    const obj = {};
    capceleres.forEach((clau, i) => obj[clau] = valors[i] || '');
    return obj;
  });
}

/**
 * Actualitza les <option> dins dels <datalist> de cada camp de filtre.
 */
function actualitzarDatalists(divFiltres, camps, dades) {
  camps.forEach(camp => {
    const datalist = divFiltres.querySelector(`#filtres-${camp}`);
    if (datalist) {
      const valorsUnics = [...new Set(dades.map(d => d[camp]).filter(Boolean))].sort();
      datalist.innerHTML = ''; // Esborra opcions antigues
      valorsUnics.forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        datalist.appendChild(option);
      });
    }
  });
}

/**
 * Crea els elements <label>, <input> i <datalist> per als filtres. S'executa UNA SOLA VEGADA.
 */
function generarInputsFiltre(divFiltres, camps, dades) {
  divFiltres.innerHTML = '';
  camps.forEach(camp => {
    const label = document.createElement('label');
    label.textContent = `${camp}: `;
    const input = document.createElement('input');
    input.setAttribute('name', camp);
    input.setAttribute('list', `filtres-${camp}`);
    input.setAttribute('placeholder', `Filtrar per ${camp}...`);
    const datalist = document.createElement('datalist');
    datalist.id = `filtres-${camp}`;
    label.appendChild(input);
    divFiltres.appendChild(label);
    divFiltres.appendChild(datalist);
  });
  actualitzarDatalists(divFiltres, camps, dades);
}

// --- ALTRES FUNCIONS DE SUPORT (Helpers) ---

function obtenirCampsFiltrables(contenidor, template) {
    const attrContenidor = contenidor.getAttribute('data-filtrable');
    if (attrContenidor) return attrContenidor.split(',').map(c => c.trim()).filter(Boolean);
    if (!template) return [];
    const attrTemplate = template.getAttribute('data-filtrable');
    return attrTemplate ? attrTemplate.split(',').map(c => c.trim()).filter(Boolean) : [];
}

function obtenirFiltresDelFormulari(contenidor) {
    const inputs = contenidor.querySelectorAll('.filtres input[name]');
    const filtres = {};
    inputs.forEach(input => {
        const valor = input.value.trim();
        if (valor) filtres[input.name] = valor;
    });
    return filtres;
}

function aplicarFiltresDinamics(dades, filtres, campsFiltrables) {
    return dades.filter(item => {
        return Object.entries(filtres).every(([camp, valor]) => {
            if (!campsFiltrables.includes(camp)) return true;
            return item[camp]?.toLowerCase().includes(valor.toLowerCase());
        });
    });
}

function omplirContenidor(dades, contenidor, template) {
    if (!template) return;
    const divDades = contenidor.querySelector('.dades');
    if (!divDades) return;
    divDades.innerHTML = '';
    dades.forEach(item => {
        const clone = template.content.cloneNode(true);
        for (const clau in item) {
            const el = clone.querySelector(`.${clau}`);
            if (el) el.textContent = item[clau];
        }
        divDades.appendChild(clone);
    });
}

function prepararEstructuraContenidor(contenidor) {
    let divFiltres = contenidor.querySelector('.filtres');
    if (!divFiltres) {
        divFiltres = document.createElement('div');
        divFiltres.classList.add('filtres');
        contenidor.prepend(divFiltres); // Posa els filtres al principi
    }
    let divDades = contenidor.querySelector('.dades');
    if (!divDades) {
        divDades = document.createElement('div');
        divDades.classList.add('dades');
        contenidor.appendChild(divDades);
    }
}