import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import "./RankingCard.scss";

export default function RankingCardGeneral({ album, index }) {
  const nameRef = useRef(null);
  const artistRef = useRef(null);

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (!isNaN(numRating)) {
      if (numRating >= 7) return "text-success";
      if (numRating >= 5) return "text-warning";
      return "text-danger";
    }
    return "text-secondary";
  };

  const navigate = useNavigate();
  const handleNavigate = () => {
    if (album && album.id) navigate(`/album-review/${album.id}`);
  };
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigate();
    }
  };

  return (
    <>
      <div className="ranking-card-general d-flex flex-column align-items-center">
        <div className="album-inner d-flex flex-column align-items-center gap-2 mb-0">
          <div
            className="cover-wrapper position-relative"
            role="button"
            tabIndex={0}
            onClick={handleNavigate}
            onKeyDown={handleKey}
            aria-label={`Abrir review de ${album.name}`}
          >
            <img
              src={album.cover}
              alt={`${album.name} - Capa`}
              className="ranking-album-cover-general"
            />
            <p className="ranking-index-general">
              <strong>{index + 1}</strong>
            </p>
            <div
              className={`ranking-rating-badge ${getRatingColor(album.average)}`}
            >
              {album.average}
            </div>
          </div>

          <div className="album-meta d-flex flex-column align-items-center gap-1 text-center">
            <p ref={nameRef} className="album-name mb-0 text-limit">
              <strong>{album.name}</strong>
            </p>
            <small ref={artistRef} className="album-artist mb-0 text-limit">
              {album.artist}
            </small>
          </div>
        </div>
      </div>
    </>
  );
}

RankingCardGeneral.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    cover: PropTypes.string.isRequired,
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
  }).isRequired,
};
