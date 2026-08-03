import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import HeaderPages from "../components/HeaderPages/HeaderPages";
import AlbumHeader from "../components/AlbumHeader/AlbumHeader";
import DivisionMark from "../components/DivisionMark/DivisionMark";
import { getAlbumCredits } from "../services/discogsService";

import "../styles/AlbumReview.scss";

export default function AlbumReview() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [ratings, setRatings] = useState({ user1: {}, user2: {} });
  const [averages, setAverages] = useState({ user1: "", user2: "" });
  const [bestNewTracks, setBestNewTracks] = useState({ user1: "", user2: "" });
  const [comments, setComments] = useState({ user1: "", user2: "" });
  const [credits, setCredits] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const database = getDatabase();

  const setAverageColor = (average) => {
    let color = "text-secondary";

    if (average !== "N/A" && average !== "-") {
      if (parseFloat(average) >= 7) {
        color = "text-success";
      } else if (parseFloat(average) >= 5) {
        color = "text-warning";
      } else {
        color = "text-danger";
      }
    }

    return (
      <span className={color}>
        <strong>{average}</strong>
      </span>
    );
  };

  useEffect(() => {
    const albumRef = ref(database, `albums/${id}`);
    onValue(albumRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAlbum(data);
        setRatings(data.ratings || { user1: {}, user2: {} });
        setAverages(data.averages || { user1: "", user2: "" });
        setBestNewTracks(data.bestNewTracks || { user1: "", user2: "" });
        setComments(data.comments || { user1: "", user2: "" });
      }
    });
  }, [id, database]);

  useEffect(() => {
    if (!album?.artist || !album?.name) return;

    let cancelled = false;
    setCreditsLoading(true);

    getAlbumCredits(album.artist, album.name)
      .then((data) => {
        if (!cancelled) setCredits(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar creditos do album:", error);
      })
      .finally(() => {
        if (!cancelled) setCreditsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [album?.artist, album?.name]);

  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100">
      {album ? (
        <AlbumHeader album={album} pageTitle="Detalhes da obra" />
      ) : (
        <>
          <HeaderPages text="Detalhes da obra" />
          <p>Carregando álbum...</p>
        </>
      )}

      <div className="box-album-details w-100">
        <div className="table-row">
          <small className="table-cell text-left track-name">
            <strong>Tracklist</strong>
          </small>
          <small className="table-cell text-center">Ducardo</small>
          <small className="table-cell text-center">Flavioxe</small>
        </div>

        {album?.tracks.map((track, index) => (
          <div className="table-row" key={index}>
            <small className="table-cell text-left track-name">
              <strong>{track.title}</strong>
            </small>
            <small className={`table-cell text-center ${album.ratings && album?.ratings.user1[index]?.rate ? 
              (album?.ratings.user1[index]?.rate >= 7 ? "text-success" : 
               album?.ratings.user1[index]?.rate >= 5 ? "text-warning" : "text-danger") : ""}`}>
              {album.ratings ? album?.ratings.user1[index]?.rate : "-"}
            </small>
            <small className={`table-cell text-center ${album.ratings && album?.ratings.user2[index]?.rate ? 
              (album?.ratings.user2[index]?.rate >= 7 ? "text-success" : 
               album?.ratings.user2[index]?.rate >= 5 ? "text-warning" : "text-danger") : ""}`}>
              {album.ratings ? album?.ratings.user2[index]?.rate : "-"}
            </small>
          </div>
        ))}

        <div className="table-row">
          <small className="table-cell text-left color-primary track-name">
            <strong>Média geral</strong>
          </small>
          <small className="table-cell text-center">
            <strong>{setAverageColor(averages.user1 || "-")}</strong>
          </small>
          <small className="table-cell text-center">
            <strong>{setAverageColor(averages.user2 || "-")}</strong>
          </small>
        </div>

        <DivisionMark />

        <div className="d-flex align-items-center gap-3 mb-3">
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
          <h6 className="text-left">
            <strong>Best new track</strong>
          </h6>
        </div>

        <section className="d-flex flex-column align-items-start gap-3 w-100">
          <div className="d-flex align-items-center justify-content-between w-100">
            <small>
              <strong>Ducardo</strong>
            </small>
            <small>{bestNewTracks.user1 || "-"}</small>
          </div>
          <div className="d-flex align-items-center justify-content-between w-100">
            <small>
              <strong>Flavioxe</strong>
            </small>
            <small>{bestNewTracks.user2 || "-"}</small>
          </div>
        </section>
        <DivisionMark />

        <div className="d-flex align-items-center gap-3 mb-3">
          <h6 className="text-left">
            <strong>Comentários</strong>
          </h6>
        </div>

        <section className="d-flex flex-column align-items-start gap-3 w-100">
          <div className="d-flex flex-column align-items-start gap-2 justify-content-between w-100">
            <small>
              <strong>Ducardo</strong>
            </small>
            <small className="text-left">{comments.user1 || "-"}</small>
          </div>
          <div className="d-flex flex-column align-items-start gap-2 justify-content-between w-100">
            <small>
              <strong>Flavioxe</strong>
            </small>
            <small className="text-left">{comments.user2 || "-"}</small>
          </div>
        </section>

        {(creditsLoading || credits) && (
          <>
            <DivisionMark />

            <div className="d-flex align-items-center gap-3 mb-3">
              <h6 className="text-left">
                <strong>Créditos</strong>
              </h6>
            </div>

            {creditsLoading && <p>Carregando créditos...</p>}

            {!creditsLoading && credits && (
              <section className="d-flex flex-column align-items-start gap-2 w-100">
                {credits.albumCredits?.length > 0 ? (
                  credits.albumCredits.map((credit, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center justify-content-between w-100"
                    >
                      <small>{credit.name}</small>
                      <small className="text-secondary">{credit.role}</small>
                    </div>
                  ))
                ) : (
                  <small>Nenhum crédito encontrado para este álbum.</small>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </section>
  );
}
