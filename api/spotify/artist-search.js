import { SPOTIFY_API_BASE, getSpotifyAccessToken, sendSpotifyError } from "./_spotify.js";

function mapArtistFromSpotify(artist) {
  return {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.images?.[0]?.url ?? "",
  };
}

function pickBestArtistMatch(items, query) {
  if (!items?.length) return null;

  const normalizedQuery = query.trim().toLowerCase();
  const exactMatch = items.find(
    (item) => (item.name || "").trim().toLowerCase() === normalizedQuery,
  );

  return exactMatch || items[0];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: "Query param 'q' is required" });
  }

  try {
    const token = await getSpotifyAccessToken();
    const searchParams = new URLSearchParams({
      q: String(q).trim(),
      type: "artist",
      limit: "10",
    });

    const spotifyResponse = await fetch(`${SPOTIFY_API_BASE}/search?${searchParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!spotifyResponse.ok) {
      const message = await spotifyResponse.text();
      const error = new Error(`Spotify artist search failed: ${message}`);
      error.status = spotifyResponse.status;
      throw error;
    }

    const spotifyData = await spotifyResponse.json();
    const bestMatch = pickBestArtistMatch(spotifyData.artists?.items, String(q));

    if (!bestMatch) {
      return res.status(404).json({ error: "Artist not found on Spotify" });
    }

    return res.status(200).json(mapArtistFromSpotify(bestMatch));
  } catch (error) {
    return sendSpotifyError(res, error);
  }
}
