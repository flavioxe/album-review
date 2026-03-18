import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { ref, set } from "firebase/database";
import { database } from "../../firebase";
import { extractDominantColor } from "../../utils/extractColor";

import "./SpotifyAlbumModal.scss";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("pt-BR");
}

function formatDuration(ms) {
  const totalSeconds = Math.floor((ms || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function SpotifyAlbumModal({ album, onClose, onImported }) {
  const [genre, setGenre] = useState("");
  const [headerColor, setHeaderColor] = useState("#1a1a1a");
  const [isLoadingColor, setIsLoadingColor] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const tracks = useMemo(() => album?.tracks || [], [album]);
  const portalElement = useMemo(() => {
    const element = document.createElement("div");
    element.className = "spotify-modal-portal";
    return element;
  }, []);

  useEffect(() => {
    document.body.appendChild(portalElement);

    return () => {
      document.body.removeChild(portalElement);
    };
  }, [portalElement]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const previousStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    };

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previousStyles.overflow;
      document.body.style.position = previousStyles.position;
      document.body.style.top = previousStyles.top;
      document.body.style.left = previousStyles.left;
      document.body.style.right = previousStyles.right;
      document.body.style.width = previousStyles.width;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadColor = async () => {
      setIsLoadingColor(true);
      const color = await extractDominantColor(album?.coverUrl || "");
      if (!isMounted) return;
      setHeaderColor(color || "#1a1a1a");
      setIsLoadingColor(false);
    };

    loadColor();

    return () => {
      isMounted = false;
    };
  }, [album]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const dominantColor = await extractDominantColor(album.coverUrl);
      const id = Date.now();

      const newAlbum = {
        id,
        name: album.name,
        artist: album.artistName,
        releaseDate: album.releaseDate,
        primaryColor: dominantColor || "#1a1a1a",
        cover: album.coverUrl,
        genre,
        tracks: tracks.map((track) => ({
          title: track.titulo,
          ratings: { user1: null, user2: null },
        })),
        bestNewTrack: {
          user1: null,
          user2: null,
        },
      };

      const albumRef = ref(database, `albums/${id}`);
      await set(albumRef, newAlbum);

      onImported();
      setIsSaving(false);
      onClose();
    } catch (err) {
      setError(err.message || "Falha ao importar album.");
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div className="spotify-modal-overlay" onClick={onClose}>
      <div className="spotify-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="spotify-modal-close"
          onClick={onClose}
          aria-label="Fechar modal"
          disabled={isSaving}
        >
          ×
        </button>

        <div className="spotify-modal-shell">
          <div
            className="spotify-modal-header"
            style={{ backgroundColor: isLoadingColor ? "#1a1a1a" : headerColor }}
          >
            {isLoadingColor ? (
              <small className="spotify-modal-header-loader">Carregando cor...</small>
            ) : null}

            <img src={album.coverUrl} alt={`${album.name} cover`} className="spotify-modal-cover" />

            <div className="spotify-modal-headings">
              <h3 className="text-left">
                <strong>{album.name}</strong>
              </h3>
              <h6>{album.artistName}</h6>
            </div>
          </div>

          <div className="spotify-modal-body">
            <div className="spotify-modal-meta w-100">
              <small>
                Lançamento: <strong>{formatDate(album.releaseDate)}</strong>
              </small>

              <div className="d-flex flex-column align-items-start gap-1 w-100 mt-3">
                <label htmlFor="spotifyGenre">Genero musical</label>
                <input
                  id="spotifyGenre"
                  type="text"
                  placeholder="Genero musical (opcional)"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-100"
                />
              </div>
            </div>

            <div className="spotify-tracks-scroll mt-3 w-100">
              <div className="spotify-tracks-list">
                {tracks.map((track, index) => (
                  <div className="spotify-track-row" key={`${track.titulo}-${index}`}>
                    <small className="spotify-track-title">
                      <strong>{index + 1}. {track.titulo}</strong>
                    </small>
                    <small>{formatDuration(track.duracaoMs)}</small>
                  </div>
                ))}
              </div>
            </div>

            {error ? <small className="color-danger mt-2">{error}</small> : null}
          </div>

          <div className="spotify-modal-footer">
            <button type="button" className="button-outline w-50" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="button" className="button-primary w-50" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <span className="spotify-submit-loader" aria-label="Salvando" /> : "Adicionar a plataforma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalElement);
}

SpotifyAlbumModal.propTypes = {
  album: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    artistName: PropTypes.string.isRequired,
    releaseDate: PropTypes.string,
    coverUrl: PropTypes.string,
    tracks: PropTypes.arrayOf(
      PropTypes.shape({
        titulo: PropTypes.string.isRequired,
        duracaoMs: PropTypes.number,
      }),
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onImported: PropTypes.func.isRequired,
};
