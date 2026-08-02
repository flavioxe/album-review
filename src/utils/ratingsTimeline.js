const getNumericRatings = (entries) => {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => (entry ? entry.rate : null))
    .filter((rate) => typeof rate === "number" && !Number.isNaN(rate));
};

const average = (numbers) => {
  if (!numbers.length) return null;
  const total = numbers.reduce((acc, n) => acc + n, 0);
  return total / numbers.length;
};

// Usa a data de lançamento do álbum como aproximação de "quando" a nota
// foi dada, já que o app não guarda um timestamp de avaliação.
export function computeTimelinePoints(albums) {
  if (!Array.isArray(albums)) return [];

  return albums
    .map((album) => {
      const user1Avg = average(getNumericRatings(album.ratings?.user1));
      const user2Avg = average(getNumericRatings(album.ratings?.user2));
      if (user1Avg === null || user2Avg === null) return null;

      const date = new Date(album.releaseDate);
      if (Number.isNaN(date.getTime())) return null;

      return {
        albumId: album.id,
        name: album.name,
        artist: album.artist,
        cover: album.cover,
        date,
        user1: user1Avg,
        user2: user2Avg,
        gap: Math.abs(user1Avg - user2Avg),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);
}
