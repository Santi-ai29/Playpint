# Playpint — Relatório de Separação entre Frontend e Backend

**Versão:** 1.0  
**Data:** 25 de junho de 2026  
**Estado:** Base técnica aprovada para o MVP

## 1. Objetivo

Definir uma organização técnica que permita a duas pessoas desenvolverem o Playpint sem misturar responsabilidades entre a aplicação mobile e o servidor. O Codex será o processo obrigatório para operações Git: preparação de alterações, commits, atualização de branches, resolução de conflitos e integração na `main`.

## 2. Decisão arquitetural

Para o MVP será usado **um único repositório com dois projetos independentes**, isto é, um monorepo modular:

- `apps/mobile`: frontend mobile;
- `apps/backend`: backend e comunicação em tempo real;
- `packages/contracts`: contratos partilhados entre os dois projetos;
- `docs`: documentação funcional e técnica;
- `.github/workflows`: verificações automáticas separadas.

Esta solução mantém frontend e backend isolados, mas permite ao Codex validar a integração completa numa única branch `main`.

## 3. Estrutura do repositório

```text
playpint/
├── apps/
│   ├── mobile/
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   ├── game-modes/
│   │   │   ├── sensors/
│   │   │   ├── camera/
│   │   │   └── state/
│   │   ├── assets/
│   │   ├── tests/
│   │   └── .env.example
│   │
│   └── backend/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── rooms/
│       │   │   ├── players/
│       │   │   ├── games/
│       │   │   ├── votes/
│       │   │   ├── scores/
│       │   │   └── punishments/
│       │   ├── realtime/
│       │   ├── database/
│       │   ├── security/
│       │   └── config/
│       ├── tests/
│       └── .env.example
│
├── packages/
│   └── contracts/
│       ├── api/
│       ├── events/
│       ├── models/
│       └── validation/
│
├── docs/
│   ├── GDD.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── GIT_WORKFLOW.md
│
├── .github/
│   └── workflows/
│       ├── mobile-ci.yml
│       ├── backend-ci.yml
│       └── integration-ci.yml
│
├── README.md
└── .gitignore
```

## 4. Responsabilidades do frontend mobile

O frontend é responsável por tudo o que o jogador vê ou controla no telemóvel:

- ecrã de carregamento e menu principal;
- navegação entre Host, Join, lobby, jogo e classificação;
- introdução do nickname;
- câmara e criação do avatar;
- leitura de QR Code;
- apresentação do código e QR Code da sala;
- formulários e botões de host;
- temporizadores visuais baseados no prazo enviado pelo servidor;
- respostas, votos, desenhos e interações do jogador;
- apresentação de resultados, percentagens e classificação;
- utilização futura de giroscópio, acelerómetro e outros sensores;
- ligação ao backend por HTTP e comunicação em tempo real;
- gestão apenas do estado visual e temporário da interface.

O frontend **não deve**:

- decidir quem é o impostor;
- calcular a pontuação oficial;
- aceitar ou rejeitar votos por conta própria;
- definir sozinho o início ou fim de uma ronda;
- guardar segredos de servidor;
- alterar permissões do host;
- tratar o estado local como resultado oficial da partida.

## 5. Responsabilidades do backend

O backend é a autoridade da sala e da partida:

- criar salas e códigos únicos;
- validar a entrada dos jogadores;
- identificar host e clientes;
- gerir ligações, saídas e reconexões;
- aplicar permissões de host;
- expulsar jogadores quando solicitado pelo host;
- sincronizar lobby, rondas e resultados;
- escolher perguntas, palavras e jogadores aleatórios;
- proteger a palavra secreta do jogo do impostor;
- validar respostas e impedir votos duplicados;
- controlar prazos oficiais das rondas;
- calcular percentagens e pontuações;
- guardar a consequência definida para o último lugar;
- produzir a classificação final;
- determinar o último classificado;
- guardar apenas os dados necessários para a sessão e para as funcionalidades acordadas.

## 6. Contratos partilhados

A pasta `packages/contracts` é a única zona de partilha direta entre frontend e backend. Deve conter apenas estruturas neutras:

- modelos de dados;
- nomes e formatos de eventos;
- pedidos e respostas da API;
- enums de estado;
- regras de validação que não contenham lógica secreta;
- versões dos contratos.

Exemplos:

```text
RoomStatus: waiting | playing | finished
PlayerRole: host | client
GameMode: would_you_rather | impostor | truth_or_dare
RoundStatus: preparing | active | voting | result
```

O frontend não pode importar ficheiros de `apps/backend`, e o backend não pode importar ficheiros de `apps/mobile`.

## 7. Comunicação entre projetos

### HTTP

Adequado para ações pontuais:

```text
POST /rooms
POST /rooms/{code}/join
GET  /rooms/{roomId}
POST /rooms/{roomId}/start
POST /rooms/{roomId}/kick
POST /rooms/{roomId}/leave
```

### Comunicação em tempo real

Adequada para sincronização imediata:

```text
room:player_joined
room:player_left
room:player_kicked
room:settings_updated
game:started
game:round_started
game:submission_received
game:round_finished
game:leaderboard_updated
game:punishment_revealed
```

O telemóvel envia uma intenção, como “votar na opção A”. O backend valida e devolve o estado oficial. O temporizador deve usar uma data/hora limite enviada pelo servidor, evitando que cada telemóvel determine o fim da ronda de forma diferente.

O QR Code deve identificar a sala através de um código ou ligação de entrada. Não deve conter credenciais privadas nem segredos administrativos.

## 8. Entidades principais

### Room

```text
id
code
name
hostPlayerId
status
selectedGameModes
roundCount
currentRoundId
finalPunishment
createdAt
```

### Player

```text
id
roomId
nickname
avatarReference
role
score
connectionStatus
joinedAt
```

### GameSession

```text
id
roomId
selectedModes
currentRoundNumber
status
startedAt
finishedAt
```

### Round

```text
id
gameSessionId
gameMode
prompt
subjectPlayerId
status
startsAt
endsAt
result
```

### Submission / Vote

```text
id
roundId
playerId
contentOrOption
submittedAt
```

## 9. Regra Git obrigatória

A branch `main` representa sempre a versão integrada e funcional do projeto.

Regras:

1. Nenhuma pessoa trabalha diretamente na `main`.
2. Cada tarefa começa numa branch criada a partir da `main` atualizada.
3. Cada branch deve tratar uma única tarefa ou correção.
4. O Codex verifica os ficheiros alterados antes de criar o commit.
5. O Codex executa lint, testes e build aplicáveis.
6. O Codex cria o commit com uma mensagem objetiva.
7. O Codex atualiza a branch com a versão mais recente da `main`.
8. O Codex resolve conflitos com validação dos dois programadores quando o comportamento funcional estiver em dúvida.
9. A integração ocorre através de Pull Request.
10. Só é feito merge quando as verificações do frontend, backend e integração necessárias estiverem aprovadas.
11. Depois do merge, a branch é eliminada.

### Nota de controlo

O Codex será o procedimento obrigatório para operar o Git. Caso o Codex use as credenciais Git de um dos programadores, o GitHub registará tecnicamente esse utilizador como autor da operação. Para uma separação técnica total, seria necessário configurar uma conta de automação ou GitHub App própria. Para o MVP, a regra operacional e a proteção da `main` são suficientes.

## 10. Convenção de branches

```text
feat/mobile/loading-screen
feat/mobile/join-room
feat/mobile/lobby
feat/mobile/would-you-rather

feat/backend/create-room
feat/backend/player-session
feat/backend/lobby-realtime
feat/backend/would-you-rather

fix/mobile/qr-permission
fix/backend/duplicate-vote

refactor/mobile/navigation
refactor/backend/room-state

docs/game-design
chore/ci-mobile
```

Não será usada uma branch `develop` no MVP. A equipa terá `main` protegida e branches curtas de funcionalidade, reduzindo merges intermédios e divergência desnecessária.

## 11. Convenção de commits

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

Um commit não deve combinar, sem necessidade, alterações de interface, servidor, documentação e configuração.

## 12. Proteção da `main`

Configuração recomendada:

- exigir Pull Request;
- bloquear push direto;
- exigir verificações automáticas concluídas;
- exigir que a branch esteja atualizada antes do merge;
- bloquear force push;
- bloquear eliminação da `main`;
- exigir pelo menos uma revisão humana;
- usar `CODEOWNERS` quando as responsabilidades de cada pessoa estiverem definidas.

Exemplo de `CODEOWNERS`:

```text
/apps/mobile/       @frontend-owner
/apps/backend/      @backend-owner
/packages/contracts/ @frontend-owner @backend-owner
/docs/              @frontend-owner @backend-owner
```

## 13. Integração contínua separada

### `mobile-ci.yml`

Executa quando forem alterados:

```text
apps/mobile/**
packages/contracts/**
```

Valida:

- instalação;
- lint;
- tipos;
- testes;
- build de desenvolvimento.

### `backend-ci.yml`

Executa quando forem alterados:

```text
apps/backend/**
packages/contracts/**
```

Valida:

- instalação;
- lint;
- tipos;
- testes;
- arranque do servidor;
- testes das rotas e eventos.

### `integration-ci.yml`

Executa quando forem alterados contratos ou quando uma funcionalidade tocar nos dois projetos. Deve validar pelo menos:

- criação de sala;
- entrada de jogador;
- atualização do lobby;
- início pelo host;
- envio e receção de um evento de jogo;
- conclusão da ronda.

Uma alteração em `packages/contracts` deve acionar as verificações do frontend e do backend.

## 14. Divisão inicial do trabalho

### Frente de trabalho mobile

1. Estrutura da aplicação e navegação.
2. Ecrã de carregamento.
3. Menu principal.
4. Ecrãs Host e Join.
5. Câmara e avatar.
6. Leitor de QR Code.
7. Lobby do host.
8. Lobby do cliente.
9. Serviço de ligação ao backend.
10. Estados visuais de ligação, erro e reconexão.

### Frente de trabalho backend

1. Estrutura do servidor.
2. Configuração por ambiente.
3. Criação de salas.
4. Geração e validação do código da sala.
5. Sessão de jogador.
6. Regras de host e cliente.
7. Entrada, saída e reconexão.
8. Eventos em tempo real do lobby.
9. Expulsão de jogador.
10. Estado oficial da sala.

### Trabalho conjunto

1. Definir contratos de API e eventos.
2. Testar o fluxo completo Host → Join → Lobby → Start.
3. Rever erros e mensagens apresentadas ao utilizador.
4. Aprovar alterações aos contratos.
5. Validar a integração antes do merge.

## 15. Primeiro jogo integrado — “Você Prefere”

### Frontend

- mostrar pergunta e duas opções;
- mostrar contagem decrescente;
- bloquear segundo voto;
- mostrar estado de voto enviado;
- apresentar percentagens finais;
- apresentar nicknames por opção;
- apresentar pontos recebidos.

### Backend

- selecionar a pergunta;
- iniciar a ronda e definir o prazo;
- aceitar um voto por jogador;
- rejeitar votos fora do prazo;
- calcular percentagens;
- agrupar nicknames por opção;
- calcular pontos;
- emitir resultado oficial;
- avançar para a ronda seguinte.

### Contrato partilhado

```text
WouldYouRatherQuestion
WouldYouRatherVoteRequest
WouldYouRatherRoundStartedEvent
WouldYouRatherRoundResultEvent
```

## 16. Definition of Done

Uma tarefa só está concluída quando:

- cumpre os critérios funcionais;
- respeita a divisão frontend/backend;
- não contém segredos no repositório;
- tem tratamento de erros relevante;
- inclui testes adequados;
- passa lint, testes e build;
- atualiza contratos e documentação quando necessário;
- foi revista no diff pelo Codex;
- foi integrada por Pull Request;
- mantém a `main` funcional.

## 17. Decisão final

O Playpint começará como **monorepo modular**, com frontend e backend fisicamente separados e uma pequena área de contratos partilhados. A `main` conterá ambos os projetos, mas nenhum deles poderá depender diretamente do código interno do outro. O Codex será o operador obrigatório do fluxo Git e a `main` ficará protegida contra alterações diretas.
