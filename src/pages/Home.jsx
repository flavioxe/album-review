// src/pages/Home.jsx

// import React from "react";
import AlbumList from "../components/AlbumList";
// import AlbumForm from "../components/AlbumForm";

const Home = () => {
  return (
    <div className="home-container">
      <h1>Avaliações de Álbuns Musicais</h1>
      {/* <AlbumForm /> */}
      <h2>Álbuns Cadastrados</h2>
      <AlbumList />
    </div>
  );
};

export default Home;
