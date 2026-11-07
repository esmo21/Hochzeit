const weddingDay = Date.UTC(2027, 4, 29);
const daysElement = document.querySelector('#countdown-days');
const labelElement = document.querySelector('#countdown-label');
let midnightTimer;

function updateCountdown() {
  if (!daysElement || !labelElement) return;
  clearTimeout(midnightTimer);
  const now = new Date();
  // Compare calendar dates so daylight saving changes do not affect the count.
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.max(0, Math.round((weddingDay - today) / 86400000));
  daysElement.textContent = days;
  labelElement.textContent = days === 1 ? 'Tag' : 'Tage';

  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  midnightTimer = setTimeout(updateCountdown, nextMidnight.getTime() - now.getTime() + 100);
}

updateCountdown();
window.addEventListener('pageshow', updateCountdown);
window.addEventListener('focus', updateCountdown);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateCountdown();
});
