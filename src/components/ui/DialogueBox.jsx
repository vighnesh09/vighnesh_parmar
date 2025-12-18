import React, { useEffect, useState, useMemo } from "react";

export const idleMessages = [
  "Hey… are you still there?",
  "You’ve gone quiet.",
  "Everything okay?",
  "We should keep moving.",
  "I’ll wait… just don’t take too long.",
  "Did you see that?",
  "It's quiet... too quiet.",
  "I'm ready when you are.",
  "Still with me?",
  "Let's explore some more.",
  "Don't leave me hanging here.",
  "Hello? Anyone home?",
  "Taking a break?",
  "I'm getting bored...",
  "Adventure awaits!",
];

let lastIdleMessage = "";

export function DialogueBox({
  text,
  speaker = "Companion",
  autoHide = true,
  hideAfter = 4000,
  isIntro = false,
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [visible, setVisible] = useState(true);

  if (isIntro) return null;

  // Determine which text to show (prop or random)
  const content = useMemo(() => {
    if (text) return text;

    let candidate;
    // Try to pick a new message different from the last one
    let attempts = 0;
    do {
        candidate = idleMessages[Math.floor(Math.random() * idleMessages.length)];
        attempts++;
    } while (candidate === lastIdleMessage && attempts < 10);

    lastIdleMessage = candidate;
    return candidate;
  }, [text]);

  // Typing effect (Fixed: using slice to ensure correct characters)
  useEffect(() => {
    if (!content) return;

    let i = 0;
    setDisplayedText(""); // Start empty

    const t = setInterval(() => {
      i++;
      setDisplayedText(content.slice(0, i)); // Always slice from source
      if (i >= content.length) {
        clearInterval(t);
      }
    }, 38);

    return () => clearInterval(t);
  }, [content]);

  // Cursor blink
  useEffect(() => {
    const c = setInterval(() => setShowCursor((p) => !p), 500);
    return () => clearInterval(c);
  }, []);

  // Auto hide
  useEffect(() => {
    if (!autoHide) return;

    const h = setTimeout(() => setVisible(false), hideAfter);
    return () => clearTimeout(h);
  }, [autoHide, hideAfter]);

  if (!visible) return null;

  return (
    <div className="relative pointer-events-none select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes appear {
            from { opacity: 0; transform: translateY(6px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes idle {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-1.5px); }
          }
          `,
        }}
      />

      {/* Dialogue */}
      <div
        style={{
          animation:
            "appear 0.25s ease-out, idle 2.8s ease-in-out infinite",
        }}
        className="
          relative
          bg-zinc-950/85 backdrop-blur-md
          rounded-md
          px-1.5 py-0.5
          min-w-[80px] max-w-[280px]
          whitespace-nowrap
          border border-white/5
          shadow-[0_0_16px_rgba(16,185,129,0.12)]
        "
      >
        {/* Speaker tag */}
        <div className="absolute -top-1.5 left-2 px-1 py-[0.5px] rounded bg-emerald-400/90 text-[6px] font-bold tracking-widest text-black">
          {speaker}
        </div>

        {/* Text */}
        <p className="mt-[3px] text-zinc-100 text-[8.5px] leading-snug font-mono tracking-wide">
          {displayedText}
          {showCursor && (
            <span className="text-emerald-400 ml-[1px]">▍</span>
          )}
        </p>
      </div>

      {/* Tail */}
      <div
        className="
          absolute
          -bottom-[3px] left-3
          w-1.5 h-1.5
          bg-zinc-950/85
          rotate-45
          border-r border-b border-white/5
        "
      />
    </div>
  );
}
