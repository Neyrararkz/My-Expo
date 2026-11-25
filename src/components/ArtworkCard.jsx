import { useState } from "react";
import { Link } from "react-router-dom";
import { artistName, iiifUrl } from "../lib/art.js";

export default function ArtworkCard({ work, iiifBase }) {
  const [broken, setBroken] = useState(false);
  const src = iiifUrl(iiifBase, work.image_id, 843);
  const w = work.thumbnail?.width;
  const h = work.thumbnail?.height;
  const ratio = w && h ? `${w} / ${h}` : "1 / 1";
  const alt = work.thumbnail?.alt_text || work.title || "Произведение искусства";

  return (
    <Link to={`/artwork/${work.id}`} className="card">
      <div className="card-img" style={{ aspectRatio: ratio }}>
        {src && !broken ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setBroken(true)}
            />
        ) : (
          <span className="placeholder">Нет изображения</span>
        )}
      </div>
      <div className="card-title">{work.title}</div>
      <div className="card-author">{artistName(work.artist_display) || "Автор неизвестен"}</div>
    </Link>
  );
}