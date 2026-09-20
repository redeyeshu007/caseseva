import { useEffect, useState } from 'react';
import './Navbar.css';
import StaggeredMenu from './StaggeredMenu';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const marqueeItems = [
    "LEGAL AI",
    "CASE RESEARCH",
    "DOCUMENT ANALYSIS",
    "PRECEDENT SEARCH",
    "CONTRACT REVIEW"
  ];

  return (
    <header className="javix-navbar-container">
      <div className="javix-navbar-wrapper">
        <nav
          className={`javix-navbar ${scrolled ? 'javix-navbar--scrolled' : ''}`}
          aria-label="Main navigation"
        >
          {/* ── Logo ── */}
          <a
            href="#threshold"
            className="javix-navbar-logo"
            aria-label="CaseSeva — Back to top"
          >
            <img src="/logo.png" alt="CaseSeva" className="javix-navbar-logo-img" />
          </a>

          {/* ── Centered Marquee ── */}
          <div className="javix-navbar-marquee-container">
            <div className="javix-navbar-marquee">
              <div className="javix-navbar-marquee-content">
                {marqueeItems.map((item, index) => (
                  <div key={index} className="javix-navbar-marquee-item">
                    <span className="javix-navbar-marquee-text">{item}</span>
                    <span className="javix-navbar-marquee-dot"></span>
                  </div>
                ))}
              </div>
              {/* Duplicate for infinite effect */}
              <div className="javix-navbar-marquee-content" aria-hidden="true">
                {marqueeItems.map((item, index) => (
                  <div key={index} className="javix-navbar-marquee-item">
                    <span className="javix-navbar-marquee-text">{item}</span>
                    <span className="javix-navbar-marquee-dot"></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CTA and Settings ── */}
          <div className="javix-navbar-actions">
            <a
              href="#final-cta"
              className="javix-navbar-cta"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span>{isHovered ? "Explore" : "Open Your Case"}</span>
              <svg 
                className={`javix-navbar-cta-icon ${isHovered ? 'icon-hovered' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" height="24" viewBox="0 0 24 24" 
                fill="none" stroke="currentColor" strokeWidth="2" 
                strokeLinecap="round" strokeLinejoin="round"
              >
                {isHovered ? (
                  <>
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </>
                ) : (
                  <>
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </>
                )}
              </svg>
            </a>

            {/* Settings Dropdown using StaggeredMenu */}
            <div className="javix-navbar-settings-container">
              <StaggeredMenu 
                position="right"
                items={[
                  { label: 'Threshold', link: '#threshold' },
                  { label: 'Assembly', link: '#assembly' },
                  { label: 'Robes', link: '#robes' },
                  { label: 'Standing', link: '#standing' },
                  { label: 'Enter Chambers', link: '#final-cta' }
                ]}
                logoUrl="/logo.png"
                displaySocials={false}
                displayItemNumbering={false}
                colors={['#1a1a1a', '#F4F2EB']}
                accentColor="#D4AF37"
                isFixed={false}
              />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
