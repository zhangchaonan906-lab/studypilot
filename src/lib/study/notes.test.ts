import { describe, expect, it } from "vitest";
import {
  MAX_NOTE_ATTACHMENTS_PER_NOTE,
  MAX_NOTE_ATTACHMENT_BYTES,
  MAX_USER_NOTE_ATTACHMENT_BYTES,
  NOTE_ATTACHMENT_LIMIT_ERROR,
  NOTE_FILE_TOO_LARGE_ERROR,
  NOTE_FILE_TYPE_ERROR,
  NOTE_STORAGE_FULL_ERROR,
  NOTE_TITLE_REQUIRED_ERROR,
  NOTE_TITLE_TOO_LONG_ERROR,
  buildNoteAttachmentPath,
  getNoteAttachmentType,
  normalizeNoteInput,
  validateNoteAttachmentQuota,
  validateNoteAttachmentFile,
} from "./notes-core";

describe("note input validation", () => {
  it("normalizes a valid note input", () => {
    const result = normalizeNoteInput({
      title: "  高数错题整理  ",
      content: "第一章重点\n第二章例题",
      plan_id: "",
      course_name: "  高等数学  ",
      tags: ["  期末  ", "", "积分"],
    });

    expect(result).toEqual({
      title: "高数错题整理",
      content: "第一章重点\n第二章例题",
      plan_id: null,
      course_name: "高等数学",
      tags: ["期末", "积分"],
    });
  });

  it("rejects an empty title", () => {
    expect(() => normalizeNoteInput({ title: "   " })).toThrow(NOTE_TITLE_REQUIRED_ERROR);
  });

  it("rejects titles longer than 100 characters", () => {
    expect(() => normalizeNoteInput({ title: "学".repeat(101) })).toThrow(
      NOTE_TITLE_TOO_LONG_ERROR,
    );
  });
});

describe("note attachment validation", () => {
  it("accepts supported images", () => {
    const file = new File(["image"], "diagram.png", { type: "image/png" });

    expect(getNoteAttachmentType(file.type)).toBe("image");
    expect(validateNoteAttachmentFile(file)).toEqual({
      ok: true,
      attachmentType: "image",
    });
  });

  it("accepts supported study files", () => {
    const file = new File(["pdf"], "chapter.pdf", { type: "application/pdf" });

    expect(getNoteAttachmentType(file.type)).toBe("file");
    expect(validateNoteAttachmentFile(file)).toEqual({
      ok: true,
      attachmentType: "file",
    });
  });

  it("rejects files over 5MB", () => {
    const file = new File([new Blob([new Uint8Array(MAX_NOTE_ATTACHMENT_BYTES + 1)])], "big.pdf", {
      type: "application/pdf",
    });

    expect(validateNoteAttachmentFile(file)).toEqual({
      ok: false,
      error: NOTE_FILE_TOO_LARGE_ERROR,
    });
    expect(MAX_NOTE_ATTACHMENT_BYTES).toBe(5 * 1024 * 1024);
  });

  it("rejects unsupported executable or script files", () => {
    const file = new File(["alert(1)"], "script.js", { type: "application/javascript" });

    expect(validateNoteAttachmentFile(file)).toEqual({
      ok: false,
      error: NOTE_FILE_TYPE_ERROR,
    });
  });

  it("builds storage paths under the current user and note", () => {
    expect(buildNoteAttachmentPath("user-1", "note-1", "课堂 资料.pdf")).toMatch(
      /^user-1\/note-1\/[a-z0-9-]+-课堂-资料\.pdf$/,
    );
  });

  it("rejects uploads that would exceed 5 attachments on one note", () => {
    expect(MAX_NOTE_ATTACHMENTS_PER_NOTE).toBe(5);
    expect(
      validateNoteAttachmentQuota({
        existingNoteAttachmentCount: 4,
        existingUserAttachmentBytes: 0,
        uploadingFileCount: 2,
        uploadingBytes: 1024,
      }),
    ).toBe(NOTE_ATTACHMENT_LIMIT_ERROR);
  });

  it("rejects uploads that would exceed the user's 50MB attachment space", () => {
    expect(MAX_USER_NOTE_ATTACHMENT_BYTES).toBe(50 * 1024 * 1024);
    expect(
      validateNoteAttachmentQuota({
        existingNoteAttachmentCount: 0,
        existingUserAttachmentBytes: MAX_USER_NOTE_ATTACHMENT_BYTES - 1,
        uploadingFileCount: 1,
        uploadingBytes: 2,
      }),
    ).toBe(NOTE_STORAGE_FULL_ERROR);
  });

  it("allows uploads that fit both note and user attachment limits", () => {
    expect(
      validateNoteAttachmentQuota({
        existingNoteAttachmentCount: 4,
        existingUserAttachmentBytes: MAX_USER_NOTE_ATTACHMENT_BYTES - MAX_NOTE_ATTACHMENT_BYTES,
        uploadingFileCount: 1,
        uploadingBytes: MAX_NOTE_ATTACHMENT_BYTES,
      }),
    ).toBeNull();
  });
});
