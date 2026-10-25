import { describe, expect, it } from "vitest";
import { fromDoc, mentionedIds, mentionToken, parseBody, syncWith, toDoc } from "./mentions";

describe("parseBody", () => {
  it("splits text and mentions in order", () => {
    expect(parseBody("Ramen with @[Sam Rivera](person:1) and @[Priya Shah](person:2).")).toEqual([
      { text: "Ramen with " },
      { mention: { id: 1, label: "Sam Rivera" } },
      { text: " and " },
      { mention: { id: 2, label: "Priya Shah" } },
      { text: "." },
    ]);
  });

  it("leaves a plain @ alone", () => {
    expect(parseBody("email me @ home")).toEqual([{ text: "email me @ home" }]);
  });
});

describe("mentionToken", () => {
  it("drops characters that would end the label early", () => {
    expect(parseBody(mentionToken(3, "Jo [the] Lee"))).toEqual([{ mention: { id: 3, label: "Jo [the Lee" } }]);
  });
});

describe("toDoc and fromDoc", () => {
  it("round-trip lines, blank lines, and mentions", () => {
    const body = "Coffee with @[Sam Rivera](person:1).\n\nThen a walk.";
    expect(fromDoc(toDoc(body))).toBe(body);
  });

  it("read \\r\\n line breaks as \\n", () => {
    expect(fromDoc(toDoc("one\r\ntwo"))).toBe("one\ntwo");
  });

  it("make one paragraph per line, with mentions as nodes", () => {
    expect(toDoc("Hi @[Sam](person:1)\n")).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hi " }, { type: "mention", attrs: { id: "1", label: "Sam" } }] },
        { type: "paragraph" },
      ],
    });
  });
});

describe("mentionedIds", () => {
  it("lists each person once", () => {
    expect(mentionedIds("@[Sam](person:1) and @[Priya](person:2), then @[Sam](person:1)")).toEqual([1, 2]);
  });
});

describe("syncWith", () => {
  it("drops someone a mention added once their last mention is gone", () => {
    expect(syncWith([1, 2], [2], [])).toEqual([1]);
  });

  it("keeps someone added by hand, mentioned or not", () => {
    expect(syncWith([1], [], [])).toEqual([1]);
  });

  it("keeps someone while another mention of them remains", () => {
    expect(syncWith([2], [2], [2])).toEqual([2]);
  });

  it("brings them back when the mention returns", () => {
    expect(syncWith([1], [2], [2])).toEqual([1, 2]);
  });
});
