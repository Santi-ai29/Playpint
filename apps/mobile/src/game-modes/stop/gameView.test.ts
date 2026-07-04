import assert from "node:assert/strict";
import test from "node:test";
import type {
  RoundSnapshot,
  StopPlayerState,
  StopPublicState,
} from "../../../../../packages/contracts/src";
import { createStopScreenModel } from "./screenModel";
import {
  createStopAnswerDraft,
  createStopGameView,
  createStopSubmitIntent,
} from "./gameView";

test("creates the premium Playpint Stop answering view", () => {
  const source = snapshot("active");
  const view = createStopGameView(source, "2026-06-25T20:00:05.000Z");

  assert.equal(view.backgroundStyle, "premium_word_table");
  assert.equal(view.brand.logoText, "Playpint");
  assert.equal(view.brand.logoAsset, "./assets/playpint-logo.png");
  assert.equal(view.brand.modeLabel, "Stop");
  assert.equal(view.hero.letter, "A");
  assert.equal(view.hero.timerLabel, "01:25");
  assert.equal(view.hero.submittedLabel, "0/2");
  assert.equal(view.primaryAction.label, "STOP");
  assert.equal(view.primaryAction.tone, "orange");
  assert.equal(view.answerGrid.every((field) => field.visualState !== "locked"), true);
});

test("creates a Stop submit intent from the screen model", () => {
  const model = createStopScreenModel(
    snapshot("active"),
    "2026-06-25T20:00:05.000Z",
  );
  const intent = createStopSubmitIntent({
    model,
    playerId: "p1",
    answers: {
      name: "Ana",
      city: "Aveiro",
    },
    stopRound: true,
  });

  assert.deepEqual(intent, {
    enabled: true,
    action: {
      playerId: "p1",
      roundId: "round_1",
      answers: {
        name: "Ana",
        city: "Aveiro",
      },
      stopRound: true,
    },
  });
});

test("keeps the local Stop draft disabled until there is an answer", () => {
  const model = createStopScreenModel(
    snapshot("active"),
    "2026-06-25T20:00:05.000Z",
  );
  const emptyDraft = createStopAnswerDraft({ model, answers: {} });
  const filledDraft = createStopAnswerDraft({
    model,
    answers: {
      name: "Ana",
    },
  });

  assert.equal(emptyDraft.canSubmit, true);
  assert.equal(emptyDraft.canStop, false);
  assert.equal(filledDraft.canStop, true);
  assert.equal(filledDraft.fields[0]?.value, "Ana");
});

test("maps result rows and ranking rows for the view", () => {
  const view = createStopGameView(
    snapshot("result"),
    "2026-06-25T20:01:30.000Z",
  );

  assert.equal(view.status, "result");
  assert.equal(view.result?.stoppedByLabel, "Ana carregou Stop");
  assert.deepEqual(view.result?.tableColumns, ["Nome", "Cidade"]);
  assert.deepEqual(view.result?.answerRows, [
    {
      playerId: "p1",
      nickname: "Ana",
      totalLabel: "20 pts",
      isWinner: true,
      answers: [
        { label: "Ana", pointsLabel: "10", valid: true },
        { label: "Aveiro", pointsLabel: "10", valid: true },
      ],
    },
    {
      playerId: "p2",
      nickname: "Bruno",
      totalLabel: "0 pts",
      isWinner: false,
      answers: [
        { label: "-", pointsLabel: "0", valid: false },
        { label: "Braga", pointsLabel: "0", valid: false },
      ],
    },
  ]);
  assert.deepEqual(view.result?.rankingRows, [
    {
      rankLabel: "#1",
      playerId: "p1",
      nickname: "Ana",
      totalLabel: "20 pts",
      detailLabel: "1 ronda ganha",
      isLeader: true,
    },
    {
      rankLabel: "#2",
      playerId: "p2",
      nickname: "Bruno",
      totalLabel: "0 pts",
      detailLabel: "0 rondas ganhas",
      isLeader: false,
    },
  ]);
});

function snapshot(
  lifecycleState: "active" | "result",
): RoundSnapshot<StopPublicState, StopPlayerState> {
  const result = lifecycleState === "result";

  return {
    gameMode: "stop",
    gameModeId: "stop",
    roomId: "room_1",
    roundId: "round_1",
    lifecycleState,
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
      ],
      players: [
        { playerId: "p1", nickname: "Ana" },
        { playerId: "p2", nickname: "Bruno" },
      ],
      submittedCount: result ? 2 : 0,
      totalPlayers: 2,
      stoppedByPlayerId: result ? "p1" : undefined,
      stoppedByNickname: result ? "Ana" : undefined,
      result: result
        ? {
            letter: "A",
            stoppedByPlayerId: "p1",
            stoppedByNickname: "Ana",
            totalSubmissions: 2,
            categoryResults: [
              {
                category: {
                  id: "name",
                  label: "Nome",
                  placeholder: "Nome proprio",
                  tone: "classic",
                },
                answers: [
                  scored("p1", "Ana", "name", "Nome", "Ana", 10, "unique"),
                  scored("p2", "Bruno", "name", "Nome", "", 0, "empty"),
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
                ],
              },
            ],
            playerScores: [
              {
                playerId: "p1",
                nickname: "Ana",
                totalScore: 20,
                categoryScores: {
                  name: 10,
                  city: 10,
                },
              },
              {
                playerId: "p2",
                nickname: "Bruno",
                totalScore: 0,
                categoryScores: {
                  name: 0,
                  city: 0,
                },
              },
            ],
            scoreDeltas: [],
            overallRanking: [
              {
                rank: 1,
                playerId: "p1",
                nickname: "Ana",
                totalScore: 20,
                roundsWon: 1,
                lastRoundScore: 20,
              },
              {
                rank: 2,
                playerId: "p2",
                nickname: "Bruno",
                totalScore: 0,
                roundsWon: 0,
                lastRoundScore: 0,
              },
            ],
          }
        : undefined,
    },
    playerState: { hasSubmitted: false },
  };
}

function scored(
  playerId: string,
  nickname: string,
  categoryId: "name" | "city",
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
