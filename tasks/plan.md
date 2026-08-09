# Simula Verum — Plano de Implementação

## Contexto

O repositório está vazio de código (só README, CLAUDE.MD e os dois arquivos de prompt). `prompt-v4-simulaverum.txt` é a especificação completa e corrigida (produzida por uma entrevista detalhada que já resolveu as ambiguidades do rascunho v3) e é a fonte da verdade para este plano. O objetivo é construir o site do zero: React (frontend) + Node.js/Express (backend) + SQLite (banco), rodando localmente primeiro, pensado para depois ser hospedado no servidor do colégio (espaço limitado) e futuramente open-sourced para outras escolas rodarem em hardware modesto.

O trabalho será fatiado verticalmente (cada task entrega um caminho completo — schema → API → UI — demonstrável), não em camadas horizontais ("todo o backend" depois "todo o frontend").

## Dispositivos-alvo (adicionado após aprovação inicial)

Uso principal: iPads (10ª/11ª geração) e computadores — otimizar layout e alvos de toque para essas telas primeiro (tablet ~768–1024px+ e desktop). Celulares e outros dispositivos devem ser funcionais (layout reorganiza/empilha, nunca quebra ou corta conteúdo), sem exigir otimização pixel-perfect. Como o uso principal é touch (iPad), elementos interativos (botões, toggles, swatches de cor) devem ter alvo de toque confortável (referência: ~40-44px). Cada task de UI a partir de agora deve considerar isso; uma varredura de responsividade também acontece no Checkpoint G.

## Decisões técnicas

- **better-sqlite3** (API síncrona) — mais fácil de entender pra quem nunca mexeu com banco de dados, sem callbacks/promises complicando.
- **express-session + store em SQLite** em vez de JWT — tudo fica no mesmo arquivo que a escola vai fazer backup, sobrevive a reinícios do servidor.
- **bcrypt** para o hash da senha do admin (seed `admin`/`simulaverum` no primeiro boot, nunca texto puro no banco).
- **multer** com armazenamento em disco (não blob no banco) pros anexos — mantém o arquivo SQLite pequeno.
- Emojis de bandeira **gerados programaticamente** a partir do código ISO 3166-1 alpha-2 do país (função pequena e determinística), em vez de digitados manualmente um a um (195 países = risco alto de erro digitando na mão).
- Sem framework de teste ainda — verificação manual (navegador + PowerShell `Invoke-WebRequest` para checar permissões de API).

## Suposições assumidas (padrões razoáveis, não bloqueiam o início)

1. Validação de data `DD/MM`: usa o ano corrente; se a data resultante já passou, rejeita (não assume "ano que vem").
2. "Apenas letras" no nome = letras Unicode + espaço (permite nomes acentuados), validado no servidor também, não só no cliente.
3. Identidade de conta é case-sensitive por padrão do SQLite — não adicionar `COLLATE NOCASE` na coluna de nome, ou a regra de "nome exato = mesma conta" quebra.
4. Heurística de spam (2.3.2), definida pelo usuário: considerar SPAM se "5+ mensagens quase idênticas de menos de 100 caracteres forem enviadas em ~10s" OU se "3+ mensagens quase idênticas de mais de 100 caracteres forem enviadas em ~10s" — diferencia reação/ênfase (mensagens curtas repetidas) de alguém realmente poluindo o chat (mensagens longas repetidas exigem menos repetições para acionar a penalidade).
5. "~195 países": usar os 193 estados-membros da ONU + observadores comumente incluídos em simulações (Santa Sé, Palestina).

## Padrão de UX: botões de ajuda "(?)" (adicionado após a aprovação inicial do plano)

Generalizar o padrão já previsto em 3.1.1.2 (botão "(?)" explicando a formatação de texto) para qualquer funcionalidade não óbvia: toggles, seletores, e comportamentos de conta (ex: toggle de emoji automático em 2.2.1.1, seleção de tema em 2.2.1.2, modo ordem de chegada vs. sorteio em 2.5.2.4, autofill de excedente em 2.5.2.3, etc.). Ao clicar ou passar o mouse sobre o "(?)", abre um dropdown explicando a funcionalidade. Será detalhado com mais rigor (quais elementos exatamente, texto exato de cada explicação) posteriormente — por ora, cada task de checkpoint que introduzir um toggle/seletor não óbvio deve incluir um "(?)" com uma explicação básica, e uma varredura de consistência revisita isso no Checkpoint G (polimento).

## Schema (SQLite) — visão geral

Tabelas principais: `users`, `admins`, `representation_nodes` / `committee_nodes` (Tree View), `posts`, `simulation_details`, `simulation_available_representations`, `simulation_participants`, `speaking_order`, `post_attachments`, `post_history` (append-only), `debate_messages`, `forum_state`, `spam_penalties`.

## Superfície de API — visão geral

Login por nome / login admin / sessão; CRUD de posts + anexos + fixar; entrar/sortear/reatribuir participantes de simulação; CRUD das duas Tree Views; storage + restore do banco; mensagens de debate (polling) + moderação + penalidade de spam.

QR code (2.1.2) é gerado **só no cliente** a partir da URL atual — sem endpoint de backend.

## Tarefas por checkpoint

### Checkpoint A — Esqueleto core (identidade, chrome, temas)
- **A1** Scaffold do projeto (Vite+React + Express + better-sqlite3, `npm run dev` sobe os dois, `/api/health`).
- **A2** Sistema de notificação padrão (2.4) — retângulo vermelho escuro, segurar pausa, arrastar pra cima descarta.
- **A3** Login de usuário por nome (2.1, 2.1.0) — mesma string = mesma conta, sessão persiste.
- **A4** Login de admin (2.1.1) — seed `admin`/`simulaverum` com bcrypt, mensagem de erro exata, toggle usuário/admin.
- **A5** Botão de QR code (2.1.2).
- **A6** Shell do menu + sidebar na ordem exata do spec (2.2, 2.2.1).
- **A7** Seleção de tema (2.2.1.2) — 8 cores, hex exatos, grid 4×2, persistido por usuário.
- **A8** Perfil de emoji — parte manual (2.2.1.1): toggle + seletor manual (a parte automática liga em E6).

### Checkpoint B — Posts de Texto usáveis
- **B1** Leitura de posts de Texto (lista + detalhe + regra de timestamp 2.5/2.5.1).
- **B2** Admin cria/edita/exclui posts de Texto (3.1, 3.1.1, 3.1.1.2 formatação `*itálico*`/`**negrito**`/`_sublinhado_`, confirmação "Você tem certeza?").
- **B3** Anexos (3.1.3) — limite 8MB/arquivo, 5/post, notificação sugerindo Drive/OneDrive acima do limite.
- **B4** Fixar posts (máx. 3).

### Checkpoint C — Debates (paralelo, só depende de A)
- **C1** Fórum core (2.3) — polling 3s, bolhas esquerda/direita, regra de timestamp própria (diferente da de posts), limite 1500 caracteres.
- **C2** Detecção de spam + cooldown de 5s + liberação manual pelo admin (2.3.2, 3.2).
- **C3** Moderação (3.2) — excluir mensagens, trancar fórum, purgar por idade com notificação quando não há mensagens no período.

### Checkpoint D — Base da Tree View (pré-requisito duro do Checkpoint E)
- **D1** Schema + seed completo (todos os países da ONU com bandeira real gerada por código ISO, organizações, comitê histórico, mitológico/fictício, profissões, empresas, comitês da ONU + outros) + visualizador somente-leitura.

### Checkpoint E — Simulação e sorteio
- **E1** Criação de post de Simulação + especificações (omitir campo não definido; "Ver mais/Ver menos" acima de 20 itens).
- **E2** Indicador ativo (bolinha vermelha pulsando) + abrir/fechar.
- **E3** Inscrição — modo ordem de chegada + busca quando pool ≥ 20.
- **E4** Inscrição — modo sorteio + sorteio com prioridade + preenchimento automático em caso de excedente (2.5.2.3/2.5.2.4).
- **E5** Gestão individual pelo admin (reatribuir, remover, resortear um).
- **E6** Fecha o loop do emoji automático (2.2.1.1) — ao ser designado, se toggle ligado e a representação tem emoji, atualiza o perfil.
- **E7** Ordem de oradores — oculta enquanto aberto, visível só após encerrar (2.5.2.2).

### Checkpoint F — Recursos avançados do admin
- **F1** Editor da Tree View + armazenamento usado + "Restaurar banco de dados" com a pergunta "Qual a melhor turma de 2026?" / resposta "Tales" (3.3).

### Checkpoint G — Polimento
- **G1** Formatação/notificação consistentes em todas as superfícies.
- **G2** Varredura de segurança — todo endpoint admin-only rejeita requisição sem sessão de admin (não só escondido na UI).
- **G3** Conta compartilhada por nome — dois navegadores, mesmo nome, tudo sincronizado.
- **G4** Checagem de portabilidade — tamanho do banco após seed completo, anexos fora do arquivo `.db`, documentar backup no README.

## Grafo de dependências (nível alto)

```
A1 → A2 → A3 → A4 → A6 → A7, A8
                 │
                 ├─→ B1 → B2 → B3, B4        (Conteúdo)
                 ├─→ C1 → C2, C3              (Debates — paralelo)
                 └─→ D1 (só precisa de A1)     (Tree View)

B2 + D1 → E1 → E2 → E3 → E4 → E5
                        E3/E4 + A8 → E6
                        E2 + E5 → E7

D1 + A4 → F1
(tudo de B/D/E/F) → G1, G2, G3, G4
```

## Arquivos críticos

- `server/db/schema.sql` — definição única das tabelas.
- `server/db/seed/representations.seed.ts` — seed dos ~195 países + categorias (tarefa D1, a mais trabalhosa em volume de conteúdo).
- `server/routes/posts.ts` — CRUD de posts Texto/Simulação, arquivo mais reaproveitado (Checkpoints B e E).
- `server/middleware/session.ts` — autenticação/sessão usada por praticamente todo endpoint admin-only.
- `client/src/components/NotificationProvider.tsx` — sistema de toast compartilhado por B3, C1/C2, E1, E3/E4, F1.

## Verificação

Sem suíte de testes ainda — cada task tem um passo de verificação manual específico (navegador + PowerShell `Invoke-WebRequest` para confirmar que endpoints admin-only retornam 401/403 sem sessão de admin, não só escondidos na UI). Checkpoints G2 (varredura de segurança) e G3 (conta compartilhada) fecham o plano confirmando as duas garantias mais importantes do spec: nada admin-only vaza pra usuário comum, e a identidade por nome exato realmente se comporta como uma conta única.
