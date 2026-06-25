# Playpint - Workflow Git para 2 pessoas

Este projeto deve ser desenvolvido sempre com a `main` estável. Ninguem trabalha diretamente na `main`; cada tarefa vive numa branch curta e entra no projeto por Pull Request.

## 1. Setup inicial em cada PC

Instalar Git:

```powershell
winget install --id Git.Git -e
```

Depois de instalar, fechar e abrir o terminal. Confirmar:

```powershell
git --version
```

Configurar identidade:

```powershell
git config --global user.name "O Teu Nome"
git config --global user.email "o-teu-email-do-github@example.com"
```

Clonar o projeto:

```powershell
git clone <URL_DO_REPOSITORIO> Playpint
cd Playpint
git status
```

## 2. Regra principal

Antes de começar qualquer tarefa:

```powershell
git switch main
git pull --ff-only
git switch -c feat/mobile/join-room
```

Trocar `feat/mobile/join-room` pelo nome real da tarefa.

## 3. Divisao de trabalho recomendada

Pessoa 1:

- `apps/mobile/`
- ecras, navegacao, componentes, sensores, camera, estado local

Pessoa 2:

- `apps/backend/`
- salas, jogadores, jogos, votos, tempo real, base de dados, seguranca

Ambos:

- `packages/contracts/`
- `docs/`
- contratos de API, eventos, modelos partilhados

Mudancas em `packages/contracts/` devem ser combinadas antes, porque afetam mobile e backend ao mesmo tempo.

## 4. Ciclo diario de trabalho

Ver alteracoes:

```powershell
git status
git diff
```

Adicionar ficheiros especificos:

```powershell
git add apps/mobile/src/screens/JoinRoomScreen.tsx
```

Confirmar o que vai entrar no commit:

```powershell
git diff --staged
```

Criar commit:

```powershell
git commit -m "feat(mobile): add join room screen"
```

Enviar branch para o GitHub:

```powershell
git push -u origin feat/mobile/join-room
```

Depois disso, abrir Pull Request no GitHub.

## 5. Como atualizar uma branch com a main

Antes de abrir ou atualizar um Pull Request:

```powershell
git fetch origin
git rebase origin/main
```

Se houver conflitos, parar e resolver ficheiro a ficheiro. Depois:

```powershell
git add <ficheiro-resolvido>
git rebase --continue
```

Se o comportamento correto nao for obvio, os dois programadores validam a decisao antes de continuar.

## 6. Depois de um Pull Request aceite

Voltar para a `main`:

```powershell
git switch main
git pull --ff-only
```

Apagar branch local:

```powershell
git branch -d feat/mobile/join-room
```

Se a branch remota ainda existir:

```powershell
git push origin --delete feat/mobile/join-room
```

## 7. Convencao de branches

Exemplos:

```text
feat/mobile/loading-screen
feat/mobile/join-room
feat/mobile/lobby
feat/backend/create-room
feat/backend/lobby-realtime
fix/mobile/qr-permission
fix/backend/duplicate-vote
refactor/contracts/room-events
docs/game-design
chore/ci-mobile
```

## 8. Convencao de commits

Exemplos:

```text
feat(mobile): add join room screen
feat(backend): create room endpoint
fix(backend): prevent duplicate votes
fix(mobile): handle camera permission denial
refactor(contracts): version room events
test(backend): cover host kick permissions
docs: document lobby flow
chore(ci): add mobile validation workflow
```

Um commit deve ter uma unica intencao. Evitar misturar interface, backend, documentacao e configuracao no mesmo commit sem necessidade.

## 9. O que pedir ao Codex

Exemplos de pedidos bons:

```text
Codex, atualiza a main e cria a branch feat/backend/create-room.
Codex, mostra os ficheiros alterados antes do commit.
Codex, faz commit das alteracoes do lobby mobile.
Codex, atualiza esta branch com a main e resolve conflitos comigo.
Codex, prepara o push desta branch.
Codex, explica ao outro PC como puxar as alteracoes mais recentes.
```

O Codex deve sempre verificar `git status`, rever o diff, executar os testes aplicaveis e so depois criar commit ou push.

## 10. Regras que evitam conflitos

- Nunca trabalhar diretamente na `main`.
- Fazer `git pull --ff-only` antes de criar branch.
- Branch pequena, uma tarefa por branch.
- Evitar duas pessoas a editar o mesmo ficheiro ao mesmo tempo.
- Combinar antes qualquer mudanca em contratos partilhados.
- Abrir Pull Request cedo quando a tarefa ja tem forma.
- Nao fazer `force push` sem decisao explicita.
- Nao aceitar merge se testes, lint ou build falharem.

## 11. Fluxo ideal para Playpint

1. Pessoa 1 cria `feat/mobile/join-room`.
2. Pessoa 2 cria `feat/backend/create-room`.
3. Ambas combinam o contrato em `packages/contracts/`.
4. Backend implementa endpoint.
5. Mobile consome endpoint.
6. Cada branch abre Pull Request.
7. Pull Requests passam testes.
8. Merge para `main`.
9. Ambos fazem `git switch main` e `git pull --ff-only`.

Assim os dois PCs conseguem trabalhar ao mesmo tempo sem pisar o trabalho um do outro.
