import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { House } from "phosphor-react";

import DivisionMark from "../DivisionMark/DivisionMark";
import { navigateBack } from "../../utils/navigation";

import "./AlbumHeader.scss";

export default function AlbumHeader({ album, pageTitle = "" }) {
  const navigate = useNavigate();

  return (
    <section className="w-100">
      <div
        className="album-hero"
        style={{
          backgroundColor: album.primaryColor || "#1A1A1A",
        }}
      >
        <div className="album-hero-inner">
          <header className="album-hero-topbar d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => navigateBack(navigate)}
                className="d-flex align-items-center gap-2 back-button"
              >
                <svg
                  width="6"
                  height="11"
                  viewBox="0 0 6 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.94692 1.39394L5.04793 0.5L0.0529785 5.5L5.05298 10.5L5.94692 9.60606L1.84086 5.5L5.94692 1.39394Z"
                    fill="#fff"
                  />
                </svg>{" "}
                Voltar
              </button>

              <button
                onClick={() => navigate("/")}
                className="d-flex align-items-center gap-2 back-button"
              >
                <House size={14} weight="bold" color="#fff" />
                Home
              </button>
            </div>

            <p>
              <strong>{pageTitle}</strong>
            </p>
          </header>

          <img
            src={album.cover}
            alt={`${album.name} cover`}
            className="cover-image"
          />
        </div>
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
        <button
          onClick={() => navigate(`/edit-album/${album.id}`)}
          className="button-outline w-50"
        >
          Editar obra
        </button>{" "}
        <button
          onClick={() =>
            navigate(`/rate-album/${album.id}`, { state: { album } })
          }
          className="button-secondary w-50"
          style={{ backgroundColor: album.primaryColor || "#1A1A1A" }}
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
  pageTitle: PropTypes.string,
};
