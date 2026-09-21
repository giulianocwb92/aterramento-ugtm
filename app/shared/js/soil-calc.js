/* ======================= CALCULADORA DE SOLO (POP — 05-solo.html) =======================
   window.Ugtm.Soil.init() liga o input de ρ à tabela e persiste o valor no state,
   para ser reaproveitado pelo stepper do procedimento (passo condicional da bentonita). */
(function(){
  window.Ugtm = window.Ugtm || {};

  function update(){
    const input = document.getElementById('rho-val');
    const rows = document.querySelectorAll('.soil-row');
    const result = document.getElementById('solo-result');
    if(!input || !result) return;

    const val = parseFloat(input.value);
    rows.forEach(r=>r.classList.remove('highlighted'));
    result.className='soil-result';
    result.innerHTML='';

    if(isNaN(val)||val<=0){
      window.Ugtm.State.setRho(null);
      return;
    }
    window.Ugtm.State.setRho(val);

    rows.forEach(function(r){
      const min=parseFloat(r.dataset.min), max=parseFloat(r.dataset.max);
      if(val>=min && val<=max){
        r.classList.add('highlighted');
        const badge = r.querySelector('.action-badge');
        const time = r.querySelector('.time-num').textContent;
        const isOk = badge.classList.contains('badge-green');
        result.classList.add('show');
        if(isOk){
          result.classList.add('ok');
          result.innerHTML=`<div style="font-weight:600;font-size:15px;margin-bottom:4px;">✅ Solo favorável — bentonita não necessária</div><div style="font-size:13px;">Instalar as hastes diretamente e medir Rg. Critério de aceite: Rg ≤ 40 Ω.</div>`;
        } else {
          result.classList.add('bentonita');
          result.innerHTML=`<div style="font-weight:600;font-size:15px;margin-bottom:4px;">⚠️ Aplicar bentonita sódica — aguardar ${time}</div><div style="font-size:13px;">Aplicar nos 4 pontos de instalação das hastes com água. Anotar o horário de aplicação e aguardar ${time} antes de medir Rg. Tempo de referência validado em campo até ρ = 76 Ω·m — para solos muito mais resistivos, confirmar com a engenharia.</div>`;
        }
      }
    });
  }

  function init(){
    const input = document.getElementById('rho-val');
    if(!input) return;
    const saved = window.Ugtm.State.getRho();
    if(saved!=null) input.value = saved;
    input.addEventListener('input', update);
    update();
  }

  window.Ugtm.Soil = {init, update};
})();
