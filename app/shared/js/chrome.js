/* ======================= CHROME (topbar + sidebar) =======================
   Monta a barra superior e a navegação lateral via JS puro (sem fetch de
   partials — assim o app funciona abrindo o .html direto do disco, sem
   precisar de servidor). window.Ugtm.Chrome.render(opts) */
(function(){
  window.Ugtm = window.Ugtm || {};

  const POP_PAGES = [
    {id:'visao-geral',  file:'pop/00-visao-geral.html',  label:'Visão geral'},
    {id:'objetivo',     file:'pop/01-objetivo.html',     label:'Objetivo'},
    {id:'procedimento', file:'pop/02-procedimento.html', label:'Procedimento'},
    {id:'registro',     file:'pop/03-registro.html',     label:'Registro'}
  ];

  const MANUAL_PAGES = [
    {id:'contexto',   file:'manual/00-contexto.html',        label:'Contexto'},
    {id:'blocos',     file:'manual/01-blocos.html',          label:'Blocos'},
    {id:'b1',         file:'manual/02-b1-solo.html',         label:'B1 — Solo'},
    {id:'b2',         file:'manual/03-b2-criterio.html',     label:'B2 — Critério'},
    {id:'b3-geral',      file:'manual/04-b3-visao-geral.html',       label:'B3 — Visão geral'},
    {id:'b3-comparacao', file:'manual/04-b3-comparacao-hastes.html', label:'B3 — Paralelo vs. anel'},
    {id:'b3-schwarz',    file:'manual/04-b3-equacoes-schwarz.html',  label:'B3 — Equações Schwarz'},
    {id:'b3-resultados', file:'manual/04-b3-resultados.html',        label:'B3 — Resultados'},
    {id:'b3b',        file:'manual/05-b3b-bentonita.html',   label:'B3 — Bentonita'},
    {id:'b4',         file:'manual/06-b4-protecao.html',     label:'B4 — Proteção'},
    {id:'b5',         file:'manual/07-b5-medicao-rg.html',   label:'B5 — Medição Rg'},
    {id:'b6',         file:'manual/08-b6-suplementar.html',  label:'B6 — Suplementar'},
    {id:'referencias',file:'manual/09-referencias.html',     label:'Referências'}
  ];

  function pageIndex(list, id){ return list.findIndex(p=>p.id===id); }

  function furthestPopFile(basePath){
    const idx = (window.Ugtm.State ? window.Ugtm.State.getFurthestPage() : 0);
    const page = POP_PAGES[Math.min(idx, POP_PAGES.length-1)] || POP_PAGES[0];
    return basePath + page.file;
  }

  function render(opts){
    const mode = opts.mode;            // 'pop' | 'manual'
    const activeId = opts.activeId;
    const basePath = opts.basePath || ''; // '' na raiz de app/, '../' dentro de pop/ ou manual/

    const list = mode==='pop' ? POP_PAGES : MANUAL_PAGES;
    const activeIdx = pageIndex(list, activeId);
    const furthest = mode==='pop' && window.Ugtm.State ? window.Ugtm.State.getFurthestPage() : list.length;

    // ---- TOPBAR ----
    const topbar = document.getElementById('topbar-mount');
    if(topbar){
      topbar.innerHTML = `
      <div class="topbar" id="topbar">
        <div class="topbar-left">
          <a class="home-btn" href="${basePath}index.html" title="Voltar à abertura">🏠</a>
          <span class="topbar-logo">${mode==='pop' ? 'POP · COPEL-DIST-AT-001' : 'MANUAL TÉCNICO · COPEL-DIST-AT-002'}</span>
          <div class="mode-switch">
            <a class="mode-btn ${mode==='pop'?'active':''}" data-mode="pop" href="${furthestPopFile(basePath)}">👷 <span class="mode-btn-label">POP</span></a>
            <a class="mode-btn ${mode==='manual'?'active':''}" data-mode="manual" href="${basePath}manual/00-contexto.html">🎓 <span class="mode-btn-label">Manual Técnico</span></a>
          </div>
        </div>
        <div class="topbar-right">
          <span class="topbar-version">v2.0.0 · 2026</span>
          <button id="theme-btn" style="background:var(--surface2);border:1px solid var(--border-strong);border-radius:8px;padding:4px 12px;font-size:13px;font-weight:500;color:var(--text);cursor:pointer;font-family:var(--sans);display:flex;align-items:center;gap:6px;">
            <span id="theme-icon">☀️</span><span id="theme-label">Claro</span>
          </button>
        </div>
      </div>`;
    }

    // ---- SIDEBAR ----
    const sidebar = document.getElementById('sidebar-mount');
    if(sidebar){
      const items = list.map((p,i)=>{
        const isActive = p.id===activeId;
        const isLocked = mode==='pop' && i>furthest;
        const cls = ['nav-anchor'];
        if(isActive) cls.push('active');
        if(isLocked) cls.push('locked');
        const lockIcon = isLocked ? '<span class="nav-anchor-lock">🔒</span>' : '';
        return isLocked
          ? `<span class="${cls.join(' ')}">${p.label}${lockIcon}</span>`
          : `<a class="${cls.join(' ')}" href="${basePath}${p.file}">${p.label}</a>`;
      }).join('');
      sidebar.innerHTML = `<div class="nav-anchors">${items}</div>`;
    }

    if(window.Ugtm.Theme) window.Ugtm.Theme.init();
  }

  window.Ugtm.Chrome = {render, POP_PAGES, MANUAL_PAGES, pageIndex};
})();
