export async function translateToPortuguese(text) {
  const value = (text || "").trim();
  if (!value) return "";

  try {
    const response = await fetch(
      `/api/translate?text=${encodeURIComponent(value)}&target=pt`,
    );
    if (!response.ok) return value;

    const data = await response.json();
    return data?.translatedText || value;
  } catch (error) {
    console.error("Erro ao traduzir texto:", error);
    return value;
  }
}
