import { supabase } from './supabase-client.js';
import { $, setBusy, setMessage } from './utils.js';

export async function getSession(){ const { data, error } = await supabase.auth.getSession(); if(error) throw error; return data.session; }
export async function requireAuth(){ try{ const session=await getSession(); if(!session){ window.location.href='login.html'; return null; } return session; }catch{ window.location.href='login.html'; return null; } }
export async function redirectIfAuthenticated(){ try{ const session=await getSession(); if(session) window.location.href='index.html'; }catch{} }
export async function signOut(){ await supabase.auth.signOut(); window.location.href='login.html'; }
export function initLogin(){ const form=$('#login-form'); if(!form) return; redirectIfAuthenticated(); form.addEventListener('submit', async e=>{ e.preventDefault(); const msg=$('#login-message'); const btn=$('#login-submit'); setMessage(msg,''); setBusy(btn,true,'Anmeldung läuft …'); try{ const email=$('#email').value.trim(); const password=$('#password').value; const { error }=await supabase.auth.signInWithPassword({ email, password }); if(error) throw error; window.location.href='index.html'; }catch(error){ setMessage(msg,'Anmeldung fehlgeschlagen. Bitte prüfe E-Mail-Adresse und Passwort.','error'); }finally{ setBusy(btn,false); } }); }
