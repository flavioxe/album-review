const DISCOGS_API_BASE = "https://api.discogs.com";
const DISCOGS_USER_AGENT = "AlbumReviewApp/1.0 +https://github.com";

function getEnvOrThrow(key) {
  const value = process.env[key];
  if (!value) {
    const error = new Error(`Missing environment variable: ${key}`);
    error.status = 500;
    throw error;
  }
  return value;
}

async function discogsFetch(path, params = {}) {
  const token = getEnvOrThrow("DISCOGS_TOKEN");
  const searchParams = new URLSearchParams({ ...params, token });
  const url = `${DISCOGS_API_BASE}${path}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: { "User-Agent": DISCOGS_USER_AGENT },
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Discogs request failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function cleanDiscogsText(text) {
  return (text || "")
    .replace(/\[[a-z]=([^\]]+)\]/gi, "$1")
    .replace(/\[[a-z]\d+\]/gi, "")
    .replace(/\[\/?[a-z0-9]+\]/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function mapArtistFromDiscogs(artist) {
  return {
    discogsId: artist.id,
    name: artist.name,
    bio: cleanDiscogsText(artist.profile),
    imageUrl: artist.images?.[0]?.resource_url || artist.images?.[0]?.uri || "",
  };
}

function mapCreditsFromRelease(release) {
  const albumCredits = (release.extraartists || []).map((person) => ({
    name: person.name,
    role: person.role,
  }));

  const trackCredits = (release.tracklist || [])
    .filter((track) => track.extraartists?.length)
    .map((track) => ({
      title: track.title,
      credits: track.extraartists.map((person) => ({
        name: person.name,
        role: person.role,
      })),
    }));

  return { albumCredits, trackCredits };
}

function sendDiscogsError(res, error) {
  const status = error.status || 500;
  const message = error?.message || "";

  if (message.startsWith("Missing environment variable:")) {
    return res.status(500).json({ error: message });
  }

  if (status >= 400 && status < 500) {
    return res.status(status).json({ error: message || "Discogs request error" });
  }

  return res.status(500).json({ error: "Internal server error while contacting Discogs" });
}

export {
  discogsFetch,
  mapArtistFromDiscogs,
  mapCreditsFromRelease,
  sendDiscogsError,
};
