import React, { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface BubblesBackgroundProps {
  bubbleColors?: string;
}

export function BubblesBackground({ bubbleColors = 'from-blue-200/30 to-purple-200/30' }: BubblesBackgroundProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Create initial bubbles
    const initialBubbles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 10 + Math.random() * 40,
      speed: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.3,
    }));

    setBubbles(initialBubbles);

    // Animate bubbles
    const interval = setInterval(() => {
      setBubbles(prevBubbles =>
        prevBubbles.map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          x: bubble.x + Math.sin(bubble.y / 50) * 0.5,
          // Reset bubble position when it goes off screen
          ...(bubble.y < -bubble.size && {
            y: window.innerHeight + bubble.size,
            x: Math.random() * window.innerWidth,
          }),
        }))
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className={`absolute rounded-full bg-gradient-to-br ${bubbleColors}`}
          style={{
            left: `${bubble.x}px`,
            top: `${bubble.y}px`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            opacity: bubble.opacity,
            transition: 'opacity 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}