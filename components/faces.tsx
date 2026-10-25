import { initials } from "@/lib/names";
import { personColor } from "@/lib/person-colors";

type Face = { id: number; name: string; color: number };

/** Small overlapping avatars for the people in a moment. */
export function Faces({ people, max = 3 }: { people: Face[]; max?: number }) {
  if (people.length === 0) return null;
  return (
    <span className="flex -space-x-1.5">
      {people.slice(0, max).map((p) => {
        const c = personColor(p.color);
        return (
          <span
            key={p.id}
            title={p.name}
            className={`flex size-6 items-center justify-center rounded-full font-serif text-[10px] ring-[1.5px] ring-paper ${c.fill} ${c.ink}`}
          >
            {initials(p.name)}
          </span>
        );
      })}
    </span>
  );
}
