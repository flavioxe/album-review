import { useEffect, useState } from "react";
import { CaretUp } from "phosphor-react";

import "./ScrollToTopButton.scss";

const SCROLL_THRESHOLD = 400;

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="scroll-to-top-button"
      aria-label="Voltar ao topo"
    >
      <CaretUp size={20} weight="bold" color="#fff" />
    </button>
  );
}
