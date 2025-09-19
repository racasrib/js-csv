window.addEventListener('DOMContentLoaded', processarLectors);

function processarLectors() {
  const contenidors = document.querySelectorAll('.lector-csv');

  contenidors.forEach(contenidor => {
    const refresh = parseInt(contenidor.getAttribute('data-refresh'), 10);
    actualitzarContenidor(contenidor);

    if (!isNaN(refresh) && refresh > 0) {
      setInterval(() => {
        actualitzarContenidor(contenidor);
      }, refresh);
    }
  });
}

async function actualitzarContenidor(contenidor) {
  const url = contenidor.getAttribute('data-url');
  const templateId = contenidor.getAttribute('data-template');
  if (!url || !templateId) return;

  try {
    const dades = await llegirCSV(url);
    const template = document.getElementById(templateId);
    const campsFiltrables = obtenirCampsFiltrables(contenidor, template);
    const { divFiltres } = prepararEstructuraContenidor(contenidor);

    generarInputsFiltre(divFiltres, campsFiltrables, dades);

    divFiltres.addEventListener('input', () => {
      const filtres = obtenirFiltresDelFormulari(contenidor);
      const dadesFiltrades = aplicarFiltresDinamics(dades, filtres, campsFiltrables);
      omplirContenidor(dadesFiltrades, contenidor, template);
    });

    // Inicial
    const filtres = obtenirFiltresDelFormulari(contenidor);
    const dadesFiltrades = aplicarFiltresDinamics(dades, filtres, campsFiltrables);
    omplirContenidor(dadesFiltrades, contenidor, template);

  } catch (err) {
    console.error('Error carregant CSV per contenidor:', contenidor, err);
  }
}

async function llegirCSV(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Error en fetch: ${resposta.status}`);
  const text = await resposta.text();

  const linies = text.trim().split('\n').map(l => l.trim());
  const capceleres = linies[0].split(',');

  return linies.slice(1).map(linia => {
    const valors = linia.split(',');
    const obj = {};
    capceleres.forEach((clau, i) => obj[clau] = valors[i]);
    return obj;
  });
}

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
  divFiltres.innerHTML = ''; // Reiniciem

  camps.forEach(camp => {
    const valorsUnics = [...new Set(dades.map(d => d[camp]).filter(Boolean))];

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

  // Eliminar contingut anterior
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
  // Si no existeix, crea div.filtres i div.dades
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


// Crida automàtica
processarLectors();
