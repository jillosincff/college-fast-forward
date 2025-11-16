// Standard hero styling for College Fast Forward
// Dark blue + Gator texture background with consistent typography

export const HERO_BG_CLASSES = "relative overflow-hidden bg-[#0A1F3D]";

export const HERO_BG_GRADIENT = {
  background: 'linear-gradient(135deg, #001540 0%, #0021A5 50%, #002157 100%)',
};

export const HERO_TEXTURE_OVERLAY = (
  <div className="absolute inset-0 opacity-5" style={{
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  }} />
);

export const HERO_GLOW_EFFECTS = (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-10 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
    <div className="absolute bottom-10 left-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
  </div>
);

// Typography classes
export const HERO_HEADING_CLASSES = "text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight";
export const HERO_SUBHEADING_CLASSES = "text-xl md:text-2xl text-[#FA4616] font-semibold leading-relaxed";
export const HERO_DESCRIPTION_CLASSES = "text-lg md:text-xl text-white/90 leading-relaxed";