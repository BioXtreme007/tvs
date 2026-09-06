export const baseline = { portfolioCr: 1250, gnpaPct: 2.45, borrowers: 28400 };
export const coefficients = {
  droughtCoefficient: 0.08,
  heatCoefficient: 0.45,
  priceCoefficient: 0.05,
  restructuredGnpaMultiplier: 0.68,
  incrementalCapitalSavedMultiplier: 0.65,
} as const;
export function calculateStress(
  rainfallChange: number,
  tempIncrease: number,
  priceChange: number,
) {
  const droughtPenalty =
    Math.max(0, -rainfallChange) * coefficients.droughtCoefficient;
  const heatPenalty = tempIncrease * coefficients.heatCoefficient;
  const pricePenalty =
    Math.max(0, -priceChange) * coefficients.priceCoefficient;
  const stressedGnpaPct = Number(
    (baseline.gnpaPct + droughtPenalty + heatPenalty + pricePenalty).toFixed(2),
  );
  const baseCr = Number(
    ((baseline.portfolioCr * baseline.gnpaPct) / 100).toFixed(1),
  );
  const stressedCr = Number(
    ((baseline.portfolioCr * stressedGnpaPct) / 100).toFixed(1),
  );
  const incrementalNpaCr = Number((stressedCr - baseCr).toFixed(1));
  return {
    stressedGnpaPct,
    baseCr,
    stressedCr,
    incrementalNpaCr,
    atRiskFarmersCount: Math.round(
      (baseline.borrowers * stressedGnpaPct) / 100,
    ),
    mitigatedGnpaPct: Number(
      (stressedGnpaPct * coefficients.restructuredGnpaMultiplier).toFixed(2),
    ),
    capitalLossPreventedCr: Number(
      (
        incrementalNpaCr * coefficients.incrementalCapitalSavedMultiplier
      ).toFixed(1),
    ),
    droughtPenalty,
    heatPenalty,
    pricePenalty,
  };
}
export const weatherState = (value: number) =>
  value < 35 ? "dry" : value <= 70 ? "normal" : "wet";
