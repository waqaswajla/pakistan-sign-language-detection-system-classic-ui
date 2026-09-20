/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button, TabButton } from "../components/Button";

const API = "http://127.0.0.1:8000/api";
const TOTAL = 37;

const LABELS: string[] = [
  "ء","ا","ب","ت","ث","ج","ح","خ","د","ذ",
  "ر","ز","س","ش","ص","ض","ط","ظ","ع","غ",
  "ف","ق","ل","م","ن","و","ٹ","پ","چ","ڈ",
  "ژ","ک","گ","ں","ھ","ی","ے",
];

const normalize = (s: string) => s.replace(/‬/g, "").trim();

function pickRandom(exclude: number) {
  if (TOTAL <= 1) return 0;
  let n: number;
  do { n = Math.floor(Math.random() * TOTAL); } while (n === exclude);
  return n;
}

export default function LearnPage() {
  const [current, setCurrent] = useState(1);
  const [detecting, setDetecting] = useState(false);
  const [detectedLetter, setDetectedLetter] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Quiz mode
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showHint, setShowHint] = useState(false);
  const roundCorrectRef = useRef(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetLabel = quizMode ? LABELS[quizIndex] : LABELS[current - 1];
  const imageIndex = quizMode ? quizIndex + 1 : current;

  function nextQuizLetter(wasCorrect: boolean) {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    setScore(prev => ({ correct: prev.correct + (wasCorrect ? 1 : 0), total: prev.total + 1 }));
    setQuizIndex(prev => pickRandom(prev));
    setDetectedLetter("");
    setResult(null);
    setShowHint(false);
    roundCorrectRef.current = false;
  }

  function enterQuizMode() {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    setQuizMode(true);
    setQuizIndex(Math.floor(Math.random() * TOTAL));
    setScore({ correct: 0, total: 0 });
    setDetectedLetter("");
    setResult(null);
    setShowHint(false);
    roundCorrectRef.current = false;
  }

  function enterLearnMode() {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    setQuizMode(false);
    setDetectedLetter("");
    setResult(null);
    roundCorrectRef.current = false;
  }

  async function startCamera() {
    await fetch(`${API}/start-capture`, { method: "POST" }).catch(() => {});
    setDetecting(true);
    setDetectedLetter("");
    setResult(null);
  }

  async function stopCamera() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    await fetch(`${API}/stop-capture`, { method: "POST" }).catch(() => {});
    setDetecting(false);
    setDetectedLetter("");
    setResult(null);
  }

  useEffect(() => {
    if (!detecting) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: 0, speech: 0 }),
        });
        const data = await res.json();
        if (data.label && data.label !== "no match" && data.label !== "no confidence") {
          const isCorrect = normalize(data.label) === normalize(targetLabel);
          setDetectedLetter(data.label);
          if (quizMode) {
            if (isCorrect && !roundCorrectRef.current) {
              roundCorrectRef.current = true;
              setResult("correct");
              autoAdvanceRef.current = setTimeout(() => nextQuizLetter(true), 1500);
            } else if (!isCorrect && !roundCorrectRef.current) {
              setResult("wrong");
            }
          } else {
            setResult(isCorrect ? "correct" : "wrong");
          }
        } else {
          setDetectedLetter("");
          if (!roundCorrectRef.current) setResult(null);
        }
      } catch { /* backend unreachable */ }
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [detecting, current, quizMode, quizIndex, targetLabel]);

  function next() {
    setCurrent(p => Math.min(p + 1, TOTAL));
    setDetectedLetter("");
    setResult(null);
  }

  function prev() {
    setCurrent(p => Math.max(p - 1, 1));
    setDetectedLetter("");
    setResult(null);
  }

  return (
    <main style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot-accent" />
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>Learn Signs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="badge">Pakistan Sign Language</div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Controls */}
        <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 3, border: '1px solid var(--border)', gap: 3 }}>
            <TabButton active={!quizMode} onClick={enterLearnMode}>Learn</TabButton>
            <TabButton active={quizMode} onClick={enterQuizMode}>Quiz</TabButton>
          </div>

          {/* Quiz score */}
          {quizMode && (
            <div className="dark-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{score.correct} / {score.total}</span>
            </div>
          )}

          {/* Target letter */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {quizMode ? 'Sign This Letter' : 'Sign Letter'}
            </span>
            <div className="dark-card" style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', minHeight: 64 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: 'var(--text)', lineHeight: 1, direction: 'rtl' }}>
                {targetLabel}
              </span>
            </div>
          </div>

          {/* Detected letter */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Detected Letter</span>
            <div className="dark-card" style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 16px', minHeight: 64 }}>
              <span style={{
                fontSize: 40, fontWeight: 700, lineHeight: 1, direction: 'rtl',
                color: result === 'correct' ? '#4ade80' : result === 'wrong' ? '#fb397d' : 'var(--text-ghost)',
              }}>
                {detectedLetter || '—'}
              </span>
            </div>
          </div>

          {/* Sign image */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Image of Sign</span>
              {quizMode ? (
                <Button variant="ghost" onClick={() => setShowHint(h => !h)}
                  style={{ fontSize: 12, color: showHint ? '#fb397d' : 'var(--text-muted)' }}>
                  {showHint ? 'Hide Hint' : 'Hint'}
                </Button>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{current} / {TOTAL}</span>
              )}
            </div>
            <div className="dark-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, minHeight: 150, flex: 1 }}>
              {(!quizMode || showHint) ? (
                <Image
                  src={`/images/alphabet/${imageIndex}.png`}
                  alt={`Sign ${imageIndex}`}
                  width={160}
                  height={160}
                  style={{ objectFit: 'contain', maxHeight: '100%' }}
                />
              ) : (
                <span style={{ fontSize: 64, color: 'var(--text-ghost)', fontWeight: 300 }}>?</span>
              )}
            </div>
          </div>

          {/* Bottom buttons */}
          {quizMode ? (
            <Button variant="ghost" onClick={() => nextQuizLetter(false)}
              style={{ width: '100%', height: 42, border: '1px solid var(--border)' }}>
              Skip →
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Button onClick={prev} disabled={current === 1} style={{ flex: 1, height: 42 }}>
                ← Previous
              </Button>
              <Button onClick={next} disabled={current === TOTAL} style={{ flex: 1, height: 42 }}>
                Next →
              </Button>
            </div>
          )}

        </div>

        {/* RIGHT: Camera feed */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--bg)', gap: 16 }}>

          <div className="feed-box w-full" style={{ maxWidth: 720, aspectRatio: '4/3', position: 'relative' }}>
            <span className="feed-label">Camera Feed</span>

            {detecting && (
              <span style={{ position: 'absolute', top: 14, right: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#fb397d', zIndex: 2 }}>
                LIVE
              </span>
            )}

            {detecting ? (
              <img src="http://127.0.0.1:8000/api/stream" alt="Live feed"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-ghost)' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="2" y="10" width="44" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="24" cy="26" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 10L19 4H29L32 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, letterSpacing: '0.05em' }}>Camera inactive</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>Press Start Camera to begin</span>
              </div>
            )}

            {result && (
              <div style={{
                position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 10,
                background: result === 'correct' ? 'rgba(34,197,94,0.15)' : 'rgba(251,57,125,0.15)',
                border: `1px solid ${result === 'correct' ? 'rgba(34,197,94,0.4)' : 'rgba(251,57,125,0.4)'}`,
                borderRadius: 10, padding: '10px 20px', zIndex: 5, whiteSpace: 'nowrap',
              }}>
                <Image src={result === 'correct' ? '/images/good.png' : '/images/bad.png'} alt={result} width={28} height={28} />
                <span style={{ fontSize: 16, fontWeight: 700, color: result === 'correct' ? '#4ade80' : '#fb397d' }}>
                  {result === 'correct' ? 'Correct!' : 'Not correct — keep trying'}
                </span>
              </div>
            )}
          </div>

          <div style={{ width: '100%', maxWidth: 720 }}>
            {!detecting ? (
              <Button onClick={startCamera} style={{ width: '100%', height: 50 }}>Start Camera</Button>
            ) : (
              <Button variant="danger" onClick={stopCamera} style={{ width: '100%', height: 50 }}>Stop Camera</Button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
