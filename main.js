async function llegirCSV(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Error en fetch: ${resposta.status}`);
  
    const text = await resposta.text();
  
    const linies = text.trim().split('\n').map(l => l.trim());
    const capceleres = linies[0].split(',');
  
    const dades = linies.slice(1).map(linia => {
      const valors = linia.split(',');
      const obj = {};
      capceleres.forEach((cap, i) => {
        obj[cap] = valors[i];
      });
      return obj;
    });
  
    return dades;
  }
  
  function omplirContenidor(dades, idContenidor, idTemplate) {
    const contenidor = document.getElementById(idContenidor);
    const template = document.getElementById(idTemplate);
  
    if (!contenidor || !template) {
      console.error('Contenidor o template no trobats');
      return;
    }
  
    contenidor.innerHTML = '';
  
    dades.forEach(item => {
      const clone = template.content.cloneNode(true);
  
      // Aquí suposem que els camps a omplir tenen classes iguals a les propietats
      for (const camp in item) {
        const elem = clone.querySelector(`.${camp}`);
        if (elem) elem.textContent = item[camp];
      }
  
      contenidor.appendChild(clone);
    });
  }
  