import { Cta } from "../components/MarketingShell";

const ASSET_BASE = "/assets/landing";

const sections = [
  {
    id: "daily",
    eyebrow: "Daily practice",
    headline: "The right positions, every day.",
    body: "Daily Blundr turns your repertoire and weak spots into focused positions. Make the move first. Then review the answer and keep your training on track.",
    image: "daily_move_recall_chess_trainer.png",
    alt: "Daily Blundr move recall trainer",
  },
  {
    id: "review",
    eyebrow: "Review",
    headline: "Mistakes become your review.",
    body: "Blundr brings back the positions you miss so weak spots turn into moves you actually remember.",
    image: "chess_replay_training_dashboard.png",
    alt: "Blundr replay dashboard for a missed move",
  },
  {
    id: "repertoire",
    eyebrow: "Repertoire mastery",
    headline: "Build a repertoire you actually understand.",
    body: "Track opening mastery, spot weak branches, and know what to train next.",
    image: "italian_game_mastery_dashboard.png",
    alt: "Italian Game mastery dashboard",
  },
  {
    id: "habit",
    eyebrow: "Consistency",
    headline: "Train a little every day. Improve a lot over time.",
    body: "Close your daily rings, keep your streak alive, and always know the next best action.",
    image: "daily_rings_training_dashboard.png",
    alt: "Daily rings training dashboard",
  },
];

function ProductImage({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="launch-media">
      <img src={`${ASSET_BASE}/${image}`} alt={alt} />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="launch-hero">
        <div>
          <p className="eyebrow">Opening training for real games</p>
          <h1>Learn the opening. Know what to do when it changes.</h1>
          <p className="lede">
            Blundr trains the positions behind your repertoire, brings back the moves you miss, and helps you keep playing when your opponent leaves the line.
          </p>
          <p className="launch-actions">
            <Cta source="homepage" />
            <a href="#how-it-works">See how it works</a>
          </p>
        </div>
        <div className="launch-hero-media">
          <img src={`${ASSET_BASE}/interactive_chess_training_board.png`} alt="Interactive chess training board" />
          <img src={`${ASSET_BASE}/italian_game_tempo_cue_card.png`} alt="Italian Game tempo cue card" />
        </div>
      </section>

      <section id="how-it-works" className="launch-section">
        <div>
          <p className="eyebrow">Why it matters</p>
          <h2>Your opponent won't follow your study file.</h2>
          <p>Memorizing one line is not enough. Blundr helps you understand the position, respond to common continuations, and stay comfortable when the game changes.</p>
        </div>
        <ProductImage image="interactive_chess_training_board.png" alt="Blundr board for opening practice" />
      </section>

      {sections.map((section, index) => (
        <section key={section.id} id={section.id} className={`launch-section ${index % 2 ? "reverse" : ""}`}>
          <div>
            <p className="eyebrow">{section.eyebrow}</p>
            <h2>{section.headline}</h2>
            <p>{section.body}</p>
          </div>
          <ProductImage image={section.image} alt={section.alt} />
        </section>
      ))}

      <section id="rewards" className="launch-section">
        <div>
          <p className="eyebrow">Momentum</p>
          <h2>Progress should feel rewarding.</h2>
          <p>Close your rings, earn rewards, and keep momentum moving.</p>
        </div>
        <ProductImage image="blundr_common_reward_popup.png" alt="Blundr reward popup" />
      </section>

      <section className="launch-final">
        <div>
          <p className="eyebrow">Start now</p>
          <h2>Start building a stronger opening game.</h2>
          <p>Train smarter openings, review the moves you miss, and build a repertoire that holds up in real games.</p>
          <Cta source="homepage" />
        </div>
        <ProductImage image="daily_rings_training_dashboard.png" alt="Daily rings dashboard" />
      </section>
    </>
  );
}
