const WIKIPEDIA_API_BASE = "https://pt.wikipedia.org/w/api.php";
const WIKIPEDIA_REST_BASE = "https://pt.wikipedia.org/api/rest_v1/page/summary";
const WIKIPEDIA_USER_AGENT = "AlbumReviewApp/1.0 (contact: https://github.com)";

const MUSIC_KEYWORDS = [
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
  "artista musical",
  "k pop",
  "hip hop",
];

async function fetchSummaryByTitle(title) {
  const url = `${WIKIPEDIA_REST_BASE}/${encodeURIComponent(title)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": WIKIPEDIA_USER_AGENT, Accept: "application/json" },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Wikipedia summary request failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function searchArticleTitles(query, limit = 5) {
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
    const error = new Error(`Wikipedia search request failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const results = data?.query?.search || [];
  return results.map((result) => result.title).filter(Boolean);
}

function mapSummary(summary) {
  return {
    bio: summary?.extract || "",
    sourceUrl: summary?.content_urls?.desktop?.page || "",
  };
}

function normalizeForCompare(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Muitos artistas ficam salvos com o nome estilizado do Spotify (ex:
// "ROSALÍA" todo em caixa alta), mas o titulo do artigo na Wikipedia
// costuma estar em title case (ex: "Rosalía"). Sem isso o lookup direto
// falha (404) e cai no fallback de busca por texto.
function toTitleCase(text) {
  return (text || "")
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function isTitleAMatch(title, artistName) {
  const normalizedTitle = normalizeForCompare(title);
  const normalizedName = normalizeForCompare(artistName);
  if (!normalizedTitle || !normalizedName) return false;
  return (
    normalizedTitle.includes(normalizedName) ||
    normalizedName.includes(normalizedTitle)
  );
}

// Nomes curtos/comuns (ex: "Chlöe") podem casar com paginas de
// personagens ficticios ou outras pessoas homonimas. Por isso, alem do
// titulo bater com o nome buscado, exigimos que o texto do resumo
// realmente fale de musica antes de aceitar o resultado.
function looksLikeMusicSummary(summary) {
  const text = normalizeForCompare(summary?.extract);
  if (!text) return false;
  return MUSIC_KEYWORDS.some((keyword) => text.includes(keyword));
}

async function findBestMusicSummary(artistName) {
  const candidateTitles = await searchArticleTitles(artistName);

  for (const title of candidateTitles) {
    if (!isTitleAMatch(title, artistName)) continue;

    const summary = await fetchSummaryByTitle(title);
    if (!summary || summary.type === "disambiguation" || !summary.extract) continue;
    if (looksLikeMusicSummary(summary)) return summary;
  }

  return null;
}

async function getArtistSummaryFromWikipedia(artistName) {
  let summary = await fetchSummaryByTitle(artistName);

  if (!summary || summary.type === "disambiguation" || !summary.extract) {
    const titleCased = toTitleCase(artistName);
    if (titleCased !== artistName) {
      summary = await fetchSummaryByTitle(titleCased);
    }
  }

  // Mesmo um lookup direto "acertado" pode ser uma pessoa homonima
  // diferente (nome curto/comum) - valida que o texto fala de musica.
  if (summary && !looksLikeMusicSummary(summary)) {
    summary = null;
  }

  if (!summary) {
    summary = await findBestMusicSummary(artistName);
  }

  if (!summary || summary.type === "disambiguation" || !summary.extract) {
    return null;
  }

  return mapSummary(summary);
}

function sendWikipediaError(res, error) {
  const status = error.status || 500;
  return res
    .status(status >= 400 && status < 500 ? status : 500)
    .json({ error: error.message || "Erro ao consultar a Wikipedia" });
}

export { getArtistSummaryFromWikipedia, sendWikipediaError };
