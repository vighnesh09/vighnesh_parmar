import { useInputContext } from '../context/InputContext';

export function useInput() {
  const context = useInputContext();
  if (!context) {
    // Fallback if used outside provider (though shouldn't happen in this setup)
    return {
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
        jump: false,
        joystick: { x: 0, y: 0 }
    };
  }
  return context.input;
}
