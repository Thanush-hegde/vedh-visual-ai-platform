import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Maximize2, 
  Layers, 
  Settings2, 
  Info, 
  Volume2, 
  Sparkles,
  Compass,
  Gauge
} from 'lucide-react';

export type SimulationType = 'solar_system' | 'four_stroke_engine' | 'neural_synapse' | 'photosynthesis' | 'quantum_atom';

interface RealisticSimulationCanvasProps {
  simulationType: SimulationType;
  conceptName?: string;
  onSelectEntity?: (name: string, details: any) => void;
}

// Astronomical data for realistic Solar System simulation
const PLANETS_DATA = [
  {
    name: 'Mercury',
    radius: 4,
    orbitRadius: 52,
    speed: 4.15,
    color: '#A3A3A3',
    gradient: ['#D4D4D8', '#71717A'],
    distanceKm: '57.9M km',
    orbitalPeriod: '88 days',
    diameter: '4,879 km',
    moons: 0,
    temp: '167°C',
    details: 'Smallest planet, highly cratered surface, experiences extreme temperature swings from -180°C to 430°C.'
  },
  {
    name: 'Venus',
    radius: 7,
    orbitRadius: 78,
    speed: 1.62,
    color: '#FBBF24',
    gradient: ['#FDE68A', '#D97706'],
    distanceKm: '108.2M km',
    orbitalPeriod: '225 days',
    diameter: '12,104 km',
    moons: 0,
    temp: '464°C',
    details: 'Hottest planet in the solar system due to a runaway greenhouse effect under thick toxic sulfuric acid clouds.'
  },
  {
    name: 'Earth',
    radius: 8,
    orbitRadius: 112,
    speed: 1.0,
    color: '#3B82F6',
    gradient: ['#60A5FA', '#1E40AF', '#10B981'],
    hasMoon: true,
    moonDistance: 14,
    distanceKm: '149.6M km (1 AU)',
    orbitalPeriod: '365.25 days',
    diameter: '12,742 km',
    moons: 1,
    temp: '15°C',
    details: 'Only known astronomical body to harbor life, with liquid water oceans and a protective oxygen-nitrogen atmosphere.'
  },
  {
    name: 'Mars',
    radius: 5.5,
    orbitRadius: 148,
    speed: 0.53,
    color: '#EF4444',
    gradient: ['#FCA5A5', '#B91C1C'],
    distanceKm: '227.9M km',
    orbitalPeriod: '687 days',
    diameter: '6,779 km',
    moons: 2,
    temp: '-65°C',
    details: 'The Red Planet, home to Olympus Mons (largest volcano in the solar system) and vast frozen polar ice caps.'
  },
  {
    name: 'Jupiter',
    radius: 17,
    orbitRadius: 205,
    speed: 0.084,
    color: '#F97316',
    gradient: ['#FDBA74', '#C2410C', '#E2E8F0'],
    hasSpot: true,
    distanceKm: '778.5M km',
    orbitalPeriod: '11.86 years',
    diameter: '139,820 km',
    moons: 95,
    temp: '-110°C',
    details: 'Massive gas giant with twice the mass of all other planets combined. Houses the centuries-old Great Red Spot storm.'
  },
  {
    name: 'Saturn',
    radius: 14,
    orbitRadius: 265,
    speed: 0.034,
    color: '#FDE047',
    gradient: ['#FEF08A', '#CA8A04'],
    hasRings: true,
    distanceKm: '1.43B km',
    orbitalPeriod: '29.45 years',
    diameter: '116,460 km',
    moons: 146,
    temp: '-140°C',
    details: 'Famed for its dazzling, extensive ring system made of billions of chunks of water ice and rock.'
  },
  {
    name: 'Uranus',
    radius: 10,
    orbitRadius: 320,
    speed: 0.012,
    color: '#38BDF8',
    gradient: ['#BAE6FD', '#0284C7'],
    hasThinRing: true,
    distanceKm: '2.87B km',
    orbitalPeriod: '84 years',
    diameter: '50,724 km',
    moons: 28,
    temp: '-195°C',
    details: 'Ice giant with an extreme 98° axial tilt, effectively rotating on its side with 13 faint rings.'
  },
  {
    name: 'Neptune',
    radius: 9.5,
    orbitRadius: 375,
    speed: 0.006,
    color: '#6366F1',
    gradient: ['#A5B4FC', '#3730A3'],
    distanceKm: '4.50B km',
    orbitalPeriod: '164.8 years',
    diameter: '49,244 km',
    moons: 16,
    temp: '-200°C',
    details: 'Most distant major planet, characterized by supersonic winds exceeding 2,100 km/h and dark dynamic storms.'
  }
];

// Safe roundRect helper for cross-browser canvas support
function safeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

export const RealisticSimulationCanvas: React.FC<RealisticSimulationCanvasProps> = ({
  simulationType = 'solar_system',
  conceptName,
  onSelectEntity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tiltPerspective, setTiltPerspective] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<any>(PLANETS_DATA[2]); // Default Earth
  const [engineRpm, setEngineRpm] = useState(1800);
  const [engineStroke, setEngineStroke] = useState('Intake');
  const [synapsePotential, setSynapsePotential] = useState(-70);
  const [quantumLevel, setQuantumLevel] = useState(2);
  const [timeCounter, setTimeCounter] = useState(0);

  // Animation frame loop ref
  const animFrameRef = useRef<number | null>(null);
  const stateRef = useRef({
    time: 0,
    solarAngles: PLANETS_DATA.map((_, i) => (i * Math.PI) / 4),
    engineAngle: 0,
    neuronPulses: [] as { x: number; y: number; progress: number }[],
    quantumAngle: 0,
    thylakoidParticles: [] as { x: number; y: number; vy: number; color: string }[],
  });

  // Keep state updated in refs for requestAnimationFrame
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(speedMultiplier);
  speedRef.current = speedMultiplier;
  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;
  const tiltRef = useRef(tiltPerspective);
  tiltRef.current = tiltPerspective;
  const orbitsRef = useRef(showOrbits);
  orbitsRef.current = showOrbits;
  const labelsRef = useRef(showLabels);
  labelsRef.current = showLabels;
  const simTypeRef = useRef(simulationType);
  simTypeRef.current = simulationType;

  // Handle Canvas Resizing with ResizeObserver for tab switches & layout changes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) observer.disconnect();
    };
  }, []);

  // Main 60FPS Realistic Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      if (isPlayingRef.current) {
        stateRef.current.time += dt * speedRef.current;
        setTimeCounter(Math.floor(stateRef.current.time * 10));
      }

      // Render based on simulation type
      if (simTypeRef.current === 'solar_system') {
        renderSolarSystem(ctx, width, height, dt);
      } else if (simTypeRef.current === 'four_stroke_engine') {
        renderEngine(ctx, width, height, dt);
      } else if (simTypeRef.current === 'neural_synapse') {
        renderNeuralSynapse(ctx, width, height, dt);
      } else if (simTypeRef.current === 'photosynthesis') {
        renderPhotosynthesis(ctx, width, height, dt);
      } else if (simTypeRef.current === 'quantum_atom') {
        renderQuantumAtom(ctx, width, height, dt);
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // -------------------------------------------------------------
  // SIMULATION 1: REALISTIC SOLAR SYSTEM ENGINE
  // -------------------------------------------------------------
  const renderSolarSystem = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const zoom = zoomRef.current;
    const tilt = tiltRef.current ? 0.45 : 1.0; // 3D orbital plane inclination

    // Realistic deep space background with stars
    ctx.save();
    ctx.fillStyle = '#050711';
    ctx.fillRect(0, 0, width, height);

    // Subtle star field
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const starSeed = [
      [30, 40], [120, 80], [250, 45], [400, 110], [550, 60], [700, 140],
      [80, 220], [180, 310], [320, 280], [490, 360], [680, 290], [820, 210],
      [90, 450], [210, 520], [380, 490], [590, 510], [750, 460], [860, 530]
    ];
    starSeed.forEach(([sx, sy], idx) => {
      const twinkle = Math.sin(stateRef.current.time * 2 + idx) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle * 0.7;
      ctx.beginPath();
      ctx.arc(sx % width, sy % height, (idx % 2 === 0 ? 1 : 1.5), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Center Sun Glow
    const sunRadius = 24 * zoom;
    const sunGrad = ctx.createRadialGradient(cx, cy, sunRadius * 0.2, cx, cy, sunRadius * 2.8);
    sunGrad.addColorStop(0, '#FFFFFF');
    sunGrad.addColorStop(0.2, '#FEF08A');
    sunGrad.addColorStop(0.5, '#F59E0B');
    sunGrad.addColorStop(0.8, 'rgba(245, 158, 11, 0.2)');
    sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Solid Sun Core
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Asteroid Belt Particles (between Mars 148 and Jupiter 205)
    ctx.save();
    ctx.fillStyle = 'rgba(163, 163, 163, 0.35)';
    const beltR = 176 * zoom;
    for (let a = 0; a < 60; a++) {
      const angle = a * (Math.PI / 30) + stateRef.current.time * 0.05;
      const jitter = (a % 5) * 2;
      const ax = cx + Math.cos(angle) * (beltR + jitter);
      const ay = cy + Math.sin(angle) * (beltR + jitter) * tilt;
      ctx.fillRect(ax, ay, 1.2, 1.2);
    }
    ctx.restore();

    // Render Orbits & Planets
    PLANETS_DATA.forEach((planet, index) => {
      const orbR = planet.orbitRadius * zoom;

      // Draw Orbit Path
      if (orbitsRef.current) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.ellipse(cx, cy, orbR, orbR * tilt, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Update planetary orbit angle
      if (isPlayingRef.current) {
        stateRef.current.solarAngles[index] += (planet.speed * 0.5 * dt * speedRef.current);
      }
      const angle = stateRef.current.solarAngles[index];

      const px = cx + Math.cos(angle) * orbR;
      const py = cy + Math.sin(angle) * orbR * tilt;
      const pRad = Math.max(3, planet.radius * zoom * 0.9);

      // Saturn Rings
      if (planet.hasRings) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.lineWidth = pRad * 0.7;
        ctx.ellipse(px, py, pRad * 2.3, pRad * 0.9 * tilt, Math.PI / 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Uranus Thin Ring
      if (planet.hasThinRing) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.ellipse(px, py, pRad * 1.7, pRad * 0.6, Math.PI / 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Planet Sphere with Realistic Gradient
      const planetGrad = ctx.createRadialGradient(
        px - pRad * 0.3,
        py - pRad * 0.3,
        pRad * 0.1,
        px,
        py,
        pRad
      );
      planetGrad.addColorStop(0, planet.gradient[0]);
      planetGrad.addColorStop(1, planet.gradient[1] || planet.color);

      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(px, py, pRad, 0, Math.PI * 2);
      ctx.fill();

      // Earth's Moon
      if (planet.hasMoon) {
        const moonAngle = stateRef.current.time * 6;
        const moonDist = planet.moonDistance * zoom;
        const mx = px + Math.cos(moonAngle) * moonDist;
        const my = py + Math.sin(moonAngle) * moonDist * tilt;

        ctx.fillStyle = '#D1D5DB';
        ctx.beginPath();
        ctx.arc(mx, my, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Jupiter Great Red Spot
      if (planet.hasSpot) {
        ctx.fillStyle = '#7F1D1D';
        ctx.beginPath();
        ctx.ellipse(px + pRad * 0.3, py + pRad * 0.2, pRad * 0.28, pRad * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Highlight selected planet
      if (selectedPlanet?.name === planet.name) {
        ctx.beginPath();
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 2;
        ctx.arc(px, py, pRad + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Planet Label
      if (labelsRef.current) {
        ctx.fillStyle = selectedPlanet?.name === planet.name ? '#93C5FD' : '#E2E8F0';
        ctx.font = `${Math.max(10, 11 * zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, px, py + pRad + 14);
      }
    });

    ctx.restore();
  };

  // -------------------------------------------------------------
  // SIMULATION 2: FOUR-STROKE INTERNAL COMBUSTION ENGINE
  // -------------------------------------------------------------
  const renderEngine = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // RPM to crank angle update
    const speed = (engineRpm / 60) * (2 * Math.PI);
    if (isPlayingRef.current) {
      stateRef.current.engineAngle = (stateRef.current.engineAngle + speed * dt * speedRef.current) % (4 * Math.PI);
    }
    const theta = stateRef.current.engineAngle; // 0 to 4pi (720 degrees)
    const deg = ((theta * 180) / Math.PI) % 720;

    // Determine current stroke
    let stroke = 'Intake';
    let chamberColor = 'rgba(59, 130, 246, 0.25)'; // Blue fuel/air
    if (deg >= 0 && deg < 180) {
      stroke = '1. Intake (Fuel/Air In)';
      chamberColor = 'rgba(59, 130, 246, 0.35)';
    } else if (deg >= 180 && deg < 360) {
      stroke = '2. Compression (Pressurizing)';
      chamberColor = 'rgba(168, 85, 247, 0.4)';
    } else if (deg >= 360 && deg < 540) {
      stroke = '3. Power Stroke (Combustion)';
      chamberColor = 'rgba(239, 68, 68, 0.85)'; // Fire explosion!
    } else {
      stroke = '4. Exhaust (Burnt Gas Out)';
      chamberColor = 'rgba(107, 114, 128, 0.4)';
    }

    // Engine Geometry
    const cylinderW = 140;
    const cylinderH = 220;
    const crankR = 45;
    const rodL = 120;
    const crankY = cy + 120;

    // Crankshaft pin position
    const pinX = cx + crankR * Math.sin(theta);
    const pinY = crankY - crankR * Math.cos(theta);

    // Piston position via slider-crank kinematics
    const pistonY = pinY - Math.sqrt(rodL * rodL - Math.pow(pinX - cx, 2)) - 40;

    // Cylinder Housing
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 6;
    ctx.strokeRect(cx - cylinderW / 2, cy - 140, cylinderW, cylinderH);

    // Chamber Gas / Combustion Flash
    ctx.fillStyle = chamberColor;
    ctx.fillRect(cx - cylinderW / 2 + 3, cy - 137, cylinderW - 6, Math.max(10, pistonY - (cy - 140)));

    // Spark Plug firing during power stroke
    if (deg >= 355 && deg <= 385) {
      ctx.fillStyle = '#FEF08A';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy - 130, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Spark plug body
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(cx - 8, cy - 165, 16, 25);

    // Intake Valve (left) - opens during intake stroke
    const intakeOpen = deg < 180 ? 12 : 0;
    ctx.fillStyle = '#60A5FA';
    ctx.fillRect(cx - 45, cy - 140 + intakeOpen, 24, 6);
    ctx.fillRect(cx - 35, cy - 160 + intakeOpen, 4, 20);

    // Exhaust Valve (right) - opens during exhaust stroke
    const exhaustOpen = deg >= 540 ? 12 : 0;
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(cx + 21, cy - 140 + exhaustOpen, 24, 6);
    ctx.fillRect(cx + 31, cy - 160 + exhaustOpen, 4, 20);

    // Piston Head
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(cx - cylinderW / 2 + 5, pistonY, cylinderW - 10, 48);

    // Piston Ring grooves
    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(cx - cylinderW / 2 + 5, pistonY + 10, cylinderW - 10, 2);
    ctx.fillRect(cx - cylinderW / 2 + 5, pistonY + 20, cylinderW - 10, 2);

    // Connecting Rod
    ctx.beginPath();
    ctx.moveTo(cx, pistonY + 24);
    ctx.lineTo(pinX, pinY);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Wrist Pin & Crank Pin
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(cx, pistonY + 24, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pinX, pinY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Crankshaft Flywheel
    ctx.beginPath();
    ctx.arc(cx, crankY, crankR + 10, 0, Math.PI * 2);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rotating Counterweight
    ctx.beginPath();
    ctx.arc(cx, crankY, crankR, theta + Math.PI * 0.7, theta + Math.PI * 1.3);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 14;
    ctx.stroke();

    // HUD Text
    ctx.fillStyle = '#F3F4F6';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Cycle: ${stroke}`, 24, 36);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText(`Crank Angle: ${Math.floor(deg)}°`, 24, 58);
    ctx.fillText(`RPM: ${engineRpm}`, 24, 76);
  };

  // -------------------------------------------------------------
  // SIMULATION 3: NEURAL SYNAPTIC NETWORK
  // -------------------------------------------------------------
  const renderNeuralSynapse = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    const layers = [
      { count: 3, x: width * 0.2, label: 'Sensory Input' },
      { count: 4, x: width * 0.5, label: 'Interneuron Layer' },
      { count: 2, x: width * 0.8, label: 'Motor Output' }
    ];

    // Spawn synaptic electrical pulses
    if (Math.random() < 0.08 * speedRef.current && isPlayingRef.current) {
      const srcLayer = 0;
      const srcIdx = Math.floor(Math.random() * layers[0].count);
      const tgtIdx = Math.floor(Math.random() * layers[1].count);
      stateRef.current.neuronPulses.push({ x: srcIdx, y: tgtIdx, progress: 0 });
    }

    // Draw Axon Connections
    layers.forEach((layer, lIdx) => {
      if (lIdx === layers.length - 1) return;
      const nextLayer = layers[lIdx + 1];

      for (let i = 0; i < layer.count; i++) {
        const y1 = (height / (layer.count + 1)) * (i + 1);
        for (let j = 0; j < nextLayer.count; j++) {
          const y2 = (height / (nextLayer.count + 1)) * (j + 1);

          ctx.beginPath();
          ctx.moveTo(layer.x, y1);
          ctx.lineTo(nextLayer.x, y2);
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    });

    // Update & draw action potential pulses
    stateRef.current.neuronPulses.forEach((pulse, idx) => {
      if (isPlayingRef.current) pulse.progress += dt * 1.8 * speedRef.current;
      const l1 = layers[0];
      const l2 = layers[1];
      const y1 = (height / (l1.count + 1)) * (pulse.x + 1);
      const y2 = (height / (l2.count + 1)) * (pulse.y + 1);

      const px = l1.x + (l2.x - l1.x) * pulse.progress;
      const py = y1 + (y2 - y1) * pulse.progress;

      ctx.fillStyle = '#38BDF8';
      ctx.shadowColor = '#0284C7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    stateRef.current.neuronPulses = stateRef.current.neuronPulses.filter((p) => p.progress < 1);

    // Draw Neurons (Cell Bodies)
    layers.forEach((layer) => {
      ctx.fillStyle = '#6366F1';
      for (let i = 0; i < layer.count; i++) {
        const ny = (height / (layer.count + 1)) * (i + 1);
        const pulse = Math.sin(stateRef.current.time * 4 + i) * 2;

        ctx.beginPath();
        ctx.arc(layer.x, ny, 16 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#4F46E5';
        ctx.fill();
        ctx.strokeStyle = '#818CF8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(layer.x, ny, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(layer.label, layer.x, height - 20);
    });
  };

  // -------------------------------------------------------------
  // SIMULATION 4: PHOTOSYNTHESIS & MOLECULAR ENERGY CYCLE
  // -------------------------------------------------------------
  const renderPhotosynthesis = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    ctx.fillStyle = '#064E3B';
    ctx.fillRect(0, 0, width, height);

    // Sunlight Rays
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.lineWidth = 3;
    for (let r = 0; r < 5; r++) {
      const rx = 60 + r * 40 + Math.sin(stateRef.current.time * 2) * 10;
      ctx.beginPath();
      ctx.moveTo(rx, 20);
      ctx.lineTo(rx + 80, height * 0.4);
      ctx.stroke();
    }

    // Thylakoid Membrane
    const memY = height * 0.5;
    ctx.fillStyle = '#047857';
    ctx.fillRect(40, memY - 20, width - 80, 40);

    // Photosystem II (Light Absorption & H2O splitting)
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    safeRoundRect(ctx, width * 0.25, memY - 35, 60, 70, 8);
    ctx.fill();
    ctx.strokeStyle = '#A7F3D0';
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PS II', width * 0.25 + 30, memY + 5);

    // ATP Synthase Rotor (Spinning Motor)
    const rotorX = width * 0.72;
    const rotorAngle = stateRef.current.time * 5 * speedRef.current;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    safeRoundRect(ctx, rotorX - 25, memY - 45, 50, 90, 10);
    ctx.fill();

    // Spinning rotor blades
    ctx.save();
    ctx.translate(rotorX, memY + 25);
    ctx.rotate(rotorAngle);
    ctx.fillStyle = '#FEF08A';
    for (let b = 0; b < 3; b++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.fillRect(-4, -18, 8, 36);
    }
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('ATP Synthase', rotorX, memY - 55);

    // HUD Text
    ctx.fillStyle = '#A7F3D0';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Reaction: 2H₂O + Light ➔ O₂ + 4H⁺ + 4e⁻', 24, 36);
    ctx.fillText('Output: ADP + Pi ➔ ATP (Cellular Energy)', 24, 56);
  };

  // -------------------------------------------------------------
  // SIMULATION 5: QUANTUM ATOM BOHR MODEL
  // -------------------------------------------------------------
  const renderQuantumAtom = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Nucleus with protons and neutrons
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(cx + 4, cy + 3, 8, 0, Math.PI * 2);
    ctx.fill();

    // Quantum Energy Shells (n=1, n=2, n=3, n=4)
    const shells = [40, 80, 130, 190];
    shells.forEach((r, idx) => {
      ctx.beginPath();
      ctx.strokeStyle = idx + 1 === quantumLevel ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = idx + 1 === quantumLevel ? 2 : 1;
      ctx.setLineDash([4, 4]);
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px monospace';
      ctx.fillText(`n=${idx + 1}`, cx + r + 4, cy - 4);
    });

    // Orbiting Electron
    if (isPlayingRef.current) {
      stateRef.current.quantumAngle += dt * (5 / quantumLevel) * speedRef.current;
    }
    const qR = shells[quantumLevel - 1];
    const ex = cx + Math.cos(stateRef.current.quantumAngle) * qR;
    const ey = cy + Math.sin(stateRef.current.quantumAngle) * qR;

    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#0284C7';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ex, ey, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // HUD
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Hydrogen Quantum Energy Level: n=${quantumLevel}`, 24, 36);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`Orbital Radius: ${(0.529 * quantumLevel * quantumLevel).toFixed(2)} Å`, 24, 56);
    ctx.fillText(`Energy: ${(-13.6 / (quantumLevel * quantumLevel)).toFixed(2)} eV`, 24, 74);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (simulationType !== 'solar_system') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Detect clicked planet
    PLANETS_DATA.forEach((planet, index) => {
      const orbR = planet.orbitRadius * zoomLevel;
      const tilt = tiltPerspective ? 0.45 : 1.0;
      const angle = stateRef.current.solarAngles[index];
      const px = cx + Math.cos(angle) * orbR;
      const py = cy + Math.sin(angle) * orbR * tilt;
      const dist = Math.hypot(x - px, y - py);

      if (dist < Math.max(16, planet.radius * zoomLevel + 10)) {
        setSelectedPlanet(planet);
        if (onSelectEntity) onSelectEntity(planet.name, planet);
      }
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Simulation Stage Container */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-video min-h-[420px] max-h-[580px] bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 shadow-md group"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-crosshair"
        />

        {/* Top-Right Floating Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-white text-xs">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              setZoomLevel(1);
              stateRef.current.time = 0;
            }}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {simulationType === 'solar_system' && (
            <>
              <button
                onClick={() => setTiltPerspective(!tiltPerspective)}
                className={`p-1.5 rounded-lg transition-colors ${tiltPerspective ? 'bg-blue-600 text-white' : 'hover:bg-white/20'}`}
                title="Toggle 3D Orbital Tilt"
              >
                <Compass className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowOrbits(!showOrbits)}
                className={`p-1.5 rounded-lg transition-colors ${showOrbits ? 'bg-purple-600 text-white' : 'hover:bg-white/20'}`}
                title="Toggle Orbits"
              >
                <Eye className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Status / Playback Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-white text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold flex items-center gap-1.5 text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{conceptName || 'Realistic Interactive Physics Simulation'}</span>
            </span>
            <span className="text-gray-400 font-mono">T: {timeCounter}s</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400">Velocity:</span>
            {[0.5, 1, 5, 20].map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                  speedMultiplier === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Realistic Interactive Controls & Scientific Parameter Inspector */}
      {simulationType === 'solar_system' && selectedPlanet && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                style={{ backgroundColor: selectedPlanet.color }}
              >
                {selectedPlanet.name.slice(0, 2)}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedPlanet.name}</h3>
                <span className="text-xs text-gray-500 font-medium">{selectedPlanet.details}</span>
              </div>
            </div>

            {/* Quick Planet Selector Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
              {PLANETS_DATA.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPlanet(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedPlanet.name === p.name
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Physical Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Orbital Period</span>
              <span className="font-bold text-gray-900">{selectedPlanet.orbitalPeriod}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Distance from Sun</span>
              <span className="font-bold text-gray-900">{selectedPlanet.distanceKm}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Diameter</span>
              <span className="font-bold text-gray-900">{selectedPlanet.diameter}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Surface Temp</span>
              <span className="font-bold text-gray-900">{selectedPlanet.temp}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Known Moons</span>
              <span className="font-bold text-gray-900">{selectedPlanet.moons}</span>
            </div>
          </div>
        </div>
      )}

      {/* Internal Combustion Engine Controls */}
      {simulationType === 'four_stroke_engine' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-gray-900 text-sm">Engine Throttle & Crankshaft Speed</span>
            <div className="text-gray-500">Live 4-stroke thermodynamic cycle: Intake ➔ Compression ➔ Power ➔ Exhaust</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-gray-900">{engineRpm} RPM</span>
            <input
              type="range"
              min="600"
              max="6000"
              step="200"
              value={engineRpm}
              onChange={(e) => setEngineRpm(parseInt(e.target.value))}
              className="w-44 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Quantum Atom Level Selector */}
      {simulationType === 'quantum_atom' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-gray-900 text-sm">Bohr Quantized Energy Orbitals</span>
            <div className="text-gray-500">Trigger electronic quantum jumps across principal quantum numbers (n=1 to n=4)</div>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setQuantumLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                  quantumLevel === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Jump to n={lvl}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
