// Date object -> "2026-10-07"
export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// "2026-10-07" -> Date object
export function parseDate(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// "2026-10-07" -> "Oct 7, 2026" (depends on phone language)
export function formatDisplay(dateString) {
  return parseDate(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}