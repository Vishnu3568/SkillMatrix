import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll Restoration handler.
 * Automatically scrolls window back to top on path changes.
 */
export default function ScrollRestoration() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
