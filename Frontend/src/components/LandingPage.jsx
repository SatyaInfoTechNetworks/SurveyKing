import React, { useState } from 'react';
import { Crown, Zap, ArrowRight, ShieldCheck, Users, MessageSquare, Trophy, CheckCircle, HelpCircle, Gift, CreditCard, Send, ExternalLink, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';

export default function LandingPage({ onLaunchApp }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const telegramBotUrl = 'https://t.me/survey_king_bot?start=web';

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Is Survey King free to use?',
      a: 'Yes, 100% free! You never have to pay anything to earn on Survey King. Simply complete surveys and withdraw real cash.'
    },
    {
      q: 'What is the coin conversion rate?',
      a: '1,000 Coins equal ₹10.00 INR. For example, completing a 5,000 Coin survey earns you ₹50.00 INR directly.'
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'Our minimum withdrawal starts at just 2,500 Coins (₹5.00 INR) for UPI and Gift Cards.'
    },
    {
      q: 'Which payment options are supported?',
      a: 'We support instant UPI Transfers (VPA), Amazon Pay Gift Cards, Paytm Wallet Cash, and Google Play Vouchers.'
    },
    {
      q: 'How does the Referral Program work?',
      a: 'You get 1,000 Coins (₹10.00) for every friend you invite when they complete their first survey of 100+ coins. Your friend also receives a 500 Coin welcome bonus!'
    }
  ];

  return (
    <div style={{ background: '#070a12', color: '#fff', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* 1. NAVBAR */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7, 10, 18, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 20px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}>
              <Crown size={20} color="#000" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Survey King</span>
          </div>

          {/* Desktop Links */}
          <div className="desktop-only-flex" style={{ alignItems: 'center', gap: '20px' }}>
            <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>How It Works</a>
            <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Features</a>
            <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>FAQ</a>

            <a
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Start Earning</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="mobile-only-block">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: '#0f172a',
            borderTop: '1px solid var(--border-color)',
            padding: '16px',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>How It Works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>Features</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>FAQ</a>
            <a
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
                fontWeight: 800,
                textAlign: 'center',
                textDecoration: 'none'
              }}
            >
              Start Earning on Telegram →
            </a>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section style={{ padding: '60px 16px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(7, 10, 18, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            color: 'var(--accent-gold)',
            fontWeight: 700,
            marginBottom: '20px',
            maxWidth: '100%'
          }}>
            <Zap size={14} fill="var(--accent-gold)" />
            <span>Join 50,000+ Active Survey Earners</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#fff', marginBottom: '16px' }}>
            The #1 Telegram App to <br />
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Earn Real Cash via Surveys 👑</span>
          </h1>

          <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 28px', lineHeight: 1.5 }}>
            Complete quick paid market surveys, invite friends, and earn instant Coins. Redeem them directly to your UPI ID, Amazon Gift Cards, Paytm Wallet, or Google Play Codes!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <a
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                padding: '14px 28px',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
                minWidth: '220px',
                justifyContent: 'center'
              }}
            >
              <span>Start Earning on Telegram</span>
              <ArrowRight size={18} />
            </a>

            <button
              onClick={onLaunchApp}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '14px 24px',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '200px',
                justifyContent: 'center'
              }}
            >
              <Crown size={16} color="var(--accent-gold)" />
              <span>Launch Web Demo App</span>
            </button>
          </div>

          {/* Responsive Key Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '16px'
          }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>₹5.4M+</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Paid Out</div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)' }}>4.9 / 5</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Rating</div>
            </div>

            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>100%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Instant Payouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '60px 16px', background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#fff' }}>How It Works</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Start earning money in 3 simple steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {/* Step 1 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px 20px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'rgba(245, 158, 11, 0.2)'
              }}>01</div>

              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <MessageSquare size={24} color="var(--accent-gold)" />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>1. Launch Telegram Bot</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Click start to launch `@survey_king_bot` on Telegram and open the Mini App with 1 tap.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px 20px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'rgba(245, 158, 11, 0.2)'
              }}>02</div>

              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Trophy size={24} color="var(--accent-green)" />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>2. Complete Quick Surveys</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Participate in high-paying market research surveys provided by CPX Research & partners.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px 20px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'rgba(245, 158, 11, 0.2)'
              }}>03</div>

              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle size={24} color="#60a5fa" />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>3. Instant Cash Out</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Redeem your coins for UPI VPA transfer, Amazon Vouchers, Paytm Cash, or Google Play Codes!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" style={{ padding: '60px 16px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#fff' }}>Why Choose Survey King?</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Engineered for high payouts and user satisfaction</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
              <Zap size={22} color="var(--accent-gold)" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>⚡ Instant Payouts</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>No long wait times. Payouts are processed rapidly to your UPI or gift voucher address.</p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
              <ShieldCheck size={22} color="var(--accent-green)" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>🛡️ 100% Secure & Verified</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Your data is protected with enterprise security standards and HTTPS encryption.</p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
              <Users size={22} color="#60a5fa" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>👥 High Referral Rewards</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Earn 1,000 Coins (₹10.00) for every friend you refer plus bonus coins for your friend.</p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
              <Gift size={22} color="#ec4899" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>🎁 Multiple Payment Options</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Withdraw via UPI, Amazon Pay Gift Cards, Paytm Wallet, or Google Play Voucher Codes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" style={{ padding: '60px 16px', background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, color: '#fff' }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Have questions? We have answers!</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((f, idx) => (
              <div
                key={idx}
                onClick={() => toggleFaq(idx)}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={16} color="var(--accent-gold)" />
                    <span>{f.q}</span>
                  </div>
                  {openFaq === idx ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                </div>

                {openFaq === idx && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.5, paddingLeft: '24px' }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section style={{ padding: '60px 16px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '850px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '24px',
          padding: '36px 16px'
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#fff', marginBottom: '10px' }}>
            Ready to Start Earning Real Money? 👑
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto 24px' }}>
            Join thousands of users earning daily rewards with Survey King on Telegram!
          </p>

          <a
            href={telegramBotUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              padding: '14px 32px',
              borderRadius: '9999px',
              fontSize: '0.95rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            <span>Launch Survey King Bot</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={18} color="var(--accent-gold)" />
            <span style={{ fontWeight: 800, color: '#fff' }}>Survey King 👑</span>
          </div>

          <div>© 2026 Survey King Networks. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
