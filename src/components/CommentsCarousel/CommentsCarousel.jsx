import React, { useState, useEffect } from "react";
import { CaretLeft, CaretRight, Pause, Play, MusicNote } from "phosphor-react";
import "./CommentsCarousel.scss";

const CommentsCarousel = ({ albums }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Utilitário: calcular cor de texto com bom contraste sobre um fundo
  const getTextColorForBackground = (color) => {
    if (!color) return "#212529";

    // Normaliza hex #RGB ou #RRGGBB
    const normalizeHex = (hex) => {
      if (typeof hex !== "string") return null;
      let h = hex.trim();
      if (!h.startsWith("#")) return null;
      h = h.slice(1);
      if (h.length === 3) {
        h = h
          .split("")
          .map((c) => c + c)
          .join("");
      }
      if (h.length !== 6) return null;
      return `#${h}`;
    };

    const normalized = normalizeHex(color);
    if (!normalized) return "#212529";

    const r = parseInt(normalized.slice(1, 3), 16);
    const g = parseInt(normalized.slice(3, 5), 16);
    const b = parseInt(normalized.slice(5, 7), 16);

    // Luminância relativa
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    // Se fundo é claro, usa texto preto; caso contrário, branco
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  // Função para extrair e formatar comentários dos álbuns
  const extractComments = (albums) => {
    if (!albums || albums.length === 0) return [];

    const comments = [];

    albums.forEach((album) => {
      if (album.comments) {
        // Comentário do user1 (Ducardo)
        if (album.comments.user1 && album.comments.user1.trim()) {
          comments.push({
            id: `${album.id}-user1`,
            text: album.comments.user1,
            userName: "Ducardo",
            userAvatar: "/ducardo.jpg", // Avatar padrão para Ducardo
            albumName: album.name,
            albumCover: album.cover,
            albumReleaseDate: album.releaseDate,
            albumId: album.id,
            primaryColor: album.primaryColor || "#ffffff",
            bestNewTrack:
              album.bestNewTracks &&
              album.bestNewTracks.user1 &&
              String(album.bestNewTracks.user1).trim()
                ? album.bestNewTracks.user1
                : album.bestNewTrack &&
                  album.bestNewTrack.user1 &&
                  String(album.bestNewTrack.user1).trim()
                ? album.bestNewTrack.user1
                : null,
          });
        }

        // Comentário do user2 (Flavioxe)
        if (album.comments.user2 && album.comments.user2.trim()) {
          comments.push({
            id: `${album.id}-user2`,
            text: album.comments.user2,
            userName: "Flavioxe",
            userAvatar: "/flavioxe.jpg", // Avatar padrão para Flavioxe
            albumName: album.name,
              albumCover: album.cover,
              albumReleaseDate: album.releaseDate,
              albumId: album.id,
              primaryColor: album.primaryColor || "#ffffff",
              bestNewTrack:
                album.bestNewTracks &&
                album.bestNewTracks.user2 &&
                String(album.bestNewTracks.user2).trim()
                  ? album.bestNewTracks.user2
                  : album.bestNewTrack &&
                  album.bestNewTrack.user2 &&
                  String(album.bestNewTrack.user2).trim()
                  ? album.bestNewTrack.user2
                  : null,
          });
        }
      }
    });

    // Ordenar por mais recente (releaseDate desc; fallback para id timestamp)
    return comments.sort((a, b) => {
      const da = new Date(a.albumReleaseDate);
      const db = new Date(b.albumReleaseDate);
      const ta = isNaN(da) ? Number(a.albumId) || 0 : da.getTime();
      const tb = isNaN(db) ? Number(b.albumId) || 0 : db.getTime();
      return tb - ta;
    });
  };

  // Extrair comentários dos álbuns
  const allComments = extractComments(albums);

  // Dobrar a quantidade de comentários exibidos
  const displayComments =
    allComments.length > 0 ? [...allComments, ...allComments] : [];

  useEffect(() => {
    if (!isAutoPlay || displayComments.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayComments.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [displayComments.length, isAutoPlay]);

  const nextComment = () => {
    setCurrentIndex((prev) => (prev + 1) % displayComments.length);
    // Reset do timer ao navegar manualmente
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 100);
  };

  const prevComment = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + displayComments.length) % displayComments.length
    );
    // Reset do timer ao navegar manualmente
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 100);
  };

  const goToComment = (index) => {
    setCurrentIndex(index);
    // Reset do timer ao navegar manualmente
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 100);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => !prev);
  };

  if (!allComments || allComments.length === 0) {
    return (
      <div className="comments-carousel">
        <h6>Comentários dos Usuários</h6>
        <div className="no-comments">Nenhum comentário disponível ainda.</div>
      </div>
    );
  }

  const currentComment = displayComments[currentIndex];

  return (
    <div className="comments-carousel text-left mb-5">
      <h6>Reviews avançadas</h6>
      <div className="carousel-container">
        {/* Botão de pause/play */}
        <button
          className="carousel-toggle"
          onClick={toggleAutoPlay}
          title={
            isAutoPlay
              ? "Pausar rotação automática"
              : "Retomar rotação automática"
          }
        >
          {isAutoPlay ? (
            <Pause size={20} color="#007bff" />
          ) : (
            <Play size={20} color="#007bff" />
          )}
        </button>

        {/* Botões de navegação */}
        {displayComments.length > 1 && (
          <>
            <button className="carousel-button prev" onClick={prevComment}>
              <CaretLeft size={20} color="#007bff" />
            </button>
            <button className="carousel-button next" onClick={nextComment}>
              <CaretRight size={20} color="#007bff" />
            </button>
          </>
        )}

        {/* Comentário atual */}
        <div
          className="comment-card"
          style={{
            backgroundColor: currentComment.primaryColor || "#ffffff",
            color: getTextColorForBackground(
              currentComment.primaryColor || "#ffffff"
            ),
          }}
        >
          <div className="album-cover-container">
            <img
              src={currentComment.albumCover}
              alt={currentComment.albumName}
              className="album-cover"
            />
          </div>
          <div className="comment-content text-left">
            <div className="d-flex align-items-center mb-2">
              <img
                src={currentComment.userAvatar || "/carol.png"}
                alt={currentComment.userName}
                className="user-avatar"
                onError={(e) => {
                  e.target.src = "/carol.png";
                }}
              />
              <div className="comment-info">
                <h6>{currentComment.userName}</h6>
                <p>sobre "{currentComment.albumName}"</p>
              </div>
            </div>
            <div className="comment-text">"{currentComment.text}"</div>
            {currentComment.bestNewTrack && (
              <div className="best-new-track">
                <div className="d-flex gap-2">
                  <MusicNote
                    size={16}
                    color={getTextColorForBackground(
                      currentComment.primaryColor || "#ffffff"
                    )}
                  />
                  <span className="label">Best New Track:</span>
                </div>
                <span className="track">{currentComment.bestNewTrack}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dots de navegação */}
      {displayComments.length > 1 && (
        <div className="carousel-dots">
          {displayComments.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToComment(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsCarousel;
