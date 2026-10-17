/* ======================= HUB DO PROCEDIMENTO =======================
   window.Ugtm.Hub — lista central dos 12 itens do Procedimento, com a lógica
   de aplicabilidade (itens condicionais que só aparecem conforme ρ/Rg já
   medidos) e o progresso sequencial dentro do hub.

   Dois tipos de item:
   - kind:'page'   → item complexo (checklist múltiplo, campo numérico) que
                      abre sua própria página em pop/itens/*.html.
   - kind:'inline' → passo simples ("concluí este passo") resolvido direto
                      na lista do hub, sem navegar — marca, esmaece e avança.

   Três grupos de materiais:
   1. CRÍTICOS (hastes, terrômetro): ausência → cancelamento imediato, sem justificativa.
   2. BLOQUEADORES (neutro, interligação, ferramental, bentonita*): podem ser justificados,
      mas sem eles a instalação elétrica/física é inviável → cancelamento forçado.
      *bentonita só é bloqueadora se ρ > 500 Ω·m (condicional).
   3. OPERACIONAIS (marreta, fita, cones): podem ser justificados,
      operação continua com alerta no relatório. */
(function(){
  window.Ugtm = window.Ugtm || {};

  const ITEMS = [
    {id:'epi',               kind:'page',   title:'EPI e isolamento da área',                file:'itens/epi.html',                     critical:true},
    {id:'materiais',         kind:'page',   title:'Materiais necessários',                   file:'itens/materiais.html',               critical:false},
    {id:'solo',              kind:'page',   title:'Medir resistividade do solo (ρ)',         file:'itens/solo.html',                    critical:false},
    {id:'hastes',            kind:'inline', title:'Instalar as 4 hastes',                    desc:'Cravar as hastes de 2.400 mm nos 4 cantos do retângulo 17 m × 4 m, verticalmente até o limite do comprimento.', critical:false},
    {id:'bentonita',         kind:'inline', title:'Aplicar bentonita sódica',                desc:'Somente se ρ > 500 Ω·m. Com as hastes já instaladas, aplicar a bentonita pré-dosada ao redor de cada uma e hidratar com água. Anotar o horário de aplicação.', critical:false, cond:'bentonita'},
    {id:'cabos',             kind:'inline', title:'Instalar os cabos de interligação',        desc:'Conectar as 4 hastes entre si com o cabo 25 mm² formando o perímetro da malha. Verificar aperto de todas as conexões.', critical:false},
    {id:'neutro',            kind:'inline', title:'Conectar o cabo de neutro',                desc:'Conectar o cabo 50 mm² entre a malha e o neutro da UGTM. Verificar continuidade e aperto da conexão.', critical:false},
    {id:'espera-bentonita',  kind:'inline', title:'Aguardar tempo de espera da bentonita',    desc:'Não realizar a medição de Rg antes do prazo indicado.', critical:false, cond:'bentonita', timer:60},
    {id:'medir-rg',          kind:'page',   title:'Medir a resistência de aterramento (Rg)', file:'itens/passo-medir-rg.html',          critical:false},
    {id:'criterio',          kind:'inline', title:'Critério de aceite',                       desc:'Rg ≤ 40 Ω — critério derivado do pickup da função 50N do relé SEPAM S40.', critical:false, showRgResult:true},
    {id:'config-secundaria', kind:'page',   title:'Configuração secundária',                  file:'itens/passo-config-secundaria.html', critical:false, cond:'secundaria'},
    {id:'cancelar',          kind:'inline', title:'Cancelar intervenção',                     desc:'Rg ainda acima de 40 Ω após a configuração secundária. Acionar a equipe de engenharia responsável. Não energizar a UGTM.', critical:false, cond:'cancelar', danger:true}
  ];

  // GRUPO 1 — críticos: ausência bloqueia imediatamente (sem justificativa)
  const MATERIAIS_CRITICOS = ['hastes', 'terrometro'];

  // GRUPO 2 — elétricos/ferramenteiros: justificáveis, mas ausência → cancelamento forçado
  // Inclui ferramental (sem ele a instalação física não é possível com segurança)
  // bentonita só conta como bloqueador se ρ > 500 Ω·m
  const MATERIAIS_ELETRICOS = ['neutro', 'interligacao', 'bentonita', 'ferramental'];

  // Passos que dependem dos materiais críticos ou elétricos/ferramenteiros
  const PASSOS_DEPENDEM_MATERIAIS = [
    'solo', 'hastes', 'bentonita', 'cabos', 'neutro',
    'espera-bentonita', 'medir-rg', 'criterio', 'config-secundaria'
  ];

  function indexOf(id){ return ITEMS.findIndex(function(i){ return i.id===id; }); }

  /** Verifica se um item de material NÃO está confirmado (checked:false). */
  function itemIndisponivel(key){
    return !window.Ugtm.State.getChecklistItem('materiais.' + key).checked;
  }

  /** GRUPO 1: algum crítico (hastes/terrômetro) não confirmado → aborto. */
  function temCriticoAusente(){
    return MATERIAIS_CRITICOS.some(itemIndisponivel);
  }

  /** GRUPO 2: elétricos não confirmados. Bentonita só conta se ρ > 500.
   *  Retorna array com as chaves bloqueadoras. */
  function eletricosIndisponiveis(){
    return MATERIAIS_ELETRICOS.filter(function(key){
      if(key === 'bentonita'){
        var rho = window.Ugtm.State.getRho();
        if(rho == null || rho <= 500) return false;
      }
      return itemIndisponivel(key);
    });
  }

  /** true se há itens operacionais justificados (gera alerta no relatório).
   *  Operacionais: apenas marreta, fita, cones — ferramental agora é bloqueador. */
  function temAlertaOperacional(){
    var OPERACIONAIS = ['marreta', 'fita', 'cones'];
    return OPERACIONAIS.some(function(key){
      var st = window.Ugtm.State.getChecklistItem('materiais.' + key);
      return !st.checked && !!st.justification;
    });
  }

  /** true se a operação deve ser ABORTADA.
   *  Chamado no clique de Próximo em materiais.html — sem guard de hubFurthest. */
  function deveAbortar(){
    return temCriticoAusente() || eletricosIndisponiveis().length > 0;
  }

  /** Alias mantido para compatibilidade com applicability(). */
  function deveForcarCancelamento(){ return deveAbortar(); }

  /** Lista todos os materiais bloqueadores (críticos + elétricos indisponíveis). */
  function materiaisIndisponiveis(){
    var criticos = MATERIAIS_CRITICOS.filter(itemIndisponivel);
    return criticos.concat(eletricosIndisponiveis());
  }

  /** 'required' | 'skip' | 'manual' */
  function applicability(item){
    const S = window.Ugtm.State;

    // Se materiais já foram confirmados e há indisponíveis → pula passos de campo
    if(deveForcarCancelamento()){
      if(item.id === 'epi' || item.id === 'materiais') return 'required';
      if(item.id === 'cancelar') return 'required';
      if(PASSOS_DEPENDEM_MATERIAIS.indexOf(item.id) !== -1) return 'skip';
    }

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

  /** Empurra hubFurthest sobre itens que não se aplicam. */
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

  window.Ugtm.Hub = {
    ITEMS, indexOf, applicability, autoAdvanceSkips, isComplete,
    guardItem, renderItemFooter, renderProgress,
    deveAbortar, deveForcarCancelamento, materiaisIndisponiveis,
    temCriticoAusente, eletricosIndisponiveis, temAlertaOperacional
  };
})();
