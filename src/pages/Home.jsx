import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import Ranking from "../components/Ranking/Ranking";
import GeneralRanking from "../components/GeneralRanking/GeneralRanking";
import WorstRanking from "../components/WorstRanking/WorstRanking";
import CommentsCarousel from "../components/CommentsCarousel/CommentsCarousel";
import Latests from "../components/Latests/Latests";
import UserAvatar from "../components/UserAvatar/UserAvatar";
import SpotifySearch from "../components/SpotifySearch/SpotifySearch";
import {
  RankingLoader,
  WorstRankingLoader,
  CommentsLoader,
  LatestsLoader,
} from "../components/Loaders/HomeSectionLoaders";

import "../styles/Home.scss";

export default function Home({ user, onLogout }) {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpotifySearchVisible, setIsSpotifySearchVisible] = useState(false);

  const navigate = useNavigate();
  const database = getDatabase();

  const toggleSpotifySearch = () => {
    setIsSpotifySearchVisible((prev) => !prev);
  };

  const navigateToAllAlbum = () => {
    navigate("/all-albums");
  };

  const navigateToGrammyBet = () => {
    navigate("/grammy-bet");
  };

  const navigateToEditProfile = () => {
    navigate("/edit-profile");
  };

  const navigateToLogin = () => {
    navigate("/login");
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
          ratings: data[key].ratings || { user1: [], user2: [] }, // Garantir que ratings seja um objeto com arrays
        }));
        setAlbums(albumsArray);
        setIsLoading(false);
      } else {
        setAlbums([]);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchAlbums();
  }, []); // Executa apenas uma vez na montagem

  // Computar quantos álbuns deste ano têm avaliações válidas dos dois usuários
  const currentYear = new Date().getFullYear();
  const albumsOfThisYear = albums.filter((album) => {
    if (!album.releaseDate) return false;
    return new Date(album.releaseDate).getFullYear() === currentYear;
  });

  const isEvaluatedByBoth = (album) => {
    if (
      !album.ratings ||
      !Array.isArray(album.ratings.user1) ||
      !Array.isArray(album.ratings.user2)
    ) {
      return false;
    }

    const user1Has = album.ratings.user1
      .map((r) => (r ? r.rate : null))
      .some((rate) => typeof rate === "number");
    const user2Has = album.ratings.user2
      .map((r) => (r ? r.rate : null))
      .some((rate) => typeof rate === "number");

    return user1Has && user2Has;
  };

  const evaluatedCount = albumsOfThisYear.filter(isEvaluatedByBoth).length;

  return (
    <main className="d-flex flex-column align-items-start">
      <header className="d-flex flex-column align-items-start gap-3 w-100 home-header">
        <div className="d-flex flex-column align-items-start">
          {user && <UserAvatar userId={user.uid} />}

          <h1 className="text-left text-bold">Bem-vindo ao app</h1>
          <h1 className="text-left text-bold color-primary">
            Reviews avançadas
          </h1>
        </div>
        <h5 className="text-left">
          Uma plataforma para avaliação de álbuns musicais
        </h5>

        <div className="home-actions d-flex align-items-center gap-2">
          <button onClick={navigateToAllAlbum} className="button-secondary">
            Todas as reviews
          </button>
          <button onClick={toggleSpotifySearch} className="button-primary">
            {isSpotifySearchVisible ? "Fechar busca" : "+ Novo registro"}
          </button>

          {/* Botão para o bolão do grammy aparece apenas se o usuário estiver logado */}
          {user && (
            <button onClick={navigateToGrammyBet} className="button-grammy">
              Bolão do Grammy
            </button>
          )}

          {/* Botão de editar perfil visível quando logado */}
          {user && (
            <button
              onClick={navigateToEditProfile}
              className="button-secondary"
            >
              Editar perfil
            </button>
          )}

          {/* Botão para a página de login */}
          {!user && ( // Exibe o botão apenas se o usuário não estiver logado
            <button onClick={navigateToLogin} className="button-secondary">
              Login
            </button>
          )}
        </div>

        <div
          className={`spotify-search-panel ${isSpotifySearchVisible ? "open" : ""}`}
        >
          {isSpotifySearchVisible ? <SpotifySearch /> : null}
        </div>
      </header>

      <div className="w-100">
        <div className="general-ranking-section mb-4 w-100">
          {isLoading ? <RankingLoader /> : <GeneralRanking albums={albums} />}
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between w-100">
        {isLoading ? (
          <>
            <div className="ranking-section pe-2">
              <RankingLoader />
            </div>
            <div className="worst-ranking-section ps-2">
              <WorstRankingLoader />
            </div>
          </>
        ) : // Quando não estiver carregando, mostrar a seção do ano somente
        // se houver pelo menos 5 álbuns avaliados por ambos os usuários.
        evaluatedCount >= 5 ? (
          <>
            <div className="ranking-section pe-2">
              <Ranking albums={albums} />
            </div>
            {evaluatedCount >= 10 && (
              <div className="worst-ranking-section ps-2">
                <WorstRanking albums={albums} />
              </div>
            )}
          </>
        ) : null}
      </div>
      {isLoading ? (
        <CommentsLoader />
      ) : (
        <CommentsCarousel albums={albums} user={user} />
      )}
      {isLoading ? <LatestsLoader /> : <Latests albums={albums} />}
    </main>
  );
}
