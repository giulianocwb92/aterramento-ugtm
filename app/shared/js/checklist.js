/* ======================= CHECKLIST GENÉRICO =======================
   window.Ugtm.Checklist.render(mountId, groupId, items, onChange)
   items: [{key, label, critical}]
   Cada item vira "groupId.key" na chave do state (ex.: "epi.luvas"). Itens
   críticos só podem ser resolvidos marcando o check — sem opção de
   justificativa. Itens não-críticos, se não marcados, podem ser justificados
   por texto (fica registrado no log de auditoria). */
(function(){
  window.Ugtm = window.Ugtm || {};

  function itemKey(groupId, key){ return groupId+'.'+key; }

  function render(mountId, groupId, items, onChange){
    const mount = document.getElementById(mountId);
    if(!mount) return;

    function draw(){
      mount.innerHTML = items.map(function(def){
        const key = itemKey(groupId, def.key);
        const st = window.Ugtm.State.getChecklistItem(key);
        const cls = ['check-item'];
        if(st.checked) cls.push('checked');
        else if(st.justification) cls.push('justified');

        const critTag = def.critical ? '<span class="check-item-critical-tag">obrigatório</span>' : '';
        const box = st.checked ? '✓' : (st.justification ? '!' : '');

        let justifyHtml = '';
        if(!def.critical && !st.checked){
          if(st.justification){
            justifyHtml = `<div class="check-item-justify-saved">Justificativa: "${st.justification}"
              — <button class="check-item-justify-link" data-edit="${def.key}">editar</button></div>`;
          } else {
            justifyHtml = `<button class="check-item-justify-link" data-open="${def.key}">Não disponível / justificar</button>`;
          }
        }

        return `<div class="${cls.join(' ')}" data-key="${def.key}">
          <div class="check-item-row" data-toggle="${def.key}">
            <div class="check-item-box">${box}</div>
            <div class="check-item-label">${def.label}</div>
            ${critTag}
          </div>
          <div class="check-item-extra">${justifyHtml}</div>
        </div>`;
      }).join('');

      // toggle check
      mount.querySelectorAll('[data-toggle]').forEach(function(el){
        el.addEventListener('click', function(){
          const k = el.getAttribute('data-toggle');
          const key = itemKey(groupId, k);
          const st = window.Ugtm.State.getChecklistItem(key);
          window.Ugtm.State.setChecked(key, !st.checked);
          draw();
          if(onChange) onChange();
        });
      });

      // abrir caixa de justificativa
      mount.querySelectorAll('[data-open],[data-edit]').forEach(function(el){
        el.addEventListener('click', function(ev){
          ev.stopPropagation();
          const k = el.getAttribute('data-open')||el.getAttribute('data-edit');
          const def = items.find(i=>i.key===k);
          const key = itemKey(groupId, k);
          const st = window.Ugtm.State.getChecklistItem(key);
          const itemEl = mount.querySelector('[data-key="'+k+'"] .check-item-extra');
          itemEl.innerHTML = `<div class="check-item-justify-box">
            <textarea placeholder="Por que este item não foi confirmado?">${st.justification||''}</textarea>
            <button class="check-item-justify-link" data-save="${k}" style="margin-top:6px;">Salvar justificativa</button>
          </div>`;
          itemEl.querySelector('textarea').focus();
          itemEl.querySelector('[data-save]').addEventListener('click', function(ev2){
            ev2.stopPropagation();
            const text = itemEl.querySelector('textarea').value.trim();
            if(!text) return;
            window.Ugtm.State.setJustification(key, text);
            draw();
            if(onChange) onChange();
          });
        });
      });
    }

    draw();
    return {refresh:draw};
  }

  window.Ugtm.Checklist = {render, itemKey};
})();
