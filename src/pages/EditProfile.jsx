import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, set } from "firebase/database";
import HeaderPages from "../components/HeaderPages/HeaderPages";
import UserAvatar from "../components/UserAvatar/UserAvatar";

export default function EditProfile({ user }) {
  const navigate = useNavigate();
  const database = getDatabase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!user) return;
    const userRef = ref(database, `users/${user.uid}`);
    const off = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setName(data.username || "");
        setAvatar(data.avatar || "");
      }
      setLoading(false);
    });
    return () => off();
  }, [user, database]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || name.trim() === "") {
      setError("Informe um nome válido.");
      return;
    }

    try {
      const userRef = ref(database, `users/${user.uid}`);
      // Primeiro lê o valor atual para preservar campos como email
      let current = {};
      await new Promise((resolve) =>
        onValue(userRef, (snapshot) => {
          current = snapshot.val() || {};
          resolve();
        }, { onlyOnce: true })
      );

      await set(userRef, {
        ...current,
        username: name,
        avatar: avatar || null,
      });

      alert("Perfil atualizado com sucesso.");
      navigate("/");
    } catch (e) {
      setError(`Erro ao salvar perfil: ${e.message}`);
    }
  };

  if (!user) {
    return (
      <section className="d-flex flex-column align-items-start gap-3 w-100">
        <HeaderPages text="Editar perfil" />
        <p>Faça login para editar seu perfil.</p>
      </section>
    );
  }

  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100">
      <HeaderPages text="Editar perfil" />

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <form
          onSubmit={handleSave}
          className="d-flex flex-column align-items-start gap-3 w-100"
        >
          <div className="d-flex align-items-center gap-3">
            <UserAvatar userId={user.uid} />
            <div className="d-flex flex-column">
              <small>ID: {user.uid}</small>
              <small>Email: {user.email}</small>
            </div>
          </div>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label>Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-100"
            />
          </div>

          <div className="d-flex flex-column align-items-start gap-1 w-100">
            <label>Foto (URL)</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-100"
            />
          </div>

          <div className="d-flex align-items-center gap-2 w-100">
            <button type="submit" className="button-primary w-100">
              Salvar alterações
            </button>
            <button
              type="button"
              className="button-outline w-100"
              onClick={() => navigate("/")}
            >
              Cancelar
            </button>
          </div>

          {error && <p className="error mt-2">{error}</p>}
        </form>
      )}
    </section>
  );
}