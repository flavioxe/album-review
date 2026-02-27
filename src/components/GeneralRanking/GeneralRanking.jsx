import React from "react";
import PropTypes from "prop-types";
import RankingCardGeneral from "../RankingCard/RankingCardGeneral";

export default function GeneralRanking({ albums }) {
  const calculateAverage = (album) => {
    if (
      !album.ratings ||
      !Array.isArray(album.ratings.user1) ||
      !Array.isArray(album.ratings.user2)
    ) {
      return "N/A";
    }

    const user1Ratings = album.ratings.user1
      .map((r) => (r ? r.rate : null))
      .filter((rate) => typeof rate === "number");
    const user2Ratings = album.ratings.user2
      .map((r) => (r ? r.rate : null))
      .filter((rate) => typeof rate === "number");

    if (user1Ratings.length === 0 || user2Ratings.length === 0) {
      return "N/A";
    }

    const totalRatings = [...user1Ratings, ...user2Ratings];
    const count = totalRatings.length;
    if (count === 0) return "N/A";

    const total = totalRatings.reduce((acc, rating) => acc + rating, 0);
    return (total / count).toFixed(2);
  };

  const albumsWithAverages = albums.map((album) => ({
    ...album,
    average: calculateAverage(album),
  }));

  const topAlbums = albumsWithAverages
    .filter((album) => album.average !== "N/A")
    .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
    .slice(0, 5);

  return (
    <section className="w-100">
      <div className="d-flex align-items-center justify-content-between mb-4 w-100">
        <h6>Ranking Geral - Todos os anos</h6>
      </div>

      <div className="general-ranking-list d-flex align-items-end w-full justify-content-between">
        {topAlbums.map((album, index) => (
          <div key={album.id} className="general-ranking-item">
            <RankingCardGeneral album={album} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}

GeneralRanking.propTypes = {
  albums: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string,
      artist: PropTypes.string,
      ratings: PropTypes.shape({
        user1: PropTypes.arrayOf(
          PropTypes.shape({
            rate: PropTypes.number,
          }),
        ).isRequired,
        user2: PropTypes.arrayOf(
          PropTypes.shape({
            rate: PropTypes.number,
          }),
        ).isRequired,
      }).isRequired,
    }),
  ).isRequired,
};
