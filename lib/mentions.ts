import type { JSONContent } from "@tiptap/core";

// A moment's body is plain text where a mention is `@[Sam Rivera](person:12)` and an activity is
// `/[Board games](activity:3)`, so it stays readable as Markdown and can become `[[Sam Rivera]]` on
// export. The editor works on a document of paragraphs.

const MENTION = /@\[([^\]\n]+)\]\(person:(\d+)\)|\/\[([^\]\n]+)\]\(activity:(\d+)\)/g;

type Ref = { id: number; label: string };
export type Segment = { text: string } | { mention: Ref } | { activity: Ref };

/** Splits a body into text, mentions, and activities, in order. */
export function parseBody(body: string): Segment[] {
  const segments: Segment[] = [];
  let at = 0;
  for (const m of body.matchAll(MENTION)) {
    if (m.index > at) segments.push({ text: body.slice(at, m.index) });
    segments.push(m[1] ? { mention: { id: Number(m[2]), label: m[1] } } : { activity: { id: Number(m[4]), label: m[3] } });
    at = m.index + m[0].length;
  }
  if (at < body.length) segments.push({ text: body.slice(at) });
  return segments;
}

/** What the @ and / menus offer: those with a word in their name starting with the query, in the given order, at most 3. */
export function mentionMatches<P extends { name: string }>(people: P[], query: string) {
  const q = query.toLowerCase();
  return people.filter((p) => p.name.toLowerCase().split(/\s+/).some((w) => w.startsWith(q))).slice(0, 3);
}

/** Everyone mentioned in a body, once each. */
export function mentionedIds(body: string) {
  return [...new Set(parseBody(body).flatMap((s) => ("mention" in s ? [s.mention.id] : [])))];
}

/** Every activity in a body, once each. */
export function mentionedActivityIds(body: string) {
  return [...new Set(parseBody(body).flatMap((s) => ("activity" in s ? [s.activity.id] : [])))];
}

/**
 * "with" (or "doing") after the body changes. `linked` are the people a mention put there: they leave
 * with their last mention and come back if it does (undo). Everyone else stays as chosen.
 */
export function syncWith(chosen: number[], linked: number[], mentioned: number[]) {
  const gone = linked.filter((id) => !mentioned.includes(id));
  const back = linked.filter((id) => mentioned.includes(id) && !chosen.includes(id));
  return [...chosen.filter((id) => !gone.includes(id)), ...back];
}

/** `linked` after "with" is changed by hand: anyone added or removed there is no longer tied to a mention. */
export function linkedAfterHandEdit(linked: number[], before: number[], after: number[]) {
  return linked.filter((id) => before.includes(id) && after.includes(id));
}

const clip = (label: string) => label.replace(/[\]\n]/g, "");

export function mentionToken(id: number, label: string) {
  return `@[${clip(label)}](person:${id})`;
}

export function activityToken(id: number, label: string) {
  return `/[${clip(label)}](activity:${id})`;
}

/** The editor document for a body: one paragraph per line. */
export function toDoc(body: string): JSONContent {
  return {
    type: "doc",
    content: body.split(/\r?\n/).map((line) => {
      const content = parseBody(line).map((s) =>
        "text" in s
          ? { type: "text", text: s.text }
          : "mention" in s
            ? { type: "mention", attrs: { id: String(s.mention.id), label: s.mention.label } }
            : { type: "mention", attrs: { id: String(s.activity.id), label: s.activity.label, mentionSuggestionChar: "/" } },
      );
      return content.length ? { type: "paragraph", content } : { type: "paragraph" };
    }),
  };
}

/** The body for an editor document: the inverse of toDoc. */
export function fromDoc(doc: JSONContent): string {
  return (doc.content ?? [])
    .map((p) =>
      (p.content ?? [])
        .map((n) => {
          if (n.type !== "mention") return n.text ?? "";
          const token = n.attrs?.mentionSuggestionChar === "/" ? activityToken : mentionToken;
          return token(Number(n.attrs?.id), String(n.attrs?.label ?? ""));
        })
        .join(""),
    )
    .join("\n");
}
