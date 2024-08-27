import React from "react";
import { useNavigate } from "react-router-dom";
import { useAlbum } from "../context/AlbumContext"; // Importa o contexto dos álbuns
import AlbumCard from "../components/AlbumCard";
import "../styles/Home.scss"; // Importe o arquivo de estilo para a página

export default function Home() {
  const { albums } = useAlbum(); // Obtém a lista de álbuns do contexto
  const navigate = useNavigate();

  const navigateToAddAlbum = () => {
    navigate("/add-album");
  };

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
