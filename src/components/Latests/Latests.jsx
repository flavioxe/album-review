import React from "react";
import { useNavigate } from "react-router-dom";
import AlbumCard from "../AlbumCard/AlbumCard";

export default function Latests({ albums }) {
  const navigate = useNavigate();

  // ordenando por data de lançamento mais recente
  const latestAlbums = albums
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    .slice(0, 14);

  const navigateToAllAlbum = () => {
    navigate("/all-albums");
  };

  return (
    <section className="w-100">
      <div className="d-flex align-items-center justify-content-between w-100">
        <h6>Últimos lançamentos</h6>
        <a href="#" onClick={navigateToAllAlbum}>
          Todas as reviews
        </a>
      </div>

      <div className="album-grid">
        {latestAlbums.length === 0 ? (
          <p>Nenhum álbum cadastrado ainda.</p>
        ) : (
          latestAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))
        )}
      </div>
    </section>
  );
}
