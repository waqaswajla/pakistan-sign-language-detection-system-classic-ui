"use client";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span className="dot-accent" />
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 18, letterSpacing: '-0.02em' }}>PSL</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13 }}>
          <Link href="/about" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>About Us</Link>
          <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >Contact Us</Link>
          <Link href="/feedback" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >Feedback</Link>
          <Link href="/dictionary" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >Dictionary</Link>
          <span style={{ color: 'var(--text-faint)' }}>Pakistan Sign Language</span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '72px 96px 48px', maxWidth: 900 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fb397d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          About the Project
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 50px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '16px 0 20px' }}>
          Making Pakistan Sign Language{' '}
          <span style={{ color: 'var(--text-faint)' }}>Accessible to Everyone</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 640 }}>
          This system uses computer vision and machine learning to detect and translate Pakistan Sign Language (PSL)
          gestures in real-time — helping bridge the communication gap between the deaf and hearing communities.
        </p>
      </div>

      {/* Cards */}
      <div style={{ padding: '0 96px 72px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 900 }}>
        {[
          {
            icon: <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>,
            circle: <circle cx="12" cy="12" r="3"/>,
            title: 'Real-Time Detection',
            desc: 'Webcam-based detection runs at up to 30 FPS, recognising hand gestures with sub-second latency.',
          },
          {
            icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
            title: 'MLP Model',
            desc: 'A Multi-Layer Perceptron trained on 42 MediaPipe hand landmark coordinates achieves 98.6% test accuracy across 36 Urdu letters.',
          },
          {
            icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
            title: 'Urdu Speech Output',
            desc: 'Detected signs are spoken aloud in Urdu using pre-recorded audio, making the system accessible without reading.',
          },
        ].map(({ icon, circle, title, desc }) => (
          <div key={title} className="dark-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(251,57,125,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb397d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {icon}{circle}
              </svg>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div style={{ padding: '0 96px 72px' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Technology Stack
        </span>
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {['MediaPipe Hands', 'TensorFlow / Keras', 'FastAPI', 'Next.js 14', 'OpenCV', 'SQLite', 'StandardScaler', 'Python'].map(tech => (
            <span key={tech} style={{
              padding: '8px 16px', borderRadius: 6,
              border: '1px solid var(--border-medium)',
              fontSize: 13, color: 'var(--text-muted)', fontWeight: 500,
            }}>{tech}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 96px 72px', display: 'flex', gap: 64 }}>
        {[['98.6%', 'Test Accuracy'], ['36', 'Urdu Letters'], ['42', 'Landmark Features'], ['16,745', 'Training Samples']].map(([val, label]) => (
          <div key={label}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'auto', padding: '18px 48px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: 'var(--text-faint)',
      }}>
        <span>PSL · Pakistan Sign Language System</span>
        <span>MediaPipe · Next.js · FastAPI</span>
      </div>

    </main>
  );
}
