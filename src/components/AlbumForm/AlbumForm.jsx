import { useState } from "react";
import { useAlbum } from "../../context/AlbumContext";
import { ref, set } from "firebase/database";
import { database } from "../../firebase";

import DivisionMark from "../DivisionMark/DivisionMark";

import "./AlbumForm.scss";

export default function AlbumForm() {
  const { addAlbum } = useAlbum();
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [cover, setCover] = useState("");
  const [genre, setGenre] = useState("");
  const [tracks, setTracks] = useState(["", "", "", ""]);

  const handleTrackChange = (index, value) => {
    const newTracks = [...tracks];
    newTracks[index] = value;
    setTracks(newTracks);
  };

  const addTrack = () => {
    setTracks((prevTracks) => [...prevTracks, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newAlbum = {
      id: Date.now(),
      name,
      artist,
      releaseDate,
      primaryColor,
      cover,
      genre,
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
      const albumRef = ref(database, `albums/${newAlbum.id}`);
      await set(albumRef, newAlbum);
      addAlbum(newAlbum);

      // Reseta os campos do formulário
      setName("");
      setArtist("");
      setReleaseDate("");
      setPrimaryColor("");
      setCover("");
      setGenre("");
      setTracks(["", "", "", ""]);
      alert("Lacre!");
    } catch (error) {
      console.error("Erro:", error);
      alert("Flop! Tenta dnv bibi");
    }
  };

  return (
    <div className="d-flex flex-column align-items-start gap-3 w-100">
      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column align-items-start gap-2 w-100"
      >
        <p className="mb-2">
          <strong>Informações gerais</strong>
        </p>

        <div className="d-flex flex-column align-items-start gap-1 w-100">
          <label htmlFor="name">Título da obra</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="title"
            className="w-100"
            required
          />
        </div>

        <div className="d-flex flex-column align-items-start gap-1 w-100">
          <label htmlFor="artist">Artista</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="artist"
            className="w-100"
            required
          />
        </div>

        <div className="d-flex flex-column align-items-start gap-1 w-100">
          <label htmlFor="releaseDate">Data de lançamento</label>
          <input
            type="date"
            id="releaseDate"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-100"
            required
          />
        </div>

        <DivisionMark />

        <p className="mb-2">
          <strong>Estilização</strong>
        </p>

        <div
          className="d-flex align-items-center justify-content-center box-album-styles"
          style={{ backgroundColor: primaryColor }}
        >
          {cover && (
            <img src={cover} alt="Capa do álbum" className="cover-image" />
          )}
        </div>

        <div className="d-flex flex-column align-items-start gap-1 w-100">
          <label htmlFor="cover">URL da capa</label>
          <input
            type="text"
            id="cover"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="URL da imagem da capa"
            className="w-100"
            required
          />
        </div>

        <div className="d-flex flex-column align-items-start gap-1 w-100">
          <label htmlFor="primaryColor">HEX da cor principal</label>
          <input
            type="color"
            id="primaryColor"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-100 p-0"
            required
          />
        </div>

        <div className="d-flex flex-column align-items-start gap-1 w-100">
          <label htmlFor="genre">Gênero musical</label>
          <input
            type="text"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="genre"
            className="w-100"
          />
        </div>

        <DivisionMark />

        <p className="mb-2">
          <strong>Lista de músicas</strong>
        </p>

        {tracks.map((track, index) => (
          <div key={index} className="d-flex align-items-center gap-2 w-100">
            <label htmlFor={`track-${index}`} className="w-10">
              {index + 1}
            </label>
            <input
              type="text"
              id={`track-${index}`}
              value={track}
              onChange={(e) => handleTrackChange(index, e.target.value)}
              className="w-100"
              required
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addTrack}
          className="button-secondary w-100 mt-3"
        >
          +1 música
        </button>

        <DivisionMark />

        <button type="submit" className="button-primary w-100">
          Cadastrar álbum
        </button>
      </form>
    </div>
  );
}
