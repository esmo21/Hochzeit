export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
export function formatDate(dateString){ if(!dateString) return 'Ohne Datum'; const [y,m,d]=dateString.split('-'); return `${d}.${m}.${y}`; }
export function todayISO(){ const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
export function isOverdue(dateString, done=false){ return Boolean(dateString && !done && dateString < todayISO()); }
export function setMessage(el, text='', type='success'){ if(!el) return; el.textContent=text; el.className=`notice ${type}`; el.hidden=!text; }
export function clearChildren(node){ while(node.firstChild) node.removeChild(node.firstChild); }
export function setBusy(button, busy, label){ if(!button) return; if(!button.dataset.defaultText) button.dataset.defaultText=button.textContent; button.disabled=busy; button.textContent=busy ? (label || 'Bitte warten …') : button.dataset.defaultText; }
export function normalizeOptional(value){ const v=String(value ?? '').trim(); return v === '' ? null : v; }
export function parseNonNegativeInteger(value){ if(value === '' || value == null) return 0; const n=Number(value); return Number.isInteger(n) && n >= 0 ? n : null; }
export function parseOptionalPrice(value){ if(value === '' || value == null) return null; const n=Number(String(value).replace(',','.')); return Number.isFinite(n) && n >= 0 ? n : null; }
export function isValidHttpUrl(value){ if(!value) return true; try{ const url=new URL(value); return url.protocol === 'http:' || url.protocol === 'https:'; }catch{return false;} }
export function confirmDialog(message){ return new Promise(resolve=>{ const d=$('#confirm-dialog'); if(!d || typeof d.showModal !== 'function') return resolve(window.confirm(message)); $('#confirm-message',d).textContent=message; const yes=$('[data-confirm-yes]',d); const no=$('[data-confirm-no]',d); const cleanup=(result)=>{ yes.removeEventListener('click',onYes); no.removeEventListener('click',onNo); d.close(); resolve(result); }; const onYes=()=>cleanup(true); const onNo=()=>cleanup(false); yes.addEventListener('click',onYes); no.addEventListener('click',onNo); d.showModal(); }); }
export function renderEmpty(container, text){ clearChildren(container); const div=document.createElement('div'); div.className='empty-state'; div.textContent=text; container.append(div); }
