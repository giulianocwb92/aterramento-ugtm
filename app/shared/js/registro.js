/* ======================= REGISTRO DA OPERAÇÃO (POP — 07-registro.html) =======================
   window.Ugtm.Registro — formulário final. Pré-preenche com ρ/Rg já medidos nas
   páginas anteriores, valida os campos, e exporta um registro em texto que agora
   inclui a trilha de auditoria completa (checklist, justificativas, timestamps). */
(function(){
  window.Ugtm = window.Ugtm || {};

  const FIELD_IDS = ['r-data','r-hora','r-local','r-rho','r-rg','r-resp','r-obs'];

  function validate(){
    const rho = parseFloat(document.getElementById('r-rho').value);
    const rg = parseFloat(document.getElementById('r-rg').value);
    const rhoInput = document.getElementById('r-rho');
    const rgInput = document.getElementById('r-rg');
    const rhoHint = document.getElementById('r-rho-hint');
    const rgHint = document.getElementById('r-rg-hint');
    let ok = true;

    if(document.getElementById('r-rho').value!==''){
      const rhoOk = !isNaN(rho) && rho>0;
      rhoInput.classList.toggle('invalid', !rhoOk);
      if(rhoHint) rhoHint.classList.toggle('invalid', !rhoOk);
      if(!rhoOk) ok=false;
    }
    if(document.getElementById('r-rg').value!==''){
      const rgOk = !isNaN(rg) && rg>=0;
      rgInput.classList.toggle('invalid', !rgOk);
      if(rgHint) rgHint.classList.toggle('invalid', !rgOk);
      if(!rgOk) ok=false;
      if(rgOk && rg>200 && rgHint){
        rgHint.textContent = 'Rg muito acima do critério (40 Ω) — confira a leitura do terrômetro antes de liberar.';
        rgHint.classList.add('invalid');
      }
    }
    const btn = document.getElementById('btn-exportar');
    if(btn) btn.disabled = !ok;
    return ok;
  }

  function auditTrailText(){
    const log = window.Ugtm.State.getLog();
    if(!log.length) return '(sem eventos registrados)';
    return log.map(e=>`  [${e.ts.replace('T',' ').slice(0,19)}] ${e.action} ${e.detail}`).join('\n');
  }

  function exportar(){
    if(!validate()) return;
    const data=document.getElementById('r-data').value||'—';
    const hora=document.getElementById('r-hora').value||'—';
    const local=document.getElementById('r-local').value||'—';
    const rho=document.getElementById('r-rho').value||'—';
    const rg=document.getElementById('r-rg').value||'—';
    const config=document.getElementById('r-config');
    const bentonita=document.getElementById('r-bentonita');
    const resp=document.getElementById('r-resp').value||'—';
    const obs=document.getElementById('r-obs').value||'—';
    const rgNum=parseFloat(rg);
    const status=!isNaN(rgNum)?(rgNum<=40?'✅ APROVADO':'⚠️ REPROVADO — configuração secundária acionada'):'—';

    FIELD_IDS.forEach(id=>window.Ugtm.State.setRegistroField(id, document.getElementById(id).value));
    window.Ugtm.State.addLog('export', 'registro exportado');
    window.Ugtm.State.save();

    const texto=`══════════════════════════════════
REGISTRO DE OPERAÇÃO — POP ATERRAMENTO UGTM
COPEL-DIST-AT-001 · v2.0.0
══════════════════════════════════
Data:          ${data}
Hora de início: ${hora}
Local / UGTM:  ${local}

ρ medido:      ${rho} Ω·m
Rg medido:    ${rg} Ω
Resultado:     ${status}

Configuração:  ${config.options[config.selectedIndex]?.text||'—'}
Bentonita:     ${bentonita.options[bentonita.selectedIndex]?.text||'—'}
Responsável:   ${resp}
Observações:   ${obs}
──────────────────────────────────
TRILHA DE AUDITORIA (checklist, justificativas, passos)
──────────────────────────────────
${auditTrailText()}
══════════════════════════════════`;

    const prev=document.getElementById('export-preview');
    prev.textContent=texto;
    prev.classList.add('show');
    document.getElementById('btn-copiar').style.display='block';
  }

  function copiar(){
    const txt=document.getElementById('export-preview').textContent;
    navigator.clipboard.writeText(txt).then(function(){
      const btn=document.getElementById('btn-copiar');
      btn.textContent='✅ Copiado!';
      setTimeout(()=>btn.textContent='Copiar registro',2000);
    });
  }

  function limpar(){
    FIELD_IDS.forEach(id=>document.getElementById(id).value='');
    document.getElementById('r-config').selectedIndex=0;
    document.getElementById('r-bentonita').selectedIndex=0;
    document.getElementById('export-preview').classList.remove('show');
    document.getElementById('btn-copiar').style.display='none';
    validate();
  }

  function init(){
    const now=new Date();
    const registro = window.Ugtm.State.getRegistro();
    document.getElementById('r-data').value = registro['r-data'] || now.toISOString().split('T')[0];
    document.getElementById('r-hora').value = registro['r-hora'] || now.toTimeString().slice(0,5);
    document.getElementById('r-local').value = registro['r-local'] || '';
    document.getElementById('r-rho').value = registro['r-rho'] || (window.Ugtm.State.getRho()!=null ? window.Ugtm.State.getRho() : '');
    document.getElementById('r-rg').value = registro['r-rg'] || (window.Ugtm.State.getRg()!=null ? window.Ugtm.State.getRg() : '');
    document.getElementById('r-resp').value = registro['r-resp'] || '';
    document.getElementById('r-obs').value = registro['r-obs'] || '';

    document.getElementById('btn-exportar').addEventListener('click', exportar);
    document.getElementById('btn-limpar').addEventListener('click', limpar);
    document.getElementById('btn-copiar').addEventListener('click', copiar);
    ['r-rho','r-rg'].forEach(id=>document.getElementById(id).addEventListener('input', validate));
    validate();
  }

  window.Ugtm.Registro = {init, exportar, copiar, limpar, validate};
})();
