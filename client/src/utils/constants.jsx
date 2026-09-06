import React from 'react';
import { 
  Rocket, 
  Disc, 
  Orbit, 
  Satellite, 
  Sparkles, 
  Radio, 
  Telescope, 
  Compass, 
  Sun, 
  Moon, 
  Zap, 
  Globe, 
  Shield, 
  Flame, 
  Cpu, 
  Radar, 
  Navigation, 
  Atom, 
  Eye, 
  Anchor, 
  Activity, 
  Target, 
  Layers, 
  Crosshair 
} from 'lucide-react';

export const AVATARS = [
  { id: 'rocket', name: 'Nebula Pioneer', icon: 'Rocket' },
  { id: 'pulsar', name: 'Quantum Pulsar', icon: 'Disc' },
  { id: 'saturn', name: 'Saturn Ringster', icon: 'Orbit' },
  { id: 'strider', name: 'Solar Strider', icon: 'Sparkles' },
  { id: 'voyager', name: 'Void Voyager', icon: 'Satellite' },
  { id: 'comet', name: 'Comet Wanderer', icon: 'Radio' },
  { id: 'astronomer', name: 'Deep-Space Scope', icon: 'Telescope' },
  { id: 'navigator', name: 'Astro Navigator', icon: 'Compass' },
  { id: 'helios', name: 'Helios Flare', icon: 'Sun' },
  { id: 'lunar', name: 'Lunar Walker', icon: 'Moon' },
  { id: 'tachyon', name: 'Tachyon Spark', icon: 'Zap' },
  { id: 'exoplanet', name: 'Exo Cartographer', icon: 'Globe' },
  { id: 'aegis', name: 'Aegis Sentinel', icon: 'Shield' },
  { id: 'supernova', name: 'Supernova Forge', icon: 'Flame' },
  { id: 'matrix', name: 'Cosmic Core', icon: 'Cpu' },
  { id: 'radar', name: 'Orbital Radar', icon: 'Radar' },
  { id: 'beacon', name: 'Stellar Beacon', icon: 'Navigation' },
  { id: 'quantum', name: 'Quantum Atom', icon: 'Atom' },
  { id: 'watcher', name: 'Cosmos Watcher', icon: 'Eye' },
  { id: 'anchor', name: 'Gravity Anchor', icon: 'Anchor' },
  { id: 'flux', name: 'Flux Surveyor', icon: 'Activity' },
  { id: 'zenith', name: 'Zenith Seeker', icon: 'Target' },
  { id: 'strata', name: 'Dimension Strata', icon: 'Layers' },
  { id: 'vector', name: 'Warp Vector', icon: 'Crosshair' }
];

export function renderAvatarIcon(iconName, className = "w-4 h-4") {
  switch (iconName) {
    case 'Rocket':
      return <Rocket className={className} />;
    case 'Disc':
      return <Disc className={className} />;
    case 'Orbit':
      return <Orbit className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Satellite':
      return <Satellite className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'Telescope':
      return <Telescope className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Sun':
      return <Sun className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Radar':
      return <Radar className={className} />;
    case 'Navigation':
      return <Navigation className={className} />;
    case 'Atom':
      return <Atom className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Anchor':
      return <Anchor className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Target':
      return <Target className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Crosshair':
      return <Crosshair className={className} />;
    default:
      return <Orbit className={className} />;
  }
}

export const RANDOM_NAMES = [
  'CosmoKnot',
  'StarGazer',
  'NovaSeeker',
  'OrionPilot',
  'AstroDrifter',
  'ZenithWalker',
  'PulsarKnight',
  'NebulaRider',
  'SolarVanguard',
  'VoidSkipper',
  'GalaxyRunner',
  'LunarNomad',
  'EclipseEcho',
  'ApexVoyager',
  'ChronoDrift',
  'HeliosScout',
  'VectorShifter',
  'ZeroGrav',
  'QuasarPilot',
  'DarkMatter',
  'HyperNova',
  'StarlightFox',
  'OrbitFalcon',
  'CosmicWarden',
  'TitanRover',
  'AeroStrider',
  'PhotonBlade',
  'WarpNomad',
  'CelestialAce',
  'AstralGhost',
  'IonCruiser',
  'MeteorSpark',
  'EventHorizon',
  'ZenithSpark',
  'NebulaPhantom',
  'CosmicRanger',
  'StellarSentry',
  'SolarMatrix',
  'AstroGlider',
  'QuantumScout'
];

export const CHUNK_SIZE = 64 * 1024;