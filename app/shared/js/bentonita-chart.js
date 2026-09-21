/* ======================= GRÁFICO Rg × TEMPO (Manual — bentonita) =======================
   SVG nativo, sem dependências. window.Ugtm.BentonitaChart.render(mountId) */
(function(){
  window.Ugtm = window.Ugtm || {};

  const tMed=[0,15,30,45,60,75,90];
  const rgMed=[132,78,52,32,23,21,15];

  function render(mountId){
    const wrap = document.getElementById(mountId);
    if(!wrap) return;
    const isDark=document.documentElement.classList.contains('dark')||
      (!document.documentElement.classList.contains('light')&&matchMedia('(prefers-color-scheme:dark)').matches);
    const gridC=isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.09)';
    const tickC=isDark?'#9a9a92':'#636360';
    const accent=isDark?'#4f8ef7':'#1a5fb0';
    const red=isDark?'#f04040':'#b81c1c';
    const orange=isDark?'#f5a623':'#e08e00';

    const W=640,H=300;
    const mL=48,mR=14,mT=14,mB=36;
    const pW=W-mL-mR, pH=H-mT-mB;
    const xMax=90, yMax=140;
    const xs=t=>mL+(t/xMax)*pW;
    const ys=v=>mT+(1-v/yMax)*pH;

    const xTicks=[0,15,30,45,60,75,90];
    const yTicks=[0,20,40,60,80,100,120,140];

    let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="font-family:var(--sans);">`;

    yTicks.forEach(v=>{
      svg += `<line x1="${mL}" y1="${ys(v)}" x2="${W-mR}" y2="${ys(v)}" stroke="${gridC}" stroke-width="1"/>`;
      svg += `<text x="${mL-8}" y="${ys(v)+4}" text-anchor="end" font-size="11" fill="${tickC}">${v}</text>`;
    });
    xTicks.forEach(t=>{
      svg += `<line x1="${xs(t)}" y1="${mT}" x2="${xs(t)}" y2="${H-mB}" stroke="${gridC}" stroke-width="1"/>`;
      svg += `<text x="${xs(t)}" y="${H-mB+18}" text-anchor="middle" font-size="11" fill="${tickC}">${t}</text>`;
    });

    svg += `<text x="${mL+pW/2}" y="${H-4}" text-anchor="middle" font-size="12" fill="${tickC}">Tempo (min)</text>`;
    svg += `<text x="14" y="${mT+pH/2}" text-anchor="middle" font-size="12" fill="${tickC}" transform="rotate(-90,14,${mT+pH/2})">Resistência Rg (Ω)</text>`;

    svg += `<line x1="${xs(0)}" y1="${ys(40)}" x2="${xs(xMax)}" y2="${ys(40)}" stroke="${red}" stroke-width="1.5" stroke-dasharray="6 4"/>`;
    svg += `<text x="${W-mR}" y="${ys(40)-6}" text-anchor="end" font-size="11" fill="${red}" font-weight="600">Referência 40 Ω</text>`;

    const pathD = tMed.map((t,i)=>`${i===0?'M':'L'}${xs(t).toFixed(1)},${ys(rgMed[i]).toFixed(1)}`).join(' ');
    svg += `<path d="${pathD}" fill="none" stroke="${accent}" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/>`;

    tMed.forEach((t,i)=>{
      const near40 = Math.abs(rgMed[i]-40)<2;
      const r = near40 ? 7 : 4.5;
      const fill = near40 ? orange : accent;
      svg += `<circle cx="${xs(t).toFixed(1)}" cy="${ys(rgMed[i]).toFixed(1)}" r="${r}" fill="${fill}" stroke="${isDark?'#1a1a17':'#ffffff'}" stroke-width="2"><title>t = ${t} min · Rg = ${rgMed[i].toFixed(2)} Ω</title></circle>`;
    });

    svg += `</svg>`;
    wrap.innerHTML = svg;
  }

  window.Ugtm.BentonitaChart = {render};
})();
