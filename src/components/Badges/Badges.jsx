import { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Fire,
  Handshake,
  Heart,
  Sword,
  Skull,
  ThumbsDown,
  Repeat,
  CalendarBlank,
  MusicNotesSimple,
  Medal,
} from "phosphor-react";

import { computeBadges, USER_NAMES } from "../../utils/badges";
import BadgeCard from "./BadgeCard";
import BadgeFeatured from "./BadgeFeatured";
import BadgeRanking from "./BadgeRanking";

import "./Badges.scss";

const BADGE_CONFIG = {
  lowest_album_average: {
    label: "Álbum com menor média",
    icon: Skull,
    accent: "#BD2626",
  },
  artist_lowest_average: {
    label: "Artista com menor média histórica",
    icon: ThumbsDown,
    accent: "#767676",
  },
  most_discordant_album: {
    label: "Álbum mais discordado",
    icon: Sword,
    accent: "#BD2626",
  },
  most_consensual_album: {
    label: "Álbum mais consensual",
    icon: Handshake,
    accent: "#1A8F4C",
  },
  nemesis_artist: {
    label: "Nêmesis musical",
    icon: Fire,
    accent: "#BD2626",
  },
  soulmate_artist: {
    label: "Alma gêmea musical",
    icon: Heart,
    accent: "#D14D72",
  },
  most_rated_artist: {
    label: "Artistas com mais álbuns avaliados",
    icon: Repeat,
    accent: "#1A1A1A",
    variant: "ranking",
  },
  solo_top_albums: {
    label: "Top 5 notas individuais",
    icon: Medal,
    accent: "#4C6FFF",
    variant: "ranking",
  },
  most_recent_release: {
    label: "Lançamento mais recente avaliado",
    icon: CalendarBlank,
    accent: "#1A1A1A",
    variant: "featured",
  },
  lowest_track_user1: {
    label: `Nota mais baixa de ${USER_NAMES.user1}`,
    icon: MusicNotesSimple,
    accent: "#767676",
  },
  lowest_track_user2: {
    label: `Nota mais baixa de ${USER_NAMES.user2}`,
    icon: MusicNotesSimple,
    accent: "#767676",
  },
};

const VARIANT_ORDER = { featured: 0, ranking: 1, default: 2 };

export default function Badges({ albums }) {
  const badges = useMemo(() => {
    const computed = computeBadges(albums);
    return [...computed].sort((a, b) => {
      const orderA = VARIANT_ORDER[BADGE_CONFIG[a.type].variant || "default"];
      const orderB = VARIANT_ORDER[BADGE_CONFIG[b.type].variant || "default"];
      return orderA - orderB;
    });
  }, [albums]);

  if (badges.length === 0) return null;

  return (
    <section className="badges-section w-100">
      <div className="d-flex align-items-center justify-content-between mb-4 w-100">
        <h6>Conquistas</h6>
      </div>

      <div className="badges-grid">
        {badges.map((badge) => {
          const config = BADGE_CONFIG[badge.type];

          if (config.variant === "featured") {
            return (
              <BadgeFeatured key={badge.type} config={config} badge={badge} />
            );
          }

          if (config.variant === "ranking") {
            return (
              <BadgeRanking key={badge.type} config={config} badge={badge} />
            );
          }

          return <BadgeCard key={badge.type} config={config} badge={badge} />;
        })}
      </div>
    </section>
  );
}

Badges.propTypes = {
  albums: PropTypes.array.isRequired,
};
