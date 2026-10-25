import type { JSONContent } from "@tiptap/core";

// A moment's body is plain text where a mention is `@[Sam Rivera](person:12)`, so it stays readable
// as Markdown and can become `[[Sam Rivera]]` on export. The editor works on a document of paragraphs.

const MENTION = /@\[([^\]\n]+)\]\(person:(\d+)\)/g;

export type Segment = { text: string } | { mention: { id: number; label: string } };

/** Splits a body into text and mentions, in order. */
export function parseBody(body: string): Segment[] {
  const segments: Segment[] = [];
  let at = 0;
  for (const m of body.matchAll(MENTION)) {
    if (m.index > at) segments.push({ text: body.slice(at, m.index) });
    segments.push({ mention: { id: Number(m[2]), label: m[1] } });
    at = m.index + m[0].length;
  }
  if (at < body.length) segments.push({ text: body.slice(at) });
  return segments;
}

/** Everyone mentioned in a body, once each. */
export function mentionedIds(body: string) {
  return [...new Set(parseBody(body).flatMap((s) => ("mention" in s ? [s.mention.id] : [])))];
}

/**
 * "with" after the body changes. `linked` are the people a mention put there: they leave with their
 * last mention and come back if it does (undo). Everyone else stays as chosen.
 */
export function syncWith(chosen: number[], linked: number[], mentioned: number[]) {
  const gone = linked.filter((id) => !mentioned.includes(id));
  const back = linked.filter((id) => mentioned.includes(id) && !chosen.includes(id));
  return [...chosen.filter((id) => !gone.includes(id)), ...back];
}

export function mentionToken(id: number, label: string) {
  return `@[${label.replace(/[\]\n]/g, "")}](person:${id})`;
}

/** The editor document for a body: one paragraph per line. */
export function toDoc(body: string): JSONContent {
  return {
    type: "doc",
    content: body.split(/\r?\n/).map((line) => {
      const content = parseBody(line).map((s) =>
        "text" in s ? { type: "text", text: s.text } : { type: "mention", attrs: { id: String(s.mention.id), label: s.mention.label } },
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
        .map((n) => (n.type === "mention" ? mentionToken(Number(n.attrs?.id), String(n.attrs?.label ?? "")) : (n.text ?? "")))
        .join(""),
    )
    .join("\n");
}
