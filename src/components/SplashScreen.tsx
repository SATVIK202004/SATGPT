import React, { useEffect, useState } from 'react';
import { Bird } from 'lucide-react';

interface BirdAnimation {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  scale: number;
  trail: { x: number; y: number }[];
  angle: number;
}

const DynamicLogo: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [color, setColor] = useState('#4F46E5');
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 9000);
      setScale(1 + Math.sin(Date.now() / 9000) * 0.1);
      setColor(`hsl(${(Date.now() / 50) % 9000}, 70%, 60%)`);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="relative w-32 h-32 mb-8 transition-transform"
      style={{
        transform: `translate(${mouseX * 0.02}px, ${mouseY * 0.02}px)`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full border-4 border-transparent"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          background: `conic-gradient(from ${rotation}deg, ${color}, transparent)`,
        }}
      />
      <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          SAT GPT
        </div>
      </div>
    </div>
  );
};

export function SplashScreen() {
  const [birds, setBirds] = useState<BirdAnimation[]>([]);
  const [opacity, setOpacity] = useState(1);
  const [curtainState, setCurtainState] = useState<'open' | 'closed'>('closed');
  const [particles, setParticles] = useState<{ x: number; y: number; opacity: number }[]>([]);

  useEffect(() => {
    setTimeout(() => setCurtainState('open'), 9000);
    setTimeout(() => setOpacity(0), 7000);

    // Generate particles
    const newParticles = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      opacity: Math.random(),
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBirds((prevBirds) =>
        prevBirds.map(bird => ({
          ...bird,
          x: bird.x + Math.cos(bird.angle) * bird.speed,
          y: bird.y + Math.sin(bird.angle) * bird.speed,
          angle: bird.angle + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-1000"
      style={{ opacity }}
    >
      {/* Curtain Animation */}
      <div
        className={`absolute inset-0 bg-black transition-all duration-9000 ${
          curtainState === 'open' ? 'translate-y-full' : ''
        }`}
      />
      <div
        className={`absolute inset-0 bg-black transition-all duration-9000 ${
          curtainState === 'open' ? '-translate-y-full' : ''
        }`}
      />

      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute w-2 h-2 bg-white rounded-full opacity-75 transition-all"
          style={{
            top: `${particle.y}px`,
            left: `${particle.x}px`,
            opacity: particle.opacity,
            transform: `scale(${Math.random() * 1.5})`,
          }}
        />
      ))}

      {/* Birds Animation */}
      {birds.map((bird) => (
        <Bird
          key={bird.id}
          className="absolute text-white"
          style={{
            top: bird.y,
            left: bird.x,
            transform: `scale(${bird.scale}) rotate(${bird.rotation}deg)`,
          }}
        />
      ))}

      <div className="relative z-10 text-center">
        <DynamicLogo />
        <h1 className="text-6xl font-extrabold text-white mb-4 animate-pulse">SAT GPT</h1>
        <p className="text-lg text-gray-200">Your AI Assistant</p>
      </div>
    </div>
  );
}
