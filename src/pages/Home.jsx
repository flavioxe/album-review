import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database"; // Importa as funções necessárias do Firebase
import AlbumCard from "../components/AlbumCard";
import "../styles/Home.scss"; // Importe o arquivo de estilo para a página

export default function Home() {
  const [albums, setAlbums] = useState([]); // Estado local para armazenar álbuns
  const navigate = useNavigate();
  const database = getDatabase(); // Obtém a instância do banco de dados

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
        setAlbums(albumsArray); // Atualiza a lista de álbuns no estado local
      } else {
        setAlbums([]); // Se não houver dados, define como array vazio
      }
    });
  };

  useEffect(() => {
    fetchAlbums(); // Chama a função para buscar álbuns quando o componente é montado
  }, []);

  return (
    <div>
      <h1>Avaliações de Álbuns Musicais</h1>
      <button onClick={navigateToAddAlbum} className="add-album-btn">
        Cadastrar Novo Álbum
      </button>
      <h2>Álbuns Cadastrados</h2>
      <div className="album-grid">
        {albums.length === 0 ? (
          <p>Nenhum álbum cadastrado ainda.</p>
        ) : (
          albums.map((album) => <AlbumCard key={album.id} album={album} />)
        )}
      </div>
    </div>
  );
}
