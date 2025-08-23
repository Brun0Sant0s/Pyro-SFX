import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import MobileMenu from './components/MobileMenu';

import Hero from './sections/Hero';
import About from './sections/About';
import Services from './sections/Services';
import Portfolio from './sections/Portfolio';
import Contacts from './sections/Contacts';

function SectionDivider() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="py-40 sm:py-42">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}

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

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeSection={activeSection}
      />

      <Hero />
      <div className="mx-auto max-w-7xl px-24">
        <header className="mb-8">
          <h2 className="text-3xl sm:text-4xl tracking-tight text-white">Sobre</h2>
          <span className="block mt-2 h-[1px] w-20 bg-gradient-to-r from-red-500 to-black" />
        </header>
        <About />
      </div>

      <SectionDivider />

      <div className="mx-auto max-w-7xl px-24">
         <header className="mb-8">
          <h2 className="text-3xl sm:text-4xl tracking-tight text-white">Serviços</h2>
          <span className="block mt-2 h-[1px] w-20 bg-gradient-to-r from-red-500 to-black" />
        </header>
        <Services />
      </div>
      <SectionDivider />

      <div className="mx-auto max-w-7xl px-24">
         <header className="mb-8">
          <h2 className="text-3xl sm:text-4xl tracking-tight text-white">Portfólio</h2>
          <span className="block mt-2 h-[1px] w-20 bg-gradient-to-r from-red-500 to-black" />
        </header>
        <Portfolio />
      </div>
      <SectionDivider />

      <div className="mx-auto max-w-7xl px-24 pb-24">
         <header className="mb-8">
          <h2 className="text-3xl sm:text-4xl tracking-tight text-white">Contacos</h2>
          <span className="block mt-2 h-[1px] w-20 bg-gradient-to-r from-red-500 to-black" />
        </header>
        <Contacts />
      </div>
    </>
  );
}
