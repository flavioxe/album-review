const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

let spotifyTokenCache = {
  token: null,
  expiresAt: 0,
};

function getEnvOrThrow(key) {
  const value = process.env[key];
  if (!value) {
    const error = new Error(`Missing environment variable: ${key}`);
    error.status = 500;
    throw error;
  }
  return value;
}

async function getSpotifyAccessToken() {
  const now = Date.now();
  if (spotifyTokenCache.token && now < spotifyTokenCache.expiresAt) {
    return spotifyTokenCache.token;
  }

  const clientId = getEnvOrThrow("SPOTIFY_CLIENT_ID");
  const clientSecret = getEnvOrThrow("SPOTIFY_CLIENT_SECRET");
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!tokenResponse.ok) {
    const message = await tokenResponse.text();
    const error = new Error(`Spotify token request failed: ${message}`);
    error.status = tokenResponse.status;
    throw error;
  }

  const tokenData = await tokenResponse.json();
  const safetyWindowMs = 30 * 1000;

  spotifyTokenCache = {
    token: tokenData.access_token,
    expiresAt: now + tokenData.expires_in * 1000 - safetyWindowMs,
  };

  return spotifyTokenCache.token;
}

function mapAlbumFromSpotify(album) {
  return {
    id: album.id,
    name: album.name,
    artistName: album.artists?.[0]?.name ?? "Artista desconhecido",
    releaseDate: album.release_date,
    coverUrl: album.images?.[0]?.url ?? "",
  };
}

function sendSpotifyError(res, error) {
  const status = error.status || 500;
  const message = error?.message || "";

  if (message.startsWith("Missing environment variable:")) {
    return res.status(500).json({ error: message });
  }

  if (status >= 400 && status < 500) {
    return res.status(status).json({ error: message || "Spotify request error" });
  }

  return res.status(500).json({ error: "Internal server error while contacting Spotify" });
}

export {
  SPOTIFY_API_BASE,
  getSpotifyAccessToken,
  mapAlbumFromSpotify,
  sendSpotifyError,
};
