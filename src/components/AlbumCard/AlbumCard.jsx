import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import "./AlbumCard.scss";

import ducardo from "../../assets/ducardo.png";
import flavioxe from "../../assets/flavioxe.png";

export default function AlbumCard({ album }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/album-review/${album.id}`);
  };

  return (
    <div className="d-flex flex-column gap-2 album-card" onClick={handleClick}>
      <div>
        {/* <small className="color-gray">Álbum</small> */}
        <p className="text-limit">
          <strong>{album.name}</strong>
        </p>
        <small className="text-limit">{album.artist}</small>
      </div>

      <img
        src={album.cover}
        alt={`${album.name} - Capa`}
        className="album-cover"
      />

      <div className="album-card-footer">
        <div className="d-flex align-items-center gap-1">
          <img src={ducardo} alt="Ducardo avatar" />
          <small>
            <strong>10</strong>
          </small>
        </div>

        <div className="d-flex align-items-center gap-1">
          <img src={flavioxe} alt="Flavioxe avatar" />
          <small>
            <strong>10</strong>
          </small>
        </div>
      </div>
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
