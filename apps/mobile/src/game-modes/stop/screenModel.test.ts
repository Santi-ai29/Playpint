import assert from "node:assert/strict";
import test from "node:test";
import type {
  RoundSnapshot,
  StopPlayerState,
  StopPublicState,
} from "../../../../../packages/contracts/src";
import {
  createStopScreenModel,
  createStopSubmitAnswersAction,
} from "./screenModel";

test("shows a focused answering model with letter, timer, and fields", () => {
  const model = createStopScreenModel(
    snapshot({ lifecycleState: "active" }),
    "2026-06-25T20:00:05.000Z",
  );

  assert.equal(model.gameModeId, "stop");
  assert.equal(model.header.brandLogoText, "Playpint");
  assert.equal(model.header.brandLogoAsset, "./assets/playpint-logo.png");
  assert.equal(model.header.modeLabel, "Stop");
  assert.equal(model.header.phaseLabel, "Letra da ronda");
  assert.equal(model.header.timerLabel, "01:25");
  assert.equal(model.status, "answering");
  assert.equal(model.letter, "A");
  assert.equal(model.canEdit, true);
  assert.equal(model.canStop, true);
  assert.deepEqual(
    model.fields.map((field) => ({
      id: field.categoryId,
      placeholder: field.placeholder,
      disabled: field.disabled,
    })),
    [
      { id: "name", placeholder: "Nome proprio com A", disabled: false },
      { id: "city", placeholder: "Cidade com A", disabled: false },
      { id: "animal", placeholder: "Animal com A", disabled: false },
    ],
  );
});

test("locks the local fields after this player submits", () => {
  const model = createStopScreenModel(
    snapshot({
      lifecycleState: "active",
      playerState: {
        hasSubmitted: true,
        submittedAt: "2026-06-25T20:00:10.000Z",
        answers: {
          name: "Ana",
          city: "Aveiro",
        },
      },
    }),
    "2026-06-25T20:00:12.000Z",
  );

  assert.equal(model.status, "submitted");
  assert.equal(model.header.phaseLabel, "Stop chamado");
  assert.equal(model.canStop, false);
  assert.equal(model.fields.every((field) => field.disabled), true);
  assert.equal(model.fields[0]?.value, "Ana");
});

test("maps official Stop results and ranking", () => {
  const model = createStopScreenModel(
    snapshot({ lifecycleState: "result", result: true }),
    "2026-06-25T20:01:30.000Z",
  );

  assert.equal(model.status, "result");
  assert.equal(model.result?.letter, "A");
  assert.equal(model.result?.stoppedByLabel, "Carla carregou Stop");
  assert.deepEqual(
    model.result?.roundRanking.map((row) => ({
      playerId: row.playerId,
      totalScore: row.totalScore,
      isWinner: row.isWinner,
    })),
    [
      { playerId: "p3", totalScore: 30, isWinner: true },
      { playerId: "p1", totalScore: 25, isWinner: false },
      { playerId: "p2", totalScore: 5, isWinner: false },
    ],
  );
  assert.deepEqual(
    model.result?.answerRows[0]?.cells.map((cell) => ({
      answer: cell.answer,
      points: cell.points,
      reason: cell.reason,
    })),
    [
      { answer: "Alice", points: 10, reason: "unique" },
      { answer: "Amadora", points: 10, reason: "unique" },
      { answer: "Arara", points: 10, reason: "unique" },
    ],
  );
  assert.deepEqual(
    model.result?.overallRanking.map((row) => ({
      rank: row.rank,
      playerId: row.playerId,
      isLeader: row.isLeader,
    })),
    [
      { rank: 1, playerId: "p3", isLeader: true },
      { rank: 2, playerId: "p1", isLeader: false },
      { rank: 3, playerId: "p2", isLeader: false },
    ],
  );
});

test("creates a contract-compatible Stop submit action", () => {
  assert.deepEqual(
    createStopSubmitAnswersAction({
      playerId: "p1",
      roundId: "round_1",
      answers: {
        name: "Ana",
      },
      stopRound: true,
    }),
    {
      playerId: "p1",
      roundId: "round_1",
      answers: {
        name: "Ana",
      },
      stopRound: true,
    },
  );
});

function snapshot(input: {
  lifecycleState: "active" | "result";
  playerState?: StopPlayerState;
  result?: boolean;
}): RoundSnapshot<StopPublicState, StopPlayerState> {
  return {
    gameMode: "stop",
    gameModeId: "stop",
    roomId: "room_1",
    roundId: "round_1",
    lifecycleState: input.lifecycleState,
    clock: {
      startsAt: "2026-06-25T20:00:00.000Z",
      endsAt: "2026-06-25T20:01:30.000Z",
    },
    serverNow: "2026-06-25T20:00:05.000Z",
    publicState: {
      roomName: "Mesa 29",
      letter: "A",
      categories: [
        {
          id: "name",
          label: "Nome",
          placeholder: "Nome proprio",
          tone: "classic",
        },
        {
          id: "city",
          label: "Cidade",
          placeholder: "Cidade",
          tone: "classic",
        },
        {
          id: "animal",
          label: "Animal",
          placeholder: "Animal",
          tone: "classic",
        },
      ],
      players: [
        { playerId: "p1", nickname: "Ana" },
        { playerId: "p2", nickname: "Bruno" },
        { playerId: "p3", nickname: "Carla" },
      ],
      submittedCount: input.playerState?.hasSubmitted ? 1 : 3,
      totalPlayers: 3,
      stoppedByPlayerId: input.result ? "p3" : undefined,
      stoppedByNickname: input.result ? "Carla" : undefined,
      result: input.result
        ? {
            letter: "A",
            stoppedByPlayerId: "p3",
            stoppedByNickname: "Carla",
            totalSubmissions: 3,
            categoryResults: [
              {
                category: {
                  id: "name",
                  label: "Nome",
                  placeholder: "Nome proprio",
                  tone: "classic",
                },
                answers: [
                  scored("p1", "Ana", "name", "Nome", "Ana", 5, "duplicate"),
                  scored("p2", "Bruno", "name", "Nome", "Ana", 5, "duplicate"),
                  scored("p3", "Carla", "name", "Nome", "Alice", 10, "unique"),
                ],
              },
              {
                category: {
                  id: "city",
                  label: "Cidade",
                  placeholder: "Cidade",
                  tone: "classic",
                },
                answers: [
                  scored("p1", "Ana", "city", "Cidade", "Aveiro", 10, "unique"),
                  scored(
                    "p2",
                    "Bruno",
                    "city",
                    "Cidade",
                    "Braga",
                    0,
                    "wrong_letter",
                  ),
                  scored(
                    "p3",
                    "Carla",
                    "city",
                    "Cidade",
                    "Amadora",
                    10,
                    "unique",
                  ),
                ],
              },
              {
                category: {
                  id: "animal",
                  label: "Animal",
                  placeholder: "Animal",
                  tone: "classic",
                },
                answers: [
                  scored("p1", "Ana", "animal", "Animal", "Anta", 10, "unique"),
                  scored("p2", "Bruno", "animal", "Animal", "", 0, "empty"),
                  scored(
                    "p3",
                    "Carla",
                    "animal",
                    "Animal",
                    "Arara",
                    10,
                    "unique",
                  ),
                ],
              },
            ],
            playerScores: [
              {
                playerId: "p3",
                nickname: "Carla",
                totalScore: 30,
                categoryScores: {
                  name: 10,
                  city: 10,
                  animal: 10,
                },
              },
              {
                playerId: "p1",
                nickname: "Ana",
                totalScore: 25,
                categoryScores: {
                  name: 5,
                  city: 10,
                  animal: 10,
                },
              },
              {
                playerId: "p2",
                nickname: "Bruno",
                totalScore: 5,
                categoryScores: {
                  name: 5,
                  city: 0,
                  animal: 0,
                },
              },
            ],
            scoreDeltas: [],
            overallRanking: [
              {
                rank: 1,
                playerId: "p3",
                nickname: "Carla",
                totalScore: 30,
                roundsWon: 1,
                lastRoundScore: 30,
              },
              {
                rank: 2,
                playerId: "p1",
                nickname: "Ana",
                totalScore: 25,
                roundsWon: 0,
                lastRoundScore: 25,
              },
              {
                rank: 3,
                playerId: "p2",
                nickname: "Bruno",
                totalScore: 5,
                roundsWon: 0,
                lastRoundScore: 5,
              },
            ],
          }
        : undefined,
    },
    playerState: input.playerState ?? { hasSubmitted: false },
  };
}

function scored(
  playerId: string,
  nickname: string,
  categoryId: "name" | "city" | "animal",
  categoryLabel: string,
  answer: string,
  points: number,
  reason: "empty" | "wrong_letter" | "duplicate" | "unique",
) {
  return {
    playerId,
    nickname,
    categoryId,
    categoryLabel,
    answer,
    normalizedAnswer: answer.toUpperCase(),
    valid: reason === "duplicate" || reason === "unique",
    points,
    reason,
  };
}
