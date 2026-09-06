import React from 'react';
import { Rocket, Disc, Orbit, Satellite, Sparkles, Radio } from 'lucide-react';

export const AVATARS = [
  { id: 'rocket', name: 'Nebula Pioneer', icon: 'Rocket' },
  { id: 'pulsar', name: 'Quantum Pulsar', icon: 'Disc' },
  { id: 'saturn', name: 'Saturn Ringster', icon: 'Orbit' },
  { id: 'strider', name: 'Solar Strider', icon: 'Sparkles' },
  { id: 'voyager', name: 'Void Voyager', icon: 'Satellite' },
  { id: 'comet', name: 'Comet Wanderer', icon: 'Radio' }
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
  'ZenithWalker'
];

export const REVIEWS = [
  {
    name: 'Aarav Sharma',
    role: 'Full Stack Engineer',
    rating: 5,
    comment: 'Transferred a 4.2GB video file across the room in seconds without uploading to any drive. Unbelievable speed!'
  },
  {
    name: 'Elena Rostova',
    role: 'Digital Designer',
    rating: 5,
    comment: 'The memory-only transfer model is brilliant. Zero logs, zero trace on public computers. Cleanest UI I have seen.'
  },
  {
    name: 'Marcus Vance',
    role: 'Cybersecurity Researcher',
    rating: 5,
    comment: 'Direct browser WebRTC stream with DTLS encryption and ephemeral auto-purge makes it ideal for sensitive files.'
  },
  {
    name: 'Priya Patel',
    role: 'Content Creator',
    rating: 5,
    comment: 'The 6-digit warp key works reliably even across mobile data hotspots without configuration. Outstanding tool!'
  }
];

export const CHUNK_SIZE = 64 * 1024;
