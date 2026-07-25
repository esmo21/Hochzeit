import { supabase } from './supabase-client.js';
import { requireAuth } from './auth.js';
import { initNavigation } from './navigation.js';
import { $, clearChildren, confirmDialog, parseOptionalPrice, renderEmpty, setBusy, setMessage } from './utils.js';

let session;
let costs = [];
let editing = null;

const currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const formatCurrency = value => currency.format(Number(value) || 0);

async function load(){
  const { data, error } = await supabase.from('budget_costs').select('*').order('name');
  if(error) throw error;
  costs = data || [];
  render();
}

function renderTotals(){
  const sum = field => costs.reduce((total, cost) => total + (Number(cost[field]) || 0), 0);
  $('#total-min').textContent = formatCurrency(sum('estimated_min'));
  $('#total-max').textContent = formatCurrency(sum('estimated_max'));
  $('#total-actual').textContent = formatCurrency(sum('actual_cost'));
  $('#total-paid').textContent = formatCurrency(costs.filter(cost => cost.is_paid).reduce((total, cost) => total + (Number(cost.actual_cost) || 0), 0));
}

function render(){
  const body = $('#budget-body');
  const empty = $('#budget-empty');
  clearChildren(body);
  clearChildren(empty);
  renderTotals();
  if(!costs.length){
    renderEmpty(empty, 'Noch keine Kosten eingetragen.');
    return;
  }
  costs.forEach(cost => {
    const tr = document.createElement('tr');
    const values = [cost.name, formatCurrency(cost.estimated_min), formatCurrency(cost.estimated_max), cost.actual_cost == null ? 'Noch offen' : formatCurrency(cost.actual_cost), cost.is_paid ? 'Ja' : 'Nein'];
    values.forEach((value, index) => {
      const td = document.createElement('td');
      td.textContent = value;
      if(index === 4) td.className = cost.is_paid ? 'budget-paid' : '';
      tr.append(td);
    });
    const actionCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'button button-secondary';
    edit.textContent = 'Bearbeiten';
    edit.addEventListener('click', () => startEdit(cost));
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'button button-danger';
    removeButton.textContent = 'Löschen';
    removeButton.addEventListener('click', () => remove(cost.id));
    actions.append(edit, removeButton);
    actionCell.append(actions);
    tr.append(actionCell);
    body.append(tr);
  });
}

function reset(){
  editing = null;
  $('#budget-form').reset();
  $('#budget-form-heading').textContent = 'Kosten hinzufügen';
  $('#budget-submit').textContent = 'Kosten speichern';
}

function startEdit(cost){
  editing = cost.id;
  $('#budget-name').value = cost.name;
  $('#budget-min').value = cost.estimated_min;
  $('#budget-max').value = cost.estimated_max;
  $('#budget-actual').value = cost.actual_cost ?? '';
  $('#budget-paid').checked = cost.is_paid;
  $('#budget-form-heading').textContent = 'Kosten bearbeiten';
  $('#budget-submit').textContent = 'Änderungen speichern';
  $('#budget-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function remove(id){
  if(!await confirmDialog('Diesen Kosteneintrag wirklich löschen?')) return;
  const { error } = await supabase.from('budget_costs').delete().eq('id', id);
  if(error) return setMessage($('#budget-message'), 'Die Kosten konnten nicht gelöscht werden.', 'error');
  costs = costs.filter(cost => cost.id !== id);
  if(editing === id) reset();
  render();
  setMessage($('#budget-message'), 'Kosten wurden gelöscht.');
}

async function init(){
  session = await requireAuth();
  if(!session) return;
  initNavigation();
  $('#budget-cancel').addEventListener('click', reset);
  $('#budget-form').addEventListener('submit', async event => {
    event.preventDefault();
    const name = $('#budget-name').value.trim();
    const estimated_min = parseOptionalPrice($('#budget-min').value);
    const estimated_max = parseOptionalPrice($('#budget-max').value);
    const actual_cost = parseOptionalPrice($('#budget-actual').value);
    if(!name || estimated_min == null || estimated_max == null) return setMessage($('#budget-message'), 'Bitte gib einen Namen sowie gültige minimale und maximale Schätzkosten an.', 'error');
    if(estimated_max < estimated_min) return setMessage($('#budget-message'), 'Die maximalen Schätzkosten dürfen nicht kleiner als die minimalen sein.', 'error');
    const payload = { name, estimated_min, estimated_max, actual_cost, is_paid: $('#budget-paid').checked, user_id: session.user.id };
    const button = $('#budget-submit');
    setBusy(button, true, 'Speichern …');
    try{
      const query = editing ? supabase.from('budget_costs').update(payload).eq('id', editing).select().single() : supabase.from('budget_costs').insert(payload).select().single();
      const { data, error } = await query;
      if(error) throw error;
      costs = editing ? costs.map(cost => cost.id === editing ? data : cost) : [...costs, data];
      costs.sort((a, b) => a.name.localeCompare(b.name, 'de'));
      reset();
      render();
      setMessage($('#budget-message'), 'Kosten wurden gespeichert.');
    }catch{
      setMessage($('#budget-message'), 'Die Kosten konnten nicht gespeichert werden. Prüfe, ob das Datenbankschema aktualisiert wurde.', 'error');
    }finally{
      setBusy(button, false);
    }
  });
  try{ await load(); }catch{ setMessage($('#budget-message'), 'Die Budgetdaten konnten nicht geladen werden. Prüfe, ob das Datenbankschema aktualisiert wurde.', 'error'); }
}

init();
