const parseJsonOrThrow = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao comunicar com o Spotify.");
  }
  return response.json();
};

export async function searchAlbums(query, offset = 0) {
  const q = (query || "").trim();

  if (!q) {
    return [];
  }

  const url = `/api/spotify/search?q=${encodeURIComponent(q)}&offset=${offset}&limit=5`;
  const response = await fetch(url);
  const data = await parseJsonOrThrow(response);

  if (!Array.isArray(data)) {
    throw new Error("Resposta invalida ao buscar albuns.");
  }

  return data;
}

export async function getAlbumDetails(spotifyId) {
  if (!spotifyId) {
    throw new Error("Id do Spotify nao informado.");
  }

  const response = await fetch(`/api/spotify/album/${encodeURIComponent(spotifyId)}`);
  return parseJsonOrThrow(response);
}

export async function getArtistImage(artistName) {
  const name = (artistName || "").trim();
  if (!name) {
    return null;
  }

  const response = await fetch(`/api/spotify/artist-search?q=${encodeURIComponent(name)}`);
  if (response.status === 404) {
    return null;
  }
  return parseJsonOrThrow(response);
}
