/** Geometrie in Zentimetern; x/y sind die linke obere Ecke der gedrehten Bounding-Box. */
export const ROOM_WIDTH_CM = 940;
export const ROOM_HEIGHT_CM = 1050;

export function normalizeRotation(angle) {
  return ((angle % 360) + 360) % 360;
}

export function isValidRotation(angle) {
  return Number.isFinite(angle) && angle % 45 === 0;
}

/** Außenmaße eines um seinen Mittelpunkt gedrehten Rechtecks. */
export function rotatedBounds(width, height, angle) {
  const radians = normalizeRotation(angle) * Math.PI / 180;
  const c = Math.abs(Math.cos(radians));
  const s = Math.abs(Math.sin(radians));
  return { w: width * c + height * s, h: width * s + height * c };
}

/** Kein gedrehter Tisch/Stuhl darf mit einer Ecke außerhalb des Raums stehen. */
export function clampToRoom(item, width, height) {
  const { w, h } = rotatedBounds(width, height, item.rotation);
  const x = Number.isFinite(item.x) ? item.x : 0;
  const y = Number.isFinite(item.y) ? item.y : 0;
  item.x = Math.max(0, Math.min(ROOM_WIDTH_CM - w, x));
  item.y = Math.max(0, Math.min(ROOM_HEIGHT_CM - h, y));
  return item;
}

/** Drehung um den Möbelmittelpunkt, anschließend nur falls nötig innerhalb der Wände verschieben. */
export function rotateFurniture(item, width, height, degrees) {
  if (!isValidRotation(degrees)) throw new Error('Nur 45°-Schritte sind erlaubt.');
  const before = rotatedBounds(width, height, item.rotation);
  const centerX = item.x + before.w / 2;
  const centerY = item.y + before.h / 2;
  item.rotation = normalizeRotation(item.rotation + degrees);
  const after = rotatedBounds(width, height, item.rotation);
  item.x = centerX - after.w / 2;
  item.y = centerY - after.h / 2;
  return clampToRoom(item, width, height);
}
