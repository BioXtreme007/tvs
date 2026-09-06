import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("../src/components/adaptive-slider/model.ts", import.meta.url),
  "utf8",
);
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { calculateStress, weatherState } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
);

test("baseline has no incremental exposure or saved capital", () => {
  const result = calculateStress(0, 0, 0);
  assert.equal(result.stressedGnpaPct, 2.45);
  assert.equal(result.stressedCr, 30.6);
  assert.equal(result.incrementalNpaCr, 0);
  assert.equal(result.capitalLossPreventedCr, 0);
});

test("maximum combined shock matches the specification, including rounding", () => {
  const result = calculateStress(-50, 5, -40);
  assert.equal(result.stressedGnpaPct, 10.7);
  assert.equal(result.stressedCr, 133.8);
  assert.equal(result.incrementalNpaCr, 103.2);
  assert.equal(result.atRiskFarmersCount, 3039);
  assert.equal(result.mitigatedGnpaPct, 7.28);
  assert.equal(result.capitalLossPreventedCr, 67.1);
});

test("surplus rain and rising prices do not introduce negative penalties", () => {
  assert.equal(calculateStress(20, 0, 20).stressedGnpaPct, 2.45);
  assert.equal(calculateStress(20, 2, 20).stressedGnpaPct, 3.35);
});

test("every available slider combination produces bounded, finite outcomes", () => {
  for (let rain = -50; rain <= 20; rain += 5) {
    for (let heat = 0; heat <= 5; heat += 0.5) {
      for (let price = -40; price <= 20; price += 5) {
        const result = calculateStress(rain, heat, price);
        assert.ok(Object.values(result).every(Number.isFinite));
        assert.ok(
          result.stressedGnpaPct >= 2.45 && result.stressedGnpaPct <= 10.7,
        );
        assert.ok(result.incrementalNpaCr >= 0);
        assert.ok(result.mitigatedGnpaPct <= result.stressedGnpaPct);
        assert.ok(result.capitalLossPreventedCr <= result.incrementalNpaCr);
      }
    }
  }
});

test("weather transitions agree with track colour boundaries", () => {
  for (const [value, expected] of [
    [0, "dry"],
    [34, "dry"],
    [35, "normal"],
    [70, "normal"],
    [71, "wet"],
    [100, "wet"],
  ]) {
    assert.equal(weatherState(value), expected);
  }
});
