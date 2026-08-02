import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import { computeTimelinePoints } from "../../utils/ratingsTimeline";
import { USER_NAMES, USER_AVATARS } from "../../utils/badges";

import "./RatingsTimeline.scss";

const DESKTOP_VIEW_WIDTH = 1000;
const MOBILE_POINT_SPACING = 96;
const MOBILE_MIN_WIDTH = 480;
const AVATAR_RADIUS = 11;
const COVER_RADIUS_MOBILE = 16;

const USER1_COLOR = "#4C6FFF";
const USER2_COLOR = "#BD2626";

const MOBILE_BREAKPOINT = "(max-width: 600px)";

const formatMonthYear = (date) =>
  `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getFullYear()).slice(-2)}`;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_BREAKPOINT).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const handleChange = (event) => setIsMobile(event.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

export default function RatingsTimeline({ albums }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();

  const VIEW_HEIGHT = isMobile ? 420 : 340;
  const PADDING = isMobile
    ? { top: 24, right: 24, bottom: 36, left: 40 }
    : { top: 20, right: 32, bottom: 30, left: 34 };
  const PLOT_HEIGHT = VIEW_HEIGHT - PADDING.top - PADDING.bottom;
  const monthsWindow = isMobile ? 6 : 12;
  const maxMonthLabels = isMobile ? 4 : 8;

  const allPoints = useMemo(() => computeTimelinePoints(albums), [albums]);

  const points = useMemo(() => {
    if (showAll || allPoints.length === 0) return allPoints;

    const latestDate = allPoints[allPoints.length - 1].date;
    const cutoff = new Date(latestDate);
    cutoff.setMonth(cutoff.getMonth() - (monthsWindow - 1));
    cutoff.setDate(1);

    const recentPoints = allPoints.filter((point) => point.date >= cutoff);
    return recentPoints.length >= 3 ? recentPoints : allPoints;
  }, [allPoints, showAll, monthsWindow]);

  if (allPoints.length < 3) return null;

  const isFiltered = points.length < allPoints.length;

  // No mobile o gráfico vira rolável horizontalmente com espaço fixo por
  // ponto (em vez de espremer tudo pra caber na tela), pra capa/números
  // ficarem legíveis de verdade.
  const VIEW_WIDTH = isMobile
    ? Math.max(MOBILE_MIN_WIDTH, points.length * MOBILE_POINT_SPACING)
    : DESKTOP_VIEW_WIDTH;
  const PLOT_WIDTH = VIEW_WIDTH - PADDING.left - PADDING.right;

  const allValues = points.flatMap((point) => [point.user1, point.user2]);
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const yMin = Math.max(0, rawMin - 0.5);
  const yMax = Math.min(10, rawMax + 0.5);
  const yRange = yMax - yMin || 1;

  const yScale = (value) =>
    PADDING.top + (1 - (value - yMin) / yRange) * PLOT_HEIGHT;

  const xScale = (index) =>
    PADDING.left +
    (points.length > 1 ? index / (points.length - 1) : 0.5) * PLOT_WIDTH;

  const linePath = (key) =>
    points
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command}${xScale(index).toFixed(2)},${yScale(point[key]).toFixed(2)}`;
      })
      .join(" ");

  const gapAreaPath = () => {
    const top = points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${xScale(index).toFixed(2)},${yScale(point.user1).toFixed(2)}`,
      )
      .join(" ");
    const bottom = [...points]
      .map((point, index) => index)
      .reverse()
      .map(
        (index) =>
          `L${xScale(index).toFixed(2)},${yScale(points[index].user2).toFixed(2)}`,
      )
      .join(" ");
    return `${top} ${bottom} Z`;
  };

  const yTicks = [yMin, (yMin + yMax) / 2, yMax];

  const allMonthTicks = [];
  let lastMonthKey = null;
  points.forEach((point, index) => {
    const monthKey = `${point.date.getFullYear()}-${point.date.getMonth()}`;
    if (monthKey !== lastMonthKey) {
      allMonthTicks.push({ index, label: formatMonthYear(point.date) });
      lastMonthKey = monthKey;
    }
  });

  // Evita rótulos amontoados: mostra no máximo `maxMonthLabels`, sempre
  // incluindo o mais recente.
  const monthTickStep = Math.max(
    1,
    Math.ceil(allMonthTicks.length / maxMonthLabels),
  );
  const monthTicks = allMonthTicks.filter(
    (_, tickIndex) =>
      tickIndex % monthTickStep === 0 || tickIndex === allMonthTicks.length - 1,
  );

  const stripWidth = points.length > 1 ? PLOT_WIDTH / (points.length - 1) : PLOT_WIDTH;

  const active = activeIndex !== null ? points[activeIndex] : null;
  const activeX = activeIndex !== null ? xScale(activeIndex) : null;
  const tooltipTop =
    activeIndex !== null
      ? Math.min(yScale(active.user1), yScale(active.user2))
      : null;

  const tooltipLeftPercent =
    activeX !== null ? (activeX / VIEW_WIDTH) * 100 : null;
  let tooltipAlign = "center";
  if (tooltipLeftPercent !== null) {
    if (tooltipLeftPercent < 15) tooltipAlign = "start";
    else if (tooltipLeftPercent > 85) tooltipAlign = "end";
  }

  const lastPoint = points[points.length - 1];
  const lastX = xScale(points.length - 1);

  // No mobile, mostra a capinha do álbum e as notas em cada ponto (sem
  // hover confiável no touch)
  const mobileCoverPoints = isMobile
    ? points.map((point, index) => ({
        point,
        x: xScale(index),
        y: Math.max(
          PADDING.top + COVER_RADIUS_MOBILE,
          Math.min(yScale(point.user1), yScale(point.user2)) -
            COVER_RADIUS_MOBILE -
            4,
        ),
      }))
    : [];

  return (
    <section className="ratings-timeline w-100">
      <div className="d-flex align-items-center justify-content-between mb-2 w-100">
        <h6>Evolução das notas</h6>
        <div className="ratings-timeline-legend d-flex align-items-center gap-3">
          <span
            className="ratings-timeline-legend-item"
            style={{ color: USER1_COLOR }}
          >
            <img src={USER_AVATARS.user1} alt={USER_NAMES.user1} />
            {USER_NAMES.user1}
          </span>
          <span
            className="ratings-timeline-legend-item"
            style={{ color: USER2_COLOR }}
          >
            <img src={USER_AVATARS.user2} alt={USER_NAMES.user2} />
            {USER_NAMES.user2}
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-2 w-100">
        <small className="ratings-timeline-hint text-left">
          Baseado na data de lançamento de cada álbum avaliado por ambos.
        </small>

        {isFiltered || showAll ? (
          <button
            type="button"
            className="ratings-timeline-range-toggle"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? `Últimos ${monthsWindow} meses` : "Ver tudo"}
          </button>
        ) : null}
      </div>

      <div
        className={`ratings-timeline-chart${isMobile ? " ratings-timeline-chart--scroll" : ""}`}
      >
        <div
          className="ratings-timeline-chart-inner"
          style={isMobile ? { width: VIEW_WIDTH, height: VIEW_HEIGHT } : undefined}
        >
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="ratings-timeline-svg"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <clipPath id="ratings-timeline-avatar-user1">
              <circle
                cx={lastX}
                cy={yScale(lastPoint.user1)}
                r={AVATAR_RADIUS}
              />
            </clipPath>
            <clipPath id="ratings-timeline-avatar-user2">
              <circle
                cx={lastX}
                cy={yScale(lastPoint.user2)}
                r={AVATAR_RADIUS}
              />
            </clipPath>
            {mobileCoverPoints
              .filter(({ point }) => Boolean(point.cover))
              .map(({ point, x, y }) => (
                <clipPath
                  key={`clip-${point.albumId}`}
                  id={`ratings-timeline-cover-${point.albumId}`}
                >
                  <circle cx={x} cy={y} r={COVER_RADIUS_MOBILE} />
                </clipPath>
              ))}
          </defs>

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={VIEW_WIDTH - PADDING.right}
                y1={yScale(tick)}
                y2={yScale(tick)}
                className="ratings-timeline-gridline"
              />
              <text
                x={PADDING.left - 8}
                y={yScale(tick) + 3}
                className="ratings-timeline-axis-label"
                textAnchor="end"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}

          {monthTicks.map(({ index, label }) => (
            <text
              key={`${index}-${label}`}
              x={xScale(index)}
              y={VIEW_HEIGHT - 8}
              className="ratings-timeline-axis-label"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

          <path className="ratings-timeline-gap-area" d={gapAreaPath()} />

          <path
            className="ratings-timeline-line"
            d={linePath("user1")}
            stroke={USER1_COLOR}
          />
          <path
            className="ratings-timeline-line"
            d={linePath("user2")}
            stroke={USER2_COLOR}
          />

          {points.map((point, index) => (
            <g key={point.albumId} className="ratings-timeline-dots">
              <circle
                cx={xScale(index)}
                cy={yScale(point.user1)}
                r={2.5}
                fill={USER1_COLOR}
              />
              <circle
                cx={xScale(index)}
                cy={yScale(point.user2)}
                r={2.5}
                fill={USER2_COLOR}
              />
            </g>
          ))}

          {mobileCoverPoints
            .filter(({ point }) => Boolean(point.cover))
            .map(({ point, x, y }) => (
              <g
                key={`cover-${point.albumId}`}
                className="ratings-timeline-cover-point"
              >
                <circle cx={x} cy={y} r={COVER_RADIUS_MOBILE + 2} fill="#fff" />
                <image
                  href={point.cover}
                  x={x - COVER_RADIUS_MOBILE}
                  y={y - COVER_RADIUS_MOBILE}
                  width={COVER_RADIUS_MOBILE * 2}
                  height={COVER_RADIUS_MOBILE * 2}
                  clipPath={`url(#ratings-timeline-cover-${point.albumId})`}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            ))}

          <circle
            cx={lastX}
            cy={yScale(lastPoint.user1)}
            r={AVATAR_RADIUS + 1.5}
            fill="#fff"
          />
          <image
            href={USER_AVATARS.user1}
            x={lastX - AVATAR_RADIUS}
            y={yScale(lastPoint.user1) - AVATAR_RADIUS}
            width={AVATAR_RADIUS * 2}
            height={AVATAR_RADIUS * 2}
            clipPath="url(#ratings-timeline-avatar-user1)"
            preserveAspectRatio="xMidYMid slice"
          />

          <circle
            cx={lastX}
            cy={yScale(lastPoint.user2)}
            r={AVATAR_RADIUS + 1.5}
            fill="#fff"
          />
          <image
            href={USER_AVATARS.user2}
            x={lastX - AVATAR_RADIUS}
            y={yScale(lastPoint.user2) - AVATAR_RADIUS}
            width={AVATAR_RADIUS * 2}
            height={AVATAR_RADIUS * 2}
            clipPath="url(#ratings-timeline-avatar-user2)"
            preserveAspectRatio="xMidYMid slice"
          />

          {activeIndex !== null && (
            <line
              x1={activeX}
              x2={activeX}
              y1={PADDING.top}
              y2={VIEW_HEIGHT - PADDING.bottom}
              className="ratings-timeline-hover-line"
            />
          )}

          {points.map((point, index) => (
            <rect
              key={point.albumId}
              x={xScale(index) - stripWidth / 2}
              y={PADDING.top}
              width={stripWidth}
              height={PLOT_HEIGHT}
              fill="transparent"
              className="ratings-timeline-hit-area"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => navigate(`/album-review/${point.albumId}`)}
            />
          ))}
        </svg>

        {active && (
          <div
            className={`ratings-timeline-tooltip ratings-timeline-tooltip--${tooltipAlign}`}
            style={{
              left: `${tooltipLeftPercent}%`,
              top: `${(tooltipTop / VIEW_HEIGHT) * 100}%`,
            }}
          >
            {active.cover && (
              <img src={active.cover} alt={active.name} className="ratings-timeline-tooltip-cover" />
            )}
            <div className="text-left">
              <p className="mb-0 ratings-timeline-tooltip-title">
                <strong>{active.name}</strong>
              </p>
              <small className="ratings-timeline-tooltip-artist">{active.artist}</small>
              <div className="ratings-timeline-tooltip-ratings">
                <span style={{ color: USER1_COLOR }}>
                  {USER_NAMES.user1}: <strong>{active.user1.toFixed(1)}</strong>
                </span>
                <span style={{ color: USER2_COLOR }}>
                  {USER_NAMES.user2}: <strong>{active.user2.toFixed(1)}</strong>
                </span>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}

RatingsTimeline.propTypes = {
  albums: PropTypes.array.isRequired,
};
