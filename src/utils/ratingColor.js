export function getRatingColorClass(value) {
  const rating = parseFloat(value);
  if (Number.isNaN(rating)) return "text-secondary";
  if (rating >= 7) return "text-success";
  if (rating >= 5) return "text-warning";
  return "text-danger";
}
