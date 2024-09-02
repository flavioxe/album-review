import React, { useState } from "react";
import HeaderPages from "../components/HeaderPages/HeaderPages";
import AlbumForm from "../components/AlbumForm/AlbumForm";

export default function AddAlbum() {
  const [albums, setAlbums] = useState([]);

  const handleAddAlbum = (newAlbum) => {
    setAlbums((prevAlbums) => [...prevAlbums, newAlbum]);
    console.log("Novo álbum adicionado:", newAlbum);
  };

  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100">
      <HeaderPages text="Novo registro" />
      <AlbumForm onAddAlbum={handleAddAlbum} />
    </section>
  );
}
