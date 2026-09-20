"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/Button";

const API = "http://127.0.0.1:8000/api";

export default function SignPage() {
  const [speech, setSpeech] = useState(false);
  const [wordMode, setWordMode] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const cooldown = 1000;
  const [currentLetter, setCurrentLetter] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [sentence, setSentence] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLetterRef = useRef("");

  async function startDetection() {
    await fetch(`${API}/start-capture`, { method: "POST" });
    setDetecting(true);
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
          body: JSON.stringify({ mode: wordMode ? 1 : 0, speech: speech ? 1 : 0, voice_mode: "edge" }),
        });
        const data = await res.json();
        if (data.label !== "no match" && data.label !== "no confidence") {
          const letter = data.label;
          if (letter !== lastLetterRef.current) {
            lastLetterRef.current = letter;
            setCurrentLetter(letter);
            preload(letter);
          }
        }
      } catch { /* backend unreachable */ }
    }, cooldown);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [detecting, wordMode, speech, cooldown]);

  function acceptLetter() {
    if (!currentLetter) return;
    setCurrentWord(prev => prev + currentLetter);
    setCurrentLetter("");
    lastLetterRef.current = "";
  }

  function preload(text: string) {
    if (!text) return;
    fetch(`${API}/speech/preload/${encodeURIComponent(text)}`, { method: "POST" }).catch(() => {});
  }

  async function speakWord(word: string) {
    if (!word) return;
    await fetch(`${API}/speech/${encodeURIComponent(word)}`, { method: "POST" }).catch(() => {});
  }

  async function speakSentence(words: string[]) {
    await speakWord(words.join(" "));
  }

  function addWord() {
    if (!currentWord) return;
    setSentence(prev => {
      const next = [...prev, currentWord];
      preload(next.join(" "));
      return next;
    });
    setCurrentWord("");
    setCurrentLetter("");
    lastLetterRef.current = "";
  }

  function deleteLetter() {
    setCurrentWord(prev => [...prev].slice(0, -1).join(""));
    lastLetterRef.current = "";
  }

  function removeWord(index: number) {
    setSentence(prev => prev.filter((_, i) => i !== index));
  }

  function copyToClipboard() {
    if (!sentence.length) return;
    navigator.clipboard.writeText(sentence.join(" ")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleStop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDetecting(false);
    setCurrentLetter("");
    await fetch(`${API}/stop-capture`, { method: "POST" }).catch(() => {});
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
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>Sign Detection</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="badge">Pakistan Sign Language</div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Controls */}
        <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: 20, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {detecting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#fb397d', fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fb397d', display: 'inline-block', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                LIVE
              </span>
            ) : (
              <span className="badge">Idle</span>
            )}
          </div>

          {/* Toggles */}
          <div className="dark-card" style={{ padding: 0 }}>
            <div className="toggle-row" style={{ padding: '10px 20px' }}>
              <label htmlFor="speech">Enable Speech</label>
              <input id="speech" type="checkbox" className="toggle" checked={speech} onChange={e => setSpeech(e.target.checked)} />
            </div>
            <div className="toggle-row" style={{ padding: '10px 20px', borderBottom: 'none' }}>
              <label htmlFor="wordMode">Word Mode</label>
              <input id="wordMode" type="checkbox" className="toggle" checked={wordMode} onChange={e => setWordMode(e.target.checked)} />
            </div>
          </div>

          {/* Current Letter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Detected Letter</span>
            <div className="dark-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px' }}>
              <span style={{ fontSize: 40, fontWeight: 700, color: currentLetter ? 'var(--text)' : 'var(--text-ghost)', lineHeight: 1, direction: 'rtl' }}>
                {currentLetter || '—'}
              </span>
            </div>
            <Button onClick={acceptLetter} disabled={!currentLetter} style={{ width: '100%', height: 42 }}>
              Accept Letter
            </Button>
          </div>

          {/* Current Word */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Word</span>
              {currentWord && (
                <Button variant="ghost" onClick={deleteLetter} style={{ fontSize: 12 }}>
                  ← Delete
                </Button>
              )}
            </div>
            <div className="dark-card" style={{ padding: '10px 16px', minHeight: 48, direction: 'rtl', textAlign: 'right' }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: currentWord ? 'var(--text)' : 'var(--text-ghost)', letterSpacing: '0.05em' }}>
                {currentWord || '—'}
              </span>
            </div>
            <Button onClick={addWord} disabled={!currentWord} style={{ width: '100%', height: 42 }}>
              Add Word to Sentence
            </Button>
          </div>

          {/* Sentence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sentence</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {sentence.length > 0 && (
                  <>
                    <Button variant="ghost" onClick={copyToClipboard}
                      style={{ fontSize: 12, color: copied ? '#fb397d' : 'var(--text-muted)' }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button variant="ghost" onClick={() => setSentence([])} style={{ fontSize: 12 }}>
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="dark-card" style={{ padding: 16, minHeight: 80, direction: 'rtl', textAlign: 'right' }}>
              {sentence.length === 0
                ? <span style={{ color: 'var(--text-ghost)', fontSize: 14 }}>جملہ یہاں ظاہر ہوگا…</span>
                : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                    {sentence.map((word, i) => (
                      <span key={i} onClick={() => removeWord(i)} title="Click to remove"
                        style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(251,57,125,0.2)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
              }
            </div>
            <Button onClick={() => speakSentence(sentence)} disabled={sentence.length === 0} style={{ width: '100%', height: 42 }}>
              Speak Sentence
            </Button>
          </div>

        </div>

        {/* RIGHT: Camera feed */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--bg)', gap: 16 }}>
          <div className="feed-box w-full" style={{ maxWidth: 720, aspectRatio: '4/3' }}>
            <span className="feed-label">Camera Feed</span>
            {detecting && (
              <span style={{ position: 'absolute', top: 14, right: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#fb397d', zIndex: 2 }}>
                LIVE
              </span>
            )}
            {detecting ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src="http://127.0.0.1:8000/api/stream" alt="Live feed" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-ghost)' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="2" y="10" width="44" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="24" cy="26" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 10L19 4H29L32 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, letterSpacing: '0.05em' }}>Camera inactive</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>Press Start Detection to begin</span>
              </div>
            )}
          </div>

          <div style={{ width: '100%', maxWidth: 720 }}>
            {!detecting ? (
              <Button onClick={startDetection} style={{ width: '100%', height: 50 }}>Start Detection</Button>
            ) : (
              <Button variant="danger" onClick={handleStop} style={{ width: '100%', height: 50 }}>Stop Detection</Button>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
