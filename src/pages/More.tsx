import { href } from '../app/router';
import { NAV_SECONDARY } from '../App';
import { Icons } from '../ui/icons';

export function MorePage() {
  return (
    <div className="stack-l">
      <h1>Mais</h1>
      <nav className="panel" aria-label="Outras áreas">
        <ul className="clean">
          <li><a className="row" href={href('/treino')} style={{ textDecoration: 'none', color: 'var(--ink)', minHeight: 32 }}><span style={{ width: 22, display: 'inline-flex' }}>{Icons.lessons()}</span> Exercícios (prática livre e revisão)</a></li>
          {NAV_SECONDARY.map((n) => (
            <li key={n.to}>
              <a className="row" href={href(n.to)} style={{ textDecoration: 'none', color: 'var(--ink)', minHeight: 32 }}>
                <span style={{ width: 22, display: 'inline-flex' }}>{Icons[n.icon]()}</span> {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
