import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import "../styles/AlbumReview.scss";

export default function AlbumReview() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [ratings, setRatings] = useState({ user1: {}, user2: {} }); // Armazena as notas por usuário
  const [bestNewTracks, setBestNewTracks] = useState({ user1: "", user2: "" }); // Armazena a melhor faixa nova para cada usuário
  const navigate = useNavigate();
  const database = getDatabase();

  useEffect(() => {
    const albumRef = ref(database, `albums/${id}`);
    onValue(albumRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAlbum(data);
        // Inicializa as avaliações com valores nulos
        const initialRatings = {
          user1: {},
          user2: {},
        };
        data.tracks.forEach((track) => {
          initialRatings.user1[track.title] = null;
          initialRatings.user2[track.title] = null;
        });
        setRatings(initialRatings);
      }
    });
  }, [id, database]);

  const handleRatingChange = (trackTitle, user, value) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [user]: {
        ...prevRatings[user],
        [trackTitle]: value,
      },
    }));
  };

  const calculateAverage = (user) => {
    const userRatings = Object.values(ratings[user]);
    const total = userRatings.reduce((acc, rating) => acc + (rating || 0), 0);
    const count = userRatings.filter((rating) => rating !== null).length;
    return count > 0 ? (total / count).toFixed(1) : "N/A";
  };

  const handleBestNewTrackChange = (user, e) => {
    setBestNewTracks((prev) => ({
      ...prev,
      [user]: e.target.value,
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  return (
    <div
      className="album-review"
      style={{
        background: `linear-gradient(${album?.primaryColor}, ${album?.secondaryColor})`,
      }}
    >
      {album && (
        <div className="album-info">
          <img
            src={album.cover}
            alt={`${album.name} cover`}
            className="album-cover"
          />
          <h1>{album.name}</h1>
          <h2>by {album.artist}</h2>
          <p>Lançamento: {formatDate(album.releaseDate)}</p>
        </div>
      )}
      <h2>Tracklist</h2>
      <table>
        <thead>
          <tr>
            <th>Faixa</th>
            <th>Ducardo</th>
            <th>Flavioxe</th>
          </tr>
        </thead>
        <tbody>
          {album?.tracks.map((track) => (
            <tr key={track.title}>
              <td>{track.title}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={ratings.user1[track.title] || ""}
                  onChange={(e) =>
                    handleRatingChange(
                      track.title,
                      "user1",
                      Number(e.target.value)
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={ratings.user2[track.title] || ""}
                  onChange={(e) =>
                    handleRatingChange(
                      track.title,
                      "user2",
                      Number(e.target.value)
                    )
                  }
                />
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>Média</strong>
            </td>
            <td>
              <strong>{calculateAverage("user1")}</strong>
            </td>
            <td>
              <strong>{calculateAverage("user2")}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <h3>Best New Track</h3>
      <div>
        <label>
          Ducardo:
          <input
            type="text"
            value={bestNewTracks.user1}
            onChange={(e) => handleBestNewTrackChange("user1", e)}
            placeholder="Digite a melhor faixa nova"
          />
        </label>
        <label>
          Flavioxe:
          <input
            type="text"
            value={bestNewTracks.user2}
            onChange={(e) => handleBestNewTrackChange("user2", e)}
            placeholder="Digite a melhor faixa nova"
          />
        </label>
      </div>
      <button onClick={() => navigate("/")}>Voltar para Home</button>{" "}
      {/* Botão para voltar à Home */}
    </div>
  );
}
