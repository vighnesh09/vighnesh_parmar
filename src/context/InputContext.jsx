'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const InputContext = createContext({});

export function InputProvider({ children }) {
  const [input, setInput] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    joystick: { x: 0, y: 0 }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
        switch (e.code) {
          case "KeyW": case "ArrowUp":    setInput((i) => ({ ...i, forward: true })); break;
          case "KeyS": case "ArrowDown":  setInput((i) => ({ ...i, backward: true })); break;
          case "KeyA": case "ArrowLeft":  setInput((i) => ({ ...i, left: true })); break;
          case "KeyD": case "ArrowRight": setInput((i) => ({ ...i, right: true })); break;
          case "ShiftLeft":
          case "ShiftRight":              setInput((i) => ({ ...i, run: true })); break;
          case "Space":                   setInput((i) => ({ ...i, jump: true })); break;
        }
    };

    const handleKeyUp = (e) => {
        switch (e.code) {
          case "KeyW": case "ArrowUp":    setInput((i) => ({ ...i, forward: false })); break;
          case "KeyS": case "ArrowDown":  setInput((i) => ({ ...i, backward: false })); break;
          case "KeyA": case "ArrowLeft":  setInput((i) => ({ ...i, left: false })); break;
          case "KeyD": case "ArrowRight": setInput((i) => ({ ...i, right: false })); break;
          case "ShiftLeft":
          case "ShiftRight":              setInput((i) => ({ ...i, run: false })); break;
          case "Space":                   setInput((i) => ({ ...i, jump: false })); break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <InputContext.Provider value={{ input, setInput }}>
      {children}
    </InputContext.Provider>
  );
}

export const useInputContext = () => useContext(InputContext);
