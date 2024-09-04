import React from "react";
import PropTypes from "prop-types";

import DivisionMark from "../../components/DivisionMark/DivisionMark";

import "./RankingCard.scss";

export default function RankingCard({ album, index }) {
  return (
    <>
      <div className="d-flex align-items-center justify-content-between w-100">
        <div className="d-flex align-items-center gap-3">
          <p className="ranking-index">
            <strong>{index + 1}</strong>
          </p>

          <img
            src={album.cover}
            alt={`${album.name} - Capa`}
            className="ranking-album-cover"
          />

          <div className="d-flex flex-column align-items-start gap-1">
            <p>
              <strong>{album.name}</strong>
            </p>
            <small>{album.artist}</small>
          </div>
        </div>

        <p>
          <strong>{album.average}</strong>{" "}
        </p>
      </div>
      <DivisionMark />
    </>
  );
}

RankingCard.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    cover: PropTypes.string.isRequired,
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
  }).isRequired,
};
