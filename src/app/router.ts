import { useEffect, useState } from 'react';

/** Roteamento por hash: funciona offline e em qualquer hospedagem estática. */
export interface Route {
  path: string;
  parts: string[];
  query: URLSearchParams;
}

function parse(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return { path: clean, parts: clean.split('/').filter(Boolean), query: new URLSearchParams(qs ?? '') };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => {
      setRoute(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function navigate(to: string) {
  window.location.hash = to;
}

export const href = (to: string) => `#${to}`;
