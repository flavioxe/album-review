const parseJsonOrThrow = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao comunicar com o Discogs.");
  }
  return response.json();
};

export async function getArtistProfile(artistName) {
  const name = (artistName || "").trim();
  if (!name) {
    throw new Error("Nome do artista nao informado.");
  }

  const response = await fetch(`/api/discogs/artist-search?q=${encodeURIComponent(name)}`);
  if (response.status === 404) {
    return null;
  }
  return parseJsonOrThrow(response);
}

export async function getAlbumCredits(artistName, albumName) {
  const artist = (artistName || "").trim();
  const album = (albumName || "").trim();
  if (!artist || !album) {
    throw new Error("Artista e album sao obrigatorios.");
  }

  const url = `/api/discogs/release-credits?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`;
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  return parseJsonOrThrow(response);
}
