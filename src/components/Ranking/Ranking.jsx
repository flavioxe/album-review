import React from "react";
import PropTypes from "prop-types";
import RankingCard from "../RankingCard/RankingCard";

export default function Ranking({ albums }) {
  const albumsOfThisYear = albums.filter((album) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return new Date(album.releaseDate).getFullYear() === currentYear;
  });

  // Função para calcular a média de cada álbum
  const calculateAverage = (album) => {
    if (
      !album.ratings ||
      !Array.isArray(album.ratings.user1) ||
      !Array.isArray(album.ratings.user2)
    ) {
      return "N/A"; // Sem notas válidas
    }

    const user1Ratings = album.ratings.user1
      .map((r) => (r ? r.rate : null))
      .filter((rate) => typeof rate === "number");
    const user2Ratings = album.ratings.user2
      .map((r) => (r ? r.rate : null))
      .filter((rate) => typeof rate === "number");

    // Exigir que ambos os usuários tenham avaliado (ao menos uma faixa)
    if (user1Ratings.length === 0 || user2Ratings.length === 0) {
      return "N/A";
    }

    const totalRatings = [...user1Ratings, ...user2Ratings];
    const count = totalRatings.length;
    if (count === 0) return "N/A"; // Nenhuma nota atribuída

    const total = totalRatings.reduce((acc, rating) => acc + rating, 0);
    return (total / count).toFixed(2); // Duas casas decimais
  };

  // Calcular médias para todos os álbuns
  const albumsWithAverages = albumsOfThisYear.map((album) => ({
    ...album,
    average: calculateAverage(album), // Chamar a função para calcular a média
  }));

  // Ordenar álbuns pela média em ordem decrescente e pegar os 5 primeiros
  const topAlbums = albumsWithAverages
    .filter((album) => album.average !== "N/A") // Filtrar álbuns com ao menos uma nota
    .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
    .slice(0, 5);

  return (
    <section className="w-100">
      <div className="d-flex align-items-center justify-content-between mb-4 w-100">
        <h6>Best New</h6>
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
