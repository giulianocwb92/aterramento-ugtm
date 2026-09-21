/* ======================= TIMER DE ESPERA DA BENTONITA =======================
   window.Ugtm.Timer.init(mountId, waitMinutes) — o operador registra o horário
   de aplicação (persistido no state) e o app conta a contagem regressiva até
   liberar a medição de Rg. */
(function(){
  window.Ugtm = window.Ugtm || {};
  let intervalId=null;

  function fmt(ms){
    if(ms<=0) return '00:00';
    const totalSec = Math.floor(ms/1000);
    const m = Math.floor(totalSec/60);
    const s = totalSec%60;
    return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }

  function render(mountId, waitMinutes){
    const mount = document.getElementById(mountId);
    if(!mount) return;
    const appliedAt = window.Ugtm.State.getBentonitaAppliedAt();

    if(!appliedAt){
      mount.innerHTML = `<div class="timer-card">
        <div class="timer-label">Bentonita ainda não foi marcada como aplicada</div>
        <button class="timer-btn" id="timer-start-btn">Marcar bentonita aplicada agora</button>
      </div>`;
      const btn = document.getElementById('timer-start-btn');
      if(btn) btn.addEventListener('click', function(){
        window.Ugtm.State.setBentonitaAppliedAt(new Date().toISOString());
        render(mountId, waitMinutes);
      });
      return;
    }

    const target = new Date(appliedAt).getTime() + waitMinutes*60000;
    function tick(){
      const remaining = target - Date.now();
      const ready = remaining<=0;
      mount.innerHTML = `<div class="timer-card">
        <div class="timer-val ${ready?'ready':''}">${ready?'✅ Pronto':fmt(remaining)}</div>
        <div class="timer-label">${ready ? 'Tempo de espera cumprido — pode medir Rg' : 'até poder medir Rg (aplicado às '+new Date(appliedAt).toTimeString().slice(0,5)+')'}</div>
        <button class="timer-btn" id="timer-reset-btn">Reaplicar / reiniciar contagem</button>
      </div>`;
      const resetBtn = document.getElementById('timer-reset-btn');
      if(resetBtn) resetBtn.addEventListener('click', function(){
        window.Ugtm.State.setBentonitaAppliedAt(null);
        clearInterval(intervalId);
        render(mountId, waitMinutes);
      });
      if(ready) clearInterval(intervalId);
    }
    tick();
    clearInterval(intervalId);
    intervalId = setInterval(tick, 1000);
  }

  window.Ugtm.Timer = {render};
})();
