/* ======================= HUB DO PROCEDIMENTO =======================
   window.Ugtm.Hub — lista central dos 12 itens do Procedimento, com a lógica
   de aplicabilidade (itens condicionais que só aparecem conforme ρ/Rg já
   medidos) e o progresso sequencial dentro do hub.

   Dois tipos de item:
   - kind:'page'   → item complexo (checklist múltiplo, campo numérico) que
                      abre sua própria página em pop/itens/*.html.
   - kind:'inline' → passo simples ("concluí este passo") resolvido direto
                      na lista do hub, sem navegar — marca, esmaece e avança. */
(function(){
  window.Ugtm = window.Ugtm || {};

  const ITEMS = [
    {id:'epi',               kind:'page',   title:'EPI e isolamento da área',                file:'itens/epi.html',                     critical:true},
    {id:'materiais',         kind:'page',   title:'Materiais necessários',                   file:'itens/materiais.html',               critical:false},
    {id:'solo',              kind:'page',   title:'Medir resistividade do solo (ρ)',         file:'itens/solo.html',                    critical:false},
    {id:'bentonita',         kind:'inline', title:'Aplicar bentonita sódica',                desc:'Somente se ρ > 500 Ω·m. Abrir os 4 pontos de instalação das hastes, despejar a bentonita pré-dosada e adicionar água. Anotar o horário de aplicação.', critical:false, cond:'bentonita'},
    {id:'hastes',            kind:'inline', title:'Instalar as 4 hastes',                    desc:'Cravar as hastes de 2.400 mm nos 4 cantos do retângulo 17 m × 4 m, verticalmente até o limite do comprimento.', critical:false},
    {id:'cabos',             kind:'inline', title:'Instalar os cabos de interligação',        desc:'Conectar as 4 hastes entre si com o cabo 25 mm² formando o perímetro da malha. Verificar aperto de todas as conexões.', critical:false},
    {id:'neutro',            kind:'inline', title:'Conectar o cabo de neutro',                desc:'Conectar o cabo 50 mm² entre a malha e o neutro da UGTM. Verificar continuidade e aperto da conexão.', critical:false},
    {id:'espera-bentonita',  kind:'inline', title:'Aguardar tempo de espera da bentonita',    desc:'Não realizar a medição de Rg antes do prazo indicado.', critical:false, cond:'bentonita', timer:60},
    {id:'medir-rg',          kind:'page',   title:'Medir a resistência de aterramento (Rg)', file:'itens/passo-medir-rg.html',          critical:false},
    {id:'criterio',          kind:'inline', title:'Critério de aceite',                       desc:'Rg ≤ 40 Ω — critério derivado do pickup da função 50N do relé SEPAM S40.', critical:false, showRgResult:true},
    {id:'config-secundaria', kind:'page',   title:'Configuração secundária',                  file:'itens/passo-config-secundaria.html', critical:false, cond:'secundaria'},
    {id:'cancelar',          kind:'inline', title:'Cancelar intervenção',                     desc:'Rg ainda acima de 40 Ω após a configuração secundária. Acionar a equipe de engenharia responsável. Não energizar a UGTM.', critical:false, cond:'cancelar', danger:true}
  ];

  function indexOf(id){ return ITEMS.findIndex(function(i){ return i.id===id; }); }

  /** 'required' | 'skip' | 'manual' (sem dado suficiente pra decidir — exige confirmação manual) */
  function applicability(item){
    const S = window.Ugtm.State;
    if(item.cond==='bentonita'){
      const r = S.getRho();
      if(r==null) return 'manual';
      return r>500 ? 'required' : 'skip';
    }
    if(item.cond==='secundaria'){
      const rg = S.getRg();
      if(rg==null) return 'manual';
      return rg>40 ? 'required' : 'skip';
    }
    if(item.cond==='cancelar'){
      const rg2 = S.getRgSecundario();
      if(rg2==null) return 'skip';
      return rg2>40 ? 'required' : 'skip';
    }
    return 'required';
  }

  /** empurra hubFurthest pra frente automaticamente sobre itens condicionais
   * que não se aplicam (ex.: bentonita quando ρ ≤ 500) — o operador não
   * precisa "resolver" um item que não existe pro caso dele. */
  function autoAdvanceSkips(){
    const S = window.Ugtm.State;
    let idx = S.getHubFurthest();
    while(idx < ITEMS.length && applicability(ITEMS[idx])==='skip'){
      S.unlockHubUpTo(idx+1);
      idx = S.getHubFurthest();
    }
  }

  function isComplete(){
    autoAdvanceSkips();
    return window.Ugtm.State.getHubFurthest() >= ITEMS.length;
  }

  /** Chamar no topo de cada página de item (kind:'page'): redireciona se o
   * operador tentar acessar um item ainda não desbloqueado (URL direta). */
  function guardItem(itemId, basePath){
    autoAdvanceSkips();
    const idx = indexOf(itemId);
    const furthest = window.Ugtm.State.getHubFurthest();
    if(idx > furthest){
      window.location.replace((basePath||'')+'02-procedimento.html');
      return false;
    }
    return true;
  }

  /** Rodapé padrão de cada página de item tipo 'page'. */
  function renderItemFooter(mountId, opts){
    const mount = document.getElementById(mountId);
    if(!mount) return;
    const basePath = opts.basePath||'';
    const idx = indexOf(opts.itemId);

    mount.innerHTML =
      '<div class="wizard-footer">' +
        '<a class="wizard-btn wizard-btn-prev" href="'+basePath+'02-procedimento.html">← Voltar ao Procedimento</a>' +
        '<button class="wizard-btn wizard-btn-next" id="hub-item-next-btn">Concluir este item →</button>' +
      '</div>';

    document.getElementById('hub-item-next-btn').addEventListener('click', function(){
      const result = opts.canAdvance ? opts.canAdvance() : {ok:true};
      if(opts.bannerMount) window.Ugtm.Wizard.renderGateBanner(opts.bannerMount, result);
      if(!result.ok){
        const banner = document.getElementById(opts.bannerMount);
        if(banner) banner.scrollIntoView({behavior:'smooth', block:'center'});
        return;
      }
      if(idx === window.Ugtm.State.getHubFurthest()){
        window.Ugtm.State.unlockHubUpTo(idx+1);
      }
      window.location.href = basePath+'02-procedimento.html';
    });
  }

  function renderProgress(mountId, itemId){
    const mount = document.getElementById(mountId);
    if(!mount) return;
    const idx = indexOf(itemId);
    const furthest = window.Ugtm.State.getHubFurthest();
    const pct = Math.round((idx/(ITEMS.length-1))*100);
    const complete = furthest>=ITEMS.length;
    mount.innerHTML =
      '<div class="progress-wrap"><div class="progress-inner">'
      + '<div class="progress-top"><span>Item '+(idx+1)+' de '+ITEMS.length+' do Procedimento · '+ITEMS[idx].title+'</span><span>'+pct+'%</span></div>'
      + '<div class="progress-track"><div class="progress-fill '+(complete?'complete':'')+'" style="width:'+pct+'%;"></div></div>'
      + '</div></div>';
  }

  window.Ugtm.Hub = {ITEMS, indexOf, applicability, autoAdvanceSkips, isComplete, guardItem, renderItemFooter, renderProgress};
})();
