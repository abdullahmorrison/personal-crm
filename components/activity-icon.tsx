import {
  Backpack, Beer, Bike, BookOpen, Camera, ChefHat, Coffee, Dices, Dog, Drama, Dumbbell, Film, Fish, Footprints,
  Gamepad2, Guitar, Headphones, HeartHandshake, type LucideProps, Martini, MicVocal, Mountain, MountainSnow, Palette,
  PartyPopper, Pizza, Plane, Popcorn, Sailboat, Tent, Ticket, TreePine, Trophy, Tv, Utensils, Wine,
} from "lucide-react";
import type { ActivityIcon as Key } from "@/lib/activity-icons";

/** Lucide has no pickleball paddle, so this one is drawn in its style (from the Figma icon). */
function Pickleball({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.76 4.16 15.12 3.01C13.09 1.59 10.28 2.08 8.86 4.12L7.13 6.57C5.71 8.61 6.2 11.42 8.24 12.84L9.88 13.99C11.91 15.41 14.72 14.92 16.15 12.88L17.87 10.43C19.29 8.39 18.8 5.58 16.76 4.16Z" />
      <path d="M7.83 12.55 4.68 17.06C4.21 17.74 4.37 18.68 5.04 19.15 5.72 19.62 6.66 19.46 7.13 18.78L10.29 14.28" />
      <circle cx="18.5" cy="18.5" r="2.5" />
      <path d="M18.5 18.5h.01" />
    </svg>
  );
}

const ICONS: Record<Key, React.ComponentType<LucideProps>> = {
  dices: Dices,
  pickleball: Pickleball,
  "party-popper": PartyPopper,
  "gamepad-2": Gamepad2,
  "mountain-snow": MountainSnow,
  mountain: Mountain,
  backpack: Backpack,
  dumbbell: Dumbbell,
  bike: Bike,
  tent: Tent,
  footprints: Footprints,
  trophy: Trophy,
  martini: Martini,
  wine: Wine,
  beer: Beer,
  coffee: Coffee,
  utensils: Utensils,
  pizza: Pizza,
  "chef-hat": ChefHat,
  film: Film,
  popcorn: Popcorn,
  tv: Tv,
  drama: Drama,
  "mic-vocal": MicVocal,
  headphones: Headphones,
  guitar: Guitar,
  ticket: Ticket,
  plane: Plane,
  camera: Camera,
  palette: Palette,
  "book-open": BookOpen,
  dog: Dog,
  "tree-pine": TreePine,
  sailboat: Sailboat,
  fish: Fish,
  "heart-handshake": HeartHandshake,
};

/** An activity's icon. Unknown keys (from an older version of the list) fall back to the party popper. */
export function ActivityIcon({ icon, ...props }: { icon: string } & LucideProps) {
  const Icon = ICONS[icon as Key] ?? PartyPopper;
  return <Icon {...props} />;
}

/** The icon in its rounded square, as on the list, the profile, and the form. */
export function ActivityBadge({ icon, size = "md" }: { icon: string; size?: "md" | "lg" }) {
  return (
    <span className={`flex shrink-0 items-center justify-center bg-surface text-ink ${size === "lg" ? "size-14 rounded-2xl" : "size-10 rounded-xl"}`}>
      <ActivityIcon icon={icon} size={size === "lg" ? "1.5rem" : "1.25rem"} strokeWidth={1.75} />
    </span>
  );
}
