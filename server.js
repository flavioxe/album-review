import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors"; // Importa o middleware CORS

const app = express();
const PORT = 5000;

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
let spotifyTokenCache = {
  token: null,
  expiresAt: 0,
};

app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json());

const jsonFilePath = path.join(process.cwd(), "albums.json");

const getEnvOrThrow = (key) => {
  const value = process.env[key];
  if (!value) {
    const err = new Error(`Missing environment variable: ${key}`);
    err.status = 500;
    throw err;
  }
  return value;
};

const getSpotifyAccessToken = async () => {
  const now = Date.now();
  if (spotifyTokenCache.token && now < spotifyTokenCache.expiresAt) {
    return spotifyTokenCache.token;
  }

  const clientId = getEnvOrThrow("SPOTIFY_CLIENT_ID");
  const clientSecret = getEnvOrThrow("SPOTIFY_CLIENT_SECRET");
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const message = await response.text();
    const err = new Error(`Spotify token request failed: ${message}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const safetyWindowMs = 30 * 1000;
  spotifyTokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000 - safetyWindowMs,
  };

  return spotifyTokenCache.token;
};

const mapAlbumFromSpotify = (album) => ({
  id: album.id,
  name: album.name,
  artistName: album.artists?.[0]?.name ?? "Artista desconhecido",
  releaseDate: album.release_date,
  coverUrl: album.images?.[0]?.url ?? "",
});

const handleSpotifyError = (res, error) => {
  const status = error.status || 500;
  const message = error?.message || "";

  if (message.startsWith("Missing environment variable:")) {
    return res.status(500).json({ error: message });
  }

  if (status >= 400 && status < 500) {
    return res.status(status).json({ error: message || "Spotify request error" });
  }
  return res.status(500).json({ error: "Internal server error while contacting Spotify" });
};

// Rota para obter todos os álbuns
app.get("/albums", (req, res) => {
  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Erro ao ler o arquivo");
    }
    res.json(JSON.parse(data));
  });
});

// Rota para adicionar um novo álbum
app.post("/albums", (req, res) => {
  const newAlbum = req.body;

  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Erro ao ler o arquivo");
    }

    const albums = JSON.parse(data);
    albums.push(newAlbum);

    fs.writeFile(jsonFilePath, JSON.stringify(albums, null, 2), (err) => {
      if (err) {
        return res.status(500).send("Erro ao salvar o arquivo");
      }
      res.status(201).json(newAlbum);
    });
  });
});

app.get("/api/spotify/search", async (req, res) => {
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

    const response = await fetch(`${SPOTIFY_API_BASE}/search?${searchParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const message = await response.text();
      const err = new Error(`Spotify search failed: ${message}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const mappedAlbums = (data.albums?.items || []).map(mapAlbumFromSpotify);
    return res.json(mappedAlbums);
  } catch (error) {
    return handleSpotifyError(res, error);
  }
});

app.get("/api/spotify/album/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Album id is required" });
  }

  try {
    const token = await getSpotifyAccessToken();
    const response = await fetch(`${SPOTIFY_API_BASE}/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const message = await response.text();
      const err = new Error(`Spotify album fetch failed: ${message}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const albumDetails = {
      ...mapAlbumFromSpotify(data),
      tracks: (data.tracks?.items || []).map((track) => ({
        titulo: track.name,
        duracaoMs: track.duration_ms,
      })),
    };

    return res.json(albumDetails);
  } catch (error) {
    return handleSpotifyError(res, error);
  }
});

const DISCOGS_API_BASE = "https://api.discogs.com";
const DISCOGS_USER_AGENT = "AlbumReviewApp/1.0 +https://github.com";

const discogsFetch = async (path, params = {}) => {
  const token = getEnvOrThrow("DISCOGS_TOKEN");
  const searchParams = new URLSearchParams({ ...params, token });
  const response = await fetch(`${DISCOGS_API_BASE}${path}?${searchParams.toString()}`, {
    headers: { "User-Agent": DISCOGS_USER_AGENT },
  });

  if (!response.ok) {
    const message = await response.text();
    const err = new Error(`Discogs request failed: ${message}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
};

const cleanDiscogsText = (text) =>
  (text || "")
    .replace(/\[[a-z]=([^\]]+)\]/gi, "$1")
    .replace(/\[[a-z]\d+\]/gi, "")
    .replace(/\[\/?[a-z0-9]+\]/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const mapArtistFromDiscogs = (artist) => ({
  discogsId: artist.id,
  name: artist.name,
  bio: cleanDiscogsText(artist.profile),
  imageUrl: artist.images?.[0]?.resource_url || artist.images?.[0]?.uri || "",
});

const mapCreditsFromRelease = (release) => ({
  albumCredits: (release.extraartists || []).map((person) => ({
    name: person.name,
    role: person.role,
  })),
  trackCredits: (release.tracklist || [])
    .filter((track) => track.extraartists?.length)
    .map((track) => ({
      title: track.title,
      credits: track.extraartists.map((person) => ({
        name: person.name,
        role: person.role,
      })),
    })),
});

const handleDiscogsError = (res, error) => {
  const status = error.status || 500;
  const message = error?.message || "";

  if (message.startsWith("Missing environment variable:")) {
    return res.status(500).json({ error: message });
  }

  if (status >= 400 && status < 500) {
    return res.status(status).json({ error: message || "Discogs request error" });
  }
  return res.status(500).json({ error: "Internal server error while contacting Discogs" });
};

const mapArtistFromSpotify = (artist) => ({
  id: artist.id,
  name: artist.name,
  imageUrl: artist.images?.[0]?.url ?? "",
});

const pickBestArtistMatch = (items, query) => {
  if (!items?.length) return null;

  const normalizedQuery = query.trim().toLowerCase();
  const exactMatch = items.find(
    (item) => (item.name || "").trim().toLowerCase() === normalizedQuery,
  );

  return exactMatch || items[0];
};

app.get("/api/spotify/artist-search", async (req, res) => {
  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: "Query param 'q' is required" });
  }

  try {
    const token = await getSpotifyAccessToken();
    const searchParams = new URLSearchParams({ q: String(q).trim(), type: "artist", limit: "10" });

    const response = await fetch(`${SPOTIFY_API_BASE}/search?${searchParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const message = await response.text();
      const err = new Error(`Spotify artist search failed: ${message}`);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    const bestMatch = pickBestArtistMatch(data.artists?.items, String(q));
    if (!bestMatch) {
      return res.status(404).json({ error: "Artist not found on Spotify" });
    }

    return res.json(mapArtistFromSpotify(bestMatch));
  } catch (error) {
    return handleSpotifyError(res, error);
  }
});

app.get("/api/discogs/artist-search", async (req, res) => {
  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: "Query param 'q' is required" });
  }

  try {
    const searchData = await discogsFetch("/database/search", {
      q: String(q).trim(),
      type: "artist",
      per_page: "5",
    });

    const bestMatch = (searchData.results || [])[0];
    if (!bestMatch) {
      return res.status(404).json({ error: "Artist not found on Discogs" });
    }

    const artistData = await discogsFetch(`/artists/${bestMatch.id}`);
    return res.json(mapArtistFromDiscogs(artistData));
  } catch (error) {
    return handleDiscogsError(res, error);
  }
});

app.get("/api/discogs/release-credits", async (req, res) => {
  const { artist, album } = req.query;
  if (!artist || !album) {
    return res.status(400).json({ error: "Query params 'artist' and 'album' are required" });
  }

  try {
    const searchData = await discogsFetch("/database/search", {
      artist: String(artist).trim(),
      release_title: String(album).trim(),
      type: "release",
      per_page: "1",
    });

    const bestMatch = (searchData.results || [])[0];
    if (!bestMatch) {
      return res.status(404).json({ error: "Release not found on Discogs" });
    }

    const releaseData = await discogsFetch(`/releases/${bestMatch.id}`);
    return res.json(mapCreditsFromRelease(releaseData));
  } catch (error) {
    return handleDiscogsError(res, error);
  }
});

app.get("/api/translate", async (req, res) => {
  const { text, target } = req.query;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "Query param 'text' is required" });
  }

  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: "auto",
      tl: target || "pt",
      dt: "t",
      q: String(text),
    });

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Translate request failed with status ${response.status}`);
    }

    const data = await response.json();
    const translated = (data?.[0] || []).map((segment) => segment[0]).join("");

    return res.json({ translatedText: translated });
  } catch (error) {
    return res.status(502).json({ error: "Falha ao traduzir o texto" });
  }
});

const WIKIPEDIA_API_BASE = "https://pt.wikipedia.org/w/api.php";
const WIKIPEDIA_REST_BASE = "https://pt.wikipedia.org/api/rest_v1/page/summary";
const WIKIPEDIA_USER_AGENT = "AlbumReviewApp/1.0 (contact: https://github.com)";

const fetchWikipediaSummaryByTitle = async (title) => {
  const url = `${WIKIPEDIA_REST_BASE}/${encodeURIComponent(title)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": WIKIPEDIA_USER_AGENT, Accept: "application/json" },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const message = await response.text();
    const err = new Error(`Wikipedia summary request failed: ${message}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
};

const searchWikipediaArticleTitles = async (query, limit = 5) => {
  const searchParams = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(limit),
    format: "json",
    origin: "*",
  });

  const response = await fetch(`${WIKIPEDIA_API_BASE}?${searchParams.toString()}`, {
    headers: { "User-Agent": WIKIPEDIA_USER_AGENT },
  });

  if (!response.ok) {
    const message = await response.text();
    const err = new Error(`Wikipedia search request failed: ${message}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const results = data?.query?.search || [];
  return results.map((result) => result.title).filter(Boolean);
};

const mapWikipediaSummary = (summary) => ({
  bio: summary?.extract || "",
  sourceUrl: summary?.content_urls?.desktop?.page || "",
});

const normalizeWikipediaCompare = (text) =>
  (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const toWikipediaTitleCase = (text) =>
  (text || "")
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

const isWikipediaTitleAMatch = (title, artistName) => {
  const normalizedTitle = normalizeWikipediaCompare(title);
  const normalizedName = normalizeWikipediaCompare(artistName);
  if (!normalizedTitle || !normalizedName) return false;
  return (
    normalizedTitle.includes(normalizedName) ||
    normalizedName.includes(normalizedTitle)
  );
};

const WIKIPEDIA_MUSIC_KEYWORDS = [
  "cantor",
  "cantora",
  "cantautor",
  "cantautora",
  "compositor",
  "compositora",
  "banda",
  "musico",
  "musica",
  "rapper",
  "dj",
  "grupo musical",
  "produtor musical",
  "artista musical",
  "grupo de k pop",
  "girl group",
  "boy group",
  "vocalista",
  "instrumentista",
  "k pop",
  "hip hop",
];

const looksLikeWikipediaMusicSummary = (summary) => {
  const text = normalizeWikipediaCompare(summary?.extract);
  if (!text) return false;
  return WIKIPEDIA_MUSIC_KEYWORDS.some((keyword) => text.includes(keyword));
};

const findBestWikipediaMusicSummary = async (artistName) => {
  const candidateTitles = await searchWikipediaArticleTitles(artistName);

  for (const title of candidateTitles) {
    if (!isWikipediaTitleAMatch(title, artistName)) continue;

    const summary = await fetchWikipediaSummaryByTitle(title);
    if (!summary || summary.type === "disambiguation" || !summary.extract) continue;
    if (looksLikeWikipediaMusicSummary(summary)) return summary;
  }

  return null;
};

const getArtistSummaryFromWikipedia = async (artistName) => {
  let summary = await fetchWikipediaSummaryByTitle(artistName);

  if (!summary || summary.type === "disambiguation" || !summary.extract) {
    const titleCased = toWikipediaTitleCase(artistName);
    if (titleCased !== artistName) {
      summary = await fetchWikipediaSummaryByTitle(titleCased);
    }
  }

  if (summary && !looksLikeWikipediaMusicSummary(summary)) {
    summary = null;
  }

  if (!summary) {
    summary = await findBestWikipediaMusicSummary(artistName);
  }

  if (!summary || summary.type === "disambiguation" || !summary.extract) {
    return null;
  }

  return mapWikipediaSummary(summary);
};

app.get("/api/wikipedia/artist-summary", async (req, res) => {
  const { q } = req.query;
  if (!q || !String(q).trim()) {
    return res.status(400).json({ error: "Query param 'q' is required" });
  }

  try {
    const summary = await getArtistSummaryFromWikipedia(String(q).trim());
    if (!summary) {
      return res.status(404).json({ error: "Artist not found on Wikipedia" });
    }
    return res.json(summary);
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status >= 400 && status < 500 ? status : 500)
      .json({ error: error.message || "Erro ao consultar a Wikipedia" });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.warn("Spotify env vars are missing. Configure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env");
  }
  if (!process.env.DISCOGS_TOKEN) {
    console.warn("Discogs env var is missing. Configure DISCOGS_TOKEN in .env");
  }
  console.log(`Servidor rodando na porta ${PORT}`);
});
