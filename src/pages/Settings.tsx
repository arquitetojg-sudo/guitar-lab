import { useRef, useState } from 'react';
import { useStore, uid } from '../app/store';
import { BackupError, backupFileName, parseBackup } from '../storage/backup';
import { DEFAULT_SETTINGS, type SessionBlock, type Settings } from '../storage/types';
import { TUNINGS } from '../music/fretboard';
import { installInstructions, useInstallPrompt } from '../app/pwa';

const KINDS: { id: SessionBlock['kind']; label: string }[] = [
  { id: 'tecnica', label: 'Técnica e agilidade' },
  { id: 'localizacao', label: 'Localização de notas' },
  { id: 'teoria', label: 'Conteúdo da aula' },
  { id: 'aplicacao', label: 'Aplicação musical' },
  { id: 'revisao', label: 'Revisão de dificuldades' },
  { id: 'cards', label: 'Cards' },
];

function Seg<T extends string | number | boolean>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="stack" style={{ gap: 4 }}>
      <span className="small muted" style={{ fontWeight: 600, display: 'block' }}>{label}</span>
      <div className="seg" role="group" aria-label={label}>
        {options.map((o) => <button key={String(o.v)} aria-pressed={value === o.v} onClick={() => onChange(o.v)}>{o.l}</button>)}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { data, actions, exportBackup, importBackup, resetAll, storageKind } = useStore();
  const st = data.settings;
  const set = (p: Partial<Settings>) => actions.updateSettings(p);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const install = useInstallPrompt();
  const instr = installInstructions();
  const blocks = st.sessionBlocks;
  const setBlocks = (b: SessionBlock[]) => set({ sessionBlocks: b });

  const doExport = () => {
    const blob = new Blob([JSON.stringify(exportBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg({ ok: true, text: 'Backup exportado.' });
  };

  const doImport = async (file: File) => {
    try {
      if (file.size > 20 * 1024 * 1024) throw new BackupError('Arquivo grande demais para um backup do app.');
      const b = parseBackup(await file.text());
      if (!confirm(`Importar o backup de ${new Date(b.exportedAt).toLocaleString('pt-BR')}? Isso substitui todo o progresso atual deste aparelho.`)) return;
      await importBackup(b);
      setMsg({ ok: true, text: `Backup importado: ${b.lessonProgress.length} aulas, ${b.attempts.length} respostas, ${b.songs.length} músicas.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof BackupError ? e.message : `Falha ao importar: ${(e as Error).message}` });
    }
  };

  return (
    <div className="stack-l">
      <h1>Configurações</h1>

      <section className="panel stack">
        <h2>Exibição</h2>
        <Seg label="Tema" value={st.theme} onChange={(v) => set({ theme: v })} options={[{ v: 'system', l: 'Do sistema' }, { v: 'light', l: 'Claro' }, { v: 'dark', l: 'Escuro' }]} />
        <Seg label="Nomes das notas" value={st.naming} onChange={(v) => set({ naming: v })} options={[{ v: 'pt', l: 'Dó Ré Mi' }, { v: 'en', l: 'C D E' }, { v: 'both', l: 'Ambos' }]} />
        <Seg label="Notas alteradas" value={st.accidentals} onChange={(v) => set({ accidentals: v })} options={[{ v: 'sharp', l: 'Sustenidos (♯)' }, { v: 'flat', l: 'Bemóis (♭)' }, { v: 'both', l: 'Ambos' }]} />
        <p className="small muted" style={{ margin: 0 }}>Em escalas e acordes o app sempre usa a grafia correta da tonalidade, independentemente desta opção.</p>
        <Seg label="Mão" value={st.leftHanded} onChange={(v) => set({ leftHanded: v })} options={[{ v: false, l: 'Destro' }, { v: true, l: 'Canhoto' }]} />
      </section>

      <section className="panel stack">
        <h2>Instrumento</h2>
        <Seg label="Instrumento" value={st.instrument} onChange={(v) => set({ instrument: v })} options={[{ v: 'guitarra', l: 'Guitarra (22 casas)' }, { v: 'violao', l: 'Violão (19 casas)' }]} />
        <label className="field"><span>Afinação</span>
          <select value={st.tuningId} onChange={(e) => set({ tuningId: e.target.value })}>
            {TUNINGS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <p className="small muted" style={{ margin: 0 }}>Afinações alternativas (Drop D, meio tom abaixo) estão previstas; a estrutura já suporta.</p>
        <Seg label="Som ao tocar no braço" value={st.sound} onChange={(v) => set({ sound: v })} options={[{ v: true, l: 'Ligado' }, { v: false, l: 'Desligado' }]} />
        <label className="field" style={{ maxWidth: 260 }}><span>Tempo por pergunta no modo rápido (s)</span>
          <input type="number" min={3} max={60} value={st.quickTimerSeconds} onChange={(e) => set({ quickTimerSeconds: Math.max(3, Math.min(60, Number(e.target.value) || 8)) })} />
        </label>
      </section>

      <section className="panel stack">
        <h2>Treino de hoje</h2>
        <p className="small muted" style={{ margin: 0 }}>Total: {blocks.reduce((a, b) => a + b.minutes, 0)} min.</p>
        {blocks.map((b, i) => (
          <div key={b.id} className="row" style={{ alignItems: 'flex-end' }}>
            <label className="field" style={{ flex: 2, minWidth: 160 }}><span>Bloco {i + 1}</span>
              <select value={b.kind} onChange={(e) => {
                const k = e.target.value as SessionBlock['kind'];
                setBlocks(blocks.map((x) => (x.id === b.id ? { ...x, kind: k, label: KINDS.find((y) => y.id === k)!.label } : x)));
              }}>
                {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
              </select>
            </label>
            <label className="field" style={{ width: 90 }}><span>Minutos</span>
              <input type="number" min={1} max={120} value={b.minutes} onChange={(e) => setBlocks(blocks.map((x) => (x.id === b.id ? { ...x, minutes: Math.max(1, Math.min(120, Number(e.target.value) || 1)) } : x)))} />
            </label>
            <button className="btn small" disabled={i === 0} onClick={() => { const n = [...blocks]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setBlocks(n); }} aria-label="Mover para cima">↑</button>
            <button className="btn small danger" disabled={blocks.length <= 1} onClick={() => setBlocks(blocks.filter((x) => x.id !== b.id))}>Remover</button>
          </div>
        ))}
        <div className="row">
          <button className="btn small" onClick={() => setBlocks([...blocks, { id: uid(), kind: 'cards', label: 'Cards', minutes: 5 }])} disabled={blocks.length >= 8}>Adicionar bloco</button>
          <button className="btn small ghost" onClick={() => setBlocks(DEFAULT_SETTINGS.sessionBlocks)}>Restaurar padrão (30 min)</button>
        </div>
      </section>

      <section className="panel stack">
        <h2>Instalar o app</h2>
        {install.installed ? (
          <p className="notice ok">O Guitar Lab já está instalado e rodando como app.</p>
        ) : install.canPrompt ? (
          <button className="btn primary" onClick={install.prompt}>Instalar Guitar Lab</button>
        ) : (
          <div>
            <p className="small"><strong>{instr.platform}</strong></p>
            <ol className="steps small">{instr.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </div>
        )}
        <p className="small muted" style={{ margin: 0 }}>Não precisa de loja de aplicativos. A instalação exige que o app esteja publicado em HTTPS.</p>
      </section>

      <section className="panel stack">
        <h2>Backup do progresso</h2>
        <p className="small muted" style={{ margin: 0 }}>
          Seus dados ficam só neste aparelho ({storageKind === 'indexeddb' ? 'armazenamento local do navegador' : 'memória temporária'}). Limpar os dados do navegador apaga o progresso — exporte backups de vez em quando.
        </p>
        <div className="row">
          <button className="btn" onClick={doExport}>Exportar backup (JSON)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Importar backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void doImport(f); e.target.value = ''; }} />
        </div>
        {msg && <p className={`notice ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.text}</p>}
      </section>

      <section className="panel stack">
        <h2>Apagar tudo</h2>
        <p className="small muted" style={{ margin: 0 }}>Remove progresso, respostas, cards, sessões, músicas e configurações deste aparelho.</p>
        <button className="btn danger" onClick={async () => {
          if (confirm('Apagar todo o progresso deste aparelho? Exporte um backup antes se quiser guardar.') && confirm('Confirma? Esta ação não pode ser desfeita.')) {
            await resetAll();
            setMsg({ ok: true, text: 'Dados apagados.' });
          }
        }}>Apagar todos os dados</button>
      </section>

      <p className="small muted">Guitar Lab {__APP_VERSION__}</p>
    </div>
  );
}
