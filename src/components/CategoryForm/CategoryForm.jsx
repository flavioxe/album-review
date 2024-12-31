// CategoryForm.js
import React, { useState } from "react";
import { getDatabase, ref, set } from "firebase/database";

import "./CategoryForm.scss";

const CategoryForm = ({ onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([
    { text: "", image: "" },
    { text: "", image: "" },
    { text: "", image: "" },
  ]); // Três opções iniciais
  const [error, setError] = useState("");

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleImageChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].image = value; // Armazena a URL da imagem
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: "", image: "" }]); // Adiciona uma nova opção vazia
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !categoryName ||
      !description ||
      options.some(
        (option) => option.text.trim() === "" || option.image.trim() === ""
      )
    ) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const db = getDatabase();
      const categoryRef = ref(db, "categories/" + categoryName); // Usando o nome da categoria como chave
      await set(categoryRef, {
        description,
        options,
        votes: Array(options.length).fill(0), // Inicializa os votos como zero
      });

      onCategoryAdded(); // Chama a função para atualizar a lista de categorias
      setCategoryName("");
      setDescription("");
      setOptions([
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
      ]); // Reseta as opções
    } catch (error) {
      setError("Erro ao cadastrar a categoria: " + error.message);
    }
  };

  return (
    <div className="d-flex flex-column align-items-start gap-3 w-100">
      <p className="mb-2">
        <strong>Cadastrar categoria</strong>
      </p>

      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column align-items-start gap-2 w-100"
      >
        <input
          type="text"
          placeholder="Nome da categoria"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          className="w-100"
        />
        <textarea
          placeholder="Breve descrição da categoria"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-100"
        />

        {options.map((option, index) => (
          <div key={index} className="d-flex gap-2 option-input w-100">
            <input
              type="text"
              placeholder={`Opção ${index + 1} - Texto`}
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required
              className="w-100"
            />
            <input
              type="url"
              placeholder={`Opção ${index + 1} - URL da Imagem`}
              value={option.image}
              onChange={(e) => handleImageChange(index, e.target.value)}
              required
              className="w-100"
            />
            {option.image && (
              <img
                src={option.image}
                alt={`Opção ${index + 1}`}
                className="preview-image"
              />
            )}
          </div>
        ))}

        <button type="button" onClick={addOption} className="w-100">
          +1 Opção
        </button>
        <button type="submit" className="button-primary w-100">
          Cadastrar categoria
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default CategoryForm;
