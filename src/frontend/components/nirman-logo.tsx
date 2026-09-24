import Image from "next/image";

export interface NirmanLogoProps {
  /**
   * Preset sizes or explicit pixel dimension:
   * - "xs": 24px (h-6 w-6)
   * - "sm": 32px (h-8 w-8)
   * - "md": 40px (h-10 w-10)
   * - "lg": 56px (h-14 w-14)
   * - "xl": 80px (h-20 w-20)
   * - number: custom square size in pixels
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /**
   * Accessible text - defaults strictly to "NIRMAN" per official branding rules.
   */
  alt?: string;
}

const SIZE_MAP: Record<"xs" | "sm" | "md" | "lg" | "xl", { class: string; px: number }> = {
  xs: { class: "h-7 w-7", px: 28 },
  sm: { class: "h-10 w-10", px: 40 },
  md: { class: "h-12 w-12", px: 48 },
  lg: { class: "h-16 w-16 sm:h-20 sm:w-20", px: 72 },
  xl: { class: "h-24 w-24 sm:h-28 sm:w-28", px: 104 },
};

export function NirmanLogo({
  size = "md",
  className = "",
  imageClassName = "",
  priority = false,
  alt = "NIRMAN",
}: NirmanLogoProps) {
  let dimensionPx = 48;
  let sizeClass = "";
  let inlineStyle: React.CSSProperties = {};

  if (typeof size === "number") {
    dimensionPx = size;
    inlineStyle = { width: size, height: size };
  } else {
    const matched = SIZE_MAP[size] || SIZE_MAP.md;
    dimensionPx = matched.px;
    sizeClass = matched.class;
  }

  return (
    <div
      style={inlineStyle}
      className={`relative shrink-0 select-none aspect-square rounded-full overflow-hidden bg-white shadow-xs border border-orange-500/20 ${sizeClass} ${className}`.trim()}
    >
      <Image
        src="/images/nirman-logo.png"
        alt={alt}
        width={dimensionPx * 2}
        height={dimensionPx * 2}
        priority={priority}
        className={`w-full h-full object-contain scale-[1.18] transition-transform ${imageClassName}`.trim()}
      />
    </div>
  );
}

export default NirmanLogo;
