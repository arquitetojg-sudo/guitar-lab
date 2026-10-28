/** Ícones de traço simples (24×24), desenhados para o app. */
const P = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const Icons = {
  today: () => <P d="M4 5h16v15H4zM4 9h16M8 3v4M16 3v4M8 13h3v3H8z" />,
  neck: () => <P d="M3 6h18M3 10h18M3 14h18M3 18h18M7 4v16M12 4v16M17 4v16" />,
  lessons: () => <P d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" />,
  cards: () => <P d="M7 4h11a1 1 0 0 1 1 1v12M4 7h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />,
  more: () => <P d="M5 12h.01M12 12h.01M19 12h.01" />,
  technique: () => <P d="M4 18l5-12 4 8 3-5 4 9" />,
  scales: () => <P d="M4 18h3v-4H4zM10 18h3V9h-3zM16 18h3V5h-3z" />,
  chords: () => <P d="M6 4v16M10 4v16M14 4v16M18 4v16M4 8h16M8 12a1.5 1.5 0 1 0 .01 0M16 15a1.5 1.5 0 1 0 .01 0" />,
  improv: () => <P d="M3 15c3-6 5-6 7 0s4 6 7 0 3-4 4-4" />,
  ear: () => <P d="M8 18c1 2 4 2 5 0 1-2 4-4 4-8a5 5 0 0 0-10 0M10 10a2 2 0 1 1 4 1c-1 1-2 2-2 3" />,
  songs: () => <P d="M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
  progress: () => <P d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  settings: () => <P d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8l-2-.5-1 3 2 1v2l-2 1 1 3 2-.5 1.5 1.5-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z" />,
  play: () => <P d="M7 5l12 7-12 7z" />,
  pause: () => <P d="M8 5v14M16 5v14" />,
  sound: () => <P d="M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />,
};

export type IconName = keyof typeof Icons;
