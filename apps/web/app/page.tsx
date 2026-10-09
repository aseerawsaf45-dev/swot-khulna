import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden px-4 py-24">
      {/* Radial Gradient Background for Ethereal Glass vibe */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(50,200,255,0.05)_0%,rgba(5,5,5,1)_60%)]"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center space-y-12">
        
        {/* Eyebrow */}
        <div className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium ring-1 ring-white/10 bg-white/5 backdrop-blur-md">
          Research Prototype
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
          See Beneath the Surface.
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-white/80 mt-4">
          Understand the Water. Anticipate the Change.
        </h2>

        <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto font-light mt-6">
          Explore southwest Bangladesh through NASA SWOT observations, local hydrological measurements, and physics-informed modeling. Discover spatial patterns, investigate changing water levels, and explore experimental forecasts through one unified intelligence workspace.
        </p>

        {/* Outer Shell for interaction / Double Bezel */}
        <div className="p-1.5 rounded-[2rem] bg-white/5 ring-1 ring-white/10 mt-8">
          {/* Inner Core */}
          <div className="bg-[#0A0A0A] rounded-[calc(2rem-0.375rem)] px-8 py-12 flex flex-col items-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <h2 className="text-xl text-white/80 mb-6">Explore the Hydrological Models</h2>
            
            <Link href="/app/overview" className="group relative rounded-full px-6 py-3 bg-white text-black font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[0.98] active:scale-[0.95] flex items-center space-x-4">
              <span>Enter Workspace</span>
              {/* Button-in-Button architecture */}
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                  <path d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6464L10.2929 4H6C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3H11.5C11.7761 3 12 3.22386 12 3.5V9C12 9.27614 11.7761 9.5 11.5 9.5C11.2239 9.5 11 9.27614 11 9V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
