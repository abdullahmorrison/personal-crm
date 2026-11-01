import { describe, expect, it } from "vitest";
import { searchIcons } from "./activity-icons";

describe("searchIcons", () => {
  it("matches icon names and the words behind them", () => {
    expect(searchIcons("karaoke")).toEqual(["mic-vocal"]);
    expect(searchIcons("movie")).toEqual(["film", "popcorn", "clapperboard"]);
  });

  it("returns every icon for an empty query", () => {
    expect(searchIcons(" ").length).toBeGreaterThan(200);
  });
});
