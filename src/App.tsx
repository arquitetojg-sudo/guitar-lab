import { useEffect, useState, type ReactNode } from 'react';
import { useStore } from './app/store';
import { href, useRoute } from './app/router';
import { Icons, type IconName } from './ui/icons';
import { useSessionClock, formatClock } from './app/session';
import { HomePage } from './pages/Home';
import { MapPage } from './pages/MapPage';
import { TrailPage } from './pages/Trail';
import { LessonPage } from './pages/Lesson';
import { PracticePage } from './pages/Practice';
import { CardsPage } from './pages/Cards';
import { TechniquePage } from './pages/Technique';
import { ScalesPage } from './pages/Scales';
import { ChordsPage } from './pages/Chords';
import { PlannedPage } from './pages/Planned';
import { SongsPage } from './pages/Songs';
import { ProgressPage } from './pages/Progress';
import { SettingsPage } from './pages/Settings';
import { SessionPage } from './pages/Session';
import { MorePage } from './pages/More';
import { useUpdateBanner } from './app/pwa';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

export const NAV_MAIN: NavItem[] = [
  { to: '/', label: 'Treino de hoje', icon: 'today' },
  { to: '/mapa', label: 'Mapa do braço', icon: 'neck' },
  { to: '/aulas', label: 'Aulas e trilhas', icon: 'lessons' },
  { to: '/cards', label: 'Cards', icon: 'cards' },
];
export const NAV_SECONDARY: NavItem[] = [
  { to: '/tecnica', label: 'Técnica e agilidade', icon: 'technique' },
  { to: '/escalas', label: 'Escalas e pentatônicas', icon: 'scales' },
  { to: '/acordes', label: 'Acordes e campo harmônico', icon: 'chords' },
  { to: '/improvisacao', label: 'Improvisação', icon: 'improv' },
  { to: '/ouvido', label: 'Ouvido musical', icon: 'ear' },
  { to: '/musicas', label: 'Análise de músicas', icon: 'songs' },
  { to: '/evolucao', label: 'Minha evolução', icon: 'progress' },
  { to: '/config', label: 'Configurações', icon: 'settings' },
];

const TAB_SHORT: Record<string, string> = { '/': 'Hoje', '/mapa': 'Braço', '/aulas': 'Aulas', '/cards': 'Cards' };

function isActive(path: string, to: string) {
  return to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`);
}

function Page({ path, parts }: { path: string; parts: string[] }): ReactNode {
  const [a, b] = parts;
  switch (a) {
    case undefined: return <HomePage />;
    case 'mapa': return <MapPage />;
    case 'aulas': return b ? <LessonPage id={b} /> : <TrailPage />;
    case 'treino': return <PracticePage />;
    case 'cards': return <CardsPage />;
    case 'tecnica': return <TechniquePage />;
    case 'escalas': return <ScalesPage />;
    case 'acordes': return <ChordsPage />;
    case 'improvisacao': return <PlannedPage kind="improvisacao" />;
    case 'ouvido': return <PlannedPage kind="ouvido" />;
    case 'musicas': return <SongsPage />;
    case 'evolucao': return <ProgressPage />;
    case 'config': return <SettingsPage />;
    case 'sessao': return <SessionPage />;
    case 'mais': return <MorePage />;
    default:
      return (
        <div className="panel">
          <h1>Página não encontrada</h1>
          <p>O endereço <code>{path}</code> não existe neste app.</p>
          <a className="btn primary" href={href('/')}>Ir para o treino de hoje</a>
        </div>
      );
  }
}

function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

function SessionPill() {
  const { data } = useStore();
  const clock = useSessionClock();
  if (!data.activeSession || !clock) return null;
  return (
    <a className="session-pill" href={href('/sessao')} aria-label={`Treino em andamento: ${clock.block.label}, ${formatClock(clock.blockRemaining)} restantes`}>
      <span className={`led ${clock.running ? 'on' : ''}`} />
      <span className="num">{formatClock(clock.blockRemaining)}</span>
      <span>{clock.running ? clock.block.label : 'Pausado'}</span>
    </a>
  );
}

export function App() {
  const { ready, data, storageError, storageKind, actions } = useStore();
  const route = useRoute();
  const online = useOnline();
  const update = useUpdateBanner();

  // tema e instrumento
  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', data.settings.theme);
    document.body.classList.toggle('inst-violao', data.settings.instrument === 'violao');
  }, [data.settings.theme, data.settings.instrument]);

  // lembra a última tela (para "continuar de onde parou")
  useEffect(() => {
    if (!ready) return;
    const full = window.location.hash.replace(/^#/, '') || '/';
    if (route.path !== '/' && route.path !== '/mais') actions.setLastRoute(full);
  }, [route.path, route.query, ready, actions]);

  if (!ready) {
    return (
      <div className="main" role="status" aria-live="polite">
        <p className="muted">Carregando seu progresso…</p>
      </div>
    );
  }

  const tabs = [...NAV_MAIN, { to: '/mais', label: 'Mais', icon: 'more' as IconName }];
  const moreActive = NAV_SECONDARY.some((n) => isActive(route.path, n.to)) || route.path === '/mais';

  return (
    <div className="app">
      <nav className="rail" aria-label="Navegação principal">
        <a className="brand topbar-brand" href={href('/')} style={{ textDecoration: 'none', color: 'var(--ink)', fontWeight: 800, fontStretch: '125%', display: 'flex', gap: 8, alignItems: 'center' }}>
          <img src="./icons/icon-192.png" alt="" width={26} height={26} style={{ borderRadius: 6 }} /> Guitar Lab
        </a>
        {NAV_MAIN.map((n) => (
          <a key={n.to} className="nav" href={href(n.to)} aria-current={isActive(route.path, n.to) ? 'page' : undefined}>
            {Icons[n.icon]()} {n.label}
          </a>
        ))}
        <div className="group">Estudo e ferramentas</div>
        {NAV_SECONDARY.map((n) => (
          <a key={n.to} className="nav" href={href(n.to)} aria-current={isActive(route.path, n.to) ? 'page' : undefined}>
            {Icons[n.icon]()} {n.label}
          </a>
        ))}
      </nav>

      <main className="main" id="conteudo">
        <div className="topbar">
          <a className="brand" href={href('/')}>
            <img src="./icons/icon-192.png" alt="" /> Guitar Lab
          </a>
          <span className="spacer" />
          <SessionPill />
        </div>

        <div className="stack" style={{ marginBottom: 16 }}>
          {!online && <div className="notice" role="status">Você está sem conexão. Aulas, mapa, exercícios e cards continuam funcionando; o progresso fica salvo neste aparelho.</div>}
          {storageError && (
            <div className="notice bad" role="alert">
              {storageError}{' '}
              <button className="btn small ghost" onClick={actions.dismissStorageError}>Fechar</button>
            </div>
          )}
          {storageKind === 'memory' && !storageError && <div className="notice bad">O progresso não está sendo salvo neste navegador.</div>}
          {update.needRefresh && (
            <div className="notice ok" role="status">
              Há uma nova versão do app.{' '}
              <button className="btn small primary" onClick={update.apply}>Atualizar agora</button>{' '}
              <button className="btn small ghost" onClick={update.dismiss}>Depois</button>
            </div>
          )}
          {update.offlineReady && (
            <div className="notice ok" role="status">
              Pronto para uso offline.{' '}
              <button className="btn small ghost" onClick={update.dismiss}>Ok</button>
            </div>
          )}
        </div>

        <Page path={route.path} parts={route.parts} />
      </main>

      <nav className="tabbar" aria-label="Navegação principal">
        {tabs.map((n) => {
          const active = n.to === '/mais' ? moreActive : isActive(route.path, n.to);
          return (
            <a key={n.to} href={href(n.to)} aria-current={active ? 'page' : undefined}>
              {Icons[n.icon]()}
              <span>{TAB_SHORT[n.to] ?? n.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
