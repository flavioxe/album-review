import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, set } from "firebase/database";
import HeaderPages from "../components/HeaderPages/HeaderPages";
import AlbumHeader from "../components/AlbumHeader/AlbumHeader";
import DivisionMark from "../components/DivisionMark/DivisionMark";

export default function RateAlbum() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [ratings, setRatings] = useState({ user1: [], user2: [] });
  const [bestNewTracks, setBestNewTracks] = useState({ user1: "", user2: "" });
  const [comments, setComments] = useState({ user1: "", user2: "" });

  const navigate = useNavigate();
  const database = getDatabase();

  useEffect(() => {
    const albumRef = ref(database, `albums/${id}`);
    onValue(albumRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAlbum(data);
        const initialRatings = {
          user1: data.tracks.map((track) => {
            const existingRating = data.ratings?.user1?.find(
              (r) => r.title === track.title
            );
            return existingRating || { title: track.title, rate: null };
          }),
          user2: data.tracks.map((track) => {
            const existingRating = data.ratings?.user2?.find(
              (r) => r.title === track.title
            );
            return existingRating || { title: track.title, rate: null };
          }),
        };

        setRatings(initialRatings);
        setBestNewTracks(data.bestNewTracks || { user1: "", user2: "" });
        setComments(data.comments || { user1: "", user2: "" });
      }
    });
  }, [id, database]);

  const handleRatingChange = (index, user, value) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [user]: prevRatings[user].map((rating, i) =>
        i === index ? { ...rating, rate: value } : rating
      ),
    }));
  };

  const handleBestNewTrackChange = (user, e) => {
    setBestNewTracks((prev) => ({
      ...prev,
      [user]: e.target.value,
    }));
  };

  const handleCommentChange = (user, e) => {
    setComments((prev) => ({
      ...prev,
      [user]: e.target.value,
    }));
  };

  const calculateAverage = (user) => {
    const userRatings = ratings[user]
      .map((r) => r.rate)
      .filter((rate) => rate !== null && rate !== undefined);

    const total = userRatings.reduce((acc, rating) => acc + rating, 0);
    const count = userRatings.length;
    const average = count > 0 ? (total / count).toFixed(2) : "N/A";

    return average;
  };

  const setAverageColor = (average) => {
    let color = "color-secondary";

    if (average !== "N/A") {
      if (parseFloat(average) >= 6) {
        color = "color-success";
      } else if (parseFloat(average) >= 5) {
        color = "color-warning";
      } else {
        color = "color-danger";
      }
    }

    return (
      <span className={color}>
        <strong>{average}</strong>
      </span>
    );
  };

  const handleSubmit = async () => {
    const sanitizeData = (data) => {
      const { $$typeof, ...sanitized } = data;
      return sanitized;
    };

    const albumData = {
      ratings: {
        user1: ratings.user1.map((rating) => ({
          title: rating.title,
          rate: rating.rate !== undefined ? rating.rate : null,
        })),
        user2: ratings.user2.map((rating) => ({
          title: rating.title,
          rate: rating.rate !== undefined ? rating.rate : null,
        })),
      },
      bestNewTracks: {
        user1: bestNewTracks.user1,
        user2: bestNewTracks.user2,
      },
      comments: {
        user1: comments.user1,
        user2: comments.user2,
      },
      averages: {
        user1: calculateAverage("user1"),
        user2: calculateAverage("user2"),
      },
    };

    try {
      const albumRef = ref(database, `albums/${id}`);
      const sanitizedAlbum = sanitizeData(album);
      await set(albumRef, { ...sanitizedAlbum, ...albumData });
      alert("Avaliações salvas com sucesso!");
      navigate(`/album-review/${id}`);
    } catch (error) {
      console.error("Erro ao salvar as avaliações:", error);
      alert("Houve um erro ao salvar as avaliações. Tente novamente.");
    }
  };

  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100">
      <HeaderPages text="Avaliar álbum" />
      {album ? <AlbumHeader album={album} /> : <p>Carregando álbum...</p>}

      <div className="box-album-details w-100">
        <div className="table-row">
          <small className="table-cell text-left">
            <strong>Tracklist</strong>
          </small>
          <small className="table-cell text-center">Ducardo</small>
          <small className="table-cell text-center">Flavioxe</small>
        </div>

        {album &&
          album.tracks.map((track, index) => (
            <div className="table-row" key={index}>
              <small className="table-cell text-left">
                <strong>{track.title}</strong>
              </small>
              <div className="table-cell text-center">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={ratings.user1[index]?.rate || ""}
                  onChange={(e) =>
                    handleRatingChange(index, "user1", Number(e.target.value))
                  }
                />
              </div>
              <div className="table-cell text-center">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={ratings.user2[index]?.rate || ""}
                  onChange={(e) =>
                    handleRatingChange(index, "user2", Number(e.target.value))
                  }
                />
              </div>
            </div>
          ))}

        <div className="table-row">
          <small className="table-cell text-left color-primary">
            <strong>Média geral</strong>
          </small>
          <small className="table-cell text-center">
            {setAverageColor(calculateAverage("user1"))}
          </small>
          <small className="table-cell text-center">
            {setAverageColor(calculateAverage("user2"))}
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
          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label>Ducardo</label>
            <input
              type="text"
              value={bestNewTracks.user1}
              onChange={(e) => handleBestNewTrackChange("user1", e)}
              placeholder="Qual foi a best?"
              className="w-100"
            />
          </div>
          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label>Flavioxe</label>
            <input
              type="text"
              value={bestNewTracks.user2}
              onChange={(e) => handleBestNewTrackChange("user2", e)}
              placeholder="Qual foi a best?"
              className="w-100"
            />
          </div>
        </section>

        <DivisionMark />

        <h6 className="text-left mb-2">
          <strong>Comentários</strong>
        </h6>
        <section className="d-flex flex-column gap-3 w-100">
          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label>Ducardo</label>
            <textarea
              value={comments.user1}
              onChange={(e) => handleCommentChange("user1", e)}
              placeholder="a review viu amr"
              className="w-100"
            />
          </div>
          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label>Flavioxe</label>
            <textarea
              value={comments.user2}
              onChange={(e) => handleCommentChange("user2", e)}
              placeholder="a review viu amr"
              className="w-100"
            />
          </div>
        </section>

        <button onClick={handleSubmit} className="button-primary mt-4 w-100">
          Salvar
        </button>
      </div>
    </section>
  );
}
