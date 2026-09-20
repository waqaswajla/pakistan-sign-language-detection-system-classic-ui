"use client";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/Button";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Button key={star} variant="ghost" type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{ padding: 2, lineHeight: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24"
            fill={(hover || value) >= star ? '#fb397d' : 'none'}
            stroke={(hover || value) >= star ? '#fb397d' : 'var(--border-strong)'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </Button>
      ))}
    </div>
  );
}

const CATEGORIES = [
  { key: 'accuracy',  label: 'Detection Accuracy' },
  { key: 'speed',     label: 'Response Speed' },
  { key: 'usability', label: 'Ease of Use' },
  { key: 'overall',   label: 'Overall Experience' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
  borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--text)',
  outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
};

export default function FeedbackPage() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [likes, setLikes] = useState('');
  const [improve, setImprove] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitted(true);
  }

  function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = 'var(--border-strong)';
  }
  function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = 'var(--border-medium)';
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
          <Link href="/feedback" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Feedback</Link>
          <Link href="/dictionary" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>Dictionary</Link>
          <span style={{ color: 'var(--text-faint)' }}>Pakistan Sign Language</span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 56, padding: '32px 80px', overflow: 'hidden' }}>

        {/* Left: intro + ratings */}
        <div style={{ flex: '0 0 280px' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fb397d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Share Your Thoughts
          </span>
          <h1 style={{ fontSize: 'clamp(24px, 2.5vw, 36px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.03em', margin: '12px 0 12px' }}>
            Help us{' '}
            <span style={{ color: 'var(--text-faint)' }}>improve PSL</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
            Your feedback shapes the detection system — accuracy, speed, and usability.
          </p>

          {/* Category ratings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CATEGORIES.map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
                <StarRating value={ratings[key] ?? 0} onChange={v => setRatings(r => ({ ...r, [key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: text form */}
        <div style={{ flex: 1, maxWidth: 480 }}>
          {submitted ? (
            <div className="dark-card" style={{ textAlign: 'center', padding: '56px 40px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Thank You!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
                Your feedback has been recorded. We appreciate you helping us improve.
              </p>
              <Button onClick={() => { setSubmitted(false); setRatings({}); setLikes(''); setImprove(''); setName(''); }}>
                Submit Another
              </Button>
            </div>
          ) : (
            <form className="dark-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Your Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <input type="text" style={inputStyle} placeholder="e.g. Ahmed"
                  value={name} onChange={e => setName(e.target.value)}
                  onFocus={focusBorder} onBlur={blurBorder} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  What do you like most?
                </label>
                <textarea required rows={3} style={{ ...inputStyle, resize: 'none' }}
                  placeholder="The real-time detection is impressive..."
                  value={likes} onChange={e => setLikes(e.target.value)}
                  onFocus={focusBorder} onBlur={blurBorder} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  What could be improved?
                </label>
                <textarea required rows={3} style={{ ...inputStyle, resize: 'none' }}
                  placeholder="It would be great if..."
                  value={improve} onChange={e => setImprove(e.target.value)}
                  onFocus={focusBorder} onBlur={blurBorder} />
              </div>

              <Button type="submit" style={{ width: '100%', height: 44 }}>
                Submit Feedback
              </Button>
            </form>
          )}
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding: '14px 48px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)', flexShrink: 0 }}>
        <span>PSL · Pakistan Sign Language System</span>
        <span>MediaPipe · Next.js · FastAPI</span>
      </div>

    </main>
  );
}
