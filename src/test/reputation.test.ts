import { describe, expect, it } from "vitest";
import { level } from "@/lib/reputation";

describe("levels", () => {
  it("Newcomer under 10, Helper from 10, Trusted from 50", () => {
    expect(level(9)).toBe("Newcomer");
    expect(level(10)).toBe("Helper");
    expect(level(49)).toBe("Helper");
    expect(level(50)).toBe("Trusted");
  });
});
