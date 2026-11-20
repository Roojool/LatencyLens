import assert from "node:assert/strict";
import test from "node:test";
import { scenarios, simulate } from "../src/simulation.ts";

test("defaults to a video call at 35% load", () => {
  const videoCall = scenarios.find(({ label }) => label === "Video call");
  assert.ok(videoCall);
  assert.deepEqual(simulate(), {
    scenario: videoCall,
    load: 35,
    baseline: 30,
    loaded: 55,
    added: 25,
    indicator: "Queue building",
  });
  for (const id of ["missing", "__proto__", null, {}, Symbol()]) {
    assert.deepEqual(simulate(id, 0), simulate(videoCall.id, 0));
  }
});

test("rounds and bounds numeric loads, including form values", () => {
  for (const [input, expected] of [["0", 0], [" 49.5 ", 50], [34.4, 34], [-10, 0], ["125", 100]]) {
    assert.equal(simulate(undefined, input).load, expected);
  }
});

test("invalid loads use 35% and preserve the selected scenario", () => {
  const expected = simulate("gaming", 35);
  assert.equal(expected.scenario.id, "gaming");
  for (const input of [undefined, null, false, [], {}, 1n, Symbol(), " ", "42ms", NaN, Infinity, -Infinity]) {
    assert.deepEqual(simulate("gaming", input), expected);
  }
});

test("the example queue adds 50 ms at half load and caps the total at 250 ms", () => {
  assert.equal(simulate("video-call", 50).added, 50);
  assert.equal(simulate("video-call", 100).added, 200);
  const download = simulate("downloading", 100);
  assert.equal(download.loaded, 250);
  assert.equal(download.added, 190);
});

test("indicators describe the rounded extra wait", () => {
  for (const [load, indicator] of [
    [4, "No added delay"], [5, "Short queue"], [34, "Short queue"],
    [35, "Queue building"], [70, "Queue building"], [71, "Long queue"],
  ]) {
    assert.equal(simulate("video-call", load).indicator, indicator);
  }
});

test("the activity picker has four scenarios with distinct IDs, explanations and advice", () => {
  assert.deepEqual(scenarios.map(({ label }) => label), ["Video call", "Gaming", "Browsing", "Downloading"]);
  assert.equal(new Set(scenarios.map(({ id }) => id)).size, scenarios.length);
  for (const scenario of scenarios) {
    for (const value of [scenario.id, scenario.label, scenario.description, scenario.advice]) {
      assert.ok(value.trim().length > 0);
    }
  }
});

test("every scenario gives deterministic, bounded results across the slider", () => {
  for (const scenario of scenarios) {
    assert.ok(Number.isInteger(scenario.baseline) && scenario.baseline >= 0);
    assert.equal(simulate(scenario.id, 0).added, 0);
    let previous = scenario.baseline;
    for (let load = 0; load <= 100; load++) {
      const result = simulate(scenario.id, load);
      assert.deepEqual(result, simulate(scenario.id, load));
      assert.equal(result.scenario, scenario);
      assert.equal(result.load, load);
      assert.equal(result.baseline, scenario.baseline);
      assert.ok(Number.isInteger(result.loaded) && result.loaded >= previous && result.loaded <= 250);
      assert.equal(result.added, result.loaded - result.baseline);
      previous = result.loaded;
    }
  }
});
