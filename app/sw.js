/* ======================= SERVICE WORKER — cache offline =======================
   Estratégia cache-first: uma vez que o operador abriu o app com internet (ou
   na garagem via wifi), tudo fica salvo no dispositivo e funciona 100% offline
   depois disso, em qualquer navegador (Android, iOS, notebook).
   CACHE_VERSION troca sozinha a cada deploy: o workflow em
   .github/workflows/deploy.yml substitui __BUILD_ID__ pelo hash do commit
   antes de publicar. Isso invalida o cache antigo automaticamente e força o
   download da versão nova na próxima vez que o dispositivo tiver internet —
   não precisa editar este arquivo manualmente a cada publicação. */

const CACHE_VERSION = 'ugtm-pop-__BUILD_ID__';

const ASSETS = [
  './index.html',
  './apresentacao.html',
  './manifest.webmanifest',

  './pop/00-visao-geral.html',
  './pop/01-objetivo.html',
  './pop/02-procedimento.html',
  './pop/03-registro.html',

  './pop/itens/epi.html',
  './pop/itens/materiais.html',
  './pop/itens/solo.html',
  './pop/itens/passo-medir-rg.html',
  './pop/itens/passo-config-secundaria.html',

  './manual/00-contexto.html',
  './manual/01-blocos.html',
  './manual/02-b1-solo.html',
  './manual/03-b2-criterio.html',
  './manual/04-b3-visao-geral.html',
  './manual/04-b3-comparacao-hastes.html',
  './manual/04-b3-equacoes-schwarz.html',
  './manual/04-b3-resultados.html',
  './manual/05-b3b-bentonita.html',
  './manual/06-b4-protecao.html',
  './manual/07-b5-medicao-rg.html',
  './manual/08-b6-suplementar.html',
  './manual/09-referencias.html',

  './shared/css/base.css',
  './shared/css/layout.css',
  './shared/css/components.css',
  './shared/css/wizard.css',

  './shared/js/state.js',
  './shared/js/chrome.js',
  './shared/js/theme.js',
  './shared/js/wizard.js',
  './shared/js/hub.js',
  './shared/js/checklist.js',
  './shared/js/soil-calc.js',
  './shared/js/flowchart.js',
  './shared/js/timer.js',
  './shared/js/registro.js',
  './shared/js/bentonita-chart.js',
  './shared/js/pwa.js',

  './assets/diagrama_blocos_refinado.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-180.png',
  './assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function(cache){ return cache.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k!==CACHE_VERSION; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  if(event.request.method!=='GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return; // não intercepta terceiros

  event.respondWith(
    caches.match(event.request).then(function(cached){
      if(cached) return cached;
      return fetch(event.request).then(function(response){
        if(response && response.status===200){
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(function(cache){ cache.put(event.request, copy); });
        }
        return response;
      }).catch(function(){
        // offline e sem cache — se for navegação de página, cai no index como último recurso
        if(event.request.mode==='navigate') return caches.match('./index.html');
      });
    })
  );
});
