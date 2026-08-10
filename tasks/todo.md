# Simula Verum — Lista de Tarefas

Referência completa (contexto, decisões, schema, dependências) em `tasks/plan.md`. Cada item abaixo é uma fatia vertical completa (schema → API → UI), verificável manualmente antes de marcar como concluída.

## Checkpoint A — Esqueleto core
- [x] A1 — Scaffold do projeto (Vite+React, Express, better-sqlite3, `npm run dev`, `/api/health`)
- [x] A2 — Sistema de notificação padrão (2.4)
- [x] A3 — Login de usuário por nome (2.1, 2.1.0)
- [x] A4 — Login de admin (2.1.1) + seed `admin`/`simulaverum`
- [x] A5 — Botão de QR code (2.1.2)
- [x] A6 — Shell do menu + sidebar (2.2, 2.2.1)
- [x] A7 — Seleção de tema, 8 cores (2.2.1.2)
- [x] A8 — Perfil de emoji, parte manual (2.2.1.1) + passe de responsividade (iPad/desktop otimizados, celular funcional — 0.5)

## Checkpoint B — Posts de Texto
- [x] B1 — Leitura de posts de Texto (lista + detalhe + timestamp)
- [x] B2 — Admin cria/edita/exclui posts de Texto (3.1, 3.1.1, 3.1.1.2)
- [x] B3 — Anexos com limite 8MB/5 por post (3.1.3)
- [x] B4 — Fixar posts (máx. 3)

## Checkpoint C — Debates (paralelo a B/D/E)
- [x] C1 — Fórum core, polling 3s (2.3)
- [x] C2 — Spam (5+ msgs <100 car. ou 3+ msgs >100 car. em ~10s) + cooldown 5s + liberação manual (2.3.2, 3.2)
- [x] C3 — Moderação: excluir/trancar/purgar (3.2)

## Checkpoint D — Tree View (pré-requisito de E)
- [x] D1 — Schema + seed completo (4.1–4.3). Visualizador nasce no F1 (editor completo), evitando UI descartável.

## Checkpoint E — Simulação e sorteio
- [x] E1 — Criação de post de Simulação + especificações (2.5.2, 2.5.2.1)
- [x] E2 — Indicador ativo + abrir/fechar
- [x] E3 — Inscrição modo ordem de chegada + busca (2.5.2.4a)
- [x] E4 — Inscrição modo sorteio + prioridade + autofill (2.5.2.3, 2.5.2.4b)
- [x] E5 — Gestão individual pelo admin (3.1.2)
- [x] E6 — Emoji automático ao ser designado (fecha loop de A8)
- [x] E7 — Ordem de oradores, oculta até encerrar (2.5.2.2)

Pendência conhecida: edição de título/texto de posts de Simulação após criados ainda não tem formulário dedicado (specs/pool/participantes já são editáveis via o painel de admin na própria página do post). Revisitar no Checkpoint G.

## Checkpoint F — Admin avançado
- [x] F1 — Editor Tree View + storage + restaurar banco (3.3)

## Adiado — reestruturação visual
Estilo atual está minimalista demais e com problemas de contraste (ex: texto cinza sobre fundo vermelho claro). Adiado até terminar a correção de bugs funcionais. Quando começar: usuário vai trazer sites de referência + pedir mockups (não um prompt de design escrito). Correções de contraste ficam junto com essa reestruturação, não separadas.

## Checkpoint G — Polimento
- [x] G1 — Consistência de formatação/notificação + varredura dos botões de ajuda "(?)" em todo toggle/seletor não óbvio (2.6)
- [x] G2 — Varredura de segurança: 28 endpoints admin-only testados, todos corretamente bloqueados (401/403)
- [x] G3 — Conta compartilhada por nome (2.1.0) — verificado repetidamente ao longo da sessão
- [x] G4 — Portabilidade/footprint: banco com toda a Tree View = 120KB; anexos fora do banco; backup documentado no README (inclui arquivos WAL)
