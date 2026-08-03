import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { House } from "phosphor-react";

import AlbumCard from "../components/AlbumCard/AlbumCard";
import DivisionMark from "../components/DivisionMark/DivisionMark";
import CommentsCarousel from "../components/CommentsCarousel/CommentsCarousel";
import { navigateBack } from "../utils/navigation";
import {
  findAlbumsByArtistSlug,
  getOrFetchArtistInfo,
  getArtistAggregateRating,
  getArtistAggregateByUser,
  getArtistTopTracks,
  getMostRecentAlbum,
  sortAlbumsByReleaseDateDesc,
} from "../services/artistService";

import ducardo from "../assets/ducardo.png";
import flavioxe from "../assets/flavioxe.png";
import { getRatingColorClass } from "../utils/ratingColor";
import { extractDominantColor } from "../utils/extractColor";
import { getContrastTextColor } from "../utils/textContrast";
import ArtistProfileSkeleton from "./ArtistProfileSkeleton";

import "../styles/ArtistProfile.scss";

const TOP_TRACKS_PAGE_SIZE = 10;
const DEFAULT_BANNER_COLOR = "#1a1a1a";

export default function ArtistProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [allAlbums, setAllAlbums] = useState(null);
  const [artistInfo, setArtistInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [bannerColor, setBannerColor] = useState(DEFAULT_BANNER_COLOR);

  const database = getDatabase();
  const bannerTextColor = getContrastTextColor(bannerColor);
  const bannerTextShadow =
    bannerTextColor === "#ffffff"
      ? "0 2px 16px rgba(0, 0, 0, 0.85)"
      : "0 2px 16px rgba(255, 255, 255, 0.7)";

  useEffect(() => {
    const albumsRef = ref(database, "albums");
    const unsubscribe = onValue(albumsRef, (snapshot) => {
      const data = snapshot.val();
      const albumsArray = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setAllAlbums(albumsArray);
    });

    return () => unsubscribe();
  }, [database]);

  const artistAlbums = allAlbums ? findAlbumsByArtistSlug(allAlbums, slug) : [];
  const displayName = artistAlbums[0]?.artist || "";
  const sortedAlbums = sortAlbumsByReleaseDateDesc(artistAlbums);

  useEffect(() => {
    if (!displayName) return;

    let cancelled = false;
    setInfoLoading(true);

    getOrFetchArtistInfo(displayName)
      .then((info) => {
        if (!cancelled) setArtistInfo(info);
      })
      .catch((error) => {
        console.error("Erro ao buscar informacoes do artista:", error);
      })
      .finally(() => {
        if (!cancelled) setInfoLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [displayName]);

  useEffect(() => {
    if (!artistInfo?.imageUrl) {
      setBannerColor(DEFAULT_BANNER_COLOR);
      return;
    }

    let cancelled = false;

    extractDominantColor(artistInfo.imageUrl).then((color) => {
      if (!cancelled) setBannerColor(color);
    });

    return () => {
      cancelled = true;
    };
  }, [artistInfo?.imageUrl]);

  if (allAlbums === null) {
    return <ArtistProfileSkeleton />;
  }

  if (!artistAlbums.length) {
    return (
      <section className="d-flex flex-column align-items-start gap-3 w-100">
        <p>Nenhum álbum encontrado para esse artista.</p>
      </section>
    );
  }

  const aggregateRating = getArtistAggregateRating(artistAlbums);
  const perUserRating = getArtistAggregateByUser(artistAlbums);
  const mostRecentAlbum = getMostRecentAlbum(artistAlbums);
  const topTracks = getArtistTopTracks(artistAlbums);
  const visibleTracks = showAllTracks
    ? topTracks
    : topTracks.slice(0, TOP_TRACKS_PAGE_SIZE);

  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100 artist-profile">
      <div
        className="artist-banner"
        style={{
          backgroundColor: bannerColor,
          color: bannerTextColor,
          "--banner-text-color": bannerTextColor,
          "--banner-text-shadow": bannerTextShadow,
        }}
      >
        <div className="artist-banner-nav">
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
                fill={bannerTextColor}
              />
            </svg>
            Voltar
          </button>

          <button
            onClick={() => navigate("/")}
            className="d-flex align-items-center gap-2 back-button"
          >
            <House size={14} weight="bold" color={bannerTextColor} />
            Home
          </button>
        </div>

        <div className="artist-banner-body">
          <div className="artist-banner-info">
            <h1 className="artist-name">{displayName}</h1>

            {mostRecentAlbum && (
              <div className="artist-latest-release">
                <small>Último lançamento</small>
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={mostRecentAlbum.cover}
                    alt={mostRecentAlbum.name}
                    className="artist-latest-release-cover"
                  />
                  <div className="d-flex flex-column align-items-start">
                    <p className="mb-0">
                      <strong>{mostRecentAlbum.name}</strong>
                    </p>
                    <small>
                      {new Date(
                        mostRecentAlbum.releaseDate,
                      ).toLocaleDateString("pt-BR")}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {infoLoading ? (
            <div className="artist-banner-image-skeleton skeleton" />
          ) : (
            artistInfo?.imageUrl && (
              <img
                src={artistInfo.imageUrl}
                alt={displayName}
                className="artist-banner-image"
              />
            )
          )}
        </div>

        {aggregateRating !== null && (
          <div className="artist-banner-rating">
            <small>Nota geral</small>
            <strong>{aggregateRating.toFixed(1)}</strong>
          </div>
        )}
      </div>

      <div className="artist-content d-flex flex-column align-items-start gap-3 w-100">
        <div className="artist-two-columns w-100">
          <div className="artist-bio-column">
            {infoLoading ? (
              <div className="artist-bio-skeleton">
                <div className="skeleton line" style={{ width: "100%" }} />
                <div className="skeleton line" style={{ width: "95%" }} />
                <div className="skeleton line" style={{ width: "70%" }} />
              </div>
            ) : (
              artistInfo?.bio && (
                <p className="artist-bio text-left">{artistInfo.bio}</p>
              )
            )}
          </div>

          <div className="artist-rating-column">
            <h6>
              <strong>Médias por usuário</strong>
            </h6>
            <div className="artist-per-user-rating d-flex align-items-center gap-4">
              <div className="d-flex align-items-center gap-2">
                <img src={ducardo} alt="Ducardo avatar" />
                <strong className={getRatingColorClass(perUserRating.user1)}>
                  {perUserRating.user1 !== null
                    ? perUserRating.user1.toFixed(1)
                    : "-"}
                </strong>
              </div>
              <div className="d-flex align-items-center gap-2">
                <img src={flavioxe} alt="Flavioxe avatar" />
                <strong className={getRatingColorClass(perUserRating.user2)}>
                  {perUserRating.user2 !== null
                    ? perUserRating.user2.toFixed(1)
                    : "-"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <DivisionMark />

        {topTracks.length > 0 && (
          <>
            <h6 className="d-flex align-items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12.616L12.944 15.6L11.632 9.97602L16 6.19202L10.248 5.70402L8 0.400024L5.752 5.70402L0 6.19202L4.368 9.97602L3.056 15.6L8 12.616Z"
                  fill="#BD2626"
                />
              </svg>
              <strong>Top tracks</strong>
            </h6>
            <div className="top-tracks-list w-100">
              {visibleTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="d-flex gap-2 top-track-row w-100"
                >
                  <small className="track-position">{index + 1}</small>
                  <img
                    src={track.albumCover}
                    alt={track.albumName}
                    className="track-album-cover"
                  />
                  <div className="d-flex flex-column align-items-start flex-grow-1 top-track-info mb-0 mt-1">
                    <small>
                      <strong>{track.trackName}</strong>
                    </small>
                    <small className="text-secondary">{track.albumName}</small>
                    <div className="d-flex align-items-center gap-2 top-track-meta">
                      {track.rating !== null && (
                        <small className={getRatingColorClass(track.rating)}>
                          <strong>{track.rating.toFixed(1)}</strong>
                        </small>
                      )}
                      <small className="text-secondary">{track.userLabel}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {topTracks.length > TOP_TRACKS_PAGE_SIZE && (
              <button
                className="button-outline"
                onClick={() => setShowAllTracks((prev) => !prev)}
              >
                {showAllTracks ? "Ver menos" : "Ver mais"}
              </button>
            )}

            <DivisionMark />
          </>
        )}

        <h6>
          <strong>Álbuns</strong>
        </h6>
        <div className="album-grid w-100">
          {sortedAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>

        <DivisionMark />

        <h6>
          <strong>Comentários</strong>
        </h6>
        <CommentsCarousel albums={artistAlbums} />
      </div>
    </section>
  );
}
