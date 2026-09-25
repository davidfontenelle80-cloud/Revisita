const STORAGE_KEY='revisita.state.v1';
import { validTimeZone } from './visit-time.js?v=1.5.2';
const SNAPSHOT_KEY='revisita.preimport.v1';
const TIME_RE=/^\d{2}:\d{2}$/;
const DEFAULT_SETTINGS={theme:'dark',navApp:'ask',calendarOnSave:false,calendarAsked:false,calendarMode:'auto',reminderMinutes:5};
export function createDefaultState(){return{version:3,visits:[],deleted:{},settings:{...DEFAULT_SETTINGS},map:{lat:18.7357,lng:-70.1627,zoom:8},lastSavedAt:null};}
export function loadState(){const f=createDefaultState();try{const r=localStorage.getItem(STORAGE_KEY);return r?normalizeState(JSON.parse(r)):f;}catch(e){console.warn('No se pudo leer el estado local.',e);return f;}}
export function normalizeSettings(value){
 const s={...DEFAULT_SETTINGS,...(value&&typeof value==='object'?value:{})};
 if(!['ask','google','waze','apple'].includes(s.navApp))s.navApp='ask';
 if(!['auto','ics','google'].includes(s.calendarMode))s.calendarMode='auto';
 s.calendarOnSave=s.calendarOnSave===true;
 s.calendarAsked=s.calendarAsked===true;
 const m=Number(s.reminderMinutes);s.reminderMinutes=Number.isFinite(m)&&m>=0&&m<=1440?Math.round(m):5;
 s.theme=s.theme==='light'?'light':'dark';
 return s;
}
function normalizeDeleted(value){const out={};if(value&&typeof value==='object')for(const[k,v]of Object.entries(value))if(typeof v==='string'&&v)out[k]=v;return out;}
export function normalizeState(value){const b=createDefaultState();if(!value||typeof value!=='object')return b;return{version:3,visits:Array.isArray(value.visits)?value.visits.map(normalizeVisit).filter(Boolean):[],deleted:normalizeDeleted(value.deleted),settings:normalizeSettings(value.settings),map:{...b.map,...(value.map||{})},lastSavedAt:value.lastSavedAt||null};}
function normalizeHistoryEntry(h){
 if(!h||typeof h!=='object'||!h.completedAt)return null;
 return{completedAt:String(h.completedAt),dueDate:typeof h.dueDate==='string'?h.dueDate:'',dueTime:TIME_RE.test(h.dueTime||'')?h.dueTime:'',note:String(h.note||''),leftWith:String(h.leftWith||''),ended:h.ended===true};
}
export function normalizeVisit(v){
 if(!v||typeof v!=='object')return null;const lat=Number(v.lat),lng=Number(v.lng);if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
 const status=v.status==='completed'?'completed':'active';
 return{id:String(v.id||crypto.randomUUID()),name:String(v.name||'Revisita'),reference:String(v.reference||''),address:String(v.address||''),notes:String(v.notes||''),phone:String(v.phone||''),leftWith:String(v.leftWith||''),nextTopic:String(v.nextTopic||''),calendarSlot:typeof v.calendarSlot==='string'?v.calendarSlot:'',calendarSeq:Number.isFinite(Number(v.calendarSeq))?Math.max(0,Math.round(Number(v.calendarSeq))):0,dueTimeZone:validTimeZone(v.dueTimeZone)?v.dueTimeZone:'',dueDate:typeof v.dueDate==='string'?v.dueDate:'',dueTime:TIME_RE.test(v.dueTime||'')?v.dueTime:'',status,completedAt:status==='completed'?(v.completedAt||null):null,history:Array.isArray(v.history)?v.history.map(normalizeHistoryEntry).filter(Boolean):[],lat,lng,createdAt:v.createdAt||new Date().toISOString(),updatedAt:v.updatedAt||new Date().toISOString()};
}
export function saveState(state){state.version=3;state.lastSavedAt=new Date().toISOString();localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return state.lastSavedAt;}
export function exportPayload(state){return{app:'Revisita',schemaVersion:3,exportedAt:new Date().toISOString(),visits:state.visits,deleted:state.deleted||{},settings:state.settings};}
export function validateImportPayload(payload){if(!payload||typeof payload!=='object')throw new Error('El archivo no contiene un objeto JSON válido.');if(payload.app!=='Revisita')throw new Error('Este archivo no parece ser una copia de Revisita.');if(!Array.isArray(payload.visits))throw new Error('La copia no contiene una lista de revisitas válida.');const visits=payload.visits.map(normalizeVisit).filter(Boolean);if(visits.length!==payload.visits.length)throw new Error('Una o más revisitas tienen coordenadas inválidas.');return{...payload,visits};}
export function previewImport(state,payload){const ids=new Set(state.visits.map(v=>v.id));const conflicts=payload.visits.filter(v=>ids.has(v.id)).length;return{imported:payload.visits.length,conflicts,newRecords:payload.visits.length-conflicts,localBefore:state.visits.length};}
export function applyImport(state,payload){localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(state));const merged=new Map(state.visits.map(v=>[v.id,v]));payload.visits.forEach(v=>merged.set(v.id,normalizeVisit(v)));state.visits=[...merged.values()];if(state.deleted)payload.visits.forEach(v=>delete state.deleted[v.id]);if(payload.settings?.theme)state.settings.theme=payload.settings.theme==='light'?'light':'dark';saveState(state);return state;}
export function hasRecoverySnapshot(){return Boolean(localStorage.getItem(SNAPSHOT_KEY));}
export function restoreRecoverySnapshot(){const raw=localStorage.getItem(SNAPSHOT_KEY);if(!raw)throw new Error('No hay una copia anterior disponible.');const restored=normalizeState(JSON.parse(raw));saveState(restored);return restored;}
