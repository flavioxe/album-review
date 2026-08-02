import PropTypes from "prop-types";

export default function BadgeRanking({ config, badge }) {
  const Icon = config.icon;
  const [top, ...rest] = badge.items;
  const accent = top.color || config.accent;

  return (
    <div className="badge-ranking">
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

      <div className="badge-ranking-top d-flex align-items-center gap-3">
        {top.cover && (
          <img
            src={top.cover}
            alt={top.title}
            className="badge-ranking-top-cover"
          />
        )}
        <div className="badge-ranking-top-info text-left">
          <p className="badge-ranking-top-title text-left">
            <strong>{top.title}</strong>
          </p>
          {top.subtitle && (
            <small className="badge-ranking-top-subtitle text-left">
              {top.subtitle}
            </small>
          )}
        </div>
        <div className="badge-ranking-top-metric d-flex align-items-center gap-2">
          {top.evaluatorAvatar && (
            <img
              src={top.evaluatorAvatar}
              alt={top.evaluatorName}
              title={top.evaluatorName}
              className="badge-ranking-evaluator-avatar"
            />
          )}
          <div style={{ color: accent }}>
            <strong>{top.metric}</strong>
            {top.metricLabel && <small>{top.metricLabel}</small>}
          </div>
        </div>
      </div>

      {rest.length > 0 && (
        <div className="badge-ranking-list">
          {rest.map((item, index) => (
            <div
              key={item.title}
              className="badge-ranking-row d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center gap-2 badge-ranking-row-info">
                <span className="badge-ranking-index">{index + 2}</span>
                {item.cover && (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="badge-ranking-row-cover"
                  />
                )}
                <span className="badge-ranking-row-title text-left">
                  {item.title}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {item.evaluatorAvatar && (
                  <img
                    src={item.evaluatorAvatar}
                    alt={item.evaluatorName}
                    title={item.evaluatorName}
                    className="badge-ranking-evaluator-avatar badge-ranking-evaluator-avatar--small"
                  />
                )}
                <span className="badge-ranking-row-metric">
                  {item.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

BadgeRanking.propTypes = {
  config: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    accent: PropTypes.string.isRequired,
  }).isRequired,
  badge: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        subtitle: PropTypes.string,
        cover: PropTypes.string,
        color: PropTypes.string,
        metric: PropTypes.string,
        metricLabel: PropTypes.string,
        evaluatorName: PropTypes.string,
        evaluatorAvatar: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
};
