/* ======================= FLUXOGRAMA DE DECISÃO (POP) =======================
   window.Ugtm.Flowchart.markup() devolve o SVG completo; .highlight(activeId)
   destaca o nó correspondente ao passo em que o operador está (usado na
   apresentação e no stepper do procedimento — "fluxograma vivo"). */
(function(){
  window.Ugtm = window.Ugtm || {};

  function markup(){
    return `
    <svg width="100%" viewBox="0 0 680 980" role="img" style="font-family:'Inter',sans-serif;">
      <title>Fluxograma de decisão — POP aterramento provisório UGTM</title>
      <desc>Sequência de decisões para instalação do kit de aterramento.</desc>
      <defs>
        <marker id="flarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </marker>
      </defs>

      <g class="flow-node" id="flow-inicio">
        <ellipse cx="340" cy="48" rx="130" ry="26" fill="#D3D1C7" stroke="#5F5E5A" stroke-width="0.5"/>
        <text x="340" y="48" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#2C2C2A">Início — 100 min antes</text>
      </g>
      <line x1="340" y1="74" x2="340" y2="104" stroke="#888780" stroke-width="1.2" marker-end="url(#flarr)"/>

      <g class="flow-node" id="flow-epi">
        <rect x="190" y="104" width="300" height="48" rx="8" fill="#B5D4F4" stroke="#185FA5" stroke-width="0.5"/>
        <text x="340" y="128" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#042C53">Verificar EPI e isolar a área</text>
      </g>
      <line x1="340" y1="152" x2="340" y2="182" stroke="#888780" stroke-width="1.2" marker-end="url(#flarr)"/>

      <g class="flow-node" id="flow-medir-rho">
        <rect x="190" y="182" width="300" height="48" rx="8" fill="#B5D4F4" stroke="#185FA5" stroke-width="0.5"/>
        <text x="340" y="206" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#042C53">Medir resistividade do solo (ρ)</text>
      </g>
      <line x1="340" y1="230" x2="340" y2="270" stroke="#888780" stroke-width="1.2" marker-end="url(#flarr)"/>

      <g class="flow-node" id="flow-decisao-rho">
        <polygon points="340,270 450,314 340,358 230,314" fill="#FAC775" stroke="#854F0B" stroke-width="0.5"/>
        <text x="340" y="310" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#412402">ρ &gt; 500 Ω·m?</text>
      </g>

      <line x1="340" y1="358" x2="340" y2="418" stroke="#3B6D11" stroke-width="1.2" marker-end="url(#flarr)"/>
      <text x="358" y="390" font-size="12" fill="#3B6D11">Não</text>

      <line x1="450" y1="314" x2="578" y2="314" stroke="#854F0B" stroke-width="1.2" marker-end="url(#flarr)"/>
      <text x="514" y="306" text-anchor="middle" font-size="12" fill="#633806">Sim</text>

      <g class="flow-node" id="flow-bentonita">
        <rect x="578" y="290" width="72" height="48" rx="8" fill="#FAC775" stroke="#854F0B" stroke-width="0.5"/>
        <text x="614" y="308" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#412402">Aplicar</text>
        <text x="614" y="324" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#412402">bentonita</text>
      </g>
      <path d="M614 290 L614 206 L492 206" fill="none" stroke="#854F0B" stroke-width="1.2" stroke-dasharray="5 3" marker-end="url(#flarr)"/>

      <g class="flow-node" id="flow-instalar-hastes">
        <rect x="190" y="418" width="300" height="48" rx="8" fill="#B5D4F4" stroke="#185FA5" stroke-width="0.5"/>
        <text x="340" y="442" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#042C53">Instalar hastes e cabos</text>
      </g>
      <line x1="340" y1="466" x2="340" y2="496" stroke="#888780" stroke-width="1.2" marker-end="url(#flarr)"/>

      <g class="flow-node" id="flow-medir-rg">
        <rect x="190" y="496" width="300" height="48" rx="8" fill="#B5D4F4" stroke="#185FA5" stroke-width="0.5"/>
        <text x="340" y="520" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#042C53">Medir Rg — queda de potencial</text>
      </g>
      <line x1="340" y1="544" x2="340" y2="584" stroke="#888780" stroke-width="1.2" marker-end="url(#flarr)"/>

      <g class="flow-node" id="flow-decisao-rg">
        <polygon points="340,584 450,628 340,672 230,628" fill="#FAC775" stroke="#854F0B" stroke-width="0.5"/>
        <text x="340" y="624" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#412402">Rg ≤ 40 Ω?</text>
      </g>

      <line x1="230" y1="628" x2="150" y2="628" stroke="#3B6D11" stroke-width="1.2" marker-end="url(#flarr)"/>
      <text x="190" y="619" text-anchor="middle" font-size="12" fill="#3B6D11">Sim</text>
      <g class="flow-node" id="flow-registrar1">
        <rect x="32" y="600" width="118" height="56" rx="28" fill="#C0DD97" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="91" y="622" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#173404">Registrar</text>
        <text x="91" y="640" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#173404">e liberar</text>
      </g>

      <line x1="340" y1="672" x2="340" y2="712" stroke="#854F0B" stroke-width="1.2" marker-end="url(#flarr)"/>
      <text x="358" y="694" font-size="12" fill="#633806">Não</text>

      <g class="flow-node" id="flow-config-secundaria">
        <rect x="190" y="712" width="300" height="48" rx="8" fill="#FAC775" stroke="#854F0B" stroke-width="0.5"/>
        <text x="340" y="736" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#412402">Configuração secundária (+2 hastes)</text>
      </g>
      <line x1="340" y1="760" x2="340" y2="800" stroke="#888780" stroke-width="1.2" marker-end="url(#flarr)"/>

      <g class="flow-node" id="flow-decisao-rg2">
        <polygon points="340,800 450,844 340,888 230,844" fill="#FAC775" stroke="#854F0B" stroke-width="0.5"/>
        <text x="340" y="840" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#412402">Rg ≤ 40 Ω?</text>
      </g>

      <line x1="230" y1="844" x2="150" y2="844" stroke="#3B6D11" stroke-width="1.2" marker-end="url(#flarr)"/>
      <text x="190" y="835" text-anchor="middle" font-size="12" fill="#3B6D11">Sim</text>
      <g class="flow-node" id="flow-registrar2">
        <rect x="32" y="816" width="118" height="56" rx="28" fill="#C0DD97" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="91" y="838" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#173404">Registrar</text>
        <text x="91" y="856" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#173404">e liberar</text>
      </g>

      <line x1="340" y1="888" x2="340" y2="924" stroke="#A32D2D" stroke-width="1.2" marker-end="url(#flarr)"/>
      <text x="358" y="908" font-size="12" fill="#A32D2D">Não</text>

      <g class="flow-node" id="flow-cancelar">
        <ellipse cx="340" cy="950" rx="160" ry="26" fill="#F7C1C1" stroke="#A32D2D" stroke-width="0.5"/>
        <text x="340" y="950" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="500" fill="#501313">Cancelar — acionar engenharia</text>
      </g>
    </svg>`;
  }

  function render(mountId){
    const mount = document.getElementById(mountId);
    if(mount) mount.innerHTML = markup();
  }

  /** activeId: id do nó atual (sem prefixo "flow-"); doneIds: array de ids já concluídos */
  function highlight(activeId, doneIds){
    document.querySelectorAll('.flow-node').forEach(function(g){
      g.classList.remove('active','done');
      const id = g.id.replace('flow-','');
      if(id===activeId) g.classList.add('active');
      else if(doneIds && doneIds.indexOf(id)>-1) g.classList.add('done');
    });
  }

  window.Ugtm.Flowchart = {markup, render, highlight};
})();
