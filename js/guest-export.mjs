function csvCell(value) {
  let text = String(value ?? '');
  // Keep names and table labels as text when opened in a spreadsheet.
  if (/^\s*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildGuestCsv(groups, tables = []) {
  const tableNames = new Map(tables.map((table) => [table.id, table.name]));
  const lines = [['Name', 'Familie/Gruppe', 'Personentyp', 'Tisch']];
  const sorted = [...groups].sort((a, b) =>
    a.family_name.localeCompare(b.family_name, 'de') ||
    a.main_guest_name.localeCompare(b.main_guest_name, 'de'),
  );

  for (const group of sorted) {
    const adults = group.additional_adults ?? 0;
    const children = group.children_count ?? 0;
    for (let index = 0; index <= adults + children; index += 1) {
      lines.push([
        index === 0 ? group.main_guest_name : `${group.main_guest_name} + ${index}`,
        group.family_name,
        index <= adults ? 'Erwachsener' : 'Kind',
        tableNames.get(group.table_id) || 'Noch kein Tisch',
      ]);
    }
  }

  // UTF-8 BOM preserves umlauts in Excel; semicolons suit German spreadsheets.
  return '\uFEFF' + lines.map((line) => line.map(csvCell).join(';')).join('\r\n') + '\r\n';
}
