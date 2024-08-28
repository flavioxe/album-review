import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/AlbumCard.scss"; // Opcional: para estilos específicos do cartão

export default function AlbumCard({ album }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/album-review/${album.id}`); // Navega para a página de avaliação do álbum
  };

  return (
    <div
      className="album-card"
      onClick={handleClick}
      style={{
        background: `linear-gradient(${album.primaryColor}, ${album.secondaryColor})`, // Degradê com as cores do álbum
      }}
    >
      <img
        src={album.cover}
        alt={`${album.name} - Capa`}
        className="album-cover"
      />
      <h3>{album.name}</h3>
      <p>by {album.artist}</p>
      <p>
        {new Date(album.releaseDate).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

AlbumCard.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    cover: PropTypes.string.isRequired,
    releaseDate: PropTypes.string.isRequired,
    primaryColor: PropTypes.string.isRequired, // Adiciona a prop para a cor primária
    secondaryColor: PropTypes.string.isRequired, // Adiciona a prop para a cor secundária
  }).isRequired,
};
