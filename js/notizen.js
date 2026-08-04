import { supabase } from './supabase-client.js';
import { requireAuth } from './auth.js';
import { initNavigation } from './navigation.js';
import { $, clearChildren, confirmDialog, normalizeOptional, renderEmpty, setBusy, setMessage } from './utils.js';

let session, notes = [], editing = null;

const form = () => $('#note-form');

function formatDateTime(value) {
  if (!value) return 'Unbekannt';
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

async function load() {
  const { data, error } = await supabase.from('notes').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  notes = data || [];
  render();
}

function filteredNotes() {
  const search = ($('#note-search')?.value || '').trim().toLowerCase();
  const sort = $('#note-sort')?.value || 'updated_desc';
  const arr = notes.filter(note => !search || `${note.title} ${note.content || ''}`.toLowerCase().includes(search));
  return arr.sort((a, b) => {
    if (sort === 'title_asc') return a.title.localeCompare(b.title, 'de-DE');
    if (sort === 'created_desc') return (b.created_at || '').localeCompare(a.created_at || '');
    return (b.updated_at || '').localeCompare(a.updated_at || '');
  });
}

function render() {
  const list = $('#note-list');
  clearChildren(list);
  const arr = filteredNotes();
  if (!arr.length) return renderEmpty(list, 'Keine Notizen gefunden. Lege die erste Notiz für eure Planung an.');
  arr.forEach(note => {
    const item = document.createElement('article');
    item.className = 'item';
    const head = document.createElement('div');
    head.className = 'item-header';
    const title = document.createElement('h2');
    title.className = 'item-title';
    title.textContent = note.title;
    const meta = document.createElement('span');
    meta.className = 'badge';
    meta.textContent = `Bearbeitet: ${formatDateTime(note.updated_at)}`;
    head.append(title, meta);
    const content = document.createElement('p');
    content.className = 'muted';
    content.textContent = note.content || 'Keine Notiz hinterlegt.';
    const actions = document.createElement('div');
    actions.className = 'actions';
    const edit = document.createElement('button');
    edit.className = 'button button-secondary';
    edit.textContent = 'Bearbeiten';
    edit.addEventListener('click', () => startEdit(note));
    const del = document.createElement('button');
    del.className = 'button button-danger';
    del.textContent = 'Löschen';
    del.addEventListener('click', () => remove(note.id));
    actions.append(edit, del);
    item.append(head, content, actions);
    list.append(item);
  });
}

function reset() {
  editing = null;
  form().reset();
  $('#note-id').value = '';
  $('#note-submit').textContent = 'Notiz speichern';
  form().classList.remove('edit-mode');
}

function startEdit(note) {
  editing = note.id;
  $('#note-id').value = note.id;
  $('#note-title').value = note.title;
  $('#note-content').value = note.content || '';
  $('#note-submit').textContent = 'Änderungen speichern';
  form().classList.add('edit-mode');
  form().scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function remove(id) {
  if (!await confirmDialog('Diese Notiz wirklich löschen?')) return;
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) return setMessage($('#note-message'), 'Die Notiz konnte nicht gelöscht werden.', 'error');
  notes = notes.filter(note => note.id !== id);
  setMessage($('#note-message'), 'Notiz wurde gelöscht.');
  render();
}

async function init() {
  session = await requireAuth();
  if (!session) return;
  initNavigation();
  $('#note-search').addEventListener('input', render);
  $('#note-sort').addEventListener('change', render);
  $('#note-cancel').addEventListener('click', reset);
  form().addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#note-submit');
    const title = $('#note-title').value.trim();
    if (!title) return setMessage($('#note-message'), 'Bitte gib einen Titel ein.', 'error');
    setBusy(btn, true, 'Speichern …');
    try {
      const payload = {
        title,
        content: normalizeOptional($('#note-content').value),
        user_id: session.user.id
      };
      const q = editing ? supabase.from('notes').update(payload).eq('id', editing).select().single() : supabase.from('notes').insert(payload).select().single();
      const { data, error } = await q;
      if (error) throw error;
      if (editing) notes = notes.map(note => note.id === editing ? data : note);
      else notes.unshift(data);
      reset();
      setMessage($('#note-message'), 'Notiz wurde gespeichert.');
      render();
    } catch {
      setMessage($('#note-message'), 'Die Notiz konnte nicht gespeichert werden.', 'error');
    } finally {
      setBusy(btn, false);
    }
  });
  try {
    await load();
  } catch {
    setMessage($('#note-message'), 'Notizen konnten nicht geladen werden.', 'error');
  }
}

init();
