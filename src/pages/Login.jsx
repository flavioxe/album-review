// Login.js
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase"; // Ajuste o caminho conforme necessário
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set } from "firebase/database";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Novo estado para o nome
  const [avatar, setAvatar] = useState(""); // Novo estado para o avatar
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Hook para navegação
  const database = getDatabase(); // Instância do banco de dados

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // Login do usuário
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser(userCredential.user);
        navigate("/"); // Redireciona para a home após login
      } else {
        // Registro do usuário
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser(userCredential.user);

        // Salvar os dados do usuário no banco de dados
        await set(ref(database, "users/" + userCredential.user.uid), {
          username: name,
          email: email,
          avatar: avatar || null, // Salva o avatar se fornecido
        });

        navigate("/"); // Redireciona para a home após registro
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && ( // Campo para nome apenas durante o registro
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Campo para upload de avatar */}
        {!isLogin && (
          <input
            type="url"
            placeholder="URL do Avatar (opcional)"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        )}

        <button type="submit">{isLogin ? "Login" : "Register"}</button>
        {error && <p className="error">{error}</p>}
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create an account" : "Already have an account?"}
      </button>
    </div>
  );
};

export default Login;
