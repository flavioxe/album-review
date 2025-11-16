import React, { useState } from "react";
import { getDatabase, ref, set } from "firebase/database";

import "./EditCategoryOptions.scss";

export default function EditCategoryOptions({ category, onClose }) {
  const [options, setOptions] = useState(
    (category?.options || []).map((opt) => ({ ...opt }))
  );
  const [error, setError] = useState("");
  const db = getDatabase();

  const handleTextChange = (index, value) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text: value };
      return next;
    });
  };

  const handleImageChange = (index, value) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], image: value };
      return next;
    });
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", image: "" }]);
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");
    // validação simples
    if (
      options.length === 0 ||
      options.some(
        (opt) => !opt.text || opt.text.trim() === "" || !opt.image || opt.image.trim() === ""
      )
    ) {
      setError("Preencha texto e imagem em todas as opções.");
      return;
    }

    try {
      // Atualiza somente o nó de options, preservando outros campos da categoria
      const optionsRef = ref(db, `categories/${category.name}/options`);
      await set(optionsRef, options);
      alert("Opções atualizadas com sucesso.");
      onClose?.();
    } catch (e) {
      setError(`Erro ao salvar opções: ${e.message}`);
    }
  };

  return (
    <div className="edit-category-options d-flex flex-column align-items-start gap-2 w-100">
      <p className="mb-1">
        <strong>Editar opções da categoria</strong>
      </p>
      <small>Categoria: {category?.name}</small>

      {options.map((opt, index) => (
        <div key={index} className="d-flex align-items-center gap-2 w-100 edit-option-row">
          <input
            type="text"
            placeholder={`Opção ${index + 1} - Texto`
            }
            value={opt.text || ""}
            onChange={(e) => handleTextChange(index, e.target.value)}
            className="w-100"
          />
          <input
            type="url"
            placeholder={`Opção ${index + 1} - URL da Imagem`}
            value={opt.image || ""}
            onChange={(e) => handleImageChange(index, e.target.value)}
            className="w-100"
          />
          {opt.image && (
            <img src={opt.image} alt={`Opção ${index + 1}`} className="preview-image" />
          )}
          <button type="button" className="button-outline" onClick={() => removeOption(index)}>
            Remover
          </button>
        </div>
      ))}

      <div className="d-flex align-items-center gap-2 w-100">
        <button type="button" onClick={addOption} className="button-secondary">
          +1 Opção
        </button>
        <button type="button" onClick={handleSave} className="button-primary">
          Salvar alterações
        </button>
        <button type="button" onClick={onClose} className="button-outline">
          Fechar
        </button>
      </div>

      {error && <p className="error mt-2">{error}</p>}
    </div>
  );
}