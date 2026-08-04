export async function getArtistSummary(artistName) {
  const name = (artistName || "").trim();
  if (!name) return null;

  const response = await fetch(`/api/wikipedia/artist-summary?q=${encodeURIComponent(name)}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao consultar a Wikipedia.");
  }
  return response.json();
}
