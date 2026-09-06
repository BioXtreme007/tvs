import React, { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CloudRain,
  RotateCcw,
  ShieldCheck,
  Thermometer,
  TrendingDown,
} from "lucide-react";
import {
  AdaptiveSliderBase,
  AnimatedText,
  weatherColors,
} from "./AdaptiveSliderBase";
import { baseline, calculateStress, coefficients } from "./model";
import { download } from "../../api";

const improving = {
  low: weatherColors.low,
  mid: {
    text: "#EA580C",
    gradient: "linear-gradient(to right, #F97316, #D97706)",
  },
  high: weatherColors.mid,
};
const heating = {
  low: weatherColors.mid,
  mid: improving.mid,
  high: weatherColors.low,
};
export function ExecutiveStressSlider() {
  const [rain, setRain] = useState(0);
  const [heat, setHeat] = useState(0);
  const [price, setPrice] = useState(0);
  const impact = calculateStress(rain, heat, price);
  const delta = (impact.stressedGnpaPct - baseline.gnpaPct).toFixed(2);
  const exportScenario = () =>
    download(
      "geokisaan-stress-scenario.json",
      JSON.stringify(
        {
          schemaVersion: 1,
          mode: "SIMULATION",
          generatedAt: new Date().toISOString(),
          baseline,
          inputs: {
            rainfallChangePct: rain,
            temperatureIncreaseC: heat,
            cropPriceChangePct: price,
          },
          impact,
          assumptions: {
            ...coefficients,
            note: "Illustrative fixed model; surplus rainfall and price rallies do not lower baseline GNPA. NPA exposure is not realized capital loss.",
          },
        },
        null,
        2,
      ),
    );
  return (
    <div className="adaptive-system adaptive-executive">
      <div className="adaptive-panel adaptive-input-panel">
        <div className="adaptive-panel-title">
          <div>
            <span className="adaptive-kicker">SCENARIO BUILDER</span>
            <h3>Adjust the conditions.</h3>
            <p>Three shocks. One view of portfolio resilience.</p>
          </div>
          <button
            className="adaptive-reset"
            onClick={() => {
              setRain(0);
              setHeat(0);
              setPrice(0);
            }}
            aria-label="Reset scenario to baseline"
            title="Reset to baseline"
          >
            <RotateCcw size={17} />
          </button>
        </div>
        <AdaptiveSliderBase
          label="Rainfall change"
          sublabel="Deviation from the seasonal average"
          icon={CloudRain}
          value={rain}
          min={-50}
          max={20}
          step={5}
          unit="%"
          prefix={rain > 0 ? "+" : ""}
          onChange={setRain}
          colorConfig={improving}
          endpointLabels={["−50% · Severe drought", "+20% · Surplus rain"]}
        />
        <AdaptiveSliderBase
          label="Temperature rise"
          sublabel="Additional heat above normal conditions"
          icon={Thermometer}
          value={heat}
          min={0}
          max={5}
          step={0.5}
          unit="°C"
          prefix="+"
          onChange={setHeat}
          colorConfig={heating}
          endpointLabels={["Normal", "+5°C · Extreme heat"]}
        />
        <AdaptiveSliderBase
          label="Crop market price"
          sublabel="Change in the mandi selling price"
          icon={TrendingDown}
          value={price}
          min={-40}
          max={20}
          step={5}
          unit="%"
          prefix={price > 0 ? "+" : ""}
          onChange={setPrice}
          colorConfig={improving}
          endpointLabels={["−40% · Price crash", "+20% · Price rally"]}
        />
        <div className="adaptive-baseline">
          <span>MODEL BASELINE</span>
          <b>₹{baseline.portfolioCr.toLocaleString("en-IN")} Cr</b>
          <span>{baseline.borrowers.toLocaleString("en-IN")} borrowers</span>
        </div>
      </div>
      <div className="adaptive-panel adaptive-dossier">
        <span className="adaptive-kicker">
          PORTFOLIO IMPACT / LIVE ESTIMATE
        </span>
        <h3>The cost of changing conditions.</h3>
        <div className="adaptive-comparison">
          <div>
            <span>Baseline GNPA</span>
            <strong>
              {baseline.gnpaPct.toFixed(2)}
              <small>%</small>
            </strong>
          </div>
          <ArrowRight size={20} />
          <div>
            <span>Stressed GNPA</span>
            <strong className={Number(delta) > 0 ? "adaptive-risk" : ""}>
              <span className="sr-only">
                {impact.stressedGnpaPct.toFixed(2)}
              </span>
              <AnimatedText text={impact.stressedGnpaPct.toFixed(2)} />
              <small>%</small>
            </strong>
          </div>
        </div>
        <div className="adaptive-delta">
          +{delta} percentage points from baseline
        </div>
        <dl className="adaptive-metrics">
          <div>
            <dt>Incremental NPA</dt>
            <dd>
              ₹{impact.incrementalNpaCr.toFixed(1)} <small>Cr</small>
            </dd>
          </div>
          <div>
            <dt>Borrowers at risk</dt>
            <dd>{impact.atRiskFarmersCount.toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt>Stressed NPA exposure</dt>
            <dd>
              ₹{impact.stressedCr.toFixed(1)} <small>Cr</small>
            </dd>
          </div>
        </dl>
        <div className="adaptive-shield">
          <ShieldCheck size={23} />
          <div>
            <h4>GeoKisaan restructuring shield</h4>
            <p>Seasonally linked repayment · modelled protection</p>
            <div className="adaptive-shield-values">
              <div>
                <span>Restructured GNPA</span>
                <strong>{impact.mitigatedGnpaPct.toFixed(2)}%</strong>
              </div>
              <div>
                <span>Capital saved</span>
                <strong>₹{impact.capitalLossPreventedCr.toFixed(1)} Cr</strong>
              </div>
            </div>
          </div>
        </div>
        <p className="adaptive-footnote">
          Illustrative estimates, not observed defaults. The fixed model applies
          drought, heat and price-decline penalties; excess rainfall is not
          modelled. Shield assumptions:{" "}
          {Math.round((1 - coefficients.restructuredGnpaMultiplier) * 100)}%
          lower GNPA and{" "}
          {Math.round(coefficients.incrementalCapitalSavedMultiplier * 100)}% of
          incremental NPA saved.
        </p>
        <button
          className="adaptive-button adaptive-export"
          onClick={exportScenario}
        >
          <ArrowDownToLine size={17} />
          Export scenario dossier <span>JSON</span>
        </button>
      </div>
    </div>
  );
}
