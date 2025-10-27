import React from "react";
import "./HomeSectionLoaders.scss";

export const RankingLoader = () => (
  <div className="section-loader">
    <div className="loader-title skeleton" style={{ width: "40%", height: 18 }} />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="loader-row">
        <div className="skeleton avatar" />
        <div className="skeleton line" style={{ width: "55%" }} />
        <div className="skeleton pill" style={{ width: 60 }} />
      </div>
    ))}
  </div>
);

export const WorstRankingLoader = () => (
  <div className="section-loader">
    <div className="loader-title skeleton" style={{ width: "40%", height: 18 }} />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="loader-row">
        <div className="skeleton avatar" />
        <div className="skeleton line" style={{ width: "55%" }} />
        <div className="skeleton pill" style={{ width: 60 }} />
      </div>
    ))}
  </div>
);

export const CommentsLoader = () => (
  <div className="comments-loader">
    <div className="loader-title skeleton" style={{ width: 160, height: 18 }} />
    <div className="loader-card">
      <div className="skeleton cover" />
      <div className="loader-content">
        <div className="skeleton line" style={{ width: "30%" }} />
        <div className="skeleton line" style={{ width: "50%" }} />
        <div className="skeleton block" style={{ width: "100%", height: 48 }} />
      </div>
    </div>
  </div>
);

export const LatestsLoader = () => (
  <div className="latests-loader">
    <div className="loader-title skeleton" style={{ width: 180, height: 18 }} />
    <div className="grid">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="skeleton card" />
      ))}
    </div>
  </div>
);