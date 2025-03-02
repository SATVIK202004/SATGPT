import React, { useEffect, useState } from 'react';
import { Bird, Sparkles, Star, Zap, Heart } from 'lucide-react';

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

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  opacity: number;
  rotation: number;
}

const DynamicLogo: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [color, setColor] = useState('#4F46E5');
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
      setScale(1 + Math.sin(Date.now() / 1000) * 0.1);
      setColor(`hsl(${(Date.now() / 50) % 360}, 80%, 60%)`);
      setGlowIntensity(0.5 + Math.sin(Date.now() / 800) * 0.3);
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
      className="relative w-40 h-40 mb-8 transition-transform"
      style={{
        transform: `translate(${mouseX * 0.01}px, ${mouseY * 0.01}px)`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          background: `conic-gradient(from ${rotation}deg, ${color}, transparent)`,
          filter: `blur(10px) brightness(1.2)`,
          opacity: glowIntensity,
        }}
      />
      <div
        className="absolute inset-4 bg-black rounded-full flex items-center justify-center shadow-lg"
        style={{
          boxShadow: `0 0 30px ${color}`,
        }}
      >
        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          SAT GPT
        </div>
      </div>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `2px solid ${color}`,
          transform: `rotate(${-rotation * 0.5}deg) scale(${scale * 1.1})`,
          opacity: 0.7,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid white`,
          transform: `rotate(${rotation * 0.3}deg) scale(${scale * 1.2})`,
          opacity: 0.3,
        }}
      />
    </div>
  );
};

const ParticleEffect: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate initial particles
    const initialParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 2 + Math.random() * 5,
      color: `hsl(${Math.random() * 360}, 80%, 70%)`,
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.5,
      rotation: Math.random() * 360,
    }));

    setParticles(initialParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          y: particle.y - particle.speed,
          x: particle.x + Math.sin(particle.y / 100) * 0.5,
          rotation: particle.rotation + 0.5,
          // Reset particle position when it goes off screen
          ...(particle.y < -particle.size && {
            y: window.innerHeight + particle.size,
            x: Math.random() * window.innerWidth,
          }),
        }))
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            transition: 'opacity 0.3s ease',
          }}
        />
      ))}
    </div>
  );
};

const FloatingIcons: React.FC = () => {
  const [icons, setIcons] = useState<Array<{
    id: number;
    x: number;
    y: number;
    icon: React.ReactNode;
    speed: number;
    rotation: number;
    scale: number;
  }>>([]);

  useEffect(() => {
    const iconComponents = [
      <Sparkles key="sparkles" size={24} className="text-yellow-400" />,
      <Star key="star" size={24} className="text-blue-400" />,
      <Zap key="zap" size={24} className="text-purple-400" />,
      <Heart key="heart" size={24} className="text-pink-400" />,
      <Bird key="bird" size={24} className="text-green-400" />,
    ];

    const initialIcons = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      icon: iconComponents[i % iconComponents.length],
      speed: 0.5 + Math.random() * 1,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 1,
    }));

    setIcons(initialIcons);

    const interval = setInterval(() => {
      setIcons(prevIcons =>
        prevIcons.map(icon => ({
          ...icon,
          y: icon.y - icon.speed,
          x: icon.x + Math.sin(icon.y / 100) * 1,
          rotation: icon.rotation + 0.5,
          scale: 0.5 + Math.sin(Date.now() / 1000 + icon.id) * 0.3,
          ...(icon.y < -30 && {
            y: window.innerHeight + 30,
            x: Math.random() * window.innerWidth,
          }),
        }))
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {icons.map(icon => (
        <div
          key={icon.id}
          className="absolute"
          style={{
            left: `${icon.x}px`,
            top: `${icon.y}px`,
            transform: `rotate(${icon.rotation}deg) scale(${icon.scale})`,
            transition: 'transform 0.5s ease',
          }}
        >
          {icon.icon}
        </div>
      ))}
    </div>
  );
};

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [opacity, setOpacity] = useState(1);
  const [showSignIn, setShowSignIn] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Show splash screen for 3 seconds, then show sign-in form
    const timer = setTimeout(() => {
      setShowSignIn(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!dob) {
      setError('Please enter your date of birth');
      return;
    }
    
    setIsSigningIn(true);
    setError('');
    
    // Simulate authentication
    setTimeout(() => {
      // Store user info in localStorage
      localStorage.setItem('satgpt_user', JSON.stringify({ name, dob }));
      
      // Fade out splash screen
      setOpacity(0);
      
      // Complete after fade out animation
      setTimeout(onComplete, 1000);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-1000 bg-black"
      style={{ opacity }}
    >
      <ParticleEffect />
      <FloatingIcons />
      
      <div className="relative z-10 text-center max-w-md w-full px-6">
        <DynamicLogo />
        
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4 animate-pulse">
          SAT GPT
        </h1>
        
        <p className="text-lg text-gray-300 mb-8">
          Your Advanced AI Assistant
        </p>
        
        {showSignIn && (
          <div 
            className="bg-gray-900/80 backdrop-blur-lg p-8 rounded-2xl border border-gray-700 shadow-2xl transform transition-all duration-500 ease-out"
            style={{
              boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)',
              animation: 'fadeInUp 0.8s ease-out forwards'
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Sign In to Continue</h2>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-300 mb-1 text-left">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                />
              </div>
              
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
              >
                {isSigningIn ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Enter SAT GPT'
                )}
              </button>
              
              <p className="text-xs text-gray-400 mt-4">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
