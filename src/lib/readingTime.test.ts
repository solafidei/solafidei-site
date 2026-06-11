import { describe, expect, it } from "vitest";

import { countWords, readingTime } from "./readingTime";

describe("readingTime", () => {
  it("returns '< 1 min read' for 0 words", () => {
    expect(readingTime(0)).toBe("< 1 min read");
  });

  it("returns '< 1 min read' for 149 words", () => {
    expect(readingTime(149)).toBe("< 1 min read");
  });

  it("returns '1 min read' for 150 words", () => {
    expect(readingTime(150)).toBe("1 min read");
  });

  it("returns '1 min read' for 200 words", () => {
    expect(readingTime(200)).toBe("1 min read");
  });

  it("returns '2 min read' for 201 words", () => {
    expect(readingTime(201)).toBe("2 min read");
  });

  it("returns '2 min read' for 400 words", () => {
    expect(readingTime(400)).toBe("2 min read");
  });
});

describe("countWords", () => {
  it("counts whitespace-delimited words", () => {
    expect(countWords("hello world")).toBe(2);
  });

  it("returns 0 for empty or whitespace-only text", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n\t  ")).toBe(0);
  });

  it("ignores extra whitespace between words", () => {
    expect(countWords("  one   two\nthree  ")).toBe(3);
  });
});
