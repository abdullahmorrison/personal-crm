type Props = {
  /** Height in px at the default 16px font; it grows with the app's font size. The mark is 22/13 as wide. */
  size?: number;
  /** "splash" grows the mark once; "loader" grows it, holds, shrinks it back, and repeats. */
  motion?: "none" | "splash" | "loader";
  label?: string;
  className?: string;
};

/** The Temory mark: closeness bands rising from you, as on the People screen, with two people placed in them. */
export function TemoryMark({ size = 32, motion = "none", label = "Temory", className = "" }: Props) {
  const motionClass = motion === "none" ? "" : `temory-mark-${motion}`;
  return (
    <svg
      viewBox="4 28 88 52"
      width={`${(size * 22) / 13 / 16}rem`}
      height={`${size / 16}rem`}
      role="img"
      aria-label={label}
      className={`temory-mark ${motionClass} ${className}`}
    >
      <path className="band band-3" d="M4 80 A44 44 0 0 1 92 80 Z" />
      <path className="band band-2" d="M18 80 A30 30 0 0 1 78 80 Z" />
      <path className="band band-1" d="M32 80 A16 16 0 0 1 64 80 Z" />
      <circle className="person person-1" cx="24" cy="52" r="5.5" />
      <circle className="person person-2" cx="66" cy="34" r="4.5" />
    </svg>
  );
}
