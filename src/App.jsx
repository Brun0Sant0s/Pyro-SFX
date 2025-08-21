// "use client"
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu'; // <— FALTAVA

import Hero from './sections/Hero';
import About from './sections/About';
import Services from './sections/Services';
import Portfolio from './sections/Portfolio';
import Contacts from './sections/Contacts';

export default function App() {
  const [activeSection, setActiveSection] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const SECTIONS = ['sobre', 'servicos', 'portfolio', 'contactos'];
  const NAV_H = 64;

  useEffect(() => {
    let ticking = false;
    const ACTIVATE_EARLY_VH = 0.30;
    const NEAR_BOTTOM_OFFSET = 120;

    const update = () => {
      const activationLine =
        window.scrollY + NAV_H + window.innerHeight * ACTIVATE_EARLY_VH;

      const first = document.getElementById(SECTIONS[0]);
      if (first && activationLine < first.offsetTop) {
        setActiveSection(null);
        return;
      }

      const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
      let current = SECTIONS[0];
      for (const el of els) if (activationLine >= el.offsetTop) current = el.id;

      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - NEAR_BOTTOM_OFFSET;

      if (nearBottom) current = 'contactos';
      setActiveSection(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    const mo = new MutationObserver(() => update());
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <Navbar
        activeSection={activeSection}
        open={menuOpen}
        onToggleMenu={() => setMenuOpen((v) => !v)}
      />

      {/* ⬇️ Render do menu mobile */}
     <MobileMenu
  open={menuOpen}
  onClose={() => setMenuOpen(false)}
  activeSection={activeSection}
/>


      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Contacts />
    </>
  );
}
