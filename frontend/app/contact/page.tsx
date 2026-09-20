"use client";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSent(true);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
    borderRadius: 8, padding: '12px 16px', fontSize: 14, color: 'var(--text)',
    outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span className="dot-accent" />
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 18, letterSpacing: '-0.02em' }}>PSL</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13 }}>
          <Link href="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >About Us</Link>
          <Link href="/contact" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Contact Us</Link>
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

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 80, padding: '72px 96px' }}>

        {/* Left: info */}
        <div style={{ flex: '0 0 360px' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fb397d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Get in Touch
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.03em', margin: '16px 0 20px' }}>
            We&apos;d love to{' '}
            <span style={{ color: 'var(--text-faint)' }}>hear from you</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 40 }}>
            Have questions about the project, feedback on the detection system, or want to collaborate? Send us a message.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              {
                label: 'Email', value: 'cs.abdulwahid@gmail.com',
                icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
              },
              {
                label: 'Location', value: 'Pakistan',
                icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
              },
              {
                label: 'GitHub', value: 'PSL Recognition Project',
                icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>,
              },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(251,57,125,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb397d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {icon}
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div style={{ flex: 1, maxWidth: 520 }}>
          {sent ? (
            <div className="dark-card" style={{ textAlign: 'center', padding: '64px 40px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Message Sent!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Thanks for reaching out. We&apos;ll get back to you soon.</p>
              <Button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
                Send Another
              </Button>
            </div>
          ) : (
            <form className="dark-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(['name', 'email', 'message'] as const).map(field => (
                <div key={field}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {field === 'message' ? (
                    <textarea required rows={5} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                      placeholder="Your message..." value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
                    />
                  ) : (
                    <input required type={field === 'email' ? 'email' : 'text'} style={inputStyle}
                      placeholder={field === 'email' ? 'your@email.com' : 'Your name'}
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
                    />
                  )}
                </div>
              ))}
              <Button type="submit" style={{ width: '100%', height: 50 }}>
                Send Message
              </Button>
            </form>
          )}
        </div>

      </div>

      {/* Footer */}
      <div style={{ padding: '18px 48px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)' }}>
        <span>PSL · Pakistan Sign Language System</span>
        <span>MediaPipe · Next.js · FastAPI</span>
      </div>

    </main>
  );
}
