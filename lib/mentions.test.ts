import { describe, expect, it } from "vitest";
import { activityToken, fromDoc, linkedAfterHandEdit, mentionedActivityIds, mentionMatches, mentionedIds, mentionToken, parseBody, syncWith, toDoc } from "./mentions";

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

  it("reads activities apart from mentions", () => {
    expect(parseBody("/[Board games](activity:3) with @[Sam](person:1)")).toEqual([
      { activity: { id: 3, label: "Board games" } },
      { text: " with " },
      { mention: { id: 1, label: "Sam" } },
    ]);
  });

  it("leaves a plain / and mismatched tokens alone", () => {
    expect(parseBody("w/ Sam, and/or @[Sam](activity:1) /[Sam](person:1)")).toEqual([{ text: "w/ Sam, and/or @[Sam](activity:1) /[Sam](person:1)" }]);
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

describe("mentionedActivityIds", () => {
  it("lists each activity once, and no people", () => {
    expect(mentionedActivityIds(`${activityToken(3, "Hiking")} @[Sam](person:1) ${activityToken(3, "Hiking")} ${activityToken(4, "Pickleball")}`)).toEqual([3, 4]);
  });
});

describe("toDoc and fromDoc", () => {
  it("round-trip activities as / mentions", () => {
    const body = "/[Board games](activity:3) with @[Sam Rivera](person:1)";
    expect(toDoc(body).content?.[0].content?.[0]).toEqual({ type: "mention", attrs: { id: "3", label: "Board games", mentionSuggestionChar: "/" } });
    expect(fromDoc(toDoc(body))).toBe(body);
  });

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

describe("linkedAfterHandEdit", () => {
  it("unlinks someone added back by hand after their mention was deleted", () => {
    // Sam (2) was mentioned, then the mention deleted: out of "with" but still linked, for undo.
    const linked = linkedAfterHandEdit([2], [1], [1, 2]);
    expect(linked).toEqual([]);
    expect(syncWith([1, 2], linked, [])).toEqual([1, 2]);
  });

  it("unlinks someone removed by hand", () => {
    expect(linkedAfterHandEdit([2], [1, 2], [1])).toEqual([]);
  });

  it("keeps links for everyone else", () => {
    expect(linkedAfterHandEdit([2], [2], [2, 3])).toEqual([2]);
  });
});

describe("mentionMatches", () => {
  const people = [{ name: "Sam Rivera" }, { name: "Priya Shah" }, { name: "Jordan Lee" }, { name: "Samira Ali" }];

  it("offers the first few people for a bare @, in the order given", () => {
    expect(mentionMatches(people, "").map((p) => p.name)).toEqual(["Sam Rivera", "Priya Shah", "Jordan Lee"]);
  });

  it("matches the start of any name, ignoring case", () => {
    expect(mentionMatches(people, "sa").map((p) => p.name)).toEqual(["Sam Rivera", "Samira Ali"]);
    expect(mentionMatches(people, "LE").map((p) => p.name)).toEqual(["Jordan Lee"]);
  });

  it("doesn't match the middle of a name", () => {
    expect(mentionMatches(people, "iya")).toEqual([]);
  });
});
