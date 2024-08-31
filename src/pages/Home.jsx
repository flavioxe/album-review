import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import AlbumCard from "../components/AlbumCard/AlbumCard";

import "../styles/Home.scss";

export default function Home() {
  const [albums, setAlbums] = useState([]);

  const navigate = useNavigate();
  const database = getDatabase();

  const navigateToAddAlbum = () => {
    navigate("/add-album");
  };

  // Função para buscar álbuns do Firebase
  const fetchAlbums = () => {
    const albumsRef = ref(database, "albums"); // Referência ao nó 'albums' no Realtime Database
    onValue(albumsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const albumsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAlbums(albumsArray);
      } else {
        setAlbums([]);
      }
    });
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <main className="d-flex flex-column align-items-start">
      <header className="d-flex flex-column align-items-start gap-2 home-header">
        <div className="d-flex flex-column align-items-start">
          <h1 className="text-left text-bold">Bem-vindo ao app</h1>
          <h1 className="text-left text-bold color-primary">
            Reviews avançadas
          </h1>
        </div>
        <h5 className="text-left">
          Uma plataforma para avaliação de álbuns musicais
        </h5>

        <div className="d-flex align-items-center gap-2">
          <button onClick={navigateToAddAlbum} className="button-secondary">
            + Todas as reviews
          </button>
          <button onClick={navigateToAddAlbum} className="button-primary">
            + Novo registro
          </button>
        </div>
      </header>

      <section className="d-flex align-items-center justify-content-between w-100">
        <h6>Últimos lançamentos</h6>

        <p className="d-flex align-items-center gap-1">
          +
          <a hrf="#" onClick={navigateToAddAlbum} className="">
            Todas as reviews
          </a>
        </p>
      </section>

      <div className="album-grid">
        {albums.length === 0 ? (
          <p>Nenhum álbum cadastrado ainda.</p>
        ) : (
          albums.map((album) => <AlbumCard key={album.id} album={album} />)
        )}
      </div>
    </main>
  );
}
