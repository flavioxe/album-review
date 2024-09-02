import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import HeaderPages from "../components/HeaderPages/HeaderPages";
import AlbumHeader from "../components/AlbumHeader/AlbumHeader";

import "../styles/AlbumReview.scss";

export default function AlbumReview() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [ratings, setRatings] = useState({ user1: {}, user2: {} }); // Armazena as notas por usuário
  const [bestNewTracks, setBestNewTracks] = useState({ user1: "", user2: "" }); // Armazena a melhor faixa nova para cada usuário
  const database = getDatabase();

  useEffect(() => {
    const albumRef = ref(database, `albums/${id}`);
    onValue(albumRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAlbum(data);
        setRatings(data.ratings || { user1: {}, user2: {} }); // Atualiza o estado de ratings
        setBestNewTracks(data.bestNewTracks || { user1: "", user2: "" }); // Atualiza o estado de bestNewTracks
      }
    });
  }, [id, database]);

  const calculateAverage = (user) => {
    const userRatings = Object.values(ratings[user]);
    const total = userRatings.reduce((acc, rating) => acc + (rating || 0), 0);
    const count = userRatings.filter((rating) => rating !== null).length;
    return count > 0 ? (total / count).toFixed(1) : "N/A";
  };

  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100">
      <HeaderPages text="Detalhes da obra" />
      {album ? <AlbumHeader album={album} /> : <p>Carregando álbum...</p>}

      <div className="box-album-details w-100">
        <div className="table">
          <div className="table-header">
            <div className="table-row">
              <div className="table-cell">Tracklist</div>
              <div className="table-cell text-center">Ducardo</div>
              <div className="table-cell text-center">Flavioxe</div>
            </div>
          </div>
          <div className="table-body">
            {album?.tracks.map((track, index) => (
              <div className="table-row" key={index}>
                <div className="table-cell">{track.title}</div>
                <div className="table-cell text-center">
                  {album?.ratings.user1[index]?.rate || "N/A"}
                </div>
                <div className="table-cell text-center">
                  {album?.ratings.user2[index]?.rate || "N/A"}
                </div>
              </div>
            ))}
            <div className="table-row">
              <div className="table-cell color-primary">
                <strong>Média geral</strong>
              </div>
              <div className="table-cell text-center">
                <strong>{calculateAverage("user1")}</strong>
              </div>
              <div className="table-cell text-center">
                <strong>{calculateAverage("user2")}</strong>
              </div>
            </div>
          </div>
        </div>

        <h6 className="text-left mb-2">
          <strong>Best new track</strong>
        </h6>
        <section className="d-flex flex-column align-items-start gap-2 w-100">
          <div className="d-flex align-items-center justify-content-between w-100">
            <p>
              <strong>Ducardo</strong>
            </p>
            <p>{bestNewTracks.user1 || "-"}</p>
          </div>
          <div className="d-flex align-items-center justify-content-between w-100">
            <p>
              <strong>Flavioxe</strong>
            </p>
            <p>{bestNewTracks.user2 || "-"}</p>
          </div>
        </section>
      </div>
    </section>
  );
}
