import PropTypes from "prop-types";
import "../styles/AlbumCard.scss"; // Opcional: para estilos específicos do cartão

export default function AlbumCard({ album }) {
  return (
    <div className="album-card">
      <img
        src={album.cover}
        alt={`${album.name} - Capa`}
        className="album-cover"
      />
      <h3>{album.name}</h3>
      <p>Artista: {album.artist}</p>
      <p>
        Lançamento:{" "}
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
  }).isRequired,
};
