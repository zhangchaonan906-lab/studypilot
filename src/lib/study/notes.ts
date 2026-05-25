import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Plan } from "./types";

export const NOTE_STORAGE_BUCKET = "study-notes";
export const MAX_NOTE_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_NOTE_ATTACHMENTS_PER_NOTE = 5;
export const MAX_USER_NOTE_ATTACHMENT_BYTES = 50 * 1024 * 1024;

export const NOTE_TITLE_REQUIRED_ERROR = "笔记标题不能为空。";
export const NOTE_TITLE_TOO_LONG_ERROR = "笔记标题不能超过 100 个字。";
export const NOTE_SAVE_ERROR = "笔记保存失败，请稍后重试。";
export const NOTE_READ_ERROR = "读取笔记失败，请稍后重试。";
export const NOTE_DELETE_ERROR = "删除笔记失败，请稍后重试。";
export const NOTE_NOT_FOUND_ERROR = "笔记不存在或无权访问。";
export const NOTE_UPLOAD_ERROR = "文件上传失败，请稍后重试。";
export const NOTE_FILE_TOO_LARGE_ERROR = "单个文件不能超过 5MB。";
export const NOTE_FILE_TYPE_ERROR = "暂不支持该文件类型。";
export const NOTE_ATTACHMENT_NOT_FOUND_ERROR = "附件不存在或无权访问。";
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

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  plan_id: string | null;
  course_name: string | null;
  tags: string[];
  created_at: string | null;
  updated_at: string | null;
};

export type NoteAttachment = {
  id: string;
  user_id: string;
  note_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string | null;
  attachment_type: "image" | "file";
  created_at: string | null;
};

export type NoteAttachmentWithUrl = NoteAttachment & {
  signed_url: string;
};

export type NoteListItem = Note & {
  attachment_count: number;
  plan: Pick<Plan, "id" | "title"> | null;
};

export type NoteDetail = Note & {
  plan: Pick<Plan, "id" | "title"> | null;
  attachments: NoteAttachmentWithUrl[];
};

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

async function getAuthenticatedContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { supabase, userId: user.id };
}

function throwSafe(error: { message?: string } | null, fallback: string) {
  if (error) {
    throw new Error(fallback);
  }
}

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

export async function getNotes(searchQuery = ""): Promise<NoteListItem[]> {
  const { supabase, userId } = await getAuthenticatedContext();
  return getNotesForUser(supabase, userId, searchQuery);
}

export async function getNotesForUser(
  supabase: SupabaseClient,
  userId: string,
  searchQuery = "",
): Promise<NoteListItem[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  throwSafe(error, NOTE_READ_ERROR);

  const notes = ((data ?? []) as Note[]).filter((note) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      note.title.toLowerCase().includes(query) ||
      (note.content ?? "").toLowerCase().includes(query)
    );
  });

  if (notes.length === 0) {
    return [];
  }

  const noteIds = notes.map((note) => note.id);
  const { data: attachments, error: attachmentError } = await supabase
    .from("note_attachments")
    .select("note_id")
    .eq("user_id", userId)
    .in("note_id", noteIds);

  throwSafe(attachmentError, NOTE_READ_ERROR);

  const counts = new Map<string, number>();
  for (const attachment of (attachments ?? []) as Array<Pick<NoteAttachment, "note_id">>) {
    counts.set(attachment.note_id, (counts.get(attachment.note_id) ?? 0) + 1);
  }

  const planIds = Array.from(
    new Set(notes.map((note) => note.plan_id).filter((planId): planId is string => Boolean(planId))),
  );
  const plansById = new Map<string, Pick<Plan, "id" | "title">>();

  if (planIds.length > 0) {
    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select("id,title")
      .eq("user_id", userId)
      .in("id", planIds);

    throwSafe(plansError, NOTE_READ_ERROR);

    for (const plan of (plans ?? []) as Array<Pick<Plan, "id" | "title">>) {
      plansById.set(plan.id, plan);
    }
  }

  return notes.map((note) => ({
    ...note,
    attachment_count: counts.get(note.id) ?? 0,
    plan: note.plan_id ? (plansById.get(note.plan_id) ?? null) : null,
  }));
}

export async function getNoteDetail(noteId: string): Promise<NoteDetail | null> {
  const { supabase, userId } = await getAuthenticatedContext();
  return getNoteDetailForUser(supabase, userId, noteId);
}

export async function getNoteDetailForUser(
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
): Promise<NoteDetail | null> {
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", userId)
    .maybeSingle();

  throwSafe(error, NOTE_READ_ERROR);

  if (!note) {
    return null;
  }

  const typedNote = note as Note;
  const [{ data: attachments, error: attachmentError }, plan] = await Promise.all([
    supabase
      .from("note_attachments")
      .select("*")
      .eq("note_id", noteId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    typedNote.plan_id ? getPlanForNote(supabase, userId, typedNote.plan_id) : null,
  ]);

  throwSafe(attachmentError, NOTE_READ_ERROR);

  const signedAttachments = await Promise.all(
    ((attachments ?? []) as NoteAttachment[]).map(async (attachment) => ({
      ...attachment,
      signed_url: await createSignedUrlForAttachment(supabase, attachment),
    })),
  );

  return {
    ...typedNote,
    plan,
    attachments: signedAttachments,
  };
}

export async function createNote(input: NoteInput): Promise<Note> {
  const { supabase, userId } = await getAuthenticatedContext();
  return createNoteForUser(supabase, userId, input);
}

export async function createNoteForUser(
  supabase: SupabaseClient,
  userId: string,
  input: NoteInput,
): Promise<Note> {
  const normalized = normalizeNoteInput(input);
  await ensurePlanBelongsToUserIfPresent(supabase, userId, normalized.plan_id);

  const { data, error } = await supabase
    .from("notes")
    .insert({
      ...normalized,
      user_id: userId,
    })
    .select("*")
    .single();

  throwSafe(error, NOTE_SAVE_ERROR);
  return data as Note;
}

export async function updateNote(noteId: string, input: NoteInput): Promise<Note> {
  const { supabase, userId } = await getAuthenticatedContext();
  return updateNoteForUser(supabase, userId, noteId, input);
}

export async function updateNoteForUser(
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
  input: NoteInput,
): Promise<Note> {
  const normalized = normalizeNoteInput(input);
  await ensurePlanBelongsToUserIfPresent(supabase, userId, normalized.plan_id);

  const { data, error } = await supabase
    .from("notes")
    .update({
      ...normalized,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  throwSafe(error, NOTE_SAVE_ERROR);

  if (!data) {
    throw new Error(NOTE_NOT_FOUND_ERROR);
  }

  return data as Note;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedContext();
  await deleteNoteForUser(supabase, userId, noteId);
}

export async function deleteNoteForUser(
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
): Promise<void> {
  const { data: existing, error: noteError } = await supabase
    .from("notes")
    .select("id")
    .eq("id", noteId)
    .eq("user_id", userId)
    .maybeSingle();

  throwSafe(noteError, NOTE_DELETE_ERROR);

  if (!existing) {
    throw new Error(NOTE_NOT_FOUND_ERROR);
  }

  const { data: attachments, error: attachmentError } = await supabase
    .from("note_attachments")
    .select("file_path")
    .eq("note_id", noteId)
    .eq("user_id", userId);

  throwSafe(attachmentError, NOTE_DELETE_ERROR);

  const paths = ((attachments ?? []) as Array<Pick<NoteAttachment, "file_path">>).map(
    (attachment) => attachment.file_path,
  );
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(NOTE_STORAGE_BUCKET)
      .remove(paths);
    throwSafe(storageError, NOTE_DELETE_ERROR);
  }

  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  throwSafe(error, NOTE_DELETE_ERROR);

  if (!data) {
    throw new Error(NOTE_NOT_FOUND_ERROR);
  }
}

export async function uploadNoteAttachment(noteId: string, file: File): Promise<NoteAttachment> {
  const { supabase, userId } = await getAuthenticatedContext();
  return uploadNoteAttachmentForUser(supabase, userId, noteId, file);
}

export async function uploadNoteAttachments(
  noteId: string,
  files: File[],
): Promise<NoteAttachment[]> {
  const { supabase, userId } = await getAuthenticatedContext();
  return uploadNoteAttachmentsForUser(supabase, userId, noteId, files);
}

export async function uploadNoteAttachmentForUser(
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
  file: File,
): Promise<NoteAttachment> {
  const [attachment] = await uploadNoteAttachmentsForUser(supabase, userId, noteId, [file]);

  return attachment;
}

export async function uploadNoteAttachmentsForUser(
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
  files: File[],
): Promise<NoteAttachment[]> {
  if (files.length === 0) {
    return [];
  }

  let uploadingBytes = 0;
  const validations = files.map((file) => {
    uploadingBytes += file.size;
    return validateNoteAttachmentFile(file);
  });
  const failedValidation = validations.find((validation) => !validation.ok);

  if (failedValidation && !failedValidation.ok) {
    throw new Error(failedValidation.error);
  }

  const quotaState = await getNoteAttachmentQuotaState(supabase, userId, noteId);
  const quotaError = validateNoteAttachmentQuota({
    existingNoteAttachmentCount: quotaState.noteAttachmentCount,
    existingUserAttachmentBytes: quotaState.userAttachmentBytes,
    uploadingFileCount: files.length,
    uploadingBytes,
  });

  if (quotaError) {
    throw new Error(quotaError);
  }

  const uploadedPaths: string[] = [];
  const insertedAttachmentIds: string[] = [];
  const attachments: NoteAttachment[] = [];

  try {
    for (const [index, file] of files.entries()) {
      const validation = validations[index];
      if (!validation.ok) {
        throw new Error(validation.error);
      }

      const attachment = await insertValidatedNoteAttachment(
        supabase,
        userId,
        noteId,
        file,
        validation.attachmentType,
      );

      uploadedPaths.push(attachment.file_path);
      insertedAttachmentIds.push(attachment.id);
      attachments.push(attachment);
    }
  } catch (error) {
    if (insertedAttachmentIds.length > 0) {
      try {
        await supabase
          .from("note_attachments")
          .delete()
          .eq("user_id", userId)
          .in("id", insertedAttachmentIds);
      } catch {
        // Best-effort cleanup; keep the original upload error for the UI.
      }
    }

    if (uploadedPaths.length > 0) {
      try {
        await supabase.storage.from(NOTE_STORAGE_BUCKET).remove(uploadedPaths);
      } catch {
        // Best-effort cleanup; keep the original upload error for the UI.
      }
    }

    throw error;
  }

  return attachments;
}

async function insertValidatedNoteAttachment(
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
  file: File,
  attachmentType: "image" | "file",
) {
  const filePath = buildNoteAttachmentPath(userId, noteId, file.name);
  const { error: uploadError } = await supabase.storage
    .from(NOTE_STORAGE_BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  throwSafe(uploadError, NOTE_UPLOAD_ERROR);

  const { data, error } = await supabase
    .from("note_attachments")
    .insert({
      user_id: userId,
      note_id: noteId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      mime_type: file.type || null,
      attachment_type: attachmentType,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(NOTE_STORAGE_BUCKET).remove([filePath]);
    throw new Error(NOTE_UPLOAD_ERROR);
  }

  return data as NoteAttachment;
}

export async function deleteNoteAttachment(attachmentId: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedContext();
  await deleteNoteAttachmentForUser(supabase, userId, attachmentId);
}

export async function deleteNoteAttachmentForUser(
  supabase: SupabaseClient,
  userId: string,
  attachmentId: string,
): Promise<void> {
  const attachment = await getAttachmentForUser(supabase, userId, attachmentId);

  const { error: storageError } = await supabase.storage
    .from(NOTE_STORAGE_BUCKET)
    .remove([attachment.file_path]);

  throwSafe(storageError, NOTE_DELETE_ERROR);

  const { data, error } = await supabase
    .from("note_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  throwSafe(error, NOTE_DELETE_ERROR);

  if (!data) {
    throw new Error(NOTE_ATTACHMENT_NOT_FOUND_ERROR);
  }
}

export async function getNoteAttachmentSignedUrl(attachmentId: string): Promise<string> {
  const { supabase, userId } = await getAuthenticatedContext();
  const attachment = await getAttachmentForUser(supabase, userId, attachmentId);
  return createSignedUrlForAttachment(supabase, attachment);
}

async function getNoteAttachmentQuotaState(
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
) {
  const [
    { data: note, error: noteError },
    { data: noteAttachments, error: noteAttachmentsError },
    { data: userAttachments, error: userAttachmentsError },
  ] = await Promise.all([
    supabase
      .from("notes")
      .select("id")
      .eq("id", noteId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("note_attachments")
      .select("id")
      .eq("note_id", noteId)
      .eq("user_id", userId),
    supabase
      .from("note_attachments")
      .select("file_size")
      .eq("user_id", userId),
  ]);

  throwSafe(noteError, NOTE_READ_ERROR);
  throwSafe(noteAttachmentsError, NOTE_READ_ERROR);
  throwSafe(userAttachmentsError, NOTE_READ_ERROR);

  if (!note) {
    throw new Error(NOTE_NOT_FOUND_ERROR);
  }

  return {
    noteAttachmentCount: ((noteAttachments ?? []) as Array<Pick<NoteAttachment, "id">>).length,
    userAttachmentBytes: ((userAttachments ?? []) as Array<Pick<NoteAttachment, "file_size">>)
      .reduce((total, attachment) => total + attachment.file_size, 0),
  };
}

async function getAttachmentForUser(
  supabase: SupabaseClient,
  userId: string,
  attachmentId: string,
) {
  const { data, error } = await supabase
    .from("note_attachments")
    .select("*")
    .eq("id", attachmentId)
    .eq("user_id", userId)
    .maybeSingle();

  throwSafe(error, NOTE_READ_ERROR);

  if (!data) {
    throw new Error(NOTE_ATTACHMENT_NOT_FOUND_ERROR);
  }

  return data as NoteAttachment;
}

async function createSignedUrlForAttachment(
  supabase: SupabaseClient,
  attachment: NoteAttachment,
) {
  const options =
    attachment.attachment_type === "file"
      ? { download: attachment.file_name }
      : undefined;
  const { data, error } = await supabase.storage
    .from(NOTE_STORAGE_BUCKET)
    .createSignedUrl(attachment.file_path, 60 * 10, options);

  throwSafe(error, NOTE_READ_ERROR);
  return data?.signedUrl ?? "";
}

async function ensurePlanBelongsToUserIfPresent(
  supabase: SupabaseClient,
  userId: string,
  planId: string | null,
) {
  if (!planId) {
    return;
  }

  const { data, error } = await supabase
    .from("plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  throwSafe(error, NOTE_SAVE_ERROR);

  if (!data) {
    throw new Error("关联计划不存在或无权访问。");
  }
}

async function getPlanForNote(
  supabase: SupabaseClient,
  userId: string,
  planId: string,
): Promise<Pick<Plan, "id" | "title"> | null> {
  const { data, error } = await supabase
    .from("plans")
    .select("id,title")
    .eq("id", planId)
    .eq("user_id", userId)
    .maybeSingle();

  throwSafe(error, NOTE_READ_ERROR);

  return (data as Pick<Plan, "id" | "title"> | null) ?? null;
}
