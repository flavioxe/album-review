import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import DivisionMark from "../DivisionMark/DivisionMark";

import "./AlbumHeader.scss";

export default function AlbumHeader({ album }) {
  const navigate = useNavigate();

  return (
    <section className="w-100">
      <div
        className="box-album-header"
        style={{
          backgroundColor: album.primaryColor || "#1A1A1A",
        }}
      >
        <img
          src={album.cover}
          alt={`${album.name} cover`}
          className="cover-image"
        />
      </div>
      <div className="d-flex flex-column align-items-start gap-1 album-details">
        {album && (
          <>
            <h3 className="text-left">
              <strong>{album.name}</strong>
            </h3>
            <h6>{album.artist}</h6>
            <small>
              Lançamento:{" "}
              {new Date(album.releaseDate).toLocaleDateString("pt-BR")}
            </small>
          </>
        )}
      </div>

      <div className="d-flex align-items-center gap-2 mt-4">
        <button onClick={() => navigate(`/edit-album/${album.id}`)} className="button-outline w-50">
          Editar obra
        </button>{" "}
        <button
          onClick={() => navigate(`/rate-album/${album.id}`)}
          className="button-secondary w-50"
        >
          Atribuir notas
        </button>{" "}
      </div>
      <DivisionMark />
    </section>
  );
}

AlbumHeader.propTypes = {
  album: PropTypes.shape({
    cover: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    releaseDate: PropTypes.string.isRequired,
    primaryColor: PropTypes.string,
  }).isRequired,
};
