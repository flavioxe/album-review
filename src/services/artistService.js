import { ref, get, set } from "firebase/database";
import { database } from "../firebase";
import { slugify } from "../utils/slug";
import { getArtistImage } from "./spotifyService";
import { getArtistProfile } from "./discogsService";
import { translateToPortuguese } from "./translateService";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function isCacheStale(artistCache) {
  if (!artistCache?.fetchedAt) return true;
  return Date.now() - artistCache.fetchedAt > CACHE_TTL_MS;
}

// Busca todos os albuns cadastrados cujo artista corresponde ao slug informado.
// Nao depende de nenhum campo novo no album - so compara o slug do nome ja existente.
export function findAlbumsByArtistSlug(albums, slug) {
  return (albums || []).filter((album) => slugify(album.artist) === slug);
}

// Le (e, se necessario, popula) o cache de dados externos do artista em `artists/{slug}`.
// Esse node e novo e nao interfere em nada que ja existe em `albums/`.
export async function getOrFetchArtistInfo(artistName) {
  const slug = slugify(artistName);
  if (!slug) return null;

  const artistRef = ref(database, `artists/${slug}`);
  const snapshot = await get(artistRef);
  const cached = snapshot.exists() ? snapshot.val() : null;

  if (cached && !isCacheStale(cached)) {
    return cached;
  }

  const [spotifyResult, discogsResult] = await Promise.allSettled([
    getArtistImage(artistName),
    getArtistProfile(artistName),
  ]);

  const spotifyData = spotifyResult.status === "fulfilled" ? spotifyResult.value : null;
  const discogsData = discogsResult.status === "fulfilled" ? discogsResult.value : null;

  let bio = cached?.bio || "";
  if (discogsData?.bio) {
    bio = await translateToPortuguese(discogsData.bio);
  }

  const info = {
    name: artistName,
    slug,
    imageUrl: spotifyData?.imageUrl || discogsData?.imageUrl || cached?.imageUrl || "",
    spotifyId: spotifyData?.id || cached?.spotifyId || "",
    bio,
    discogsId: discogsData?.discogsId || cached?.discogsId || "",
    fetchedAt: Date.now(),
  };

  try {
    await set(artistRef, info);
  } catch (error) {
    // Falha ao cachear nao deve impedir a exibicao dos dados ja obtidos.
    console.error("Erro ao salvar cache do artista:", error);
  }

  return info;
}

export function getArtistAggregateRating(albums) {
  const values = [];

  (albums || []).forEach((album) => {
    const u1 = parseFloat(album?.averages?.user1);
    const u2 = parseFloat(album?.averages?.user2);
    if (!Number.isNaN(u1)) values.push(u1);
    if (!Number.isNaN(u2)) values.push(u2);
  });

  if (!values.length) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

export function getMostRecentAlbum(albums) {
  if (!albums?.length) return null;
  return sortAlbumsByReleaseDateDesc(albums)[0];
}

export function sortAlbumsByReleaseDateDesc(albums) {
  return [...(albums || [])].sort(
    (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate),
  );
}

export function getArtistAggregateByUser(albums) {
  const result = { user1: null, user2: null };

  ["user1", "user2"].forEach((user) => {
    const values = (albums || [])
      .map((album) => parseFloat(album?.averages?.[user]))
      .filter((value) => !Number.isNaN(value));

    if (values.length) {
      result[user] = values.reduce((acc, v) => acc + v, 0) / values.length;
    }
  });

  return result;
}

function normalizeTrackTitle(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function findTrackRating(album, user, trackName) {
  const userRatings = album?.ratings?.[user];
  if (!Array.isArray(userRatings)) return null;

  const target = normalizeTrackTitle(trackName);

  // Match exato primeiro.
  let match = userRatings.find(
    (entry) => normalizeTrackTitle(entry?.title) === target,
  );

  // Fallback por prefixo: a tracklist do album pode ter sufixos tipo
  // "by Artista & Convidado" que nao entram no nome da best new track.
  if (!match) {
    match = userRatings.find((entry) => {
      const title = normalizeTrackTitle(entry?.title);
      return title && (title.startsWith(target) || target.startsWith(title));
    });
  }

  const rate = parseFloat(match?.rate);
  return Number.isNaN(rate) ? null : rate;
}

export function getArtistTopTracks(albums) {
  const sorted = sortAlbumsByReleaseDateDesc(albums);
  const tracks = [];

  const userLabels = { user1: "Ducardo", user2: "Flavioxe" };

  sorted.forEach((album) => {
    ["user1", "user2"].forEach((user) => {
      const trackName =
        album?.bestNewTracks?.[user] || album?.bestNewTrack?.[user];
      const normalizedTrackName = String(trackName || "").trim();
      const isInvalid =
        !normalizedTrackName ||
        ["-", "nenhuma"].includes(normalizedTrackName.toLowerCase());

      if (!isInvalid) {
        tracks.push({
          id: `${album.id}-${user}`,
          trackName: normalizedTrackName,
          albumName: album.name,
          albumCover: album.cover,
          releaseDate: album.releaseDate,
          userLabel: userLabels[user],
          rating: findTrackRating(album, user, normalizedTrackName),
        });
      }
    });
  });

  return tracks.sort((a, b) => {
    if (a.rating === null && b.rating === null) return 0;
    if (a.rating === null) return 1;
    if (b.rating === null) return -1;
    return b.rating - a.rating;
  });
}
