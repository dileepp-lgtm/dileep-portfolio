import Work from '../components/Work.jsx';

/* The full gallery — decks, agency covers and motion videos, with the
   discipline filter. Opening a cover is handled by the shared DeckViewer
   mounted in App, via the onOpenDeck handler passed down here. */
export default function WorkPage({ onOpenDeck }) {
  return (
    <div className="page">
      <Work onOpenDeck={onOpenDeck} />
    </div>
  );
}
