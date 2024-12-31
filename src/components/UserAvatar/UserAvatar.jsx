import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database"; // Importar Firebase
import "./UserAvatar.scss"; // Importando o CSS para estilização

const UserAvatar = ({ userId }) => {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true); // Estado para controle de carregamento

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    return names
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`); // Referência ao nó do usuário

    // Listener para buscar dados do usuário
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setName(data.username); // Armazenar o nome do usuário no estado
        setAvatarUrl(data.avatar); // Armazenar a URL do avatar no estado
      }
      setLoading(false); // Define loading como false após buscar os dados
    });

    // Limpar o listener quando o componente for desmontado
    return () => unsubscribe();
  }, [userId]); // Dependência para atualizar quando userId mudar

  // Exibir carregador enquanto os dados estão sendo buscados
  if (loading) {
    return <div className="loading">Carregando...</div>; // Exibe um carregador
  }

  return (
    <div className="user-avatar">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${name}'s Avatar`}
          className="avatar-image"
        />
      ) : (
        <div className="avatar-initials">{getInitials(name)}</div>
      )}
    </div>
  );
};

export default UserAvatar;
