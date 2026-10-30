import { describe, expect, it } from "vitest";
import { uploadContentType, validateUpload, type Bucket } from "@/lib/media";

describe("Upload validation", () => {
  it.each([
    ["portrait.JPG", "images", "image/jpeg"],
    ["cover.png", "images", "image/png"],
    ["book.pdf", "files", "application/pdf"],
    ["book.epub", "files", "application/epub+zip"],
    ["source.zip", "files", "application/zip"],
    ["notes.txt", "files", "text/plain"],
    ["receipt.pdf", "receipts", "application/pdf"],
  ] as const)("accepts %s without a device MIME type", (name, bucket, type) => {
    const file = new File(["sample"], name, { type: "" });
    expect(validateUpload(file, bucket)).toBeNull();
    expect(uploadContentType(file)).toBe(type);
  });
  it("normalizes generic document types", () => {
    const file = new File(["sample"], "book.pdf", { type: "application/octet-stream" });
    expect(validateUpload(file, "files")).toBeNull();
    expect(uploadContentType(file)).toBe("application/pdf");
  });
  it("rejects unsupported and mismatched file types", () => {
    expect(validateUpload(new File(["sample"], "program.exe"), "files")).not.toBeNull();
    expect(
      validateUpload(new File(["sample"], "photo.jpg", { type: "application/pdf" }), "images"),
    ).not.toBeNull();
  });
  it.each([
    ["images", 5],
    ["files", 50],
    ["receipts", 10],
  ] as const)("preserves the %s size limit", (bucket: Bucket, mb: number) => {
    const name = bucket === "images" ? "photo.png" : "file.pdf";
    const file = new File(["sample"], name);
    Object.defineProperty(file, "size", { value: mb * 1024 * 1024, configurable: true });
    expect(validateUpload(file, bucket)).toBeNull();
    Object.defineProperty(file, "size", { value: mb * 1024 * 1024 + 1 });
    expect(validateUpload(file, bucket)).not.toBeNull();
  });
  it("does not accept document-only formats as receipts", () => {
    expect(validateUpload(new File(["sample"], "source.zip"), "receipts")).not.toBeNull();
  });
});
