/* ======================= MOTOR DE GATING (POP) =======================
   window.Ugtm.Wizard — impede pular etapas, desenha a barra de progresso e o
   rodapé Voltar/Próximo, e resolve se a página atual pode avançar (bloqueio
   duro para itens críticos, bloqueio suave com justificativa para os demais). */
(function(){
  window.Ugtm = window.Ugtm || {};

  function pages(){ return window.Ugtm.Chrome.POP_PAGES; }

  /** Chamar no topo de toda página do POP: se o operador tentar acessar uma
   * página além do que já desbloqueou (editando a URL), manda de volta. */
  function guard(pageId, basePath){
    const list = pages();
    const idx = window.Ugtm.Chrome.pageIndex(list, pageId);
    const furthest = window.Ugtm.State.getFurthestPage();
    if(idx > furthest){
      window.location.replace((basePath||'')+list[furthest].file);
      return false;
    }
    return true;
  }

  function renderProgress(mountId, pageId){
    const mount = document.getElementById(mountId);
    if(!mount) return;
    const list = pages();
    const idx = window.Ugtm.Chrome.pageIndex(list, pageId);
    const furthest = window.Ugtm.State.getFurthestPage();
    const pct = Math.round(((idx)/(list.length-1))*100);
    const complete = furthest>=list.length-1;
    mount.innerHTML = `
      <div class="progress-wrap">
        <div class="progress-inner">
          <div class="progress-top"><span>Etapa ${idx+1} de ${list.length} · ${list[idx].label}</span><span>${pct}%</span></div>
          <div class="progress-track"><div class="progress-fill ${complete?'complete':''}" style="width:${pct}%;"></div></div>
        </div>
      </div>`;
  }

  /**
   * Avalia uma lista de itens de checklist (ver checklist.js) contra o state.
   * Retorna {ok, hardPending:[ids], softPending:[ids]}
   */
  function evaluateChecklist(items){
    const hardPending=[], softPending=[];
    items.forEach(function(def){
      const state = window.Ugtm.State.getChecklistItem(def.key);
      if(state.checked) return;
      if(def.critical) hardPending.push(def);
      else if(!state.justification) softPending.push(def);
    });
    return {ok: hardPending.length===0 && softPending.length===0, hardPending, softPending};
  }

  function renderGateBanner(mountId, evalResult){
    const mount = document.getElementById(mountId);
    if(!mount) return;
    if(evalResult.ok){ mount.innerHTML=''; return; }
    const hardPending = evalResult.hardPending || [];
    const softPending = evalResult.softPending || [];
    if(hardPending.length){
      mount.innerHTML = `<div class="gate-banner hard">⛔<div>
        <strong>Bloqueado — itens de segurança obrigatórios não confirmados</strong>
        Estes itens não podem ser justificados, só marcados: volte e confirme cada um.
        <ul>${hardPending.map(i=>`<li>${i.label}</li>`).join('')}</ul>
      </div></div>`;
    } else {
      mount.innerHTML = `<div class="gate-banner soft">⚠️<div>
        <strong>Pendências sem justificativa</strong>
        Marque ou justifique os itens abaixo antes de avançar.
        <ul>${softPending.map(i=>`<li>${i.label}</li>`).join('')}</ul>
      </div></div>`;
    }
  }

  /**
   * Rodapé Voltar / Próximo.
   * opts: {pageId, basePath, canAdvance: fn()=>{ok,hardPending,softPending}, bannerMount, onBeforeNext}
   */
  function renderFooter(mountId, opts){
    const mount = document.getElementById(mountId);
    if(!mount) return;
    const list = pages();
    const idx = window.Ugtm.Chrome.pageIndex(list, opts.pageId);
    const prev = idx>0 ? list[idx-1] : null;
    const next = idx<list.length-1 ? list[idx+1] : null;
    const basePath = opts.basePath||'';

    mount.innerHTML = `
      <div class="wizard-footer">
        ${prev ? `<a class="wizard-btn wizard-btn-prev" href="${basePath+prev.file}">← Voltar</a>` : '<span></span>'}
        ${next ? `<button class="wizard-btn wizard-btn-next" id="wizard-next-btn">Próximo →</button>` : ''}
      </div>`;

    const btn = document.getElementById('wizard-next-btn');
    if(btn && next){
      btn.addEventListener('click', function(){
        const result = opts.canAdvance ? opts.canAdvance() : {ok:true};
        if(opts.bannerMount) renderGateBanner(opts.bannerMount, result);
        if(!result.ok){
          if(result.hardPending && result.hardPending.length){
            btn.classList.add('blocked-hard');
            setTimeout(()=>btn.classList.remove('blocked-hard'),600);
          }
          const banner = document.getElementById(opts.bannerMount);
          if(banner) banner.scrollIntoView({behavior:'smooth', block:'center'});
          return;
        }
        if(opts.onBeforeNext) opts.onBeforeNext();
        window.Ugtm.State.unlockUpTo(idx+1);
        window.location.href = basePath+next.file;
      });
    }
  }

  window.Ugtm.Wizard = {guard, renderProgress, evaluateChecklist, renderGateBanner, renderFooter, pages};
})();
