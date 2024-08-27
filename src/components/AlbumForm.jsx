import { useState } from "react";
import { useAlbum } from "../context/AlbumContext";
import { ref, set } from "firebase/database";
import { database } from "../firebase"; // Certifique-se de que este arquivo está configurado corretamente

export default function AlbumForm() {
  const { addAlbum } = useAlbum();
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [cover, setCover] = useState("");
  const [tracks, setTracks] = useState(["", "", "", ""]);

  const handleTrackChange = (index, value) => {
    const newTracks = [...tracks];
    newTracks[index] = value;
    setTracks(newTracks);
  };

  const addTrack = () => {
    setTracks((prevTracks) => [...prevTracks, ""]); // Adiciona uma nova faixa vazia
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newAlbum = {
      id: Date.now(), // Use um ID único, mas considere usar um ID gerado pelo Firebase
      name,
      artist,
      releaseDate,
      primaryColor,
      secondaryColor,
      cover,
      tracks: tracks.map((track) => ({
        title: track,
        ratings: { user1: null, user2: null },
      })),
      bestNewTrack: {
        user1: null,
        user2: null,
      },
    };

    try {
      // Usa o Firebase Realtime Database para armazenar o novo álbum
      const albumRef = ref(database, `albums/${newAlbum.id}`);
      await set(albumRef, newAlbum);
      addAlbum(newAlbum); // Chama a função para adicionar álbum no contexto

      // Reseta os campos do formulário
      setName("");
      setArtist("");
      setReleaseDate("");
      setPrimaryColor("");
      setSecondaryColor("");
      setCover("");
      setTracks(["", "", "", ""]); // Reseta as faixas
    } catch (error) {
      console.error("Erro:", error);
      alert("Houve um erro ao adicionar o álbum. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="album-form">
      <h2>Cadastrar Novo Álbum</h2>
      <div>
        <label htmlFor="name">Nome do Álbum:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="artist">Artista:</label>
        <input
          type="text"
          id="artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="releaseDate">Data de Lançamento:</label>
        <input
          type="date"
          id="releaseDate"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="primaryColor">Cor Primária:</label>
        <input
          type="color"
          id="primaryColor"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="secondaryColor">Cor Secundária:</label>
        <input
          type="color"
          id="secondaryColor"
          value={secondaryColor}
          onChange={(e) => setSecondaryColor(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="cover">URL da Capa:</label>
        <input
          type="text"
          id="cover"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="Insira a URL da imagem da capa"
          required
        />
      </div>
      <h3>Lista de Faixas</h3>
      {tracks.map((track, index) => (
        <div key={index}>
          <label htmlFor={`track-${index}`}>Faixa {index + 1}:</label>
          <input
            type="text"
            id={`track-${index}`}
            value={track}
            onChange={(e) => handleTrackChange(index, e.target.value)}
            required
          />
        </div>
      ))}
      <button type="button" onClick={addTrack}>
        Adicionar Mais Música
      </button>
      <button type="submit">Adicionar Álbum</button>
    </form>
  );
}
