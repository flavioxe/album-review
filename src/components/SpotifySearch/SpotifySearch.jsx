import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSpotifySearch from "../../hooks/useSpotifySearch";
import { getAlbumDetails } from "../../services/spotifyService";
import SpotifyAlbumModal from "../SpotifyAlbumModal/SpotifyAlbumModal";

import "./SpotifySearch.scss";

export default function SpotifySearch() {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    hasMore,
    loadMore,
    reset,
    search,
  } = useSpotifySearch();

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const handleManualSearch = async () => {
    await search(query);
  };

  const handleSelectAlbum = async (spotifyId) => {
    setIsLoadingDetails(true);
    setDetailsError(null);

    try {
      const album = await getAlbumDetails(spotifyId);
      setSelectedAlbum(album);
    } catch (err) {
      setDetailsError(err.message || "Erro ao carregar detalhes do album.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleImportedAlbum = () => {
    setToastMessage("Album adicionado com sucesso!");
    setDetailsError(null);
    setSelectedAlbum(null);
    setQuery("");
    reset();

    window.setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  return (
    <section className="spotify-search-wrapper w-100">
        <h6 className="text-left mb-2">Spotify</h6>
      <div className="spotify-search-controls">
        <input
          type="text"
          placeholder="Buscar album no Spotify..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-100 mb-2"
        />

        <button type="button" className="button-secondary" onClick={handleManualSearch}>
          Pesquisar no Spotify
        </button>

        <button type="button" className="button-outline" onClick={() => navigate("/add-album")}>
          Adicionar manualmente
        </button>
      </div>

      {isLoading ? <small className="mt-2">Buscando albuns...</small> : null}
      {isLoadingDetails ? <small className="mt-2">Carregando detalhes do album...</small> : null}
      {error ? <small className="color-danger mt-2">{error}</small> : null}
      {detailsError ? <small className="color-danger mt-2">{detailsError}</small> : null}

      {toastMessage ? <div className="spotify-toast-success">{toastMessage}</div> : null}

      {results.length > 0 ? (
        <div className="spotify-results-grid mt-3">
          {results.map((album) => (
            <button
              key={album.id}
              type="button"
              className="spotify-result-card"
              onClick={() => handleSelectAlbum(album.id)}
            >
              <img src={album.coverUrl} alt={`${album.name} capa`} className="spotify-result-cover" />
              <div className="spotify-result-texts">
                <p className="spotify-result-title mb-0" title={album.name}>
                  <strong>{album.name}</strong>
                </p>
                <small className="spotify-result-artist" title={album.artistName}>
                  {album.artistName}
                </small>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {hasMore && results.length > 0 ? (
        <button
          type="button"
          className="button-secondary mt-3"
          onClick={loadMore}
          disabled={isLoading}
        >
          Exibir mais
        </button>
      ) : null}

      {selectedAlbum ? (
        <SpotifyAlbumModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          onImported={handleImportedAlbum}
        />
      ) : null}
    </section>
  );
}
