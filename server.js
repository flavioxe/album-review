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

// Iniciar o servidor
app.listen(PORT, () => {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.warn("Spotify env vars are missing. Configure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env");
  }
  console.log(`Servidor rodando na porta ${PORT}`);
});
