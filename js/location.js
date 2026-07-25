import { supabase } from './supabase-client.js';
import { requireAuth } from './auth.js';
import { initNavigation } from './navigation.js';
import { $, clearChildren, confirmDialog, normalizeOptional, renderEmpty, setBusy, setMessage } from './utils.js';

let session;
let locations = [];
let editingLocationId = null;
const money = value => Number(value || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

function createCostRow(cost = {}) {
  const row = document.createElement('div');
  row.className = 'cost-row';
  row.innerHTML = '<div class="form-row"><label>Kostenname<input class="input" data-cost-name maxlength="180" placeholder="z. B. Catering"></label></div><div class="form-row"><label>Kosten von (€)<input class="input" data-cost-from type="number" min="0" step="0.01" inputmode="decimal"></label></div><div class="form-row"><label>Kosten bis (€)<input class="input" data-cost-to type="number" min="0" step="0.01" inputmode="decimal"></label></div><button class="button button-danger cost-remove" type="button" aria-label="Kostenposition entfernen">Entfernen</button>';
  if (cost.id) row.dataset.costId = cost.id;
  $('[data-cost-name]', row).value = cost.name || '';
  $('[data-cost-from]', row).value = cost.cost_from ?? '';
  $('[data-cost-to]', row).value = cost.cost_to ?? '';
  return row;
}
function addCostRow() { $('#cost-rows').append(createCostRow()); }
function readCosts() {
  return [...document.querySelectorAll('.cost-row')].map(row => ({ id: row.dataset.costId || null, name: $('[data-cost-name]', row).value.trim(), cost_from: $('[data-cost-from]', row).value === '' ? null : Number($('[data-cost-from]', row).value), cost_to: $('[data-cost-to]', row).value === '' ? null : Number($('[data-cost-to]', row).value) })).filter(cost => cost.name || cost.cost_from !== null || cost.cost_to !== null);
}
function validateCosts(costs) {
  if (costs.some(cost => !cost.name)) return 'Bitte gib für jede Kostenposition einen Namen ein.';
  if (costs.some(cost => cost.cost_from === null || cost.cost_to === null)) return 'Bitte gib für jede Kostenposition „Kosten von“ und „Kosten bis“ ein.';
  if (costs.some(cost => cost.cost_from < 0 || cost.cost_to < 0)) return 'Kosten dürfen nicht negativ sein.';
  if (costs.some(cost => cost.cost_from > cost.cost_to)) return '„Kosten von“ darf nicht größer als „Kosten bis“ sein.';
  return null;
}
function resetForm() {
  editingLocationId = null;
  $('#location-form').reset();
  $('#location-form').classList.remove('edit-mode');
  $('#location-form-heading').textContent = 'Location hinzufügen';
  $('#location-submit').textContent = 'Location speichern';
  $('#location-submit').dataset.defaultText = 'Location speichern';
  $('#location-reset').textContent = 'Zurücksetzen';
  clearChildren($('#cost-rows'));
  addCostRow();
}
function startEdit(location) {
  editingLocationId = location.id;
  $('#location-name').value = location.name;
  $('#location-info').value = location.general_information || '';
  clearChildren($('#cost-rows'));
  const costs = (location.location_costs || []).sort((a, b) => a.created_at.localeCompare(b.created_at));
  (costs.length ? costs : [{}]).forEach(cost => $('#cost-rows').append(createCostRow(cost)));
  $('#location-form').classList.add('edit-mode');
  $('#location-form-heading').textContent = 'Location bearbeiten';
  $('#location-submit').textContent = 'Änderungen speichern';
  $('#location-submit').dataset.defaultText = 'Änderungen speichern';
  $('#location-reset').textContent = 'Bearbeiten abbrechen';
  $('#location-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#location-name').focus({ preventScroll: true });
}
async function load() {
  const { data, error } = await supabase.from('wedding_locations').select('*, location_costs(*)').order('created_at', { ascending: false });
  if (error) throw error;
  locations = data || [];
  render();
}
function render() {
  const list = $('#location-list'); clearChildren(list);
  if (!locations.length) return renderEmpty(list, 'Noch keine Location hinzugefügt.');
  locations.forEach(location => {
    const costs = (location.location_costs || []).sort((a, b) => a.created_at.localeCompare(b.created_at));
    const totalFrom = costs.reduce((sum, cost) => sum + Number(cost.cost_from), 0), totalTo = costs.reduce((sum, cost) => sum + Number(cost.cost_to), 0);
    const card = document.createElement('article'); card.className = 'card location-card';
    const heading = document.createElement('div'); heading.className = 'location-heading';
    const title = document.createElement('h3'); title.textContent = location.name;
    const total = document.createElement('div'); total.className = 'location-total'; total.innerHTML = `<span>Geschätzte Gesamtkosten</span><strong>${money(totalFrom)} – ${money(totalTo)}</strong>`;
    heading.append(title, total);
    const info = document.createElement('p'); info.className = 'location-description'; info.textContent = location.general_information || 'Keine allgemeinen Informationen hinterlegt.';
    const table = document.createElement('div');
    if (costs.length) {
      table.className = 'table-wrap'; table.innerHTML = '<table><thead><tr><th>Kostenname</th><th>Kosten von</th><th>Kosten bis</th></tr></thead><tbody></tbody></table>';
      const body = $('tbody', table);
      costs.forEach(cost => { const row = document.createElement('tr'); [cost.name, money(cost.cost_from), money(cost.cost_to)].forEach(value => { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); }); body.append(row); });
    } else { table.className = 'muted'; table.textContent = 'Keine Kostenpositionen hinterlegt.'; }
    const actions = document.createElement('div'); actions.className = 'actions';
    const edit = document.createElement('button'); edit.className = 'button button-secondary'; edit.type = 'button'; edit.textContent = 'Location und Kosten bearbeiten'; edit.addEventListener('click', () => startEdit(location));
    const remove = document.createElement('button'); remove.className = 'button button-danger'; remove.type = 'button'; remove.textContent = 'Location löschen'; remove.addEventListener('click', () => removeLocation(location.id)); actions.append(edit, remove);
    card.append(heading, info, table, actions); list.append(card);
  });
}
async function removeLocation(id) {
  if (!await confirmDialog('Diese Location einschließlich aller Kosten wirklich löschen?')) return;
  const { error } = await supabase.from('wedding_locations').delete().eq('id', id);
  if (error) return setMessage($('#location-message'), 'Die Location konnte nicht gelöscht werden.', 'error');
  locations = locations.filter(location => location.id !== id); setMessage($('#location-message'), 'Location wurde gelöscht.'); render();
}
async function init() {
  session = await requireAuth(); if (!session) return; initNavigation();
  $('#add-cost').addEventListener('click', addCostRow);
  $('#cost-rows').addEventListener('click', event => { const button = event.target.closest('.cost-remove'); if (!button) return; button.closest('.cost-row').remove(); if (!document.querySelector('.cost-row')) addCostRow(); });
  $('#location-reset').addEventListener('click', resetForm);
  $('#location-form').addEventListener('submit', async event => {
    event.preventDefault(); const name = $('#location-name').value.trim(), costs = readCosts(), validationError = validateCosts(costs);
    if (!name) return setMessage($('#location-message'), 'Bitte gib einen Namen für die Location ein.', 'error');
    if (validationError) return setMessage($('#location-message'), validationError, 'error');
    const button = $('#location-submit'); setBusy(button, true, 'Speichern …');
    try {
      const payload = { user_id: session.user.id, name, general_information: normalizeOptional($('#location-info').value) };
      if (editingLocationId) {
        const locationId = editingLocationId;
        const existingLocation = locations.find(location => location.id === locationId);
        const existingIds = (existingLocation?.location_costs || []).map(cost => cost.id);
        const keptIds = costs.map(cost => cost.id).filter(Boolean);
        const removedIds = existingIds.filter(id => !keptIds.includes(id));
        const { error } = await supabase.from('wedding_locations').update(payload).eq('id', locationId); if (error) throw error;
        const existingCosts = costs.filter(cost => cost.id);
        const newCosts = costs.filter(cost => !cost.id).map(({ id, ...cost }) => ({ ...cost, location_id: locationId }));
        const updateResults = await Promise.all(existingCosts.map(cost => supabase.from('location_costs').update({ name: cost.name, cost_from: cost.cost_from, cost_to: cost.cost_to }).eq('id', cost.id)));
        const updateError = updateResults.find(result => result.error)?.error; if (updateError) throw updateError;
        if (newCosts.length) { const { error: costsError } = await supabase.from('location_costs').insert(newCosts); if (costsError) throw costsError; }
        if (removedIds.length) { const { error: removeError } = await supabase.from('location_costs').delete().in('id', removedIds); if (removeError) throw removeError; }
      } else {
        const { data: location, error } = await supabase.from('wedding_locations').insert(payload).select().single(); if (error) throw error;
        if (costs.length) { const { error: costsError } = await supabase.from('location_costs').insert(costs.map(({ id, ...cost }) => ({ ...cost, location_id: location.id }))); if (costsError) { await supabase.from('wedding_locations').delete().eq('id', location.id); throw costsError; } }
      }
      const message = editingLocationId ? 'Location und Kosten wurden aktualisiert.' : 'Location wurde gespeichert.';
      resetForm(); setMessage($('#location-message'), message); await load();
    } catch { setMessage($('#location-message'), 'Die Location und ihre Kosten konnten nicht gespeichert werden.', 'error'); } finally { setBusy(button, false); }
  });
  try { await load(); } catch { setMessage($('#location-message'), 'Locations konnten nicht geladen werden.', 'error'); }
}
init();
