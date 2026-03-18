import {
  SPOTIFY_API_BASE,
  getSpotifyAccessToken,
  mapAlbumFromSpotify,
  sendSpotifyError,
} from "../_spotify.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Album id is required" });
  }

  try {
    const token = await getSpotifyAccessToken();
    const spotifyResponse = await fetch(`${SPOTIFY_API_BASE}/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!spotifyResponse.ok) {
      const message = await spotifyResponse.text();
      const error = new Error(`Spotify album fetch failed: ${message}`);
      error.status = spotifyResponse.status;
      throw error;
    }

    const spotifyData = await spotifyResponse.json();
    const albumDetails = {
      ...mapAlbumFromSpotify(spotifyData),
      tracks: (spotifyData.tracks?.items || []).map((track) => ({
        titulo: track.name,
        duracaoMs: track.duration_ms,
      })),
    };

    return res.status(200).json(albumDetails);
  } catch (error) {
    return sendSpotifyError(res, error);
  }
}
