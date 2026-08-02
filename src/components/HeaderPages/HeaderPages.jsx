import { useNavigate } from "react-router-dom";
import { House } from "phosphor-react";
import { navigateBack } from "../../utils/navigation";

export default function HeaderPages({ text }) {
  const navigate = useNavigate();

  return (
    <header className="d-flex align-items-center justify-content-between w-100">
      <div className="d-flex align-items-center gap-2">
        <button
          onClick={() => navigateBack(navigate)}
          className="d-flex align-items-center gap-2 button-outline"
        >
          <svg
            width="6"
            height="11"
            viewBox="0 0 6 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.94692 1.39394L5.04793 0.5L0.0529785 5.5L5.05298 10.5L5.94692 9.60606L1.84086 5.5L5.94692 1.39394Z"
              fill="#1A1A1A"
            />
          </svg>{" "}
          Voltar
        </button>

        <button
          onClick={() => navigate("/")}
          className="d-flex align-items-center gap-2 button-outline"
        >
          <House size={14} weight="bold" color="#1A1A1A" />
          Home
        </button>
      </div>

      <p>
        <strong>{text}</strong>
      </p>
    </header>
  );
}
