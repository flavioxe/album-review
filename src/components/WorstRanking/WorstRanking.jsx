import React from "react";
import PropTypes from "prop-types";
import RankingCard from "../RankingCard/RankingCard";

export default function WorstRanking({ albums }) {
  const albumsOfThisYear = albums.filter((album) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return new Date(album.releaseDate).getFullYear() === currentYear;
  });

  // Função para calcular a média de cada álbum
  const calculateAverage = (album) => {
    if (!album.ratings || !album.ratings.user1 || !album.ratings.user2) {
      return "N/A"; // Retornar N/A se não houver ratings
    }

    const user1Ratings = album.ratings.user1
      .filter((r) => r.rate !== null && r.rate !== undefined)
      .map((r) => r.rate);

    const user2Ratings = album.ratings.user2
      .filter((r) => r.rate !== null && r.rate !== undefined)
      .map((r) => r.rate);

    // Verificar se ambos os usuários avaliaram o álbum
    if (user1Ratings.length === 0 || user2Ratings.length === 0) {
      return "N/A";
    }

    const totalRatings = [...user1Ratings, ...user2Ratings];
    const total = totalRatings.reduce((acc, rating) => acc + rating, 0);
    const count = totalRatings.length;

    // Se não houver notas, retornar N/A
    return count > 0 ? (total / count).toFixed(2) : "N/A"; // Duas casas decimais
  };

  // Calcular médias para todos os álbuns
  const albumsWithAverages = albumsOfThisYear.map((album) => ({
    ...album,
    average: calculateAverage(album), // Chamar a função para calcular a média
  }));

  // Ordenar álbuns pela média em ordem crescente e pegar os 5 primeiros
  const worstAlbums = albumsWithAverages
    .filter((album) => album.average !== "N/A") // Filtrar apenas álbuns avaliados por ambos os usuários
    .sort((a, b) => parseFloat(a.average) - parseFloat(b.average))
    .slice(0, 5);

  return (
    <section className="w-100">
      <div className="d-flex align-items-center justify-content-between mb-4 w-100">
        <h6>Os piorais</h6>
      </div>

      <div className="">
        {worstAlbums.map((album, index) => (
          <div key={album.id}>
            <RankingCard album={album} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}

WorstRanking.propTypes = {
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
