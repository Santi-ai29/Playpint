import assert from "node:assert/strict";
import test from "node:test";

import { createRoundTimerModel } from "./roundTimer";

const clock = {
  startsAt: "2026-06-25T20:00:00.000Z",
  endsAt: "2026-06-25T20:00:15.000Z",
};

test("creates a timer model from the server clock", () => {
  const model = createRoundTimerModel(clock, "2026-06-25T20:00:05.000Z");

  assert.equal(model.remainingSeconds, 10);
  assert.equal(model.isExpired, false);
  assert.equal(Math.round(model.progress * 100), 33);
});

test("never returns negative time", () => {
  const model = createRoundTimerModel(clock, "2026-06-25T20:00:20.000Z");

  assert.equal(model.remainingSeconds, 0);
  assert.equal(model.isExpired, true);
  assert.equal(model.progress, 1);
});
