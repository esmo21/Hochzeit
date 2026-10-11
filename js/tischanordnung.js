import { supabase } from "./supabase-client.js";
import { requireAuth } from "./auth.js";
import { initNavigation } from "./navigation.js";
import { rotatedBounds, clampToRoom, rotateFurniture, isValidRotation } from "./layout-geometry.mjs";

const TYPES = [
  {id:"small",name:"69,5 × 70 cm",w:69.5,h:70,max:4},
  {id:"medium",name:"89,5 × 140 cm",w:89.5,h:140,max:1},
  {id:"compact",name:"80 × 119 cm",w:80,h:119,max:1},
  {id:"long",name:"70 × 160 cm",w:70,h:160,max:10}
];
const W=940,H=1050,SVG_NS="http://www.w3.org/2000/svg";
const $=s=>document.querySelector(s);
let items=[],selected=null,userId=null,history=[],future=[],drag=null,saveTimer=null;
const uid=()=>crypto.randomUUID();
const kind=item=>TYPES.find(t=>t.id===item.type)||{name:"Stuhl",w:45,h:45};
const dimensions=item=>{const t=kind(item);return rotatedBounds(t.w,t.h,item.rotation);};
const bound=item=>{const t=kind(item);clampToRoom(item,t.w,t.h);};
const announce=(s)=>{$("#layout-message").textContent=s;};
const snapshot=()=>JSON.stringify(items);
function remember(){history.push(snapshot());if(history.length>80)history.shift();future=[];}
function restore(data){try{const parsed=JSON.parse(data);if(!Array.isArray(parsed))throw Error();const used={};items=parsed.filter(o=>{if(!o||!Number.isFinite(o.x)||!Number.isFinite(o.y)||!isValidRotation(o.rotation))return false;if(o.type==="chair")return true;const t=TYPES.find(t=>t.id===o.type);if(!t||((used[o.type]||0)>=t.max))return false;used[o.type]=(used[o.type]||0)+1;return true;}).map(o=>{const n={id:String(o.id),type:o.type,x:o.x,y:o.y,rotation:o.rotation,label:String(o.label||"").slice(0,80)};bound(n);return n;});selected=null;render();}catch{announce("Der gespeicherte Plan konnte nicht gelesen werden.");}}
const snap=n=>$("#snap-grid").checked?Math.round(n/10)*10:Math.round(n);
function add(type){const t=TYPES.find(t=>t.id===type);if(t&&items.filter(i=>i.type===type).length>=t.max)return;remember();const item={id:uid(),type,x:60+items.length*20,y:80+items.length*20,rotation:0,label:t?"Tisch "+(items.filter(i=>i.type!=="chair").length+1):"Stuhl"};bound(item);items.push(item);selected=item.id;render();scheduleSave();}
function setSelectedProperty(prop,value){const item=items.find(i=>i.id===selected);if(!item)return;remember();item[prop]=value;bound(item);render();scheduleSave();}
function scheduleSave(){localStorage.setItem("hochzeit-room-layout",snapshot());clearTimeout(saveTimer);saveTimer=setTimeout(()=>save(false),900);}
async function save(show=true){localStorage.setItem("hochzeit-room-layout",snapshot());if(!userId){if(show)announce("Lokal gespeichert; keine Datenbank-Anmeldung.");return;}try{const {error}=await supabase.from("room_layouts").upsert({user_id:userId,name:"Hauptplan",items},{onConflict:"user_id,name"});if(error)throw error;if(show)announce("Tischplan in Supabase gespeichert.");}catch(e){announce("Lokal gespeichert. Supabase-Speicherung fehlgeschlagen: "+e.message);}}
function render(){const layer=$("#furniture-layer");layer.replaceChildren();for(const item of items){const d=dimensions(item);const group=document.createElementNS(SVG_NS,"g");group.setAttribute("class","furniture"+(item.id===selected?" selected":""));group.setAttribute("transform",`translate(${item.x} ${item.y})`);group.dataset.id=item.id;const furnitureBody=document.createElementNS(SVG_NS,"g");furnitureBody.setAttribute("transform",`translate(${d.w/2} ${d.h/2}) rotate(${item.rotation})`);group.append(furnitureBody);const rect=document.createElementNS(SVG_NS,"rect");rect.setAttribute("class","furniture-shape");const original=kind(item);rect.setAttribute("x",String(-original.w/2));rect.setAttribute("y",String(-original.h/2));rect.setAttribute("width",String(original.w));rect.setAttribute("height",String(original.h));rect.setAttribute("rx",item.type==="chair"?"8":"4");rect.setAttribute("fill",item.type==="chair"?"#b7c8ba":"#dbc19b");rect.setAttribute("stroke","#826e55");rect.setAttribute("stroke-width","2");furnitureBody.append(rect);const txt=document.createElementNS(SVG_NS,"text");txt.setAttribute("class","furniture-label");txt.setAttribute("x",String(d.w/2));txt.setAttribute("y",String(d.h/2));txt.textContent=item.label;group.append(txt);group.addEventListener("pointerdown",event=>{event.preventDefault();const pt=point(event);selected=item.id;drag={id:item.id,startX:pt.x,startY:pt.y,originalX:item.x,originalY:item.y,moved:false};group.setPointerCapture(event.pointerId);renderSelection();});group.addEventListener("pointermove",event=>{if(!drag||drag.id!==item.id)return;const pt=point(event);if(!drag.moved){remember();drag.moved=true;}item.x=snap(drag.originalX+pt.x-drag.startX);item.y=snap(drag.originalY+pt.y-drag.startY);bound(item);group.setAttribute("transform",`translate(${item.x} ${item.y})`);renderSelectionFields();});group.addEventListener("pointerup",()=>{if(drag?.moved)scheduleSave();drag=null;render();});group.addEventListener("pointercancel",()=>{drag=null;render();});layer.append(group);}renderInventory();renderSelection();}
function point(e){const svg=$("#room-svg"),p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
function renderInventory(){const inv=$("#inventory");inv.replaceChildren();for(const type of TYPES){const row=document.createElement("div");row.className="layout-inventory";const label=document.createElement("span");const used=items.filter(i=>i.type===type.id).length;label.textContent=`${type.name} · ${used}/${type.max}`;const button=document.createElement("button");button.className="button button-secondary";button.type="button";button.textContent="Hinzufügen";button.disabled=used>=type.max;button.addEventListener("click",()=>add(type.id));row.append(label,button);inv.append(row);}}
function renderSelectionFields(){const item=items.find(i=>i.id===selected);if(!item)return;$("#item-x").value=Math.round(item.x);$("#item-y").value=Math.round(item.y);const t=kind(item);$("#item-size").textContent=`Maße: ${t.w} × ${t.h} cm · Drehung ${item.rotation}°`;}
function renderSelection(){const item=items.find(i=>i.id===selected);$("#selection-empty").hidden=!!item;$("#selection-controls").hidden=!item;if(item){$("#item-label").value=item.label;renderSelectionFields();}for(const node of document.querySelectorAll(".furniture"))node.classList.toggle("selected",node.dataset.id===selected);}
async function boot(){initNavigation();const session=await requireAuth();if(!session)return;userId=session.user.id;const cached=localStorage.getItem("hochzeit-room-layout");if(cached)restore(cached);else render();const {data,error}=await supabase.from("room_layouts").select("items").eq("user_id",userId).eq("name","Hauptplan").maybeSingle();if(data?.items)restore(JSON.stringify(data.items));else if(error)announce("Supabase-Tabelle noch nicht eingerichtet. Bitte supabase/tischanordnung.sql ausführen.");}
$("#add-chair").addEventListener("click",()=>add("chair"));
$("#item-label").addEventListener("change",e=>setSelectedProperty("label",e.target.value.slice(0,80)));
for(const prop of ["x","y"])$("#item-"+prop).addEventListener("change",e=>setSelectedProperty(prop,Number(e.target.value)));
for(const [buttonId,degrees] of [["rotate-left",-45],["rotate-right",45]])$("#"+buttonId).addEventListener("click",()=>{const item=items.find(i=>i.id===selected);if(!item)return;remember();const t=kind(item);rotateFurniture(item,t.w,t.h,degrees);render();scheduleSave();});
$("#delete-item").addEventListener("click",()=>{if(!selected)return;remember();items=items.filter(i=>i.id!==selected);selected=null;render();scheduleSave();});
$("#undo").addEventListener("click",()=>{if(!history.length)return;future.push(snapshot());restore(history.pop());scheduleSave();});
$("#redo").addEventListener("click",()=>{if(!future.length)return;history.push(snapshot());restore(future.pop());scheduleSave();});
$("#save-layout").addEventListener("click",()=>save(true));
$("#clear-layout").addEventListener("click",()=>{if(!confirm("Den gesamten Tischplan wirklich leeren?"))return;remember();items=[];selected=null;render();scheduleSave();});
$("#export-layout").addEventListener("click",()=>{const svg=$("#room-svg").cloneNode(true);svg.querySelectorAll(".selected").forEach(n=>n.classList.remove("selected"));const xml=new XMLSerializer().serializeToString(svg);const link=document.createElement("a");const url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml"}));link.href=url;link.download="tischanordnung.svg";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
boot().catch(e=>announce("Laden fehlgeschlagen: "+e.message));