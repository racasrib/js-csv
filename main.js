// --- Start processing when the document is ready ---
window.addEventListener('DOMContentLoaded', processarTotsElsLectors);

// --- Use a Map to store the current data for each container ---
// This allows the event listeners to always have access to the latest data.
const dadesPerContenidor = new Map();

/**
 * Main function that finds all CSV reader components and initializes them.
 */
function processarTotsElsLectors() {
  const contenidors = document.querySelectorAll('.lector-csv');
  contenidors.forEach(contenidor => {
    // 1. Initialize the UI for each container ONCE.
    inicialitzarContenidor(contenidor);

    // 2. Set up the periodic refresh if specified.
    const refresh = parseInt(contenidor.getAttribute('data-refresh'), 10);
    if (!isNaN(refresh) && refresh > 0) {
      setInterval(async () => {
        try {
          const url = contenidor.getAttribute('data-url');
          if (!url) return;

          // Fetch new data in the background.
          const novesDades = await llegirCSV(url);
          dadesPerContenidor.set(contenidor, novesDades); // Update the shared data

          // Trigger a lightweight refresh of the view.
          refrescarVista(contenidor);
          console.log('Dades actualitzades en segon pla per:', contenidor);

        } catch (err) {
          console.error('Error en la recàrrega periòdica:', err);
        }
      }, refresh);
    }
  });
}

/**
 * Sets up the container's UI, filters, and event listeners. Runs only ONCE per container.
 */
async function inicialitzarContenidor(contenidor) {
  const url = contenidor.getAttribute('data-url');
  const templateId = contenidor.getAttribute('data-template');
  if (!url || !templateId) return;

  try {
    // Prepare the basic DOM structure (.filtres, .dades)
    prepararEstructuraContenidor(contenidor);

    // Fetch the initial data
    const dadesInicials = await llegirCSV(url);
    dadesPerContenidor.set(contenidor, dadesInicials); // Store it

    // Get filter configuration
    const template = document.getElementById(templateId);
    const campsFiltrables = obtenirCampsFiltrables(contenidor, template);
    const divFiltres = contenidor.querySelector('.filtres');

    // Generate the filter input fields ONCE. This is the key change.
    generarInputsFiltre(divFiltres, campsFiltrables, dadesInicials);

    // Add the input event listener ONCE.
    divFiltres.addEventListener('input', () => {
      // When the user types, just trigger a lightweight view refresh.
      refrescarVista(contenidor);
    });

    // Perform the initial render of the data.
    refrescarVista(contenidor);

  } catch (err) {
    console.error('Error inicialitzant el contenidor:', contenidor, err);
  }
}

/**
 * Lightweight function to refresh only the data list based on current filters.
 * It does NOT rebuild the inputs. It's called by the user's 'input' event and the setInterval.
 */
function refrescarVista(contenidor) {
  const templateId = contenidor.getAttribute('data-template');
  const template = document.getElementById(templateId);
  const campsFiltrables = obtenirCampsFiltrables(contenidor, template);

  // Get the most recent data and the current filter values
  const dadesActuals = dadesPerContenidor.get(contenidor) || [];
  const filtres = obtenirFiltresDelFormulari(contenidor);

  // Apply filters and re-render the list
  const dadesFiltrades = aplicarFiltresDinamics(dadesActuals, filtres, campsFiltrables);
  omplirContenidor(dadesFiltrades, contenidor, template);
}


// --- HELPER FUNCTIONS (with one important improvement) ---

/**
 * Fetches and parses the CSV file.
 * IMPROVED: Added cache-busting to ensure fresh data is always loaded.
 */
async function llegirCSV(url) {
  // Add a timestamp to the URL to prevent the browser from using a cached version
  const urlAmbCacheBust = `${url}?t=${new Date().getTime()}`;
  
  const resposta = await fetch(urlAmbCacheBust);
  if (!resposta.ok) throw new Error(`Error en fetch: ${resposta.status}`);
  const text = await resposta.text();

  const linies = text.trim().split('\n').map(l => l.trim());
  if (linies.length < 2) return []; // Handle empty or header-only files
  const capceleres = linies[0].split(',');

  return linies.slice(1).map(linia => {
    const valors = linia.split(',');
    const obj = {};
    capceleres.forEach((clau, i) => obj[clau.trim()] = valors[i] ? valors[i].trim() : '');
    return obj;
  });
}

// All other helper functions (obtenirCampsFiltrables, generarInputsFiltre, etc.)
// can remain exactly as you wrote them. I've included them here for completeness.

function obtenirCampsFiltrables(contenidor, template) {
  if (contenidor) {
    const attrContenidor = contenidor.getAttribute('data-filtrable');
    if (attrContenidor) {
      return attrContenidor.split(',').map(c => c.trim()).filter(c => c.length > 0);
    }
  }
  if (!template) return [];
  const attrTemplate = template.getAttribute('data-filtrable');
  if (!attrTemplate) return [];
  return attrTemplate.split(',').map(c => c.trim()).filter(c => c.length > 0);
}

function generarInputsFiltre(divFiltres, camps, dades) {
  divFiltres.innerHTML = ''; // Clear previous inputs if any (safer for initialization)
  const valorsPerCamp = {};
  camps.forEach(camp => {
    valorsPerCamp[camp] = [...new Set(dades.map(d => d[camp]).filter(Boolean))];
  });

  camps.forEach(camp => {
    const valorsUnics = valorsPerCamp[camp];

    const label = document.createElement('label');
    label.textContent = `${camp}: `;

    const input = document.createElement('input');
    input.setAttribute('name', camp);
    input.setAttribute('list', `filtres-${camp}`);
    input.setAttribute('placeholder', 'Filtrar...');

    const datalist = document.createElement('datalist');
    datalist.id = `filtres-${camp}`;
    
    valorsUnics.forEach(valor => {
      const option = document.createElement('option');
      option.value = valor;
      datalist.appendChild(option);
    });

    label.appendChild(input);
    divFiltres.appendChild(label);
    divFiltres.appendChild(datalist);
  });
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
    contenidor.appendChild(divFiltres);
  }
  let divDades = contenidor.querySelector('.dades');
  if (!divDades) {
    divDades = document.createElement('div');
    divDades.classList.add('dades');
    contenidor.appendChild(divDades);
  }
  return { divFiltres, divDades };
}