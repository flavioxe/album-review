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

  const setAverageColor = (average) => {
    let color = "color-secondary";

    if (average !== "N/A") {
      if (parseFloat(average) >= 7) {
        color = "color-success";
      } else if (parseFloat(average) >= 5) {
        color = "color-warning";
      } else {
        color = "color-danger";
      }
    }

    return (
      <small className={color}>
        <strong>{average}</strong>
      </small>
    );
  };

  return (
    <div className="d-flex flex-column gap-2 album-card" onClick={handleClick}>
      <div>
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
        <div className="d-flex align-items-center gap-2">
          <img src={ducardo} alt="Ducardo avatar" />
          <small>
            {album.averages ? setAverageColor(album.averages.user1) : "-"}{" "}
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">
          <img src={flavioxe} alt="Flavioxe avatar" />
          <small>
            {album.averages ? setAverageColor(album.averages.user2) : "-"}{" "}
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
    averages: PropTypes.shape({
      user1: PropTypes.string,
      user2: PropTypes.string,
    }),
  }).isRequired,
};
