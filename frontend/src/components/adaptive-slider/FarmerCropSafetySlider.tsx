import React, { useEffect, useId, useRef, useState } from "react";
import {
  CloudRain,
  CloudSun,
  Lightbulb,
  Mic,
  ShieldCheck,
  Sprout,
  Square,
  Sun,
  Volume2,
} from "lucide-react";
import { AdaptiveSliderBase } from "./AdaptiveSliderBase";
import { farmerCopy, FarmerLanguage } from "./farmer-copy";
import { weatherState } from "./model";

export function FarmerCropSafetySlider({
  initialLanguage = "hi",
}: {
  initialLanguage?: FarmerLanguage;
}) {
  const [language, setLanguage] = useState<FarmerLanguage>(initialLanguage);
  const [value, setValue] = useState(50);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [audioError, setAudioError] = useState(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const id = useId();
  const copy = farmerCopy[language];
  const state = weatherState(value);
  const index = state === "dry" ? 0 : state === "normal" ? 1 : 2;
  const WeatherIcon = [Sun, CloudSun, CloudRain][index];
  useEffect(() => {
    setSpeaking(null);
    setAudioError(false);
    return () => {
      if (utterance.current && "speechSynthesis" in window) {
        utterance.current = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [language, state]);
  const listen = (card: number, text: string) => {
    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      setAudioError(true);
      return;
    }
    const wasSpeaking = speaking === card;
    utterance.current = null;
    window.speechSynthesis.cancel();
    setSpeaking(null);
    setAudioError(false);
    if (wasSpeaking) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang =
      language === "ta" ? "ta-IN" : language === "en" ? "en-IN" : "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === speech.lang.toLowerCase()) ||
      voices.find((v) => v.lang.startsWith(speech.lang.split("-")[0]));
    if (voices.length && !voice) {
      setAudioError(true);
      return;
    }
    if (voice) speech.voice = voice;
    speech.rate = 0.9;
    speech.onend = () => {
      if (utterance.current === speech) {
        setSpeaking(null);
        utterance.current = null;
      }
    };
    speech.onerror = () => {
      if (utterance.current === speech) {
        setSpeaking(null);
        setAudioError(true);
        utterance.current = null;
      }
    };
    utterance.current = speech;
    setSpeaking(card);
    window.speechSynthesis.speak(speech);
  };
  return (
    <section
      id="farmer-crop-safety"
      className="adaptive-system adaptive-farmer"
      lang={language}
    >
      <div className="adaptive-farmer-heading">
        <div>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <label className="adaptive-language" htmlFor={id}>
          {copy.language}
          <select
            id={id}
            value={language}
            onChange={(e) => setLanguage(e.target.value as FarmerLanguage)}
          >
            <option value="hi">हिन्दी</option>
            <option value="hne">छत्तीसगढ़ी</option>
            <option value="ta">தமிழ்</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <div className="adaptive-weather-layout">
        <div
          className={`adaptive-weather-scene adaptive-weather-${state}`}
          aria-hidden="true"
        >
          <WeatherIcon size={64} strokeWidth={1.3} />
          <div className="adaptive-field">
            <Sprout size={58} strokeWidth={1.4} />
            <Sprout size={82} strokeWidth={1.4} />
            <Sprout size={48} strokeWidth={1.4} />
          </div>
          <strong>{copy.states[index]}</strong>
        </div>
        <div className="adaptive-weather-controls">
          <div className="adaptive-presets">
            {copy.presets.map((preset, i) => {
              const Icon = [Sun, CloudSun, CloudRain][i];
              return (
                <button
                  key={i}
                  aria-pressed={index === i}
                  onClick={() => setValue([15, 50, 90][i])}
                >
                  <Icon size={21} />
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
          <AdaptiveSliderBase
            label={copy.weather}
            value={value}
            min={0}
            max={100}
            onChange={setValue}
            valueText={copy.states[index]}
            endpointLabels={[copy.states[0], copy.states[2]]}
          />
          <p className="adaptive-simulation-note">{copy.simulation}</p>
        </div>
      </div>
      <div className="adaptive-outcomes" aria-live="polite" aria-atomic="true">
        {[copy.health[index], copy.payment[index], copy.advice[index]].map(
          (body, i) => {
            const Icon = [Sprout, ShieldCheck, Lightbulb][i];
            return (
              <article key={i}>
                <Icon size={24} />
                <h3>{copy.headings[i]}</h3>
                {i === 1 && index !== 1 && (
                  <strong className="adaptive-relief">{copy.relief}</strong>
                )}
                <p>{body}</p>
                <button
                  className="adaptive-listen"
                  onClick={() => listen(i, `${copy.headings[i]}. ${body}`)}
                  aria-label={`${speaking === i ? copy.stop : copy.listen}: ${copy.headings[i]}`}
                >
                  {speaking === i ? (
                    <Square size={17} />
                  ) : (
                    <Volume2 size={19} />
                  )}
                  {speaking === i ? copy.stop : copy.listen}
                </button>
              </article>
            );
          },
        )}
      </div>
      <div className="adaptive-farmer-footer">
        <p role="status">{audioError ? copy.unavailable : ""}</p>
        <button
          className="adaptive-button"
          onClick={() => {
            if (utterance.current) {
              utterance.current = null;
              window.speechSynthesis.cancel();
              setSpeaking(null);
            }
            window.dispatchEvent(
              new CustomEvent("open-krishi-saathi", {
                detail: {
                  query: `${copy.states[index]} — ${copy.query}`,
                  voiceMode: true,
                  language,
                },
              }),
            );
          }}
        >
          <Mic size={19} />
          {copy.voice}
        </button>
      </div>
    </section>
  );
}
