# Simula Verum

Site para organizar simulações da ONU (Model UN) no colégio: distribuição/sorteio de representações, posts de aviso e simulação, fórum de debates e um painel de administrador.

A especificação completa está em [`prompt-v4-simulaverum.txt`](prompt-v4-simulaverum.txt). O plano de implementação e a lista de tarefas estão em [`tasks/plan.md`](tasks/plan.md) e [`tasks/todo.md`](tasks/todo.md).

## Stack

- **Frontend:** React + Vite (`client/`)
- **Backend:** Node.js + Express (`server/`)
- **Banco de dados:** SQLite via `better-sqlite3` (`server/data/simulaverum.db`), sem servidor de banco separado
- **Sessão:** `express-session` com store próprio em SQLite (`server/src/sessionStore.js`)
- **Anexos:** armazenados como arquivos em `server/uploads/`, não dentro do banco

Escolhida por ser leve o suficiente para rodar em computadores modestos e não exigir experiência prévia com bancos de dados.

## Como rodar localmente

Requer Node.js 18 ou superior.

```
npm install
npm run dev
```

Isso sobe o cliente (`http://localhost:5173`) e o servidor (`http://localhost:3001`) juntos. O cliente faz proxy de `/api` para o servidor, então acesse só `http://localhost:5173`.

Na primeira execução, o servidor cria automaticamente:
- o arquivo de banco em `server/data/simulaverum.db`;
- a conta de administrador padrão: usuário `admin`, senha `simulaverum` (**troque isso antes de usar o site com dados reais** — ainda não existe uma tela para alterar a senha do admin, então por enquanto a troca precisa ser feita direto no banco);
- a árvore de representações e comitês (países, comitês históricos, mitológicos, etc.).

## Nota sobre rodar dentro do OneDrive

Este projeto está numa pasta sincronizada pelo OneDrive, o que já causou dois problemas de desenvolvimento:
- O cache do Vite (`client/node_modules/.vite`) às vezes trava com erro `EPERM` durante a sincronização — se acontecer, apague essa pasta e rode `npm run dev` de novo.
- `node --watch` sem escopo entrava em loop infinito de reinício (provavelmente por causa da sincronização mexendo em arquivos observados) — por isso o script `dev` do servidor usa `--watch-path=src`, restringindo a observação só ao código-fonte.

Se possível, mover o projeto pra fora de uma pasta sincronizada (ex: `C:\dev\simula-verum`) evita os dois problemas de vez.

## Backup

O banco roda em modo WAL (write-ahead log) para melhor desempenho. Isso significa que escritas recentes podem estar temporariamente em `simulaverum.db-wal` em vez do arquivo principal. Para um backup completo e consistente, copie os três arquivos juntos:

```
server/data/simulaverum.db
server/data/simulaverum.db-wal
server/data/simulaverum.db-shm
```

e a pasta inteira de anexos:

```
server/uploads/
```

Nenhum desses arquivos é versionado no Git (veja `.gitignore`).

## Estrutura

```
client/   — frontend React
server/   — backend Express + banco SQLite
tasks/    — plano de implementação e lista de tarefas
```
