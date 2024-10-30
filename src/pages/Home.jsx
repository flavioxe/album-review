import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import Ranking from "../components/Ranking/Ranking";
import Latests from "../components/Latests/Latests";

import "../styles/Home.scss";

export default function Home() {
  const [albums, setAlbums] = useState([]);

  const navigate = useNavigate();
  const database = getDatabase();

  const navigateToAddAlbum = () => {
    navigate("/add-album");
  };
  const navigateToAllAlbum = () => {
    navigate("/all-albums");
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
      <header className="d-flex flex-column align-items-start gap-3 w-100 home-header">
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
          <button onClick={navigateToAllAlbum} className="button-secondary">
            Todas as reviews
          </button>
          <button onClick={navigateToAddAlbum} className="button-primary">
            + Novo registro
          </button>
        </div>
      </header>

      <Ranking albums={albums} />
      {/* <DivisionMark /> */}
      <Latests albums={albums} />
    </main>
  );
}
