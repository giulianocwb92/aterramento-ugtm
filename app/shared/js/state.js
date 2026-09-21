/* ======================= ESTADO PERSISTENTE (localStorage) =======================
   Namespace global: window.Ugtm.State
   Guarda checklist, medições, formulário de registro, progresso do POP e log de
   auditoria (timestamp de cada ação — check, justificativa, avanço de página). */
(function(){
  window.Ugtm = window.Ugtm || {};

  const KEY = 'ugtm_pop_state_v1';

  function emptyState(){
    return {
      meta:{createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()},
      checklist:{},           // { "epi.luvas": {checked, justification, checkedAt, justifiedAt} }
      steps:{},               // { "proc.hastes": {done, doneAt} }
      furthestPage:0,         // índice da página mais avançada já desbloqueada no menu principal do POP
      hubFurthest:0,          // índice do item mais avançado já desbloqueado dentro do hub do Procedimento
      solo:{rho:null},
      criterio:{rg:null, rgSecundario:null},
      bentonita:{appliedAt:null},
      registro:{},
      log:[]
    };
  }

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return emptyState();
      const parsed = JSON.parse(raw);
      return Object.assign(emptyState(), parsed);
    }catch(e){
      return emptyState();
    }
  }

  let state = load();

  function save(){
    state.meta.updatedAt = new Date().toISOString();
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){/* storage indisponível */}
  }

  function addLog(action, detail){
    state.log.push({ts:new Date().toISOString(), action, detail:detail||''});
    if(state.log.length>500) state.log = state.log.slice(-500);
  }

  const State = {
    all(){ return state; },

    hasAnyProgress(){
      return state.furthestPage>0 || Object.keys(state.checklist).length>0 || state.log.length>0;
    },

    reset(){
      state = emptyState();
      save();
    },

    // ---- checklist ----
    setChecked(itemKey, checked){
      const item = state.checklist[itemKey] || {};
      item.checked = checked;
      item.checkedAt = checked ? new Date().toISOString() : null;
      if(checked){ item.justification = null; item.justifiedAt = null; }
      state.checklist[itemKey] = item;
      addLog(checked ? 'check' : 'uncheck', itemKey);
      save();
    },
    setJustification(itemKey, text){
      const item = state.checklist[itemKey] || {};
      item.justification = text;
      item.justifiedAt = text ? new Date().toISOString() : null;
      state.checklist[itemKey] = item;
      addLog('justify', itemKey+' :: '+text);
      save();
    },
    getChecklistItem(itemKey){
      return state.checklist[itemKey] || {checked:false, justification:null};
    },

    // ---- steps do procedimento (04-procedimento) ----
    setStepDone(stepId, done){
      const key = 'proc.'+stepId;
      state.steps[key] = {done, doneAt: done ? new Date().toISOString() : null};
      addLog(done?'step-done':'step-undone', 'passo '+stepId);
      save();
    },
    isStepDone(stepId){
      const s = state.steps['proc.'+stepId];
      return !!(s && s.done);
    },

    // ---- progresso de página (menu principal do POP) ----
    getFurthestPage(){ return state.furthestPage||0; },
    unlockUpTo(index){
      if(index > state.furthestPage){
        state.furthestPage = index;
        save();
      }
    },

    // ---- progresso dentro do hub do Procedimento (12 itens) ----
    getHubFurthest(){ return state.hubFurthest||0; },
    unlockHubUpTo(index){
      if(index > state.hubFurthest){
        state.hubFurthest = index;
        addLog('hub-unlock', 'item '+index);
        save();
      }
    },
    resetHub(){
      state.hubFurthest = 0;
      save();
    },

    // ---- medições ----
    setRho(v){ state.solo.rho = v; addLog('rho', String(v)); save(); },
    getRho(){ return state.solo.rho; },
    setRg(v){ state.criterio.rg = v; addLog('rg', String(v)); save(); },
    getRg(){ return state.criterio.rg; },
    setRgSecundario(v){ state.criterio.rgSecundario = v; addLog('rg-secundario', String(v)); save(); },
    getRgSecundario(){ return state.criterio.rgSecundario; },

    setBentonitaAppliedAt(iso){ state.bentonita.appliedAt = iso; addLog('bentonita-aplicada', iso||''); save(); },
    getBentonitaAppliedAt(){ return state.bentonita.appliedAt; },

    // ---- formulário de registro ----
    setRegistroField(field, value){ state.registro[field] = value; save(); },
    getRegistro(){ return state.registro; },

    // ---- log de auditoria ----
    getLog(){ return state.log.slice(); },
    addLog,

    save
  };

  window.Ugtm.State = State;
})();
