import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { MarkRole } from '../content/types';

export interface Mark {
  string: number;
  fret: number;
  role: MarkRole | 'right' | 'wrong';
  label?: string;
}

export interface FretboardProps {
  minFret?: number;
  maxFret: number;
  marks: Mark[];
  /** Nome curto de cada corda solta (6ª → 1ª), exibido no lado da pestana. */
  stringLabels?: string[];
  onTap?: (pos: { string: number; fret: number }) => void;
  /** Destaca uma corda (as outras ficam esmaecidas). */
  focusString?: number;
  orientation?: 'auto' | 'horizontal' | 'vertical';
  leftHanded?: boolean;
  /** Texto para leitores de tela. */
  title: string;
  describeCell?: (string: number, fret: number) => string;
}

const INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE = [12, 24];
const STRINGS = [6, 5, 4, 3, 2, 1];

/** Mede a largura do contêiner para escolher a orientação. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    setW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export function Fretboard({
  minFret = 0, maxFret, marks, stringLabels, onTap, focusString, orientation = 'auto', leftHanded, title, describeCell,
}: FretboardProps) {
  const [wrapRef, width] = useWidth();
  const id = useId();
  const frets = maxFret - minFret + 1;
  const vertical = orientation === 'vertical' || (orientation === 'auto' && width > 0 && width < 560);
  const [cursor, setCursor] = useState<{ s: number; f: number } | null>(null);

  // Geometria: "across" = eixo das cordas, "along" = eixo das casas.
  const showOpen = minFret === 0;
  const pad = vertical ? 36 : 26;
  const labelBand = stringLabels ? 22 : 0;
  const stringGap = vertical ? 50 : 32;
  const openLen = showOpen ? (vertical ? 40 : 44) : 0;
  const fretLen = vertical ? 50 : 58;
  const firstFret = showOpen ? 1 : minFret;
  const playable = maxFret - firstFret + 1;
  const boardLen = playable * fretLen;
  const across = pad * 2 + stringGap * 5;
  const along = labelBand + openLen + boardLen + 30;

  // posição do centro de uma casa ao longo do braço
  const alongAt = (fret: number) => {
    if (fret === 0) return labelBand + openLen / 2;
    return labelBand + openLen + (fret - firstFret + 0.5) * fretLen;
  };
  const acrossAt = (s: number) => {
    const i = STRINGS.indexOf(s); // 0 = 6ª corda
    const idx = vertical ? (leftHanded ? 5 - i : i) : 5 - i; // horizontal: 1ª corda em cima
    return pad + idx * stringGap;
  };
  const xy = (s: number, fret: number) => {
    const a = alongAt(fret);
    const c = acrossAt(s);
    if (vertical) return { x: c, y: a };
    return { x: leftHanded ? along - a : a, y: c };
  };
  const nutPos = labelBand + openLen;
  const fretLine = (k: number) => nutPos + k * fretLen; // k = 0 .. playable

  const markMap = useMemo(() => {
    const m = new Map<string, Mark>();
    for (const mk of marks) if (mk.fret >= minFret && mk.fret <= maxFret) m.set(`${mk.string}:${mk.fret}`, mk);
    return m;
  }, [marks, minFret, maxFret]);

  const W = vertical ? across : along;
  const H = vertical ? along : across;

  const line = (a1: number, c1: number, a2: number, c2: number) => {
    if (vertical) return { x1: c1, y1: a1, x2: c2, y2: a2 };
    const f = (a: number) => (leftHanded ? along - a : a);
    return { x1: f(a1), y1: c1, x2: f(a2), y2: c2 };
  };

  const onKey = (e: KeyboardEvent) => {
    if (!onTap) return;
    const c = cursor ?? { s: focusString ?? 6, f: Math.max(minFret, 0) };
    const keys: Record<string, [number, number]> = vertical
      ? { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [leftHanded ? -1 : 1, 0], ArrowRight: [leftHanded ? 1 : -1, 0] }
      : { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, leftHanded ? 1 : -1], ArrowRight: [0, leftHanded ? -1 : 1] };
    if (keys[e.key]) {
      e.preventDefault();
      const [ds, df] = keys[e.key];
      setCursor({ s: Math.min(6, Math.max(1, c.s + ds)), f: Math.min(maxFret, Math.max(minFret, c.f + df)) });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTap({ string: c.s, fret: c.f });
      setCursor(c);
    }
  };

  const cells = [];
  if (onTap) {
    for (const s of STRINGS) {
      for (let f = minFret; f <= maxFret; f++) {
        const { x, y } = xy(s, f);
        const lenHalf = (f === 0 ? openLen : fretLen) / 2;
        const w = vertical ? stringGap : lenHalf * 2;
        const h = vertical ? lenHalf * 2 : stringGap;
        cells.push(
          <rect
            key={`c${s}-${f}`}
            className="fb-cell"
            x={x - w / 2} y={y - h / 2} width={w} height={h}
            onClick={() => {
              setCursor({ s, f });
              onTap({ string: s, fret: f });
            }}
          >
            <title>{describeCell?.(s, f) ?? `${s}ª corda, casa ${f}`}</title>
          </rect>,
        );
      }
    }
  }

  const fontFor = (label: string) => (label.length <= 2 ? 13 : label.length <= 3 ? 11.5 : label.length <= 4 ? 10 : 8.5);

  return (
    <div className={`fb-wrap ${vertical ? 'is-vertical' : 'is-horizontal'}`} ref={wrapRef}>
      <svg
        className="fretboard"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role={onTap ? 'application' : 'img'}
        aria-labelledby={`${id}-t`}
        tabIndex={onTap ? 0 : undefined}
        onKeyDown={onKey}
        style={{ maxWidth: vertical ? 420 : undefined }}
      >
        <title id={`${id}-t`}>{title}{onTap ? ' — use as setas para mover e Enter para escolher.' : ''}</title>
        {/* madeira */}
        {(() => {
          const r = vertical
            ? { x: pad - 14, y: nutPos, width: stringGap * 5 + 28, height: boardLen }
            : { x: leftHanded ? along - nutPos - boardLen : nutPos, y: pad - 14, width: boardLen, height: stringGap * 5 + 28 };
          return <rect className="fb-wood" {...r} rx={3} />;
        })()}
        {/* marcações (inlays) */}
        {Array.from({ length: playable }, (_, k) => firstFret + k).map((f) => {
          const a = alongAt(f);
          const mid = pad + stringGap * 2.5;
          const pts = DOUBLE.includes(f) ? [pad + stringGap * 1.5, pad + stringGap * 3.5] : INLAYS.includes(f) ? [mid] : [];
          return pts.map((c, i) => {
            const p = vertical ? { cx: c, cy: a } : { cx: leftHanded ? along - a : a, cy: c };
            return <circle key={`in${f}-${i}`} className="fb-inlay" {...p} r={6} />;
          });
        })}
        {/* trastes */}
        {Array.from({ length: playable + 1 }, (_, k) => {
          const a = fretLine(k);
          const isNut = k === 0 && showOpen;
          return <line key={`f${k}`} className={isNut ? 'fb-nut' : 'fb-fret'} {...line(a, pad - 14, a, pad + stringGap * 5 + 14)} />;
        })}
        {/* números das casas */}
        {Array.from({ length: frets }, (_, k) => minFret + k).map((f) => {
          if (f === 0) return null;
          const a = alongAt(f);
          const strong = INLAYS.includes(f) || DOUBLE.includes(f);
          const c = pad + stringGap * 5 + 26;
          const p = vertical
            ? { x: leftHanded ? pad + stringGap * 5 + 24 : pad - 24, y: a + 4 }
            : { x: leftHanded ? along - a : a, y: c - 2 };
          return (
            <text key={`n${f}`} className={`fb-num ${strong ? 'strong' : ''}`} {...p} textAnchor="middle">{f}</text>
          );
        })}
        {/* cordas */}
        {STRINGS.map((s) => {
          const c = acrossAt(s);
          const thick = [0, 1, 1.25, 1.6, 2.1, 2.6, 3.1][s];
          const dim = focusString !== undefined && focusString !== s;
          return (
            <line
              key={`s${s}`}
              className={`fb-string ${s >= 4 ? 'wound' : ''} ${dim ? 'dim' : ''} ${focusString === s ? 'focus' : ''}`}
              {...line(labelBand, c, nutPos + boardLen + 6, c)}
              strokeWidth={thick}
            />
          );
        })}
        {/* nomes das cordas */}
        {stringLabels && STRINGS.map((s, i) => {
          const c = acrossAt(s);
          const p = vertical ? { x: c, y: 14 } : { x: leftHanded ? along - 9 : 9, y: c + 4 };
          return <text key={`l${s}`} className="fb-strlabel" {...p} textAnchor="middle">{stringLabels[i]}</text>;
        })}
        {cells}
        {/* cursor de teclado */}
        {onTap && cursor && (() => {
          const { x, y } = xy(cursor.s, cursor.f);
          return <circle className="fb-cursor" cx={x} cy={y} r={17} />;
        })()}
        {/* notas */}
        {[...markMap.values()].map((m) => {
          const { x, y } = xy(m.string, m.fret);
          const r = m.role === 'muted' ? 9 : 14.5;
          return (
            <g key={`m${m.string}-${m.fret}`} className={`fb-mark role-${m.role}`} pointerEvents="none">
              <circle cx={x} cy={y} r={r} />
              {m.role === 'wrong' && !m.label && <path d={`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`} />}
              {m.label && (
                <text x={x} y={y + fontFor(m.label) * 0.36} textAnchor="middle" fontSize={fontFor(m.label)}>{m.label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
