export const NOTE_STORAGE_BUCKET = "study-notes";
export const MAX_NOTE_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_NOTE_ATTACHMENTS_PER_NOTE = 5;
export const MAX_USER_NOTE_ATTACHMENT_BYTES = 50 * 1024 * 1024;

export const NOTE_TITLE_REQUIRED_ERROR = "笔记标题不能为空。";
export const NOTE_TITLE_TOO_LONG_ERROR = "笔记标题不能超过 100 个字。";
export const NOTE_FILE_TOO_LARGE_ERROR = "单个文件不能超过 5MB。";
export const NOTE_FILE_TYPE_ERROR = "暂不支持该文件类型。";
export const NOTE_ATTACHMENT_LIMIT_ERROR = "每条笔记最多上传 5 个附件。";
export const NOTE_STORAGE_FULL_ERROR = "当前附件空间已满，请删除部分文件后再上传。";

const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const supportedFileTypes = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export type NoteInput = {
  title: string;
  content?: string | null;
  plan_id?: string | null;
  course_name?: string | null;
  tags?: string[] | null;
};

export type NormalizedNoteInput = {
  title: string;
  content: string | null;
  plan_id: string | null;
  course_name: string | null;
  tags: string[];
};

export function normalizeNoteInput(input: NoteInput): NormalizedNoteInput {
  const title = input.title.trim();

  if (!title) {
    throw new Error(NOTE_TITLE_REQUIRED_ERROR);
  }

  if (title.length > 100) {
    throw new Error(NOTE_TITLE_TOO_LONG_ERROR);
  }

  return {
    title,
    content: input.content?.trim() || null,
    plan_id: input.plan_id?.trim() || null,
    course_name: input.course_name?.trim() || null,
    tags: normalizeTags(input.tags ?? []),
  };
}

export function normalizeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.slice(0, 24)),
    ),
  ).slice(0, 8);
}

export function parseTagsInput(value: string) {
  return normalizeTags(value.split(/[,，\s]+/));
}

export function getNoteAttachmentType(mimeType: string): "image" | "file" | null {
  if (supportedImageTypes.has(mimeType)) {
    return "image";
  }

  if (supportedFileTypes.has(mimeType)) {
    return "file";
  }

  return null;
}

export function validateNoteAttachmentFile(file: File):
  | { ok: true; attachmentType: "image" | "file" }
  | { ok: false; error: string } {
  if (file.size > MAX_NOTE_ATTACHMENT_BYTES) {
    return { ok: false, error: NOTE_FILE_TOO_LARGE_ERROR };
  }

  const attachmentType = getNoteAttachmentType(file.type);

  if (!attachmentType) {
    return { ok: false, error: NOTE_FILE_TYPE_ERROR };
  }

  return { ok: true, attachmentType };
}

export function validateNoteAttachmentQuota({
  existingNoteAttachmentCount,
  existingUserAttachmentBytes,
  uploadingFileCount,
  uploadingBytes,
}: {
  existingNoteAttachmentCount: number;
  existingUserAttachmentBytes: number;
  uploadingFileCount: number;
  uploadingBytes: number;
}) {
  if (existingNoteAttachmentCount + uploadingFileCount > MAX_NOTE_ATTACHMENTS_PER_NOTE) {
    return NOTE_ATTACHMENT_LIMIT_ERROR;
  }

  if (existingUserAttachmentBytes + uploadingBytes > MAX_USER_NOTE_ATTACHMENT_BYTES) {
    return NOTE_STORAGE_FULL_ERROR;
  }

  return null;
}

export function buildNoteAttachmentPath(userId: string, noteId: string, fileName: string) {
  const safeName =
    fileName
      .split(/[\\/]/)
      .at(-1)
      ?.trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}._-]+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "") || "attachment";

  return `${userId}/${noteId}/${globalThis.crypto.randomUUID()}-${safeName}`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function getNoteSummary(content: string | null, maxLength = 120) {
  const normalized = content?.replace(/\s+/g, " ").trim() ?? "";

  if (!normalized) {
    return "暂无正文";
  }

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength)}...`
    : normalized;
}
