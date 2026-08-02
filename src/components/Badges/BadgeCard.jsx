import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function BadgeCard({ config, badge }) {
  const navigate = useNavigate();
  const Icon = config.icon;
  const accent = badge.color || config.accent;
  const isClickable = Boolean(badge.albumId);

  return (
    <div
      className={`badge-card${isClickable ? " badge-card--clickable" : ""}`}
      onClick={
        isClickable
          ? () => navigate(`/album-review/${badge.albumId}`)
          : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <span
        className="badge-pin"
        style={{ color: accent }}
        title={config.label}
      >
        <Icon size={16} weight="fill" />
      </span>

      <span className="badge-card-label" style={{ backgroundColor: accent }}>
        {config.label}
      </span>

      <div className="badge-card-body d-flex align-items-center gap-3">
        {badge.cover && (
          <img
            src={badge.cover}
            alt={badge.title}
            className="badge-card-cover"
          />
        )}
        <div className="badge-card-info text-left">
          <p className="badge-card-title text-left">
            <strong>{badge.title}</strong>
          </p>
          {badge.subtitle && (
            <small className="badge-card-subtitle text-left">
              {badge.subtitle}
            </small>
          )}
        </div>
      </div>

      <div className="badge-card-metric" style={{ color: accent }}>
        <strong>{badge.metric}</strong>
        {badge.metricLabel && <small>{badge.metricLabel}</small>}
      </div>
    </div>
  );
}

BadgeCard.propTypes = {
  config: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    accent: PropTypes.string.isRequired,
  }).isRequired,
  badge: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    cover: PropTypes.string,
    color: PropTypes.string,
    albumId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    metric: PropTypes.string,
    metricLabel: PropTypes.string,
  }).isRequired,
};
