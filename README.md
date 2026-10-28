# Guitar Lab

PWA de estudo progressivo de guitarra e violão: mapa do braço, teoria aplicada, memorização e prática. Funciona offline, salva o progresso no aparelho e instala sem loja de aplicativos.

## Requisitos

- Node.js 20 ou superior (testado com 22)
- npm

## Comandos

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento (http://localhost:5173)
npm test           # testes automatizados (motor musical, exercícios, revisão, backup)
npm run typecheck  # checagem de tipos
npm run build      # build de produção em dist/ (inclui service worker e manifesto)
npm run preview    # serve o build em http://localhost:4173 (testa PWA e offline)
npm run icons      # regenera os ícones em public/icons a partir de scripts/make-icons.mjs
```

O service worker só é registrado no build de produção (`build` + `preview` ou publicado), não no `dev`.

## Publicação

O app é 100% estático (sem backend) e usa caminhos relativos e rotas por hash (`#/mapa`), então funciona na raiz de um domínio ou numa subpasta.

1. `npm run build`
2. Publique o conteúdo de `dist/` em qualquer hospedagem estática com **HTTPS** (obrigatório para instalação e service worker):
   - **Netlify**: arraste a pasta `dist` em app.netlify.com/drop, ou configure build `npm run build` e publish `dist`.
   - **Vercel**: framework "Vite", output `dist`.
   - **GitHub Pages**: publique `dist/` (ex.: com a action `actions/deploy-pages`). Nenhuma configuração de rotas é necessária.
   - **Cloudflare Pages**: build `npm run build`, output `dist`.
3. Abra o endereço no celular e instale (instruções por navegador em Configurações → Instalar o app).

Comportamento de instalação varia: Chrome/Edge/Samsung (Android e desktop) oferecem instalação; no iPhone/iPad é pelo Safari → Compartilhar → Adicionar à Tela de Início; Firefox desktop não instala PWAs.

**Atualizações:** quando uma nova versão é publicada, o app mostra "Há uma nova versão" e só troca quando o usuário toca em "Atualizar agora" — para não interromper um exercício.

## Arquitetura

```
src/music/      Motor musical puro (sem React): notas, grafia, intervalos, braço,
                oitavas, escalas, boxes de pentatônica, acordes, campo harmônico.
src/learning/   Geração/correção de exercícios, revisão espaçada (Leitner),
                critério de domínio, progresso da trilha.
src/content/    Conteúdo didático como dados: fases, aulas, cards, exercícios técnicos.
src/storage/    Modelo de dados, IndexedDB (lib idb), backup JSON com validação.
src/app/        Estado global (store), roteamento por hash, treino cronometrado, PWA.
src/ui/         Componentes: Braço (SVG), Quiz, Metrônomo, áudio (Web Audio).
src/pages/      Telas.
```

Decisões principais:

- **Posições calculadas, nunca desenhadas.** Toda nota no braço vem de `afinação (MIDI) + casa`. O ajuste entre as cordas Sol e Si aparece sozinho nos desenhos de oitava e nos boxes de pentatônica, e é verificado por testes.
- **Grafia correta.** Escalas e acordes usam uma letra por grau (Fá maior tem Si♭, não Lá♯).
- **Conteúdo separado do progresso.** Aulas e cards padrão vêm do código; só o progresso do usuário é persistido. Atualizar o conteúdo não exige migração.
- **Domínio ≠ tempo.** Um assunto só é "dominado" com ≥ 12 respostas sem ajuda (níveis 2–3), ≥ 85% de acerto, em pelo menos 2 dias. Tempo cronometrado aparece separado.
- **Sem dados falsos.** O app não escuta o instrumento: BPM é marcado como "declarado", e a etapa "Aplicar" é autodeclarada.
- **Áudio sintetizado** (Karplus-Strong) — nenhum arquivo de som, nada protegido por direitos autorais.
- **Sem backend.** O modelo de dados é por entidade (store por tipo, ids estáveis), o que permite adicionar sincronização entre aparelhos no futuro.

### Modelo de dados (IndexedDB `guitar-lab`)

| Store | Conteúdo |
|---|---|
| `kv` | configurações, treino em andamento, última tela |
| `lessonProgress` | etapas concluídas, melhor nota do quiz, conclusão |
| `attempts` | cada resposta: assunto, tipo, nível, acerto, dica, tempo |
| `customCards` / `cardStates` / `reviews` | cards pessoais, agenda de revisão, histórico |
| `sessions` | sessões de prática cronometradas |
| `bpm` | andamentos declarados por exercício técnico |
| `goals` | metas pessoais |
| `songs` | fichas de análise de músicas (com "confirmado / hipótese") |

Backup: Configurações → Exportar/Importar (JSON validado; importar substitui os dados do aparelho).

## Personalização

- **Nome e cores**: nome do app em `vite.config.ts` (manifesto), `index.html` e `src/App.tsx`; cores em variáveis CSS no topo de `src/styles.css`; ícone em `scripts/make-icons.mjs`.
- **Novas aulas**: adicione objetos em `src/content/lessons.ts` (cada aula define seus textos, diagramas por regra e os exercícios por especificação). Os testes verificam automaticamente que todo quiz gera perguntas válidas e solucionáveis.
- **Novas afinações**: adicione em `TUNINGS` (`src/music/fretboard.ts`).

## Escopo desta versão (MVP)

Incluído: treino do dia configurável com cronômetro e retomada, mapa interativo (notas, nota única, oitavas, intervalos, escalas, boxes, acordes sobrepostos com notas-alvo, modo teste, dedos, som), Fase 1 completa (11 aulas: escala cromática, localização das notas, relação entre cordas, padrões de oitava), exercícios em 3 níveis com dica/resposta/repetição, revisão de dificuldades, cards com revisão espaçada e cards pessoais, técnica com metrônomo e registro de BPM, análise de músicas, painel de evolução com correção de registros, backup, PWA offline e instalável.

Prévias de consulta (sem aulas ainda): Escalas/pentatônicas e Acordes/campo harmônico.

Previsto, não implementado: aulas das Fases 2–7, laboratório de improvisação com bases, treino de ouvido, afinações alternativas, sincronização.

## Notas de segurança

- Nenhuma chave, login ou serviço externo. Entradas de texto têm limite de tamanho; backups são validados campo a campo.
- `npm audit` aponta avisos de baixa severidade em `workbox-build` (dependência só de build, não vai para o app publicado).
