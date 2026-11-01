import { describe, expect, it } from "vitest";
import { searchIcons } from "./activity-icons";

describe("searchIcons", () => {
  it("matches icon names and the words behind them", () => {
    expect(searchIcons("karaoke")).toEqual(["mic-vocal"]);
    expect(searchIcons("movie")).toEqual(["film", "popcorn", "clapperboard"]);
  });

  it("returns every icon for an empty query", () => {
    expect(searchIcons(" ").length).toBeGreaterThan(280);
  });
});

// Things people do together, and the icon searching for each should offer. If one fails, add words
// to that icon in ACTIVITY_ICONS (or a new icon) rather than changing the expectation.
const ACTIVITIES: [activity: string, icon: string][] = [
  // Games
  ["board games", "dices"], ["dungeons and dragons", "dices"], ["poker", "poker-chip"], ["card games", "cards"],
  ["uno", "cards"], ["chess", "chess"], ["puzzles", "puzzle"], ["escape room", "puzzle"], ["video games", "gamepad-2"],
  ["arcade", "joystick"], ["lego", "toy-brick"], ["trivia night", "brain"], ["pub quiz", "brain"], ["bingo", "dices"],
  ["mahjong", "dices"], ["charades", "drama"], ["casino", "poker-chip"], ["laser tag", "target"], ["paintball", "target"],
  ["axe throwing", "target"], ["darts", "target"], ["go karting", "car"], ["bowling", "bowling"], ["mini golf", "golf"],
  ["pool", "pool"], ["billiards", "pool"], ["ping pong", "ping-pong"], ["table tennis", "ping-pong"], ["lan party", "gamepad-2"],
  // Parties and occasions
  ["birthday party", "cake"], ["house party", "party-popper"], ["clubbing", "party-popper"], ["dancing", "party-popper"],
  ["new year's eve", "confetti"], ["halloween", "ghost"], ["pumpkin carving", "pumpkin"], ["christmas", "christmas-tree"],
  ["gift exchange", "gift"], ["secret santa", "gift"], ["baby shower", "baby"], ["wedding", "rings"], ["bachelor party", "glass-champagne"],
  ["anniversary", "calendar-heart"], ["graduation", "graduation-cap"], ["housewarming", "house"], ["easter egg hunt", "egg"],
  ["thanksgiving dinner", "utensils"], ["potluck", "cooking-pot"], ["game night", "dices"], ["movie night", "popcorn"],
  ["sleepover", "bed"], ["prom", "crown"], ["costume party", "venetian-mask"], ["fireworks", "sparkles"],
  // Sports
  ["basketball", "basketball"], ["pickup basketball", "basketball"], ["baseball", "baseball"], ["softball", "baseball"],
  ["tennis", "tennis"], ["pickleball", "pickleball"], ["badminton", "tennis"], ["squash", "tennis"], ["soccer", "soccer"],
  ["football", "american-football"], ["flag football", "american-football"], ["rugby", "rugby-ball"], ["volleyball", "volleyball"],
  ["beach volleyball", "volleyball"], ["hockey", "goal"], ["cricket", "cricket"], ["golf", "golf"], ["disc golf", "disc-golf"],
  ["frisbee", "disc-golf"], ["ultimate frisbee", "disc-golf"], ["dodgeball", "handball"], ["archery", "bow-arrow"],
  ["fencing", "swords"], ["boxing", "hand-fist"], ["martial arts", "karate"], ["jiu jitsu", "karate"], ["wrestling", "karate"],
  ["watching the game", "tv"], ["sports bar", "beer"], ["tailgate", "american-football"], ["fantasy football", "american-football"],
  // Fitness
  ["gym", "dumbbell"], ["working out", "dumbbell"], ["weightlifting", "barbell"], ["crossfit", "barbell"], ["running", "run"],
  ["jogging", "run"], ["marathon", "medal"], ["5k", "run"], ["walking", "walk"], ["yoga", "yoga"], ["pilates", "stretching"],
  ["meditation", "yoga"], ["spin class", "bike"], ["cycling", "bike"], ["mountain biking", "bike"], ["swimming", "swimming"],
  ["jump rope", "jump-rope"], ["dance class", "party-popper"], ["zumba", "party-popper"], ["climbing", "mountain"],
  ["rock climbing", "mountain"], ["bouldering", "mountain"], ["skating", "roller-skating"], ["ice skating", "ice-skating"],
  ["roller skating", "roller-skating"], ["skateboarding", "skateboarding"], ["horseback riding", "horse"], ["tai chi", "yoga"],
  // Outdoors
  ["hiking", "mountain-snow"], ["camping", "tent"], ["backpacking", "backpack"], ["bonfire", "campfire"], ["campfire", "campfire"],
  ["picnic", "park"], ["beach day", "beach"], ["fishing", "fishing-rod"], ["hunting", "target"], ["birdwatching", "binoculars"],
  ["stargazing", "telescope"], ["sunset", "sunset"], ["sunrise hike", "sunrise"], ["gardening", "sprout"], ["foraging", "mushroom"],
  ["apple picking", "apple"], ["berry picking", "cherry"], ["pumpkin patch", "pumpkin"], ["farm visit", "tractor"],
  ["walk in the park", "park"], ["nature walk", "trees"], ["skiing", "skiing"], ["snowboarding", "snowboarding"],
  ["sledding", "snowflake"], ["snowball fight", "snowman"], ["surfing", "waves"], ["scuba diving", "scuba-diving"],
  ["snorkeling", "scuba-diving"], ["kayaking", "kayak"], ["canoeing", "kayak"], ["paddleboarding", "kayak"], ["rafting", "kayak"],
  ["sailing", "sailboat"], ["boating", "speedboat"], ["jet skiing", "speedboat"], ["skydiving", "parachute"], ["road trip", "car"],
  ["dog park", "dog"], ["zoo", "panda"], ["aquarium", "fish"], ["botanical garden", "flower"],
  // Food and drink
  ["coffee", "coffee"], ["brunch", "egg-fried"], ["breakfast", "egg-fried"], ["lunch", "sandwich"], ["dinner", "utensils"],
  ["restaurant", "utensils-crossed"], ["drinks", "martini"], ["happy hour", "beer"], ["bar", "martini"], ["pub", "beer"],
  ["brewery", "beer"], ["wine tasting", "wine"], ["winery", "grape"], ["cocktails", "martini"], ["tea", "teapot"],
  ["bubble tea", "cup-soda"], ["boba", "cup-soda"], ["ramen", "chopsticks"], ["sushi", "chopsticks"], ["pizza", "pizza"],
  ["burgers", "hamburger"], ["tacos", "utensils"], ["bbq", "grill"], ["barbecue", "grill"], ["cookout", "grill"],
  ["ice cream", "ice-cream-cone"], ["dessert", "dessert"], ["bakery", "croissant"], ["baking", "chef-hat"], ["cooking", "chef-hat"],
  ["cooking class", "chef-hat"], ["food truck", "utensils"], ["farmers market", "carrot"], ["grocery shopping", "groceries"],
  ["dim sum", "chopsticks"], ["hot pot", "cooking-pot"], ["korean bbq", "grill"], ["smoothies", "blender"], ["cheese board", "cheese"],
  ["champagne", "glass-champagne"], ["dinner party", "hand-platter"], ["food tour", "utensils"],
  // Shows and music
  ["movies", "film"], ["cinema", "popcorn"], ["netflix", "tv-minimal-play"], ["tv shows", "tv"], ["anime", "tv"],
  ["theater", "theater"], ["musical", "theater"], ["broadway", "theater"], ["ballet", "theater"], ["opera", "theater"],
  ["comedy show", "mic"], ["stand-up comedy", "mic"], ["open mic", "mic"], ["concert", "ticket"], ["music festival", "ticket"],
  ["karaoke", "mic-vocal"], ["jam session", "guitar"], ["band practice", "guitar-electric"], ["piano", "piano"], ["drums", "drum"],
  ["dj", "turntable"], ["record shopping", "disc-3"], ["listening party", "headphones"], ["podcast", "radio"], ["circus", "circus"],
  ["magic show", "wand-sparkles"], ["drag show", "spotlight"], ["sports game", "trophy"], ["live music", "music"],
  // Arts, learning and making
  ["photography", "camera"], ["photoshoot", "camera"], ["painting", "palette"], ["paint and sip", "palette"], ["drawing", "pencil"],
  ["pottery", "palette"], ["crafts", "scissors"], ["knitting", "spool"], ["crochet", "spool"], ["sewing", "needle-thread"],
  ["origami", "origami"], ["book club", "book-open"], ["reading", "book-open"], ["library", "library"], ["writing", "notebook-pen"],
  ["journaling", "notebook-pen"], ["poetry", "feather"], ["studying", "library"], ["class", "school"], ["lecture", "presentation"],
  ["workshop", "presentation"], ["language exchange", "languages"], ["coding", "code"], ["hackathon", "code"], ["museum", "landmark"],
  ["art gallery", "palette"], ["science center", "flask-conical"], ["planetarium", "telescope"], ["filming", "video"],
  ["vlogging", "video"], ["thrifting", "shirt"], ["fashion show", "shirt"],
  // Travel
  ["travel", "plane"], ["trip", "plane"], ["vacation", "luggage"], ["flight", "plane"], ["train ride", "train"],
  ["bus trip", "bus"], ["cruise", "ship"], ["ferry", "ship"], ["camping trip", "tent"], ["weekend getaway", "cottage"],
  ["cabin", "cottage"], ["staycation", "hotel"], ["sightseeing", "landmark"], ["city tour", "landmark"], ["paris", "eiffel-tower"],
  ["theme park", "roller-coaster"], ["amusement park", "roller-coaster"], ["county fair", "ferris-wheel"], ["carnival", "ferris-wheel"],
  ["castle", "castle"], ["lighthouse", "lighthouse"], ["gondola", "cable-car"], ["taxi", "car-taxi-front"], ["airport pickup", "plane"],
  // Home and life
  ["hanging out", "sofa"], ["chilling", "sofa"], ["visiting", "house"], ["babysitting", "baby"], ["dog walking", "dog"],
  ["pet sitting", "paw-print"], ["moving", "hand-helping"], ["helping move", "hand-helping"], ["diy", "hammer"],
  ["home improvement", "drill"], ["painting the house", "paint-roller"], ["fixing", "wrench"], ["car repair", "wrench"],
  ["shopping", "shopping-bag"], ["mall", "shopping-bag"], ["spa day", "massage"], ["massage", "massage"], ["nails", "sparkles"],
  ["haircut", "scissors"], ["doctor", "stethoscope"], ["budgeting", "piggy-bank"], ["errands", "shopping-cart"],
  // People and causes
  ["catch up", "message-circle"], ["phone call", "phone"], ["video call", "video"], ["date night", "heart"], ["first date", "heart"],
  ["volunteering", "heart-handshake"], ["charity run", "hand-heart"], ["fundraiser", "hand-heart"], ["church", "church"],
  ["mosque", "mosque"], ["prayer", "pray"], ["bible study", "church"], ["voting", "vote"], ["protest", "megaphone"],
  ["networking", "handshake"], ["work", "briefcase"], ["coworking", "laptop"], ["study group", "users"], ["family dinner", "utensils"],
  ["friends hangout", "friends"], ["pride", "rainbow"],
];

describe("activity icon coverage", () => {
  // In the picker's first row, so it's there without scrolling.
  it.each(ACTIVITIES)("searching %s offers %s", (activity, icon) => {
    expect(searchIcons(activity).slice(0, 6)).toContain(icon);
  });
});
