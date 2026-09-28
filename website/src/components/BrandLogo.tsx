import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  /** Image height in pixels */
  height?: number;
  priority?: boolean;
}

export default function BrandLogo({
  className = "",
  height = 48,
  priority = false,
}: BrandLogoProps) {
  // logo.png is 373×669 (portrait) — keep aspect ratio
  const width = Math.round(height * (373 / 669));

  return (
    <Image
      src="/logo.png"
      alt="Netgen"
      width={width}
      height={height}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
