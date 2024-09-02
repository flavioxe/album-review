import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, set } from "firebase/database"; // Importa set para salvar dados
import HeaderPages from "../components/HeaderPages/HeaderPages";
import AlbumHeader from "../components/AlbumHeader/AlbumHeader";
import DivisionMark from "../components/DivisionMark/DivisionMark";

// import "../styles/RateAlbum.scss";

export default function RateAlbum() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [ratings, setRatings] = useState({ user1: [], user2: [] }); // Armazena as notas por usuário
  const [bestNewTracks, setBestNewTracks] = useState({ user1: "", user2: "" }); // Armazena a melhor faixa nova para cada usuário
  const [comments, setComments] = useState({ user1: "", user2: "" }); // Armazena os comentários dos usuários
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
          user1: data.ratings?.user1 || [],
          user2: data.ratings?.user2 || [],
        };

        // Preenche as notas com base nas faixas do álbum
        data.tracks.forEach((track) => {
          if (!initialRatings.user1.some((r) => r.title === track.title)) {
            initialRatings.user1.push({ title: track.title, rate: null });
          }
          if (!initialRatings.user2.some((r) => r.title === track.title)) {
            initialRatings.user2.push({ title: track.title, rate: null });
          }
        });

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

  const handleSubmit = async () => {
    // Cria um objeto com os dados a serem salvos
    const albumData = {
      ratings: {
        user1: ratings.user1.map((rating) => ({
          title: rating.title,
          rate: rating.rate,
        })),
        user2: ratings.user2.map((rating) => ({
          title: rating.title,
          rate: rating.rate,
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
    };

    try {
      // Salva os dados no Firebase, mantendo as informações existentes
      const albumRef = ref(database, `albums/${id}`); // Define o caminho onde os dados serão salvos
      await set(albumRef, { ...album, ...albumData }); // Salva os dados, mantendo as informações existentes
      alert("Avaliações salvas com sucesso!"); // Mensagem de sucesso
      navigate(`/album-review/${id}`); // Redireciona para a página de revisão do álbum
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
            {ratings.user1.map((rating, index) => (
              <tr key={rating.title}>
                <td>{rating.title}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={rating.rate || ""}
                    onChange={(e) =>
                      handleRatingChange(index, "user1", Number(e.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={ratings.user2[index]?.rate || ""}
                    onChange={(e) =>
                      handleRatingChange(index, "user2", Number(e.target.value))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <DivisionMark />

        <h6 className="text-left mb-2">
          <strong>Best new track</strong>
        </h6>
        <section className="d-flex flex-column gap-3 w-100">
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
              placeholder="Deixe seu comentário"
              className="w-100"
            />
          </div>
          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label>Flavioxe</label>
            <textarea
              value={comments.user2}
              onChange={(e) => handleCommentChange("user2", e)}
              placeholder="Deixe seu comentário"
              className="w-100"
            />
          </div>
        </section>

        <button onClick={handleSubmit} className="button-primary">
          Salvar Avaliações
        </button>
        <button onClick={() => navigate("/")}>Voltar para Home</button>
      </div>
    </section>
  );
}
