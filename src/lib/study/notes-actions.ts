"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  NOTE_ATTACHMENT_LIMIT_ERROR,
  NOTE_FILE_TOO_LARGE_ERROR,
  NOTE_FILE_TYPE_ERROR,
  NOTE_STORAGE_FULL_ERROR,
  NOTE_UPLOAD_ERROR,
  MAX_NOTE_ATTACHMENTS_PER_NOTE,
  createNote,
  deleteNote,
  deleteNoteAttachment,
  parseTagsInput,
  updateNote,
  uploadNoteAttachments,
  validateNoteAttachmentFile,
  type NoteInput,
} from "./notes";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildNoteInput(formData: FormData): NoteInput {
  return {
    title: getString(formData, "title"),
    content: getString(formData, "content") || null,
    plan_id: getString(formData, "plan_id") || null,
    course_name: getString(formData, "course_name") || null,
    tags: parseTagsInput(getString(formData, "tags")),
  };
}

function getAttachmentFiles(formData: FormData) {
  return formData
    .getAll("attachments")
    .filter((value): value is File => value instanceof File)
    .filter((file) => file.size > 0 && file.name.trim().length > 0);
}

function validateFiles(files: File[]) {
  if (files.length > MAX_NOTE_ATTACHMENTS_PER_NOTE) {
    return NOTE_ATTACHMENT_LIMIT_ERROR;
  }

  for (const file of files) {
    const result = validateNoteAttachmentFile(file);

    if (!result.ok) {
      return result.error;
    }
  }

  return null;
}

function getSafeAttachmentError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  return [
    NOTE_FILE_TOO_LARGE_ERROR,
    NOTE_FILE_TYPE_ERROR,
    NOTE_ATTACHMENT_LIMIT_ERROR,
    NOTE_STORAGE_FULL_ERROR,
  ].includes(message)
    ? message
    : NOTE_UPLOAD_ERROR;
}

function redirectWithError(path: string, error: string) {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}error=${encodeURIComponent(error)}`);
}

function withQuery(path: string, query: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${query}`;
}

function normalizeNotesReturnPath(path: string, fallback: string) {
  if (!path || !path.startsWith("/notes/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }

  return path;
}

function getReturnPath(formData: FormData, fallback: string) {
  return normalizeNotesReturnPath(getString(formData, "return_to"), fallback);
}

export async function createNoteAction(formData: FormData) {
  const files = getAttachmentFiles(formData);
  const fileError = validateFiles(files);

  if (fileError) {
    redirectWithError("/notes/new", fileError);
  }

  let noteId = "";

  try {
    const note = await createNote(buildNoteInput(formData));
    noteId = note.id;
    await uploadNoteAttachments(note.id, files);
  } catch (error) {
    if (noteId) {
      await deleteNote(noteId).catch(() => undefined);
    }

    const message = error instanceof Error ? error.message : "";
    const safeMessage =
      message === NOTE_FILE_TOO_LARGE_ERROR || message === NOTE_FILE_TYPE_ERROR
        ? message
        : message || "笔记保存失败，请稍后重试。";
    redirectWithError("/notes/new", safeMessage);
  }

  revalidatePath("/notes");
  redirect(`/notes/${noteId}`);
}

export async function updateNoteAction(noteId: string, formData: FormData) {
  const errorPath = getReturnPath(formData, `/notes/${noteId}`);

  try {
    await updateNote(noteId, buildNoteInput(formData));
  } catch (error) {
    const message = error instanceof Error ? error.message : "笔记保存失败，请稍后重试。";
    redirectWithError(errorPath, message);
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  redirect(`/notes/${noteId}?saved=1`);
}

export async function uploadNoteAttachmentAction(noteId: string, formData: FormData) {
  const returnPath = getReturnPath(formData, `/notes/${noteId}`);
  const files = getAttachmentFiles(formData);

  if (files.length === 0) {
    redirectWithError(returnPath, "请选择要上传的文件。");
  }

  const fileError = validateFiles(files);
  if (fileError) {
    redirectWithError(returnPath, fileError);
  }

  try {
    await uploadNoteAttachments(noteId, files);
  } catch (error) {
    redirectWithError(returnPath, getSafeAttachmentError(error));
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath(`/notes/${noteId}/edit`);
  redirect(withQuery(returnPath, "uploaded=1"));
}

export async function deleteNoteAttachmentAction(
  noteId: string,
  attachmentId: string,
  returnTo?: string,
) {
  const returnPath = normalizeNotesReturnPath(returnTo ?? "", `/notes/${noteId}`);

  try {
    await deleteNoteAttachment(attachmentId);
  } catch {
    redirectWithError(returnPath, "删除附件失败，请稍后重试。");
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath(`/notes/${noteId}/edit`);
  redirect(withQuery(returnPath, "attachmentDeleted=1"));
}

export async function deleteNoteAction(noteId: string) {
  try {
    await deleteNote(noteId);
  } catch {
    redirectWithError(`/notes/${noteId}`, "删除笔记失败，请稍后重试。");
  }

  revalidatePath("/notes");
  redirect("/notes?deleted=1");
}
