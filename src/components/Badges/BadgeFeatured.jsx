import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function BadgeFeatured({ config, badge }) {
  const navigate = useNavigate();
  const Icon = config.icon;
  const accent = badge.color || config.accent;
  const isClickable = Boolean(badge.albumId);

  return (
    <div
      className={`badge-featured${isClickable ? " badge-card--clickable" : ""}`}
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

      <div className="badge-featured-body d-flex align-items-center gap-4">
        {badge.cover && (
          <img
            src={badge.cover}
            alt={badge.title}
            className="badge-featured-cover"
          />
        )}
        <div className="badge-featured-info text-left">
          <p className="badge-featured-title text-left">
            <strong>{badge.title}</strong>
          </p>
          {badge.subtitle && (
            <small className="badge-featured-subtitle text-left">
              {badge.subtitle}
            </small>
          )}
        </div>

        {badge.ratings ? (
          <div className="badge-featured-ratings d-flex align-items-center gap-3">
            {badge.ratings.map((rating) => (
              <div key={rating.label} className="badge-featured-rating">
                {rating.avatar ? (
                  <img
                    src={rating.avatar}
                    alt={rating.label}
                    title={rating.label}
                    className="badge-featured-rating-avatar"
                  />
                ) : (
                  <small>{rating.label}</small>
                )}
                <strong style={{ color: accent }}>
                  {typeof rating.value === "number"
                    ? rating.value.toFixed(2)
                    : "N/A"}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="badge-featured-metric" style={{ color: accent }}>
            <strong>{badge.metric}</strong>
            {badge.metricLabel && <small>{badge.metricLabel}</small>}
          </div>
        )}
      </div>
    </div>
  );
}

BadgeFeatured.propTypes = {
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
    ratings: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        value: PropTypes.number,
      }),
    ),
  }).isRequired,
};
