// The icons an activity can have, in the order the picker shows them. Each has words to search by.
export const ACTIVITY_ICONS = {
  dices: "dice board games",
  pickleball: "pickleball paddle tennis racket",
  "party-popper": "party clubbing celebrate",
  "gamepad-2": "video games console",
  "mountain-snow": "hiking mountain snow",
  mountain: "climbing mountain",
  backpack: "backpacking travel",
  dumbbell: "gym workout lifting",
  bike: "cycling bike",
  tent: "camping tent",
  footprints: "walk walking running",
  trophy: "sports competition trophy",
  martini: "cocktails drinks bar",
  wine: "wine drinks",
  beer: "beer drinks pub",
  coffee: "coffee cafe",
  utensils: "dinner food restaurant",
  pizza: "pizza food",
  "chef-hat": "cooking baking",
  film: "movies film",
  popcorn: "movies cinema",
  tv: "tv shows watching",
  drama: "theater drama",
  "mic-vocal": "karaoke singing",
  headphones: "music listening",
  guitar: "music playing guitar jam",
  ticket: "concerts events tickets",
  plane: "travel trips flying",
  camera: "photography camera",
  palette: "art painting",
  "book-open": "reading book club",
  dog: "dog walking pets",
  "tree-pine": "outdoors nature park",
  sailboat: "sailing boat",
  fish: "fishing",
  "heart-handshake": "volunteering helping",
} as const;

export type ActivityIcon = keyof typeof ACTIVITY_ICONS;

export const DEFAULT_ACTIVITY_ICON: ActivityIcon = "party-popper";

export function isActivityIcon(key: string): key is ActivityIcon {
  return Object.hasOwn(ACTIVITY_ICONS, key);
}

/** Icons whose name or words contain the query, in picker order. */
export function searchIcons(query: string) {
  const q = query.trim().toLowerCase();
  return (Object.keys(ACTIVITY_ICONS) as ActivityIcon[]).filter((k) => !q || k.includes(q) || ACTIVITY_ICONS[k].includes(q));
}
