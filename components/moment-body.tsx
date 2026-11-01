import { parseBody } from "@/lib/mentions";
import { firstName } from "@/lib/names";
import { personColor } from "@/lib/person-colors";

type Person = { id: number; name: string; color: number };
type Activity = { id: number; name: string };

/** How an activity reads in a moment's text. */
export const ACTIVITY_TEXT = "underline decoration-muted decoration-dotted decoration-1 underline-offset-[0.3em]";

/**
 * A moment's text, with each mention as the person's first name in their color and each activity
 * underlined. `people` and `activities` are those it mentions.
 */
export function MomentBody({ body, people, activities }: { body: string; people: Person[]; activities: Activity[] }) {
  return parseBody(body).map((s, i) => {
    if ("text" in s) return s.text;
    if ("activity" in s) {
      const a = activities.find((x) => x.id === s.activity.id);
      return (
        <span key={i} className={ACTIVITY_TEXT}>
          {a?.name ?? s.activity.label}
        </span>
      );
    }
    const p = people.find((x) => x.id === s.mention.id);
    return (
      <span key={i} className={`font-medium ${p ? personColor(p.color).ink : ""}`}>
        {firstName(p?.name ?? s.mention.label)}
      </span>
    );
  });
}
