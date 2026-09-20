/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/Button";

/* ── Data ──────────────────────────────────────────────────── */

const LABELS: string[] = [
  "ء","ا","ب","ت","ث","ج","ح","خ","د","ذ",
  "ر","ز","س","ش","ص","ض","ط","ظ","ع","غ",
  "ف","ق","ل","م","ن","و","ٹ","پ","چ","ڈ",
  "ژ","ک","گ","ں","ھ","ی","ے",
];
const ALPHA_SIGNS = LABELS.map((label, i) => ({ label, index: i + 1 }));

const WORDS: { urdu: string; english: string; label: string; index: number }[] = [
  { urdu: 'السلام علیکم', english: 'Hello / Peace',  label: 'السلام علیکم', index: 1 },
  { urdu: 'اللہ حافظ',   english: 'Goodbye',         label: 'اللہ حافظ',   index: 2 },
  { urdu: 'باپ',          english: 'Father',           label: 'باپ',          index: 3 },
  { urdu: 'ماں',          english: 'Mother',           label: 'ماں',          index: 4 },
  { urdu: 'میں',          english: 'I / Me',           label: 'میں',          index: 5 },
];

/* ── Types ─────────────────────────────────────────────────── */

type CategoryId = 'alphabet' | 'words' | 'greetings' | 'numbers' | 'colors' | 'family' | 'phrases' | 'animals' | 'food';
type View = 'home' | CategoryId;

interface Category {
  id: CategoryId;
  title: string;
  subtitle: string;
  count: number;
  ready: boolean;
  icon: React.ReactNode;
}

/* ── Categories ─────────────────────────────────────────────── */

const CATEGORIES: Category[] = [
  {
    id: 'alphabet', title: 'Urdu Alphabet', subtitle: '37 letters', count: 37, ready: true,
    icon: <span style={{ fontSize: 48, fontWeight: 800, color: '#fb397d', direction: 'rtl', lineHeight: 1 }}>ا</span>,
  },
  {
    id: 'words', title: 'Words', subtitle: '5 signs', count: 5, ready: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#fb397d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 8h32a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H16l-8 8V10a2 2 0 0 1 2-2z"/>
        <line x1="16" y1="20" x2="32" y2="20"/><line x1="16" y1="28" x2="24" y2="28"/>
      </svg>
    ),
  },
  {
    id: 'greetings', title: 'Greetings', subtitle: 'Common phrases', count: 0, ready: false,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z"/>
        <path d="M16 28s2 4 8 4 8-4 8-4"/><line x1="18" y1="20" x2="18.01" y2="20"/><line x1="30" y1="20" x2="30.01" y2="20"/>
      </svg>
    ),
  },
  {
    id: 'numbers', title: 'Numbers', subtitle: '0 – 100', count: 0, ready: false,
    icon: <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '-0.04em', lineHeight: 1 }}>123</span>,
  },
  {
    id: 'colors', title: 'Colors', subtitle: 'Basic colors', count: 0, ready: false,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="17" cy="19" r="9" fill="none" stroke="var(--text-muted)" strokeWidth="1.8"/>
        <circle cx="31" cy="19" r="9" fill="none" stroke="var(--text-muted)" strokeWidth="1.8"/>
        <circle cx="24" cy="31" r="9" fill="none" stroke="var(--text-muted)" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'family', title: 'Family', subtitle: 'Relations', count: 0, ready: false,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="14" r="5"/><circle cx="32" cy="14" r="5"/>
        <path d="M6 36c0-6 4.5-10 10-10s10 4 10 10"/><path d="M22 36c0-6 4.5-10 10-10s10 4 10 10"/>
      </svg>
    ),
  },
  {
    id: 'phrases', title: 'Common Phrases', subtitle: 'Everyday use', count: 0, ready: false,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="10" width="40" height="28" rx="3"/><line x1="14" y1="20" x2="34" y2="20"/><line x1="14" y1="28" x2="26" y2="28"/>
      </svg>
    ),
  },
  {
    id: 'animals', title: 'Animals', subtitle: 'Common animals', count: 0, ready: false,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="24" cy="28" rx="12" ry="10"/>
        <ellipse cx="14" cy="16" rx="5" ry="7"/><ellipse cx="34" cy="16" rx="5" ry="7"/>
        <line x1="18" y1="38" x2="16" y2="44"/><line x1="30" y1="38" x2="32" y2="44"/>
      </svg>
    ),
  },
  {
    id: 'food', title: 'Food & Drink', subtitle: 'Daily items', count: 0, ready: false,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12v8a16 16 0 0 0 32 0v-8"/><line x1="24" y1="36" x2="24" y2="44"/>
        <line x1="16" y1="44" x2="32" y2="44"/><line x1="8" y1="12" x2="40" y2="12"/>
      </svg>
    ),
  },
];

/* ── Shared nav breadcrumb ──────────────────────────────────── */

function BackCrumb({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Button variant="ghost" onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Dictionary
      </Button>
      <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>/</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default function DictionaryPage() {
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState('');
  const [selectedAlpha, setSelectedAlpha] = useState<{ label: string; index: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<typeof WORDS[number] | null>(null);

  const activeCategory = CATEGORIES.find(c => c.id === view);

  const filteredAlpha = query.trim()
    ? ALPHA_SIGNS.filter(s => s.label.includes(query.trim()))
    : ALPHA_SIGNS;

  const filteredWords = query.trim()
    ? WORDS.filter(w => w.urdu.includes(query.trim()) || w.english.toLowerCase().includes(query.toLowerCase().trim()))
    : WORDS;

  function goHome() { setView('home'); setQuery(''); setSelectedAlpha(null); setSelectedWord(null); }

  /* Search input shared */
  function SearchInput({ placeholder }: { placeholder: string }) {
    return (
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
            borderRadius: 8, padding: '8px 32px 8px 32px', fontSize: 15, color: 'var(--text)',
            outline: 'none', fontFamily: 'inherit', direction: view === 'alphabet' ? 'rtl' : 'ltr', width: 220,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
        />
        {query && (
          <Button variant="ghost" onClick={() => setQuery('')}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 2, lineHeight: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </Button>
        )}
      </div>
    );
  }

  return (
    <main style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span className="dot-accent" />
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 18, letterSpacing: '-0.02em' }}>PSL</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13 }}>
          <Link href="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>About Us</Link>
          <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>Contact Us</Link>
          <Link href="/feedback" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>Feedback</Link>
          <Link href="/dictionary" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Dictionary</Link>
          <span style={{ color: 'var(--text-faint)' }}>Pakistan Sign Language</span>
          <ThemeToggle />
        </div>
      </nav>

      {/* ── HOME ──────────────────────────────────────────────── */}
      {view === 'home' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 'clamp(20px, 2.2vw, 30px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
              PSL Dictionary
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              Explore Pakistan Sign Language — alphabet and word categories
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {CATEGORIES.filter(cat => cat.ready).map(cat => (
              <div key={cat.id} onClick={() => cat.ready && setView(cat.id)}
                style={{
                  background: 'var(--bg-card)', border: `1px solid ${cat.ready ? 'var(--border)' : 'var(--border-subtle)'}`,
                  borderRadius: 12, padding: '28px 20px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                  cursor: cat.ready ? 'pointer' : 'default', opacity: cat.ready ? 1 : 0.5,
                  transition: 'border-color 0.15s, transform 0.15s', position: 'relative',
                }}
                onMouseEnter={e => { if (!cat.ready) return; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { if (!cat.ready) return; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                {!cat.ready && (
                  <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 600, color: 'var(--text-sub)', background: 'var(--border-subtle)', border: '1px solid var(--border)', borderRadius: 999, padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Soon</span>
                )}
                <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.icon}</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{cat.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.ready ? `${cat.count} signs` : cat.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ALPHABET ──────────────────────────────────────────── */}
      {view === 'alphabet' && (
        <>
          <div style={{ padding: '20px 48px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <BackCrumb label="Urdu Alphabet" onBack={goHome} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filteredAlpha.length} of {ALPHA_SIGNS.length}</span>
                <SearchInput placeholder="Search e.g. ب" />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 48px 24px' }}>
            {filteredAlpha.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', gap: 8 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ fontSize: 14 }}>No sign found for &ldquo;{query}&rdquo;</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
                {filteredAlpha.map(({ label, index }) => (
                  <div key={index} onClick={() => setSelectedAlpha({ label, index })}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 10px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'border-color 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                  >
                    <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', direction: 'rtl', lineHeight: 1 }}>{label}</span>
                    <Image src={`/images/alphabet/${index}.png`} alt={`Sign for ${label}`} width={90} height={90} style={{ objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── WORDS ─────────────────────────────────────────────── */}
      {view === 'words' && (
        <>
          <div style={{ padding: '20px 48px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <BackCrumb label="Words" onBack={goHome} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filteredWords.length} of {WORDS.length}</span>
                <SearchInput placeholder="Search word..." />
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 48px 24px' }}>
            {filteredWords.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', gap: 8 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ fontSize: 14 }}>No word found for &ldquo;{query}&rdquo;</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                {filteredWords.map((word) => (
                  <div key={word.label} onClick={() => setSelectedWord(word)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 10px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'border-color 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                  >
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', direction: 'rtl', lineHeight: 1.2 }}>{word.urdu}</span>
                    <Image src={`/images/words/${word.index}.png`} alt={`Sign for ${word.urdu}`} width={90} height={90} style={{ objectFit: 'contain' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{word.english}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── COMING SOON (other categories) ────────────────────── */}
      {view !== 'home' && view !== 'alphabet' && view !== 'words' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 48, position: 'relative' }}>
          <Button variant="ghost" onClick={goHome}
            style={{ position: 'absolute', top: 24, left: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Dictionary
          </Button>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeCategory?.icon}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{activeCategory?.title}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 }}>
              Sign images for <strong style={{ color: 'var(--text)' }}>{activeCategory?.title}</strong> will be added in the next update.
            </p>
          </div>
          <Button onClick={goHome} style={{ height: 42, minWidth: 160, fontSize: 13 }}>
            Back to Dictionary
          </Button>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '14px 48px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)', flexShrink: 0 }}>
        <span>PSL · Pakistan Sign Language System</span>
        <span>MediaPipe · Next.js · FastAPI</span>
      </div>

      {/* ── ALPHABET MODAL ────────────────────────────────────── */}
      {selectedAlpha && (
        <div onClick={() => setSelectedAlpha(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: '32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative', minWidth: 280 }}>
            <Button variant="ghost" onClick={() => setSelectedAlpha(null)}
              style={{ position: 'absolute', top: 14, right: 14, padding: 4, lineHeight: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Button>
            <span style={{ fontSize: 72, fontWeight: 800, color: 'var(--text)', direction: 'rtl', lineHeight: 1 }}>{selectedAlpha.label}</span>
            <Image src={`/images/alphabet/${selectedAlpha.index}.png`} alt={`Sign for ${selectedAlpha.label}`} width={220} height={220} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sign {selectedAlpha.index} of {ALPHA_SIGNS.length}</span>
          </div>
        </div>
      )}

      {/* ── WORD MODAL ────────────────────────────────────────── */}
      {selectedWord && (
        <div onClick={() => setSelectedWord(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 16, padding: '32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative', minWidth: 280 }}>
            <Button variant="ghost" onClick={() => setSelectedWord(null)}
              style={{ position: 'absolute', top: 14, right: 14, padding: 4, lineHeight: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Button>
            <span style={{ fontSize: 52, fontWeight: 800, color: 'var(--text)', direction: 'rtl', lineHeight: 1.2 }}>{selectedWord.urdu}</span>
            <Image src={`/images/words/${selectedWord.index}.png`} alt={`Sign for ${selectedWord.urdu}`} width={220} height={220} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{selectedWord.english}</span>
          </div>
        </div>
      )}
    </main>
  );
}
