import { Link } from "react-router-dom";
import albums from "../data/albums.json";

export default function AlbumList() {
  if (!albums || albums.length === 0) {
    return <p>Nenhum álbum cadastrado.</p>;
  }

  return (
    <div className="album-list">
      {albums.map((album) => (
        <div key={album.id} className="album-item">
          <h3>{album.name}</h3>
          <p>Artista: {album.artist}</p>
          <p>
            Data de Lançamento:{" "}
            {new Date(album.releaseDate).toLocaleDateString()}
          </p>
          <Link to={`/album/${album.id}`} className="album-link">
            Ver detalhes
          </Link>
        </div>
      ))}
    </div>
  );
}
