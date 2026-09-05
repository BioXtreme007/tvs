import React from 'react';
import { Satellite, CloudRain, ShieldCheck, Sprout, AudioLines, ChartNoAxesCombined } from 'lucide-react';
import { OrbitingCircles } from '../registry/magicui/orbiting-circles';
import Logo from './Logo';

const capabilities = [
  { id: 'satellite', title: 'Satellite sensing', icon: Satellite, target: 'innovations' },
  { id: 'climate', title: 'Climate insights', icon: CloudRain, target: 'stress-sim' },
  { id: 'land', title: 'Land verification', icon: ShieldCheck, target: 'underwriting' },
  { id: 'crop', title: 'Crop health', icon: Sprout, target: 'scenarios' },
  { id: 'voice', title: 'Krishi Saathi', icon: AudioLines, target: 'assistant' },
  { id: 'risk', title: 'Credit risk', icon: ChartNoAxesCombined, target: 'portfolio' },
];

export default function TeamOrbit() {
  const handleNavigate = (target: string) => {
    if (target === 'assistant') {
      window.dispatchEvent(new CustomEvent('open-krishi-saathi'));
    } else {
      window.location.hash = target;
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const node = (item: typeof capabilities[number]) => (
    <button
      type="button"
      key={item.id}
      title={item.title}
      aria-label={item.title}
      onClick={() => handleNavigate(item.target)}
    >
      <item.icon />
    </button>
  );

  return (
    <div className="team-orbit-column">
      <div
        className="team-orbit"
        data-running="true"
        aria-label="BioXtreme connects satellite sensing, climate, land verification, crop health, voice assistance and risk analysis"
      >
        <div className="orbit-core">
          <Logo />
          <strong>BioXtreme</strong>
          <small>CONNECTED INTELLIGENCE</small>
        </div>
        <OrbitingCircles radius={155} iconSize={52} speed={1.5}>
          {capabilities.slice(0, 3).map(node)}
        </OrbitingCircles>
        <OrbitingCircles radius={104} iconSize={42} reverse speed={2}>
          {capabilities.slice(3).map(node)}
        </OrbitingCircles>
      </div>
    </div>
  );
}
