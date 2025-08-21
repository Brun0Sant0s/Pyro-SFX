export const ACCENT={ red:'#ff2a2a', deepRed:'#c01515', ember:'#ff7a59', white:'#ffffff', gold:'#ffd166' };
export const hexToRgb=(hex='')=>{ let h=String(hex).replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const r=parseInt(h.slice(0,2),16)||0; const g=parseInt(h.slice(2,4),16)||0; const b=parseInt(h.slice(4,6),16)||0; return `${r}, ${g}, ${b}`; };
