export default function IntroOverlay({ onStart }) {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex z-10 pointer-events-none">
      {/* Left Panel - Hero Section */}
      {/* Left Panel - Hero Section */}
      <div className="w-full md:w-[60%] h-full bg-gradient-to-t from-black via-black/95 to-transparent md:bg-[linear-gradient(to_right,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.85)_60%,rgba(0,0,0,0)_100%)] flex flex-col justify-end md:justify-center px-6 sm:px-12 md:px-16 lg:px-24 pb-24 md:pb-0 pointer-events-auto backdrop-blur-[1px]">
        
        {/* Top Decoration */}
        <div className="absolute top-6 left-6 md:top-12 md:left-16 lg:left-24 w-12 h-1 bg-blue-500/50 mb-8 hidden md:block" />

        <div className="space-y-4 md:space-y-6">
            <h2 className="text-[10px] sm:text-xs md:text-sm text-blue-400 font-bold tracking-[0.2em] uppercase animate-fade-in-up">
            Surat, Gujarat • Portfolio 2025
            </h2>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] animate-fade-in-up delay-100">
            VIGHNESH
            <br />
            PARMAR
            <span className="text-blue-500">.</span>
            </h1>

            <div className="h-px w-24 md:w-32 bg-gradient-to-r from-blue-500/50 to-transparent my-4 md:my-6 animate-scale-x delay-200 origin-left" />

            <div className="space-y-3 md:space-y-4 animate-fade-in-up delay-300">
            <p className="text-base sm:text-xl md:text-2xl text-white font-light tracking-wide">
                Frontend Developer <span className="text-blue-500 px-2">|</span> React & Next.js Specialist
            </p>
            
            {/* Bio - Hidden on mobile for cleaner look */}
            <p className="hidden md:block text-gray-300 max-w-sm sm:max-w-md text-xs sm:text-sm md:text-base leading-relaxed font-light">
                Passionate developer crafting scalable web applications with extensive experience in 
                 <span className="text-white font-medium"> React.js</span>, 
                 <span className="text-white font-medium"> Next.js</span>, and 
                 <span className="text-white font-medium"> Tailwind CSS</span>. 
                Focused on high-performance UI/UX and modern design systems.
            </p>
            
            {/* Tech Stack Pills - Hidden on mobile */}
            <div className="hidden md:flex flex-wrap gap-2 pt-2 opacity-80">
                {['ReactJS', 'Next.js', 'Redux', 'Tailwind', 'Three.js'].map((tech) => (
                    <span key={tech} className="px-2 py-1 text-[10px] md:text-xs border border-white/20 rounded-full text-white/60">
                        {tech}
                    </span>
                ))}
            </div>
            </div>
        </div>

        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 animate-fade-in-up delay-500">
            <button 
                onClick={onStart}
                className="group relative px-6 md:px-8 py-3 md:py-4 bg-white text-black font-bold text-xs md:text-sm tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all duration-300 ease-out overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                Enter Experience
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                </span>
            </button>
            
            {/* Social Links */}
            <div className="flex gap-4">
                <a href="mailto:vighneshparmar09@gmail.com" className="text-white/40 hover:text-blue-400 transition-colors" title="Email">
                    <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center p-2 hover:border-blue-400/50 hover:bg-blue-400/10 transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                </a>
                <a href="#" className="text-white/40 hover:text-blue-400 transition-colors">
                     <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center p-2 hover:border-blue-400/50 hover:bg-blue-400/10 transition-all">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </div>
                </a>
                <a href="#" className="text-white/40 hover:text-blue-400 transition-colors">
                    <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center p-2 hover:border-blue-400/50 hover:bg-blue-400/10 transition-all">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </div>
                </a>
            </div>
        </div>

        {/* Bottom copyright/status */}
        <div className="absolute bottom-8 left-6 md:bottom-12 md:left-24 text-white/20 text-[10px] md:text-xs tracking-widest uppercase animate-fade-in delay-700 hidden md:block">
            © 2025 Vighnesh Parmar . System Online
        </div>

      </div>

      {/* Right Panel - Transparent for 3D View (Desktop only) */}
      <div className="hidden md:block w-[45%] h-full" />
    </div>
  );
}
