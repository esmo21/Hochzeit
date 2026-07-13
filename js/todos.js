import { supabase } from './supabase-client.js';
import { requireAuth } from './auth.js';
import { initNavigation } from './navigation.js';
import { $, clearChildren, confirmDialog, formatDate, isOverdue, normalizeOptional, renderEmpty, setBusy, setMessage } from './utils.js';

let session, todos = [], editing = null;
const priorityLabels = {
  very_low: 'Sehr unwichtig',
  low: 'Unwichtig',
  medium: 'Mittel',
  high: 'Hoch',
  very_high: 'Sehr hoch'
};

const form = () => $('#todo-form');

async function load() {
  const { data, error } = await supabase.from('todos').select('*').order('is_completed').order('due_date', { ascending: true, nullsFirst: false });
  if (error) throw error;
  todos = data || [];
  render();
}

function sorted() {
  const f = $('#status-filter')?.value || 'all', s = $('#sort-order')?.value || 'default';
  let arr = todos.filter(t => f === 'all' || (f === 'open' ? !t.is_completed : t.is_completed));
  return arr.sort((a, b) => {
    if (s === 'default' && a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return s === 'desc' ? b.due_date.localeCompare(a.due_date) : a.due_date.localeCompare(b.due_date);
  });
}

function createPriorityBadge(priority) {
  const badge = document.createElement('span');
  badge.className = `badge ${priority || 'medium'}`;
  badge.textContent = `Priorität: ${priorityLabels[priority] || priorityLabels.medium}`;
  return badge;
}

function render() {
  const list = $('#todo-list');
  clearChildren(list);
  const arr = sorted();
  if (!arr.length) return renderEmpty(list, 'Keine Aufgaben gefunden. Lege die erste Aufgabe für eure Planung an.');
  arr.forEach(t => {
    const item = document.createElement('article');
    item.className = `item ${t.is_completed ? 'done' : ''} ${isOverdue(t.due_date, t.is_completed) ? 'overdue' : ''}`;
    const head = document.createElement('div');
    head.className = 'item-header';
    const left = document.createElement('label');
    left.className = 'actions';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = t.is_completed;
    cb.addEventListener('change', () => toggle(t, cb.checked));
    const title = document.createElement('span');
    title.className = 'item-title';
    title.textContent = t.title;
    left.append(cb, title);
    const meta = document.createElement('div');
    meta.className = 'actions';
    const priority = createPriorityBadge(t.priority);
    const date = document.createElement('span');
    date.className = 'badge';
    date.textContent = isOverdue(t.due_date, t.is_completed) ? `Überfällig: ${formatDate(t.due_date)}` : formatDate(t.due_date);
    meta.append(priority, date);
    head.append(left, meta);
    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = t.note || 'Keine Notiz hinterlegt.';
    const actions = document.createElement('div');
    actions.className = 'actions';
    const edit = document.createElement('button');
    edit.className = 'button button-secondary';
    edit.textContent = 'Bearbeiten';
    edit.addEventListener('click', () => startEdit(t));
    const del = document.createElement('button');
    del.className = 'button button-danger';
    del.textContent = 'Löschen';
    del.addEventListener('click', () => remove(t.id));
    actions.append(edit, del);
    item.append(head, note, actions);
    list.append(item);
  });
}

function reset() {
  editing = null;
  form().reset();
  $('#todo-id').value = '';
  $('#todo-priority').value = 'medium';
  $('#todo-submit').textContent = 'Aufgabe speichern';
  form().classList.remove('edit-mode');
}

function startEdit(t) {
  editing = t.id;
  $('#todo-id').value = t.id;
  $('#todo-title').value = t.title;
  $('#todo-note').value = t.note || '';
  $('#todo-due-date').value = t.due_date || '';
  $('#todo-priority').value = t.priority || 'medium';
  $('#todo-submit').textContent = 'Änderungen speichern';
  form().classList.add('edit-mode');
  form().scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function toggle(t, done) {
  try {
    const { error } = await supabase.from('todos').update({ is_completed: done }).eq('id', t.id);
    if (error) throw error;
    t.is_completed = done;
    setMessage($('#todo-message'), 'Status wurde gespeichert.');
    render();
  } catch {
    setMessage($('#todo-message'), 'Der Status konnte nicht gespeichert werden.', 'error');
    render();
  }
}

async function remove(id) {
  if (!await confirmDialog('Diese Aufgabe wirklich löschen?')) return;
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) return setMessage($('#todo-message'), 'Die Aufgabe konnte nicht gelöscht werden.', 'error');
  todos = todos.filter(t => t.id !== id);
  setMessage($('#todo-message'), 'Aufgabe wurde gelöscht.');
  render();
}

async function init() {
  session = await requireAuth();
  if (!session) return;
  initNavigation();
  $('#status-filter').addEventListener('change', render);
  $('#sort-order').addEventListener('change', render);
  $('#todo-cancel').addEventListener('click', reset);
  form().addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#todo-submit');
    const title = $('#todo-title').value.trim();
    if (!title) return setMessage($('#todo-message'), 'Bitte gib einen Titel ein.', 'error');
    setBusy(btn, true, 'Speichern …');
    try {
      const payload = {
        title,
        note: normalizeOptional($('#todo-note').value),
        due_date: normalizeOptional($('#todo-due-date').value),
        priority: $('#todo-priority').value || 'medium',
        user_id: session.user.id
      };
      const q = editing ? supabase.from('todos').update(payload).eq('id', editing).select().single() : supabase.from('todos').insert(payload).select().single();
      const { data, error } = await q;
      if (error) throw error;
      if (editing) todos = todos.map(t => t.id === editing ? data : t);
      else todos.push(data);
      reset();
      setMessage($('#todo-message'), 'Aufgabe wurde gespeichert.');
      render();
    } catch {
      setMessage($('#todo-message'), 'Die Aufgabe konnte nicht gespeichert werden.', 'error');
    } finally {
      setBusy(btn, false);
    }
  });
  try {
    await load();
  } catch {
    setMessage($('#todo-message'), 'Aufgaben konnten nicht geladen werden.', 'error');
  }
}

init();
