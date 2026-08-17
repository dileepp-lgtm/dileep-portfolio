export default function DeckCard({ card, onOpen }) {
  return (
    <button className="dcard" type="button"
            onClick={() => onOpen(card.key, card.cols)}
            aria-label={`${card.title} — open ${card.badge}`}>
      <div className="dm">
        <img src={card.cover} srcSet={card.srcset || undefined} sizes={card.sizes || undefined}
             width={card.w || undefined} height={card.h || undefined}
             decoding="async" loading="lazy" alt={card.title} />
        <span className="dbadge">{card.badge}</span>
      </div>
      <div className="db">
        <span className="t">{card.title}</span>
        <span className="c">{card.sub}</span>
        <span className="l">View all →</span>
      </div>
    </button>
  );
}
