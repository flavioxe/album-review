import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle, Circle } from "phosphor-react";
import useSpotifySearch from "../../hooks/useSpotifySearch";
import { getAlbumDetails } from "../../services/spotifyService";
import { extractDominantColor } from "../../utils/extractColor";

import "./SpotifyAlbumSync.scss";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("pt-BR");
}

export default function SpotifyAlbumSync({ current, onApply, onCancel }) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    hasMore,
    loadMore,
    search,
  } = useSpotifySearch();

  const [spotifyAlbum, setSpotifyAlbum] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [suggestedColor, setSuggestedColor] = useState(null);

  const [selectedFields, setSelectedFields] = useState({
    name: true,
    artist: true,
    cover: true,
    releaseDate: true,
    primaryColor: true,
  });

  useEffect(() => {
    if (!spotifyAlbum?.coverUrl) {
      setSuggestedColor(null);
      return;
    }

    let isMounted = true;
    extractDominantColor(spotifyAlbum.coverUrl).then((color) => {
      if (isMounted) setSuggestedColor(color);
    });

    return () => {
      isMounted = false;
    };
  }, [spotifyAlbum]);

  const handleManualSearch = async () => {
    await search(query);
  };

  const handleSelectAlbum = async (spotifyId) => {
    setIsLoadingDetails(true);
    setDetailsError(null);

    try {
      const album = await getAlbumDetails(spotifyId);
      setSpotifyAlbum(album);
    } catch (err) {
      setDetailsError(err.message || "Erro ao carregar detalhes do album.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const toggleField = (field) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const hasAnyFieldSelected = Object.values(selectedFields).some(Boolean);

  const handleApply = () => {
    if (!spotifyAlbum) return;

    const fields = {};
    if (selectedFields.name) fields.name = spotifyAlbum.name;
    if (selectedFields.artist) fields.artist = spotifyAlbum.artistName;
    if (selectedFields.cover) fields.cover = spotifyAlbum.coverUrl;
    if (selectedFields.releaseDate)
      fields.releaseDate = spotifyAlbum.releaseDate;
    if (selectedFields.primaryColor && suggestedColor)
      fields.primaryColor = suggestedColor;

    onApply(fields);
  };

  const FIELD_OPTIONS = [
    {
      key: "name",
      label: "Título da obra",
      current: current.name,
      next: spotifyAlbum?.name,
    },
    {
      key: "artist",
      label: "Artista",
      current: current.artist,
      next: spotifyAlbum?.artistName,
    },
    {
      key: "releaseDate",
      label: "Data de lançamento",
      current: formatDate(current.releaseDate),
      next: formatDate(spotifyAlbum?.releaseDate),
    },
  ];

  return (
    <section className="spotify-sync-wrapper w-100">
      <h6 className="text-left mb-2">Sincronizar com o Spotify</h6>
      <small className="text-left d-block mb-2 spotify-sync-hint">
        A tracklist não é alterada por aqui — apenas título, artista, capa,
        data de lançamento e cor principal.
      </small>

      <div className="spotify-sync-controls">
        <input
          type="text"
          placeholder="Buscar album no Spotify..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-100 mb-2"
        />

        <button
          type="button"
          className="button-secondary"
          onClick={handleManualSearch}
        >
          Pesquisar no Spotify
        </button>

        <button type="button" className="button-outline" onClick={onCancel}>
          Fechar
        </button>
      </div>

      {isLoading ? <small className="mt-2">Buscando albuns...</small> : null}
      {isLoadingDetails ? (
        <small className="mt-2">Carregando detalhes do album...</small>
      ) : null}
      {error ? <small className="color-danger mt-2">{error}</small> : null}
      {detailsError ? (
        <small className="color-danger mt-2">{detailsError}</small>
      ) : null}

      {!spotifyAlbum && results.length > 0 ? (
        <div className="spotify-sync-results-grid mt-3">
          {results.map((album) => (
            <button
              key={album.id}
              type="button"
              className="spotify-sync-result-card"
              onClick={() => handleSelectAlbum(album.id)}
            >
              <img
                src={album.coverUrl}
                alt={`${album.name} capa`}
                className="spotify-sync-result-cover"
              />
              <div className="spotify-sync-result-texts">
                <p className="spotify-sync-result-title mb-0" title={album.name}>
                  <strong>{album.name}</strong>
                </p>
                <small
                  className="spotify-sync-result-artist"
                  title={album.artistName}
                >
                  {album.artistName}
                </small>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {!spotifyAlbum && hasMore && results.length > 0 ? (
        <button
          type="button"
          className="button-secondary mt-3"
          onClick={loadMore}
          disabled={isLoading}
        >
          Exibir mais
        </button>
      ) : null}

      {spotifyAlbum ? (
        <div className="spotify-sync-preview mt-3 w-100">
          <div className="d-flex align-items-center gap-3 w-100">
            <img
              src={spotifyAlbum.coverUrl}
              alt={spotifyAlbum.name}
              className="spotify-sync-preview-cover"
            />
            <div className="text-left">
              <p className="mb-0">
                <strong>{spotifyAlbum.name}</strong>
              </p>
              <small>{spotifyAlbum.artistName}</small>
            </div>
          </div>

          <div className="spotify-sync-fields mt-3 w-100">
            {FIELD_OPTIONS.map((field) => (
              <button
                type="button"
                key={field.key}
                className="spotify-sync-field-row"
                onClick={() => toggleField(field.key)}
              >
                {selectedFields[field.key] ? (
                  <CheckCircle size={20} weight="fill" color="#1A8F4C" />
                ) : (
                  <Circle size={20} color="#767676" />
                )}
                <div className="text-left spotify-sync-field-info">
                  <small className="spotify-sync-field-label">
                    {field.label}
                  </small>
                  <p className="mb-0">
                    <span className="spotify-sync-field-current">
                      {field.current || "-"}
                    </span>
                    {" -> "}
                    <span className="spotify-sync-field-next">
                      {field.next || "-"}
                    </span>
                  </p>
                </div>
              </button>
            ))}

            <button
              type="button"
              className="spotify-sync-field-row"
              onClick={() => toggleField("cover")}
            >
              {selectedFields.cover ? (
                <CheckCircle size={20} weight="fill" color="#1A8F4C" />
              ) : (
                <Circle size={20} color="#767676" />
              )}
              <div className="text-left spotify-sync-field-info">
                <small className="spotify-sync-field-label">Capa</small>
                <div className="d-flex align-items-center gap-2 mt-1">
                  {current.cover ? (
                    <img
                      src={current.cover}
                      alt="Capa atual"
                      className="spotify-sync-field-cover"
                    />
                  ) : null}
                  <span>{"->"}</span>
                  <img
                    src={spotifyAlbum.coverUrl}
                    alt="Nova capa"
                    className="spotify-sync-field-cover"
                  />
                </div>
              </div>
            </button>

            <button
              type="button"
              className="spotify-sync-field-row"
              onClick={() => toggleField("primaryColor")}
              disabled={!suggestedColor}
            >
              {selectedFields.primaryColor ? (
                <CheckCircle size={20} weight="fill" color="#1A8F4C" />
              ) : (
                <Circle size={20} color="#767676" />
              )}
              <div className="text-left spotify-sync-field-info">
                <small className="spotify-sync-field-label">
                  Cor principal (extraída da nova capa)
                </small>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span
                    className="spotify-sync-color-swatch"
                    style={{ backgroundColor: current.primaryColor }}
                  />
                  <span>{"->"}</span>
                  {suggestedColor ? (
                    <span
                      className="spotify-sync-color-swatch"
                      style={{ backgroundColor: suggestedColor }}
                    />
                  ) : (
                    <small>calculando...</small>
                  )}
                </div>
              </div>
            </button>
          </div>

          <div className="d-flex gap-2 mt-3 w-100">
            <button
              type="button"
              className="button-outline w-50"
              onClick={() => setSpotifyAlbum(null)}
            >
              Escolher outro
            </button>
            <button
              type="button"
              className="button-primary w-50"
              onClick={handleApply}
              disabled={!hasAnyFieldSelected}
            >
              Aplicar selecionados
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

SpotifyAlbumSync.propTypes = {
  current: PropTypes.shape({
    name: PropTypes.string,
    artist: PropTypes.string,
    releaseDate: PropTypes.string,
    cover: PropTypes.string,
    primaryColor: PropTypes.string,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
