import { useId } from "react";

type Props = {
  /** Height in px; the mark is 1.5 times as wide. */
  size?: number;
  /** "splash" draws the mark once; "loader" draws it, pulls the thread through, and repeats. */
  motion?: "none" | "splash" | "loader";
  label?: string;
  className?: string;
};

/** The Temory mark: a knotted thread woven under, then over, the bar of a T. */
export function TemoryMark({ size = 32, motion = "none", label = "Temory", className = "" }: Props) {
  const mask = `temory-under-${useId().replace(/[^\w-]/g, "")}`;
  const motionClass = motion === "none" ? "" : `temory-mark-${motion}`;
  return (
    <svg
      viewBox="2 16.67 92 61.33"
      width={size * 1.5}
      height={size}
      role="img"
      aria-label={label}
      className={`temory-mark ${motionClass} ${className}`}
    >
      {/* Hides the thread where it passes under the bar. */}
      <mask id={mask} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
        <rect x="-10" y="-10" width="120" height="120" fill="#fff" />
        <circle cx="40" cy="38" r="10" fill="#000" />
      </mask>
      <path className="bar" pathLength={1} d="M14 38 H78" />
      <g mask={`url(#${mask})`}>
        <path
          className="thread"
          pathLength={1}
          d="M14 38 C20 20 32 20 40 38 C44 50 42 70 50 70 C58 70 56 50 60 38 C68 20 80 20 86 38"
        />
      </g>
      <circle className="knot" cx="14" cy="38" r="7" />
    </svg>
  );
}
