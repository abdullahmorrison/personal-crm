import { parseBody } from "@/lib/mentions";
import { firstName } from "@/lib/names";
import { personColor } from "@/lib/person-colors";

type Person = { id: number; name: string; color: number };

/** A moment's text, with each mention as the person's first name in their color. */
export function MomentBody({ body, people }: { body: string; people: Person[] }) {
  return parseBody(body).map((s, i) => {
    if ("text" in s) return s.text;
    const p = people.find((x) => x.id === s.mention.id);
    return (
      <span key={i} className={`font-medium ${p ? personColor(p.color).ink : ""}`}>
        {firstName(p?.name ?? s.mention.label)}
      </span>
    );
  });
}
