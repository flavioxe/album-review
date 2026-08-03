function normalizeHex(color) {
  if (typeof color !== "string") return null;
  let hex = color.trim();
  if (!hex.startsWith("#")) return null;
  hex = hex.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length !== 6) return null;
  return `#${hex}`;
}

export function getContrastTextColor(color) {
  const normalized = normalizeHex(color);
  if (!normalized) return "#ffffff";

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? "#000000" : "#ffffff";
}
