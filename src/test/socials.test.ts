import { describe, expect, it } from "vitest";
import { SOCIAL_PLATFORMS, socialHref } from "@/components/site/icons";

describe("Social platforms", () => {
  it("allows TikTok as a social link platform", () => {
    expect(SOCIAL_PLATFORMS).toContain("tiktok");
  });

  it("preserves the owner's TikTok profile URL", () => {
    const url = "https://www.tiktok.com/@chozen";
    expect(socialHref("tiktok", url)).toBe(url);
  });
});