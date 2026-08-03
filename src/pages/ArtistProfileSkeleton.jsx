export default function ArtistProfileSkeleton() {
  return (
    <section className="d-flex flex-column align-items-start gap-3 w-100 artist-profile">
      <div className="artist-banner-skeleton skeleton" />

      <div className="artist-content d-flex flex-column align-items-start gap-3 w-100">
        <div className="artist-two-columns w-100">
          <div className="artist-bio-column d-flex flex-column gap-2">
            <div className="skeleton line" style={{ width: "100%" }} />
            <div className="skeleton line" style={{ width: "95%" }} />
            <div className="skeleton line" style={{ width: "80%" }} />
          </div>
          <div className="artist-rating-column d-flex flex-column gap-2">
            <div className="skeleton line" style={{ width: "60%" }} />
            <div className="d-flex gap-3">
              <div className="skeleton pill" style={{ width: 60 }} />
              <div className="skeleton pill" style={{ width: 60 }} />
            </div>
          </div>
        </div>

        <div className="skeleton line" style={{ width: 140, height: 18 }} />
        <div className="d-flex flex-column gap-2 w-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="d-flex align-items-center gap-2 w-100">
              <div className="skeleton avatar" style={{ width: 40, height: 40 }} />
              <div className="skeleton line" style={{ width: "40%" }} />
            </div>
          ))}
        </div>

        <div className="skeleton line" style={{ width: 100, height: 18 }} />
        <div className="album-grid w-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton card" style={{ height: 200 }} />
          ))}
        </div>
      </div>
    </section>
  );
}
