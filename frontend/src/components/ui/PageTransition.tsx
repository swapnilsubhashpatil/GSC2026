/** @format */

import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Trigger reflow to restart animation
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';

    requestAnimationFrame(() => {
      el.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, [location.pathname]);

  return (
    <div ref={containerRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
