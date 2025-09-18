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

function omplirContenidor(dades, contenidor, idTemplate) {
  const template = document.getElementById(idTemplate);
  if (!template) return;

  contenidor.innerHTML = '';

  dades.forEach(item => {
    const clone = template.content.cloneNode(true);
    for (const clau in item) {
      const el = clone.querySelector(`.${clau}`);
      if (el) el.textContent = item[clau];
    }
    contenidor.appendChild(clone);
  });
}

async function processarLectors() {
  const contenidors = document.querySelectorAll('.lector-csv');

  contenidors.forEach(async contenidor => {
    const url = contenidor.getAttribute('data-url');
    const templateId = contenidor.getAttribute('data-template');

    if (!url || !templateId) return;

    try {
      const dades = await llegirCSV(url);
      omplirContenidor(dades, contenidor, templateId);
    } catch (err) {
      console.error('Error carregant CSV per contenidor:', contenidor, err);
    }
  });
}

// Crida automàtica
processarLectors();
