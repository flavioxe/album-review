// src/pages/Home.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import AlbumForm from "../components/AlbumForm";
import AlbumCard from "../components/AlbumCard";
import albumsData from "../data/albums.json";

import "../styles/Home.scss"; // Importe o arquivo de estilo para a página

export default function Home() {
  const [albums, setAlbums] = useState(albumsData);
  const navigate = useNavigate();

  const handleAddAlbum = (newAlbum) => {
    setAlbums((prevAlbums) => [...prevAlbums, newAlbum]);
  };

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
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
