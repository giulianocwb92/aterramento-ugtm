/* ======================= TEMA (claro/escuro) =======================
   Segue a preferência do sistema por padrão; alternável pelo botão da topbar.
   window.Ugtm.Theme */
(function(){
  window.Ugtm = window.Ugtm || {};

  function getSystemDark(){
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  const onChangeCallbacks = [];

  function applyTheme(dark){
    const root=document.documentElement;
    if(dark){
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    const icon=document.getElementById('theme-icon');
    const label=document.getElementById('theme-label');
    if(icon) icon.textContent = dark ? '🌙' : '☀️';
    if(label) label.textContent = dark ? 'Escuro' : 'Claro';
    onChangeCallbacks.forEach(function(cb){ try{ cb(dark); }catch(e){} });
  }

  function toggleTheme(){
    const isDark=document.documentElement.classList.contains('dark');
    applyTheme(!isDark);
  }

  function init(){
    applyTheme(getSystemDark());
    const btn = document.getElementById('theme-btn');
    if(btn) btn.addEventListener('click', toggleTheme);
  }

  window.Ugtm.Theme = {
    init,
    toggle: toggleTheme,
    onChange(cb){ onChangeCallbacks.push(cb); }
  };
})();
