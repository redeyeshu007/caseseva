import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PageContainer from './PageContainer';
import javixLogo from '../../assets/logo/javix-logo-final.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full pointer-events-auto">
        <nav
          className={`flex items-center justify-between px-6 lg:px-8 py-3 bg-white/90 backdrop-blur-md border-b border-black/[0.06] transition-all duration-300`}
          aria-label="Main navigation"
        >
          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center shrink-0 hover:opacity-80 transition-opacity duration-200 z-10"
            aria-label="JAVIX — Back to home"
          >
            <img
              src={javixLogo}
              alt="JAVIX"
              style={{ height: '28px', width: 'auto', objectFit: 'contain', display: 'block' }}
              draggable={false}
            />
          </Link>

          {/* ── Centered Marquee ── */}
          <div className="hidden md:flex flex-1 mx-8 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
            <motion.div
              className="flex whitespace-nowrap items-center"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 40, repeat: Infinity }}
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center space-x-6 px-3">
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#0A0F0D]">Web Development</span>
                  <span className="w-1 h-1 rounded-full bg-[#43C47A]"></span>
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#0A0F0D]">Product Development</span>
                  <span className="w-1 h-1 rounded-full bg-[#43C47A]"></span>
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#0A0F0D]">UI/UX</span>
                  <span className="w-1 h-1 rounded-full bg-[#43C47A]"></span>
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#0A0F0D]">Branding</span>
                  <span className="w-1 h-1 rounded-full bg-[#43C47A]"></span>
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#0A0F0D]">Social Media</span>
                  <span className="w-1 h-1 rounded-full bg-[#43C47A]"></span>
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#0A0F0D]">Marketing</span>
                  <span className="w-1 h-1 rounded-full bg-[#43C47A]"></span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Contact Us ── */}
          <Link
            to="/contact"
            className="inline-flex items-center space-x-2 bg-[#0A0F0D] !text-white px-5 py-2 rounded-full font-medium text-[14px] transition-all hover:bg-[#43C47A] hover:scale-105 shrink-0 z-10"
          >
            <span>Contact Us</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
