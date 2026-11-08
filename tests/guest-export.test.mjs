import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGuestCsv } from '../js/guest-export.mjs';

test('one row per person, including children, with numbering restarted per main guest', () => {
  const groups = [
    { family_name: 'B', main_guest_name: 'Tanja', additional_adults: 1, children_count: 2 },
    { family_name: 'A', main_guest_name: 'Matthias', additional_adults: 1, children_count: 0, table_id: 't1' },
    { family_name: 'C', main_guest_name: 'Solo', additional_adults: 0, children_count: 0 },
  ];
  const csv = buildGuestCsv(groups, [{ id: 't1', name: 'Tisch 1' }]);
  const lines = csv.slice(1).trimEnd().split('\r\n');
  assert.deepEqual(lines, [
    '"Name";"Familie/Gruppe";"Personentyp";"Tisch"',
    '"Matthias";"A";"Erwachsener";"Tisch 1"',
    '"Matthias + 1";"A";"Erwachsener";"Tisch 1"',
    '"Tanja";"B";"Erwachsener";"Noch kein Tisch"',
    '"Tanja + 1";"B";"Erwachsener";"Noch kein Tisch"',
    '"Tanja + 2";"B";"Kind";"Noch kein Tisch"',
    '"Tanja + 3";"B";"Kind";"Noch kein Tisch"',
    '"Solo";"C";"Erwachsener";"Noch kein Tisch"',
  ]);
  assert.equal(groups[0].main_guest_name, 'Tanja');
  assert.ok(csv.startsWith('\uFEFF'));
});

test('CSV preserves umlauts, separators, quotes and line breaks', () => {
  const csv = buildGuestCsv([{ family_name: 'Müller; "Familie"\nGruppe', main_guest_name: 'Jörg', additional_adults: 0, children_count: 1 }]);
  assert.ok(csv.includes('"Jörg";"Müller; ""Familie""\nGruppe";"Erwachsener"'));
  assert.ok(csv.includes('"Jörg + 1";"Müller; ""Familie""\nGruppe";"Kind"'));
});

test('spreadsheet formulas are exported as text', () => {
  const csv = buildGuestCsv([{ family_name: '+Gruppe', main_guest_name: '=1+1', table_id: 't1' }], [{ id: 't1', name: '  @Tisch' }]);
  assert.ok(csv.includes('"\'=1+1";"\'+Gruppe";"Erwachsener";"\'  @Tisch"'));
});

test('empty guest list produces only the column headings', () => {
  assert.equal(buildGuestCsv([]), '\uFEFF"Name";"Familie/Gruppe";"Personentyp";"Tisch"\r\n');
});
