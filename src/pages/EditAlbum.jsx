import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, set } from "firebase/database";
import HeaderPages from "../components/HeaderPages/HeaderPages";
import DivisionMark from "../components/DivisionMark/DivisionMark";
import { Trash } from "phosphor-react";

export default function EditAlbum() {
  const { id } = useParams();
  const navigate = useNavigate();
  const database = getDatabase();

  const [album, setAlbum] = useState(null);
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [cover, setCover] = useState("");
  const [genre, setGenre] = useState("");
  const [tracks, setTracks] = useState(["", "", "", ""]);

  const toDateInputValue = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString; // fallback
      return d.toISOString().slice(0, 10);
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const albumRef = ref(database, `albums/${id}`);
    onValue(albumRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAlbum(data);
        setName(data.name || "");
        setArtist(data.artist || "");
        setReleaseDate(toDateInputValue(data.releaseDate));
        setPrimaryColor(data.primaryColor || "#ffffff");
        setCover(data.cover || "");
        setGenre(data.genre || "");
        const titles = (data.tracks || []).map((t) => t.title || "");
        // garante no mínimo 4 faixas
        while (titles.length < 4) titles.push("");
        setTracks(titles);
      }
    });
  }, [id, database]);

  const handleTrackChange = (index, value) => {
    const newTracks = [...tracks];
    newTracks[index] = value;
    setTracks(newTracks);
  };

  const addTrack = () => {
    setTracks((prev) => [...prev, ""]);
  };

  const removeTrack = (index) => {
    if (index < 4) return; // primeiras 4 são obrigatórias
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const syncRatingsByTitle = (existingRatings, newTrackTitles) => {
    const normalize = (arr) => Array.isArray(arr) ? arr : [];
    const byTitle = (arr) => {
      const map = new Map();
      normalize(arr).forEach((r) => {
        if (r && typeof r.title === "string") {
          map.set(r.title, r);
        }
      });
      return map;
    };

    const u1Map = byTitle(existingRatings?.user1);
    const u2Map = byTitle(existingRatings?.user2);

    const user1 = newTrackTitles.map((title) => {
      const found = u1Map.get(title);
      return found ? { title, rate: found.rate ?? null } : { title, rate: null };
    });
    const user2 = newTrackTitles.map((title) => {
      const found = u2Map.get(title);
      return found ? { title, rate: found.rate ?? null } : { title, rate: null };
    });

    return { user1, user2 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!album) return;

    // Monta novas tracks no formato esperado
    const newTrackTitles = tracks.map((t) => t);
    const updatedTracks = newTrackTitles.map((title) => ({ title }));

    // Sincroniza ratings de acordo com títulos (evita desalinhamento por índice)
    const updatedRatings = syncRatingsByTitle(album.ratings || { user1: [], user2: [] }, newTrackTitles);

    const updatedAlbum = {
      ...album,
      name,
      artist,
      releaseDate: releaseDate,
      primaryColor,
      cover,
      genre,
      tracks: updatedTracks,
      ratings: updatedRatings,
    };

    try {
      const albumRef = ref(database, `albums/${id}`);
      await set(albumRef, updatedAlbum);
      alert("Álbum atualizado!");
      navigate(`/album-review/${id}`);
    } catch (error) {
      console.error("Erro ao atualizar álbum:", error);
      alert("Houve um erro ao salvar as alterações.");
    }
  };

  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100">
      <HeaderPages text="Editar obra" />
      {!album ? (
        <p>Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="d-flex flex-column align-items-start gap-2 w-100">
          <p className="mb-2">
            <strong>Informações gerais</strong>
          </p>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label htmlFor="name">Título da obra</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-100" required />
          </div>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label htmlFor="artist">Artista</label>
            <input type="text" id="artist" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-100" required />
          </div>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label htmlFor="releaseDate">Data de lançamento</label>
            <input type="date" id="releaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-100" required />
          </div>

          <DivisionMark />

          <p className="mb-2">
            <strong>Estilização</strong>
          </p>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label htmlFor="cover">URL da capa</label>
            <input type="text" id="cover" value={cover} onChange={(e) => setCover(e.target.value)} className="w-100" required />
          </div>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label htmlFor="primaryColor">HEX da cor principal</label>
            <input type="color" id="primaryColor" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-100 p-0" required />
          </div>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label htmlFor="genre">Gênero musical</label>
            <input type="text" id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-100" />
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
              <input type="text" id={`track-${index}`} value={track} onChange={(e) => handleTrackChange(index, e.target.value)} className="w-100" required />
              {index >= 4 && (
                <button type="button" className="button-outline" title="Remover faixa" onClick={() => removeTrack(index)}>
                  <Trash size={18} />
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addTrack} className="button-secondary w-100 mt-3">
            +1 música
          </button>

          <DivisionMark />

          <button type="submit" className="button-primary w-100">
            Salvar alterações
          </button>
        </form>
      )}
    </section>
  );
}