import React, { useState, useEffect } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export function ModernCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [linkHover, setLinkHover] = useState(false);

  useEffect(() => {
    // Detect if device is touch-based
    const isTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    setTouchMode(isTouchDevice());

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const updateTouchPosition = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setVisible(true);
        
        // Hide cursor after 2 seconds of inactivity on touch devices
        setTimeout(() => {
          setVisible(false);
        }, 2000);
      }
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);
    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    // Track hover on interactive elements
    const handleLinkHoverIn = () => setLinkHover(true);
    const handleLinkHoverOut = () => setLinkHover(false);

    // Add event listeners
    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('touchmove', updateTouchPosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Add event listeners for all interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', handleLinkHoverIn);
      element.addEventListener('mouseleave', handleLinkHoverOut);
    });

    return () => {
      // Clean up event listeners
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('touchmove', updateTouchPosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);

      interactiveElements.forEach(element => {
        element.removeEventListener('mouseenter', handleLinkHoverIn);
        element.removeEventListener('mouseleave', handleLinkHoverOut);
      });
    };
  }, []);

  // Don't render cursor on touch-only devices
  if (touchMode && !visible) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        className={`fixed pointer-events-none z-[9999] transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={`rounded-full transition-all duration-200 ${
            clicked ? 'scale-75' : linkHover ? 'scale-150' : 'scale-100'
          } ${
            linkHover ? 'bg-pink-400 mix-blend-difference' : 'bg-white'
          }`}
          style={{
            width: linkHover ? '30px' : '12px',
            height: linkHover ? '30px' : '12px',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
            mixBlendMode: 'exclusion',
          }}
        />
      </div>

      {/* Cursor trail/halo effect */}
      <div
        className={`fixed pointer-events-none z-[9998] rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-sm transition-all duration-500 ease-out ${
          visible ? 'opacity-70' : 'opacity-0'
        } ${clicked ? 'scale-75' : linkHover ? 'scale-200' : 'scale-100'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '40px',
          height: '40px',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Touch ripple effect (only shown on touch) */}
      {touchMode && visible && (
        <div
          className="fixed pointer-events-none z-[9997] rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 animate-ping"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '80px',
            height: '80px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      <style jsx>{`
        @keyframes ping {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          70% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}
