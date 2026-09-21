/* ======================= REGISTRO DO SERVICE WORKER =======================
   window.Ugtm.PWA.init(basePath) — registra o sw.js (que fica na raiz de app/)
   para cache offline. Chamar com basePath='' nas páginas da raiz (index.html,
   apresentacao.html) e basePath='../' nas páginas de pop/ e manual/.

   Em localhost (desenvolvimento via preview-local.sh) o service worker é
   propositalmente DESATIVADO — e qualquer registro antigo é removido — pra
   nunca mais servir versão em cache enquanto estamos editando o app. O cache
   offline de verdade só entra em ação fora de localhost (túnel de teste ou
   endereço final de produção), que é onde ele precisa funcionar. */
(function(){
  window.Ugtm = window.Ugtm || {};

  function isLocalhost(){
    return location.hostname==='localhost' || location.hostname==='127.0.0.1';
  }

  function init(basePath){
    if(!('serviceWorker' in navigator)) return;

    if(isLocalhost()){
      // limpa qualquer service worker/cache que tenha ficado registrado de
      // uma sessão de teste anterior nesta mesma porta
      navigator.serviceWorker.getRegistrations().then(function(regs){
        regs.forEach(function(r){ r.unregister(); });
      });
      if(window.caches && caches.keys){
        caches.keys().then(function(keys){
          keys.forEach(function(k){ caches.delete(k); });
        });
      }
      return;
    }

    const hadController = !!navigator.serviceWorker.controller;

    window.addEventListener('load', function(){
      navigator.serviceWorker.register((basePath||'')+'sw.js').then(function(reg){
        // confere ativamente por versão nova (além da checagem automática do navegador)
        reg.update().catch(function(){});
      }).catch(function(err){
        console.warn('Falha ao registrar service worker (app segue funcionando online):', err);
      });
    });

    // "controllerchange" também dispara na primeiríssima instalação (quando a página
    // passa de "sem controlador" para "com controlador") — só é uma ATUALIZAÇÃO de
    // verdade se este dispositivo já tinha um service worker controlando a página.
    if(hadController){
      navigator.serviceWorker.addEventListener('controllerchange', showUpdateBanner);
    }
  }

  function showUpdateBanner(){
    if(document.getElementById('sw-update-banner')) return;
    const el = document.createElement('div');
    el.id = 'sw-update-banner';
    el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;'
      + 'background:#1d5bbf;color:#fff;padding:10px 14px;display:flex;gap:12px;'
      + 'align-items:center;justify-content:center;flex-wrap:wrap;'
      + 'font-family:Inter,system-ui,sans-serif;font-size:13.5px;box-shadow:0 -2px 10px rgba(0,0,0,.2);';
    el.innerHTML = '<span>🔄 Nova versão do app disponível.</span>'
      + '<button id="sw-update-btn" style="background:#fff;color:#1d5bbf;border:none;'
      + 'border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer;">Atualizar agora</button>';
    document.body.appendChild(el);
    document.getElementById('sw-update-btn').addEventListener('click', function(){
      window.location.reload();
    });
  }

  window.Ugtm.PWA = {init};
})();
