import {
  SPOTIFY_API_BASE,
  getSpotifyAccessToken,
  mapAlbumFromSpotify,
  sendSpotifyError,
} from "./_spotify.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;
  const offset = Number.parseInt(req.query.offset, 10) || 0;
  const limit = Number.parseInt(req.query.limit, 10) || 5;

  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: "Query param 'q' is required" });
  }

  try {
    const token = await getSpotifyAccessToken();
    const searchParams = new URLSearchParams({
      q: String(q).trim(),
      type: "album",
      limit: String(limit),
      offset: String(offset),
    });

    const spotifyResponse = await fetch(`${SPOTIFY_API_BASE}/search?${searchParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!spotifyResponse.ok) {
      const message = await spotifyResponse.text();
      const error = new Error(`Spotify search failed: ${message}`);
      error.status = spotifyResponse.status;
      throw error;
    }

    const spotifyData = await spotifyResponse.json();
    const mappedAlbums = (spotifyData.albums?.items || []).map(mapAlbumFromSpotify);

    return res.status(200).json(mappedAlbums);
  } catch (error) {
    return sendSpotifyError(res, error);
  }
}
