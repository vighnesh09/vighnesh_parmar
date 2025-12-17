export default function IntroOverlay({ onStart }) {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex z-10 pointer-events-none">
      {/* Left Panel - UI */}
      <div className="w-full lg:w-1/2 h-full bg-black/80 flex flex-col justify-center px-6 lg:px-16 pointer-events-auto backdrop-blur-sm">
        <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-white mb-2 tracking-tighter">
          VIGHNESH
        </h1>
        <h2 className="text-xl md:text-2xl lg:text-3xl text-gray-400 font-light tracking-widest mb-8 lg:mb-12">
          CREATIVE DEVELOPER
        </h2>
        
        <p className="text-gray-400 mb-8 lg:mb-12 max-w-lg text-base lg:text-lg leading-relaxed">
            Welcome to my interactive 3D portfolio. Explore my projects, experience, and journey through this immersive world.
        </p>

        <button 
          onClick={onStart}
          className="group relative w-fit px-6 lg:px-8 py-3 lg:py-4 bg-white text-black font-bold text-lg lg:text-xl tracking-wider hover:bg-gray-200 transition-all duration-300"
        >
          START EXPERIENCE
          <div className="absolute -right-2 -bottom-2 w-full h-full border-2 border-white/30 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
        </button>
      </div>

      {/* Right Panel - Transparent for 3D View (Desktop only) */}
      <div className="hidden lg:block w-1/2 h-full" />
    </div>
  );
}
