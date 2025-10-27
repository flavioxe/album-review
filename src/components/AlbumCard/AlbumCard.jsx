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

  const getOverallAverage = () => {
    const u1 = parseFloat(album?.averages?.user1);
    const u2 = parseFloat(album?.averages?.user2);
    if (isNaN(u1) || isNaN(u2)) return null; // exige médias dos dois usuários
    return (u1 + u2) / 2;
  };

  const setAverageColor = (average) => {
    let color = "text-secondary";

    if (average !== "N/A") {
      if (parseFloat(average) >= 7) {
        color = "text-success";
      } else if (parseFloat(average) >= 5) {
        color = "text-warning";
      } else {
        color = "text-danger";
      }
    }

    return (
      <small className={color}>
        <strong>{average}</strong>
      </small>
    );
  };

  return (
    <div
      className="d-flex flex-column align-items-start gap-2 album-card"
      onClick={handleClick}
    >
      {getOverallAverage() !== null && getOverallAverage() >= 8.5 && (
        <img
          src="/CARIMBA.png"
          alt="Selo CARIMBA"
          className="carimba-stamp-absolute"
        />
      )}
      <div>
        <p className="text-limit">
          <strong className="text-limit">{album.name}</strong>
        </p>
        <small className="text-limit">{album.artist}</small>
      </div>

      <img
        src={album.cover}
        alt={`${album.name} - Capa`}
        className="album-cover"
      />

      <div className="album-card-footer">
        <div className="d-flex align-items-center gap-2 mb-0">
          <img src={ducardo} alt="Ducardo avatar" />
          <small>
            {album.averages ? setAverageColor(album.averages.user1) : "-"}{" "}
          </small>
        </div>

        <div className="d-flex align-items-center gap-2 mb-0">
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
