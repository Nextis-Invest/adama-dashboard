import type { LucideIcon } from "lucide-react";

interface IsometricIconProps {
  icon: LucideIcon;
  color: string;
  bgFrom: string;
  bgTo: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { wrapper: "size-12", icon: "size-5", shadow: "size-10" },
  md: { wrapper: "size-16", icon: "size-7", shadow: "size-14" },
  lg: { wrapper: "size-20", icon: "size-9", shadow: "size-18" },
};

export function IsometricIcon({
  icon: Icon,
  color,
  bgFrom,
  bgTo,
  size = "md",
  className = "",
}: IsometricIconProps) {
  const s = sizes[size];

  return (
    <div className={`relative inline-flex ${className}`} style={{ perspective: "400px" }}>
      {/* Shadow */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 ${s.shadow} rounded-full opacity-20 blur-md`}
        style={{ background: bgFrom }}
      />
      {/* 3D cube face */}
      <div
        className={`relative ${s.wrapper} flex items-center justify-center rounded-2xl shadow-lg`}
        style={{
          background: `linear-gradient(135deg, ${bgFrom}, ${bgTo})`,
          transform: "rotateX(10deg) rotateY(-10deg) rotateZ(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Top highlight */}
        <div
          className="absolute inset-x-0 top-0 h-1/3 rounded-t-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        {/* Right edge */}
        <div
          className="absolute right-0 top-0 h-full w-[3px] rounded-r-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        {/* Bottom edge */}
        <div
          className="absolute bottom-0 left-0 h-[3px] w-full rounded-b-2xl"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)",
          }}
        />
        <Icon className={s.icon} style={{ color }} />
      </div>
    </div>
  );
}

// Preset icon configs for the public site
export const iconPresets = {
  building: {
    color: "#FFFFFF",
    bgFrom: "#FF385C",
    bgTo: "#E31C5F",
  },
  search: {
    color: "#FFFFFF",
    bgFrom: "#222222",
    bgTo: "#484848",
  },
  location: {
    color: "#FFFFFF",
    bgFrom: "#00A699",
    bgTo: "#008F82",
  },
  bed: {
    color: "#FFFFFF",
    bgFrom: "#6C5CE7",
    bgTo: "#5A4BD1",
  },
  bath: {
    color: "#FFFFFF",
    bgFrom: "#0984E3",
    bgTo: "#0770C4",
  },
  guests: {
    color: "#FFFFFF",
    bgFrom: "#FC642D",
    bgTo: "#E5571F",
  },
  star: {
    color: "#FFFFFF",
    bgFrom: "#FDCB6E",
    bgTo: "#E5B85C",
  },
  shield: {
    color: "#FFFFFF",
    bgFrom: "#00B894",
    bgTo: "#009E7F",
  },
  key: {
    color: "#FFFFFF",
    bgFrom: "#FF385C",
    bgTo: "#D63051",
  },
  globe: {
    color: "#FFFFFF",
    bgFrom: "#636E72",
    bgTo: "#4A5458",
  },
} as const;
