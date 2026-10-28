# Guitar Lab — contexto para o Claude Code

PWA de estudo de guitarra/violão. O usuário já toca rock e blues (riffs, bases, partes de solos) mas não domina o mapa do braço, harmonia nem improvisação consciente. O app transforma prática em compreensão.

## Origem
Projeto iniciado numa conversa no claude.ai a partir de um "prompt mestre" com 22 seções (papel, pedagogia, navegação, módulos, PWA, modelo de dados, testes, critérios de aceitação). As etapas 1–6 do MVP foram concluídas. O texto completo do prompt mestre deve ser colado em `docs/prompt-mestre.md` (peça ao usuário se não estiver lá).

## Regras do projeto (não negociáveis)
- Interface e textos em português brasileiro.
- Pedagogia: toda aula segue ENTENDER → EXECUTAR → MEMORIZAR → APLICAR. Um conceito por vez. A aula seguinte só abre com ≥ 80% sem ajuda no quiz de memorização.
- Correção musical é requisito central: posições SEMPRE calculadas por altura (MIDI = afinação + casa), nunca desenhadas à mão. Toda regra musical nova precisa de teste em `src/music/*.test.ts`, com gabarito escrito à mão.
- Grafia correta: uma letra por grau (Fá maior tem Si♭). Cifras em letras (Am, F#m, G7).
- Domínio ≠ tempo praticado. Dominado = ≥ 12 respostas sem ajuda (nível 2–3), ≥ 85%, em ≥ 2 dias.
- Sem dados falsos: o app não escuta o instrumento. BPM é "declarado"; etapa Aplicar é autodeclarada. Nada de botão que finge executar algo inexistente — módulos futuros aparecem como "em preparação".
- Sem backend, login ou serviço pago. Sem músicas protegidas; áudio é sintetizado.
- Não adicionar dependências sem necessidade real.

## Stack
React 19 + TypeScript + Vite 8, Vitest, vite-plugin-pwa (Workbox, registerType 'prompt'), IndexedDB via `idb`, CSS próprio com tokens (claro/escuro), fonte Archivo (self-hosted). Roteamento por hash (`#/mapa`).

## Estrutura
- `src/music/` motor musical puro (notas, intervalos, braço, oitavas, escalas, boxes de pentatônica, acordes, campo harmônico)
- `src/learning/` exercícios (geração/correção), revisão espaçada (Leitner), domínio, progresso, assuntos (topics)
- `src/content/` aulas e fases (`lessons.ts`), cards, exercícios técnicos — conteúdo como dados
- `src/storage/` tipos do modelo de dados, IndexedDB, backup JSON validado
- `src/app/` store global, router, treino cronometrado, PWA (update/instalação)
- `src/ui/` Fretboard (SVG, vertical no celular), Quiz, Metrônomo, áudio
- `src/pages/` telas

## Comandos
`npm install` · `npm run dev` · `npm test` · `npm run typecheck` · `npm run build` · `npm run preview`

## Estado atual (MVP concluído)
- Fase 1 completa: 11 aulas (afinação, cromática, notas por corda, acidentes, uníssono, 4 aulas de oitavas).
- Mapa interativo, exercícios em 3 níveis, cards (72 padrão + pessoais), treino do dia, técnica com metrônomo, análise de músicas, evolução, configurações, backup, PWA offline.
- 66 testes passando. Validado em navegador (mobile/desktop, claro/escuro, offline, persistência).
- Prévias de consulta sem aulas: Escalas/pentatônicas, Acordes/campo harmônico.
- Placeholders honestos: Improvisação, Ouvido musical.

## Próximo passo combinado
Usuário vai usar a Fase 1 por alguns dias e trazer o que travou. Depois: Fase 2 (intervalos e referências), reaproveitando `src/music/intervals.ts`. Ainda não publicado em HTTPS (sugestão: Netlify/Vercel/GitHub Pages com `dist/`).

## Forma de trabalhar
Em etapas; em cada etapa relatar o que foi implementado, testes que passaram, limitações e próximo passo. Não declarar nada concluído sem verificar. O usuário prefere tom casual e quer que você sinalize quando a conversa entrar em detalhes irrelevantes para o projeto atual.
