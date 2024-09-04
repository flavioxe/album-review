import React from "react";
import PropTypes from "prop-types";
import RankingCard from "../RankingCard/RankingCard";

export default function Ranking({ albums }) {
  // Função para calcular a média de cada álbum
  const calculateAverage = (album) => {
    if (!album.ratings || !album.ratings.user1 || !album.ratings.user2) {
      return 0; // Considerar média como 0 se não houver ratings
    }

    const user1Ratings = album.ratings.user1
      .map((r) => r.rate || 0) // Considera 0 se a nota for nula
      .filter((rate) => rate !== null); // Filtrar apenas as notas não nulas
    const user2Ratings = album.ratings.user2
      .map((r) => r.rate || 0) // Considera 0 se a nota for nula
      .filter((rate) => rate !== null); // Filtrar apenas as notas não nulas

    const totalRatings = [...user1Ratings, ...user2Ratings];
    const total = totalRatings.reduce((acc, rating) => acc + rating, 0);
    const count = totalRatings.length;

    // Se não houver notas, considerar a média como 0
    return count > 0 ? (total / count).toFixed(2) : 0; // Duas casas decimais
  };

  // Calcular médias para todos os álbuns
  const albumsWithAverages = albums.map((album) => ({
    ...album,
    average: calculateAverage(album), // Chamar a função para calcular a média
  }));

  // Ordenar álbuns pela média em ordem decrescente e pegar os 5 primeiros
  const topAlbums = albumsWithAverages
    .filter((album) => album.average !== "N/A") // Filtrar álbuns com média definida
    .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
    .slice(0, 5);

  return (
    <section className="w-100">
      <div className="d-flex align-items-center justify-content-between mb-4 w-100">
        <h6>Ranking</h6>
      </div>

      {topAlbums.map((album, index) => (
        <div key={album.id}>
          <RankingCard album={album} index={index} />
        </div>
      ))}
    </section>
  );
}

Ranking.propTypes = {
  albums: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      artist: PropTypes.string.isRequired,
      ratings: PropTypes.shape({
        user1: PropTypes.arrayOf(
          PropTypes.shape({
            rate: PropTypes.number,
          })
        ).isRequired,
        user2: PropTypes.arrayOf(
          PropTypes.shape({
            rate: PropTypes.number,
          })
        ).isRequired,
      }).isRequired,
    })
  ).isRequired,
};
