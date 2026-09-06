# Adaptive sliders

The landing page (`#stress-sim`) and dashboard stress view use the same
`ExecutiveStressSlider`. The farmer workspace contains `FarmerCropSafetySlider`
at `#farmer-crop-safety`. Components and their types are exported from
`frontend/src/components/adaptive-slider/index.ts`.

The shared base uses a native range input for pointer, touch and keyboard control,
with a 48px thumb and focus ring. Framer Motion animates the visual track and
individual digits; reduced-motion preferences disable these transitions.
Scoped CSS uses existing heading/body font variables, navy, white and warm canvas.

## Calculations

`model.ts` implements the specified fixed ₹1,250 Cr, 2.45% GNPA and 28,400-borrower
baseline. Baseline NPA is rounded to ₹30.6 Cr before calculating the incremental
amount, so a zero-shock scenario produces zero incremental NPA. Exported JSON
includes the inputs, baseline, results, coefficients, timestamp and model caveats.
The supplied model does not penalize excess rainfall or reward rising crop prices.

## Farmer experience

All three outcomes, controls, weather presets, voice questions and audio errors are
localized into Hindi, Chhattisgarhi, Tamil and English. The optional
`initialLanguage` prop defaults to Hindi. Drought is below 35, normal is 35–70
inclusive, and flood is above 70.

Speech uses installed browser voices. Chhattisgarhi text uses a Hindi speech locale
where a dedicated voice is unavailable. Missing voices and speech errors show a
localized fallback. Speech stops on weather/language changes, unmount, or a Saathi
handoff. Saathi uses the existing `open-krishi-saathi` event with the selected
weather, localized query and `voiceMode: true`.

The repayment card describes the specified 60-day relief as a simulated outcome,
not an actual change to a loan account. Crop percentages are also identified as
examples. Agronomy suggestions retain the specification's intent with local
suitability and soil-test guidance.

## Verification

From `frontend`:

```sh
node --test tests/adaptive-slider.test.mjs
npm run build
```

The model tests cover baseline, maximum combined shocks, surplus/rally behavior,
all 2,145 supported input combinations and the weather transition boundaries.
Browser checks cover desktop/mobile layout, keyboard extremes, reset, presets,
and language selection. Actual speech playback depends on device voice support;
the existing voice service and microphone flow require their normal permissions.
