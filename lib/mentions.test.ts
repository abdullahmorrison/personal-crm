import { describe, expect, it } from "vitest";
import { fromDoc, mentionToken, parseBody, toDoc } from "./mentions";

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
