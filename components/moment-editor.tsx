"use client";

import Document from "@tiptap/extension-document";
import Mention from "@tiptap/extension-mention";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Placeholder, UndoRedo } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import { useLayoutEffect, useRef, useState } from "react";
import { fromDoc, mentionMatches, toDoc } from "@/lib/mentions";
import { firstName } from "@/lib/names";
import { personColor } from "@/lib/person-colors";

type Person = { id: number; name: string; color: number };

type Props = {
  people: Person[];
  defaultValue?: string;
  autoFocus?: boolean;
  /** Someone was mentioned: they belong in "with". */
  onMention: (person: Person) => void;
  /** The body changed, so mentions may have come or gone. */
  onChange: (body: string) => void;
};

/**
 * What happened, in the serif. Typing @ opens a menu of people; picking one puts their name
 * in the text in their color. Posts the body, with mentions as tokens, as the `body` field.
 */
export function MomentEditor({ people, defaultValue = "", autoFocus, onMention, onChange }: Props) {
  const [body, setBody] = useState(defaultValue);
  const [menu, setMenu] = useState<{ props: SuggestionProps<Person>; selected: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  // The editor is built once, so its callbacks read the latest values through a ref.
  const latest = useRef({ people, onMention, onChange, menu });
  useLayoutEffect(() => {
    latest.current = { people, onMention, onChange, menu };
  });

  const pick = (props: SuggestionProps<Person>, person: Person) => {
    props.command({ id: String(person.id), label: person.name });
    latest.current.onMention(person);
  };

  // The lint rule can't tell that the editor only calls these back on input, never while rendering.
  /* eslint-disable react-hooks/refs */
  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    content: toDoc(defaultValue),
    extensions: [
      Document,
      Paragraph,
      Text,
      UndoRedo,
      Placeholder.configure({ placeholder: "What happened?" }),
      Mention.configure({
        renderText: ({ node }) => firstName(node.attrs.label),
        renderHTML: ({ node }) => {
          const p = latest.current.people.find((x) => String(x.id) === node.attrs.id);
          return ["span", { class: `font-medium ${p ? personColor(p.color).ink : ""}`, "data-person": node.attrs.id }, firstName(p?.name ?? node.attrs.label)];
        },
        suggestion: {
          decorationClass: "text-accent",
          items: ({ query }) => mentionMatches(latest.current.people, query),
          render: () => ({
            onStart: (props) => setMenu({ props, selected: 0 }),
            onUpdate: (props) => setMenu((m) => ({ props, selected: Math.min(m?.selected ?? 0, Math.max(props.items.length - 1, 0)) })),
            onExit: () => setMenu(null),
            onKeyDown: ({ event }: SuggestionKeyDownProps) => {
              const m = latest.current.menu;
              if (!m?.props.items.length) return false;
              const n = m.props.items.length;
              const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
              if (step) {
                setMenu({ ...m, selected: (m.selected + step + n) % n });
                return true;
              }
              if (event.key === "Enter" || event.key === "Tab") {
                pick(m.props, m.props.items[m.selected]);
                return true;
              }
              return false;
            },
          }),
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-48 font-serif text-[19px] leading-8 outline-none",
        "aria-label": "What happened?",
      },
    },
    onUpdate: ({ editor }) => {
      const next = fromDoc(editor.getJSON());
      setBody(next);
      latest.current.onChange(next);
    },
  });
  /* eslint-enable react-hooks/refs */

  return (
    <div ref={wrap} className="relative mt-7">
      <EditorContent editor={editor} />
      <input type="hidden" name="body" value={body} />
      {menu && menu.props.items.length > 0 && <Menu wrap={wrap} props={menu.props} selected={menu.selected} onPick={(o) => pick(menu.props, o)} />}
    </div>
  );
}

/** A dark row of names under the line being typed, with a caret pointing at the @. */
function Menu({
  wrap,
  props,
  selected,
  onPick,
}: {
  wrap: React.RefObject<HTMLDivElement | null>;
  props: SuggestionProps<Person>;
  selected: number;
  onPick: (person: Person) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState({ top: 0, left: 0, caret: 0 });

  // Sits under the @, kept inside the editor's width; the caret stays over the @ when the row is pushed left.
  useLayoutEffect(() => {
    const at = props.clientRect?.();
    const box = wrap.current?.getBoundingClientRect();
    if (!at || !box || !ref.current) return;
    const x = at.left - box.left;
    const left = Math.max(0, Math.min(x - 12, box.width - ref.current.offsetWidth));
    setPlace({ top: at.bottom - box.top + 10, left, caret: x - left });
  }, [props, wrap]);

  return (
    <div ref={ref} role="listbox" aria-label="Mention someone" className="absolute z-10 flex gap-0.5 rounded-[10px] bg-ink p-1 font-sans text-[13px] text-paper shadow-[0_8px_24px_rgba(90,74,58,0.14)]" style={{ top: place.top, left: place.left }}>
      <svg width="12" height="6" viewBox="0 0 12 6" aria-hidden className="absolute -top-1.5 fill-ink" style={{ left: place.caret }}>
        <path d="M0 6 6 0l6 6z" />
      </svg>
      {props.items.map((p, i) => (
        <button
          key={p.id}
          type="button"
          role="option"
          aria-selected={i === selected}
          onMouseDown={(e) => e.preventDefault()} // keep the caret in the text
          onClick={() => onPick(p)}
          className={`rounded-[7px] px-2.5 py-1 whitespace-nowrap ${i === selected ? "bg-white/15 font-medium" : "hover:bg-white/10"}`}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
