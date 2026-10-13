import { describe, expect, it } from "vitest";

import { findPii } from "@/lib/pii";

describe("personal info check", () => {
  it("flags emails", () => expect(findPii("write to anna.k@gmail.com")).toContain("email address"));
  it("flags Swiss phone numbers", () => {
    expect(findPii("call 079 123 45 67")).toContain("phone number");
    expect(findPii("call +41 79 123 45 67")).toContain("phone number");
  });
  it("flags birth dates", () => expect(findPii("born 12.03.1985")).toContain("birth date"));
  it("flags titled and named people", () => {
    expect(findPii("Mrs Hoxha said")).toContain("full name");
    expect(findPii("the patient named Amina Yusuf")).toContain("full name");
  });
  it("lets case-code-only text through", () => expect(findPii("Case MB-2041 preferred a female interpreter in Swiss German clinics.")).toEqual([]));
});
