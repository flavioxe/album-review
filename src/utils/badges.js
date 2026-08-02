const USER_NAMES = {
  user1: "Ducardo",
  user2: "Flavioxe",
};

const USER_AVATARS = {
  user1: "/ducardo.jpg",
  user2: "/flavioxe.jpg",
};

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

const isEvaluatedByBoth = (album) => {
  if (!album.ratings) return false;
  const user1Ratings = getNumericRatings(album.ratings.user1);
  const user2Ratings = getNumericRatings(album.ratings.user2);
  return user1Ratings.length > 0 && user2Ratings.length > 0;
};

const albumUserAverage = (album, user) =>
  average(getNumericRatings(album.ratings?.[user]));

const albumCombinedAverage = (album) => {
  const combined = [
    ...getNumericRatings(album.ratings?.user1),
    ...getNumericRatings(album.ratings?.user2),
  ];
  return average(combined);
};

const normalizeArtist = (artist) => (artist || "").trim();

const groupByArtist = (albums) => {
  const groups = new Map();

  albums.forEach((album) => {
    const key = normalizeArtist(album.artist);
    if (!key) return;

    if (!groups.has(key)) {
      groups.set(key, { artist: album.artist, albums: [] });
    }
    groups.get(key).albums.push(album);
  });

  return Array.from(groups.values());
};

const findLowestTrackByUser = (albums, user) => {
  let lowest = null;

  albums.forEach((album) => {
    const entries = album.ratings?.[user];
    if (!Array.isArray(entries)) return;

    entries.forEach((entry) => {
      if (!entry || typeof entry.rate !== "number") return;
      if (lowest === null || entry.rate < lowest.rate) {
        lowest = {
          rate: entry.rate,
          trackTitle: entry.title,
          album,
        };
      }
    });
  });

  return lowest;
};

export function computeBadges(albums) {
  if (!Array.isArray(albums) || albums.length === 0) return [];

  const evaluatedAlbums = albums.filter(isEvaluatedByBoth);
  const badges = [];

  if (evaluatedAlbums.length > 0) {
    const albumsWithAverage = evaluatedAlbums
      .map((album) => ({ album, avg: albumCombinedAverage(album) }))
      .filter(({ avg }) => avg !== null);

    if (albumsWithAverage.length > 0) {
      const lowestAlbum = [...albumsWithAverage].sort(
        (a, b) => a.avg - b.avg,
      )[0];

      badges.push({
        type: "lowest_album_average",
        title: lowestAlbum.album.name,
        subtitle: lowestAlbum.album.artist,
        cover: lowestAlbum.album.cover,
        color: lowestAlbum.album.primaryColor,
        metric: lowestAlbum.avg.toFixed(2),
        metricLabel: "média",
      });
    }

    const albumsWithDiff = evaluatedAlbums
      .map((album) => {
        const user1Avg = albumUserAverage(album, "user1");
        const user2Avg = albumUserAverage(album, "user2");
        if (user1Avg === null || user2Avg === null) return null;
        return { album, diff: Math.abs(user1Avg - user2Avg) };
      })
      .filter(Boolean);

    if (albumsWithDiff.length > 0) {
      const mostDiscordant = [...albumsWithDiff].sort(
        (a, b) => b.diff - a.diff,
      )[0];
      const mostConsensual = [...albumsWithDiff].sort(
        (a, b) => a.diff - b.diff,
      )[0];

      badges.push({
        type: "most_discordant_album",
        title: mostDiscordant.album.name,
        subtitle: mostDiscordant.album.artist,
        cover: mostDiscordant.album.cover,
        color: mostDiscordant.album.primaryColor,
        metric: mostDiscordant.diff.toFixed(2),
        metricLabel: "de diferença",
      });

      badges.push({
        type: "most_consensual_album",
        title: mostConsensual.album.name,
        subtitle: mostConsensual.album.artist,
        cover: mostConsensual.album.cover,
        color: mostConsensual.album.primaryColor,
        metric: mostConsensual.diff.toFixed(2),
        metricLabel: "de diferença",
      });
    }

    const releasesWithDate = evaluatedAlbums
      .map((album) => ({ album, date: new Date(album.releaseDate) }))
      .filter(({ date }) => !Number.isNaN(date.getTime()));

    if (releasesWithDate.length > 0) {
      const mostRecent = [...releasesWithDate].sort(
        (a, b) => b.date - a.date,
      )[0];

      const trackCount = Array.isArray(mostRecent.album.tracks)
        ? mostRecent.album.tracks.length
        : null;
      const releaseYear = mostRecent.date.getFullYear();

      badges.push({
        type: "most_recent_release",
        title: mostRecent.album.name,
        subtitle:
          trackCount !== null
            ? `${mostRecent.album.artist} • ${trackCount} ${trackCount === 1 ? "faixa" : "faixas"} • ${releaseYear}`
            : `${mostRecent.album.artist} • ${releaseYear}`,
        cover: mostRecent.album.cover,
        color: mostRecent.album.primaryColor,
        ratings: [
          {
            label: USER_NAMES.user1,
            avatar: USER_AVATARS.user1,
            value: albumUserAverage(mostRecent.album, "user1"),
          },
          {
            label: USER_NAMES.user2,
            avatar: USER_AVATARS.user2,
            value: albumUserAverage(mostRecent.album, "user2"),
          },
          {
            label: "Média",
            value: albumCombinedAverage(mostRecent.album),
          },
        ],
      });
    }

    const artistGroups = groupByArtist(evaluatedAlbums);

    const artistsWithAverage = artistGroups
      .map((group) => {
        const averages = group.albums
          .map((album) => albumCombinedAverage(album))
          .filter((avg) => avg !== null);
        const artistAvg = average(averages);
        if (artistAvg === null) return null;
        return { ...group, avg: artistAvg };
      })
      .filter(Boolean);

    if (artistsWithAverage.length > 0) {
      const lowestArtist = [...artistsWithAverage].sort(
        (a, b) => a.avg - b.avg,
      )[0];

      badges.push({
        type: "artist_lowest_average",
        title: lowestArtist.artist,
        subtitle: `${lowestArtist.albums.length} ${lowestArtist.albums.length === 1 ? "álbum avaliado" : "álbuns avaliados"}`,
        cover: lowestArtist.albums[0]?.cover,
        color: lowestArtist.albums[0]?.primaryColor,
        metric: lowestArtist.avg.toFixed(2),
        metricLabel: "média",
      });
    }

    const topRatedArtists = [...artistGroups]
      .sort((a, b) => b.albums.length - a.albums.length)
      .slice(0, 5);

    if (topRatedArtists.length > 0 && topRatedArtists[0].albums.length > 1) {
      badges.push({
        type: "most_rated_artist",
        items: topRatedArtists.map((group) => ({
          title: group.artist,
          subtitle: `${group.albums.length} ${group.albums.length === 1 ? "álbum avaliado" : "álbuns avaliados"}`,
          cover: group.albums[0]?.cover,
          color: group.albums[0]?.primaryColor,
          metric: group.albums.length.toString(),
          metricLabel: "álbuns",
        })),
      });
    }

    const artistsWithUserDiff = artistGroups
      .map((group) => {
        const user1Avg = average(
          group.albums
            .map((album) => albumUserAverage(album, "user1"))
            .filter((avg) => avg !== null),
        );
        const user2Avg = average(
          group.albums
            .map((album) => albumUserAverage(album, "user2"))
            .filter((avg) => avg !== null),
        );
        if (user1Avg === null || user2Avg === null) return null;
        return { ...group, diff: Math.abs(user1Avg - user2Avg) };
      })
      .filter(Boolean);

    if (artistsWithUserDiff.length > 0) {
      const nemesis = [...artistsWithUserDiff].sort(
        (a, b) => b.diff - a.diff,
      )[0];
      const soulmate = [...artistsWithUserDiff].sort(
        (a, b) => a.diff - b.diff,
      )[0];

      badges.push({
        type: "nemesis_artist",
        title: nemesis.artist,
        subtitle: `${USER_NAMES.user1} e ${USER_NAMES.user2} mais divergem aqui`,
        cover: nemesis.albums[0]?.cover,
        color: nemesis.albums[0]?.primaryColor,
        metric: nemesis.diff.toFixed(2),
        metricLabel: "de diferença",
      });

      badges.push({
        type: "soulmate_artist",
        title: soulmate.artist,
        subtitle: `${USER_NAMES.user1} e ${USER_NAMES.user2} mais concordam aqui`,
        cover: soulmate.albums[0]?.cover,
        color: soulmate.albums[0]?.primaryColor,
        metric: soulmate.diff.toFixed(2),
        metricLabel: "de diferença",
      });
    }
  }

  const soloAlbums = albums
    .map((album) => {
      const user1Ratings = getNumericRatings(album.ratings?.user1);
      const user2Ratings = getNumericRatings(album.ratings?.user2);
      const user1Has = user1Ratings.length > 0;
      const user2Has = user2Ratings.length > 0;

      if (user1Has === user2Has) return null;

      const user = user1Has ? "user1" : "user2";
      const avg = average(user1Has ? user1Ratings : user2Ratings);
      if (avg === null) return null;

      return { album, user, avg };
    })
    .filter(Boolean);

  const topSoloAlbums = [...soloAlbums]
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  if (topSoloAlbums.length > 0) {
    badges.push({
      type: "solo_top_albums",
      items: topSoloAlbums.map(({ album, user, avg }) => ({
        title: album.name,
        subtitle: album.artist,
        cover: album.cover,
        color: album.primaryColor,
        metric: avg.toFixed(2),
        metricLabel: "nota",
        evaluatorName: USER_NAMES[user],
        evaluatorAvatar: USER_AVATARS[user],
      })),
    });
  }

  ["user1", "user2"].forEach((user) => {
    const lowest = findLowestTrackByUser(albums, user);
    if (!lowest) return;

    badges.push({
      type: user === "user1" ? "lowest_track_user1" : "lowest_track_user2",
      title: lowest.trackTitle,
      subtitle: `${lowest.album.name} - ${lowest.album.artist}`,
      cover: lowest.album.cover,
      color: lowest.album.primaryColor,
      metric: lowest.rate.toFixed(1),
      metricLabel: "nota",
    });
  });

  return badges;
}

export { USER_NAMES };
