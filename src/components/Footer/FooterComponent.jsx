import React from "react";
import "./Footer.scss";

export default function FooterComopnent({ user, onLogout }) {
  return (
    <footer className="d-flex flex-column gap-3">
      {user && (
        <button onClick={onLogout} className="btn btn-danger">
          Logout
        </button>
      )}
      <small className="d-flex gap-1">
        made by
        <a href="https://instagram.com/ducardo" target="_blank">
          {" "}
          <small>Ducardo</small>
        </a>
        and
        <a href="https://instagram.com/flavioxe" target="_blank">
          {" "}
          <small>Flavioxe</small>
        </a>
        🫰🏼
      </small>
    </footer>
  );
}
