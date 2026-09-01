import React, { useState } from 'react';
import { Crown, Zap, ArrowRight, ShieldCheck, Users, MessageSquare, Trophy, CheckCircle, HelpCircle, Gift, CreditCard, Send, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export default function LandingPage({ onLaunchApp }) {
  const [openFaq, setOpenFaq] = useState(null);

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
    <div style={{ background: '#070a12', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* 1. NAVBAR */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7, 10, 18, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}>
              <Crown size={22} color="#000" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Survey King</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>How It Works</a>
            <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Features</a>
            <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>FAQ</a>

            <a
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                padding: '10px 20px',
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
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
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
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            color: 'var(--accent-gold)',
            fontWeight: 700,
            marginBottom: '24px'
          }}>
            <Zap size={15} fill="var(--accent-gold)" />
            <span>Join 50,000+ Active Survey Earners</span>
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#fff', marginBottom: '20px' }}>
            The #1 Telegram App to <br />
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Earn Real Cash via Surveys 👑</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Complete quick paid market surveys, invite friends, and earn instant Coins. Redeem them directly to your UPI ID, Amazon Gift Cards, Paytm Wallet, or Google Play Codes!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <a
              href={telegramBotUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                padding: '16px 36px',
                borderRadius: '9999px',
                fontSize: '1.05rem',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
              }}
            >
              <span>Start Earning on Telegram</span>
              <ArrowRight size={20} />
            </a>

            <button
              onClick={onLaunchApp}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '16px 28px',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Crown size={18} color="var(--accent-gold)" />
              <span>Launch Web Demo App</span>
            </button>
          </div>

          {/* Key Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '20px'
          }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)' }}>₹5.4M+</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Paid Out to Users</div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)' }}>4.9 / 5</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>User Satisfaction</div>
            </div>

            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Instant Payouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>How It Works</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Start earning money in 3 simple steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Step 1 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '32px 24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '2rem',
                fontWeight: 900,
                color: 'rgba(245, 158, 11, 0.2)'
              }}>01</div>

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <MessageSquare size={28} color="var(--accent-gold)" />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>1. Launch Telegram Bot</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Click the start button to launch `@survey_king_bot` on Telegram and open the Mini App with 1 tap.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '32px 24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '2rem',
                fontWeight: 900,
                color: 'rgba(245, 158, 11, 0.2)'
              }}>02</div>

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Trophy size={28} color="var(--accent-green)" />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>2. Complete Quick Surveys</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Participate in high-paying market research surveys provided by CPX Research & top partners.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: '32px 24px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '2rem',
                fontWeight: 900,
                color: 'rgba(245, 158, 11, 0.2)'
              }}>03</div>

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <CheckCircle size={28} color="#60a5fa" />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>3. Instant Cash Out</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Redeem your coins for UPI VPA transfer, Amazon Vouchers, Paytm Cash, or Google Play Codes!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>Why Choose Survey King?</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Engineered for high payouts and user satisfaction</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
              <Zap size={24} color="var(--accent-gold)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>⚡ Instant Payouts</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>No long wait times. Payouts are processed rapidly to your UPI or gift voucher address.</p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
              <ShieldCheck size={24} color="var(--accent-green)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>🛡️ 100% Secure & Verified</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Your data is protected with enterprise security standards and HTTPS encryption.</p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
              <Users size={24} color="#60a5fa" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>👥 High Referral Rewards</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Earn 1,000 Coins (₹10.00) for every friend you refer plus bonus coins for your friend.</p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
              <Gift size={24} color="#ec4899" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>🎁 Multiple Payment Options</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Withdraw via UPI, Amazon Pay Gift Cards, Paytm Wallet, or Google Play Voucher Codes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" style={{ padding: '80px 24px', background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Have questions? We have answers!</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((f, idx) => (
              <div
                key={idx}
                onClick={() => toggleFaq(idx)}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HelpCircle size={18} color="var(--accent-gold)" />
                    <span>{f.q}</span>
                  </div>
                  {openFaq === idx ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                </div>

                {openFaq === idx && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.6, paddingLeft: '28px' }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '850px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '32px',
          padding: '48px 24px'
        }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
            Ready to Start Earning Real Money? 👑
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto 28px' }}>
            Join thousands of users earning daily rewards with Survey King on Telegram!
          </p>

          <a
            href={telegramBotUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              padding: '16px 36px',
              borderRadius: '9999px',
              fontSize: '1.05rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
            }}
          >
            <span>Launch Survey King Bot</span>
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={20} color="var(--accent-gold)" />
            <span style={{ fontWeight: 800, color: '#fff' }}>Survey King 👑</span>
          </div>

          <div>© 2026 Survey King Networks. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
