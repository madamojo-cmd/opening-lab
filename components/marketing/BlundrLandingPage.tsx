"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./BlundrLandingPage.module.css";

const APP_URL =
  process.env.NEXT_PUBLIC_BLUNDR_APP_URL ?? "/signup?next=/onboarding/welcome";
const LOGIN_URL = process.env.NEXT_PUBLIC_BLUNDR_LOGIN_URL ?? "/login";

const ASSET_BASE = "/assets/landing";

const productSections = [
  {
    id: "daily",
    eyebrow: "Daily practice",
    headline: "The right positions, every day.",
    body: "Daily Blundr turns your repertoire and weak spots into focused positions. Make the move first. Then review the answer and keep your training on track.",
    image: `${ASSET_BASE}/daily_move_recall_chess_trainer.png`,
    alt: "Daily Blundr move recall trainer with a chess board and answer panel",
    width: 1536,
    height: 1024,
    placement: "right",
  },
  {
    id: "review",
    eyebrow: "Review",
    headline: "Mistakes become your review.",
    body: "Blundr brings back the positions you miss so weak spots turn into moves you actually remember.",
    image: `${ASSET_BASE}/chess_replay_training_dashboard.png`,
    alt: "Blundr replay dashboard showing a missed chess position ready for review",
    width: 1536,
    height: 1024,
    placement: "left",
  },
  {
    id: "repertoire",
    eyebrow: "Repertoire mastery",
    headline: "Build a repertoire you actually understand.",
    body: "Track opening mastery, spot weak branches, and know what to train next.",
    image: `${ASSET_BASE}/italian_game_mastery_dashboard.png`,
    alt: "Italian Game mastery dashboard with opening progress and branch status",
    width: 2172,
    height: 724,
    placement: "right",
  },
  {
    id: "habit",
    eyebrow: "Consistency",
    headline: "Train a little every day. Improve a lot over time.",
    body: "Close your daily rings, keep your streak alive, and always know the next best action.",
    image: `${ASSET_BASE}/daily_rings_training_dashboard.png`,
    alt: "Daily rings training dashboard showing Tempo, Battery, and Daily progress",
    width: 1536,
    height: 1024,
    placement: "left",
  },
] as const;

function BrandMark() {
  return (
    <span className={styles.brand} aria-label="Blundr">
      <span className={styles.brandGlyph} aria-hidden="true">B</span>
      <span className={styles.brandWord}>Blundr</span>
    </span>
  );
}

function PrimaryCta({ compact = false, location }: { compact?: boolean; location: string }) {
  return (
    <a
      href={APP_URL}
      className={compact ? styles.primaryCtaCompact : styles.primaryCta}
      data-cta-location={location}
    >
      Start training free
    </a>
  );
}

function SecondaryCta() {
  return (
    <a href="#how-it-works" className={styles.secondaryCta}>
      See how it works
    </a>
  );
}

function HeroVisual() {
  return (
    <div className={styles.heroVisual} aria-label="Blundr training board with Italian Game tempo cue">
      <div className={styles.heroBoard}>
        <Image
          src={`${ASSET_BASE}/interactive_chess_training_board.png`}
          alt="Interactive chess training board showing an Italian Game position"
          width={1254}
          height={1254}
          priority
          sizes="(max-width: 760px) 88vw, 520px"
        />
      </div>
      <div className={styles.heroCue}>
        <Image
          src={`${ASSET_BASE}/italian_game_tempo_cue_card.png`}
          alt="Italian Game tempo cue card explaining the next training move"
          width={1374}
          height={1145}
          priority
          sizes="(max-width: 760px) 74vw, 340px"
        />
      </div>
    </div>
  );
}

function DifferentiatorVisual() {
  return (
    <div className={styles.differentiatorVisual}>
      <div className={styles.differentiatorBoard}>
        <Image
          src={`${ASSET_BASE}/interactive_chess_training_board.png`}
          alt="Blundr chess board for practicing opening positions"
          width={1254}
          height={1254}
          sizes="(max-width: 760px) 82vw, 430px"
        />
      </div>
      <div className={styles.differentiatorCue}>
        <Image
          src={`${ASSET_BASE}/italian_game_tempo_cue_card.png`}
          alt="Tempo cue for responding when an opening line changes"
          width={1374}
          height={1145}
          sizes="(max-width: 760px) 62vw, 280px"
        />
      </div>
    </div>
  );
}

function ProductImage({
  src,
  alt,
  width,
  height,
  wide = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  wide?: boolean;
}) {
  return (
    <div className={`${styles.productImageFrame} ${wide ? styles.productImageFrameWide : ""}`}>
      <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 760px) 92vw, 560px" />
    </div>
  );
}

export function BlundrLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="#top" className={styles.brandLink} aria-label="Blundr home"><BrandMark /></a>
          <nav className={styles.desktopNav} aria-label="Primary navigation">
            <a href="#how-it-works">Why Blundr</a>
            <a href="#daily">Daily</a>
            <a href="#review">Review</a>
            <a href="#repertoire">Repertoire</a>
          </nav>
          <div className={styles.headerActions}>
            <a href={LOGIN_URL} className={styles.loginLink}>Log in</a>
            <PrimaryCta compact location="header" />
          </div>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span aria-hidden="true">{menuOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
        {menuOpen ? (
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>Why Blundr</a>
            <a href="#daily" onClick={() => setMenuOpen(false)}>Daily</a>
            <a href="#review" onClick={() => setMenuOpen(false)}>Review</a>
            <a href="#repertoire" onClick={() => setMenuOpen(false)}>Repertoire</a>
            <a href={LOGIN_URL}>Log in</a>
            <PrimaryCta location="mobile-menu" />
          </nav>
        ) : null}
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Opening training for real games</span>
            <h1>Learn the opening. Know what to do when it changes.</h1>
            <p>
              Blundr trains the positions behind your repertoire, brings back the moves you miss, and helps you keep playing when your opponent leaves the line.
            </p>
            <div className={styles.heroActions}>
              <PrimaryCta location="hero" />
              <SecondaryCta />
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section id="how-it-works" className={styles.differentiatorSection}>
        <div className={styles.sectionCopy}>
          <span className={styles.eyebrow}>Why it matters</span>
          <h2>Your opponent won&apos;t follow your study file.</h2>
          <p>
            Memorizing one line is not enough. Blundr helps you understand the position, respond to common continuations, and stay comfortable when the game changes.
          </p>
        </div>
        <DifferentiatorVisual />
      </section>

      {productSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={`${styles.productSection} ${section.placement === "left" ? styles.productSectionReverse : ""}`}
        >
          <div className={styles.sectionCopy}>
            <span className={styles.eyebrow}>{section.eyebrow}</span>
            <h2>{section.headline}</h2>
            <p>{section.body}</p>
          </div>
          <ProductImage
            src={section.image}
            alt={section.alt}
            width={section.width}
            height={section.height}
            wide={section.id === "repertoire"}
          />
        </section>
      ))}

      <section id="rewards" className={styles.rewardSection}>
        <div className={styles.rewardCopy}>
          <span className={styles.eyebrow}>Momentum</span>
          <h2>Progress should feel rewarding.</h2>
          <p>Close your rings, earn rewards, and keep momentum moving.</p>
        </div>
        <div className={styles.rewardImageFrame}>
          <Image
            src={`${ASSET_BASE}/blundr_common_reward_popup.png`}
            alt="Blundr reward popup after completing daily training rings"
            width={1254}
            height={1254}
            sizes="(max-width: 760px) 82vw, 390px"
          />
        </div>
      </section>

      <section className={styles.finalCtaSection}>
        <div className={styles.finalCtaCopy}>
          <span className={styles.eyebrow}>Start now</span>
          <h2>Start building a stronger opening game.</h2>
          <p>
            Train smarter openings, review the moves you miss, and build a repertoire that holds up in real games.
          </p>
          <PrimaryCta location="final" />
        </div>
        <div className={styles.finalCtaVisual}>
          <Image
            src={`${ASSET_BASE}/daily_rings_training_dashboard.png`}
            alt="Daily rings dashboard showing a focused Blundr training session"
            width={1536}
            height={1024}
            sizes="(max-width: 760px) 86vw, 440px"
          />
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <BrandMark />
          <p>Practical opening training for players who want preparation to hold up in real games.</p>
        </div>
        <nav className={styles.footerLinks} aria-label="Footer navigation">
          <a href="#how-it-works">Why Blundr</a>
          <a href="#daily">Daily</a>
          <a href="#review">Review</a>
          <a href="#repertoire">Repertoire</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </footer>
    </main>
  );
}
