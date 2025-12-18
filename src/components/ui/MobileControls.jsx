'use client';

import { useState, useRef, useEffect } from 'react';
import { useInputContext } from '../../context/InputContext';

export default function MobileControls({ visible }) {
  const { input, setInput } = useInputContext();
  const joystickRef = useRef(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  // Joystick Logic
  const handleStart = (e) => {
    e.stopPropagation(); // Prevent camera from moving when touching joystick
    setActive(true);
    handleMove(e);
  };

  const handleMove = (e) => {
    e.stopPropagation(); 
    if (!active && e.type !== 'touchstart' && e.type !== 'mousedown') return;
    
    // Normalize touch/mouse position
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const rect = joystickRef.current.parentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let x = clientX - centerX;
    let y = clientY - centerY;
    
    // Clamp to radius
    const radius = rect.width / 2;
    const distance = Math.sqrt(x*x + y*y);
    
    if (distance > radius) {
        const angle = Math.atan2(y, x);
        x = Math.cos(angle) * radius;
        y = Math.sin(angle) * radius;
    }
    
    // Normalize -1 to 1 for output
    const normX = x / radius;
    const normY = y / radius;
    
    setJoystickPos({ x, y });
    setInput(prev => ({ ...prev, joystick: { x: normX, y: normY } }));
  };

  const handleEnd = (e) => {
    // e.stopPropagation(); // Optional on end, but consistent
    setActive(false);
    setJoystickPos({ x: 0, y: 0 });
    setInput(prev => ({ ...prev, joystick: { x: 0, y: 0 } }));
  };

  // Button Handlers
  const handleJump = (state, e) => {
    if(e) e.stopPropagation();
    setInput(prev => ({ ...prev, jump: state }));
  }


  useEffect(() => {
    const handleUp = () => handleEnd();
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchend', handleUp);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none lg:hidden select-none overflow-hidden">
        
        {/* Joystick Area - Positioned nicely for left thumb */}
        <div 
            className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-white/5 backdrop-blur-[2px] border border-white/10 pointer-events-auto touch-none transition-opacity duration-200 hover:opacity-100 opacity-80"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            // onTouchEnd handled by window, but we can add self-cleanup if confused
        >
            <div 
                ref={joystickRef}
                className="absolute w-12 h-12 bg-white/40 rounded-full shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
                style={{ 
                    left: '50%', 
                    top: '50%',
                    transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`
                }}
            />
        </div>

        {/* Action Buttons - Positioned for right thumb */}
        <div className="absolute bottom-16 right-8 flex items-center gap-6 pointer-events-auto">
            {/* Jump Button */}
            <button
                onMouseDown={(e) => handleJump(true, e)}
                onMouseUp={(e) => handleJump(false, e)}
                onTouchStart={(e) => handleJump(true, e)}
                onTouchEnd={(e) => handleJump(false, e)}
                className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 active:bg-white/30 active:scale-95 transition-all flex items-center justify-center shadow-lg"
            >
                <span className="font-bold text-xs tracking-wider text-white/90">JUMP</span>
            </button>
        </div>
        

    </div>
  );
}
