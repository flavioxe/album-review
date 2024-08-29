import React, { useState } from "react";
import AlbumForm from "../components/AlbumForm/AlbumForm";

export default function AddAlbum() {
  const [albums, setAlbums] = useState([]);

  const handleAddAlbum = (newAlbum) => {
    setAlbums((prevAlbums) => [...prevAlbums, newAlbum]);
    console.log("Novo álbum adicionado:", newAlbum);
  };

  return (
    <div className="d-flex flex-column align-items-start gap-3">
      <h2>Cadastrar Álbum</h2>
      <AlbumForm onAddAlbum={handleAddAlbum} />

      <h4>Álbuns cadastrados</h4>
      <ul>
        {albums.map((album) => (
          <li key={album.id}>
            {album.name} - {album.artist}
          </li>
        ))}
      </ul>
    </div>
  );
}
