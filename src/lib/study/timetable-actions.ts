"use server";

import { revalidatePath } from "next/cache";
import {
  createTimetableEntry,
  deleteTimetableEntry,
  updateTimetableEntry,
} from "./timetable";
import type { TimetableEntryInsert, TimetableEntryUpdate } from "./types";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function createTimetableEntryAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const courseName = String(formData.get("course_name") ?? "").trim();
  const weekdayRaw = String(formData.get("weekday") ?? "");
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const teacher = String(formData.get("teacher") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  if (!courseName) {
    return { error: "课程名称不能为空。" };
  }

  const weekday = Number.parseInt(weekdayRaw, 10);
  if (!Number.isFinite(weekday) || weekday < 1 || weekday > 7) {
    return { error: "请选择有效的星期。" };
  }

  if (!startTime || !endTime) {
    return { error: "请填写开始时间和结束时间。" };
  }

  if (startTime >= endTime) {
    return { error: "开始时间必须早于结束时间。" };
  }

  const input: TimetableEntryInsert = {
    course_name: courseName,
    weekday,
    start_time: startTime,
    end_time: endTime,
    location: location || null,
    teacher: teacher || null,
    note: note || null,
    color: color || null,
  };

  try {
    await createTimetableEntry(input);
    revalidatePath("/schedule");
    return { success: "课程已添加。" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { error: message || "添加课程失败，请稍后重试。" };
  }
}

export async function updateTimetableEntryAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const courseName = String(formData.get("course_name") ?? "").trim();
  const weekdayRaw = String(formData.get("weekday") ?? "");
  const startTime = String(formData.get("start_time") ?? "");
  const endTime = String(formData.get("end_time") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const teacher = String(formData.get("teacher") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  if (!id) {
    return { error: "缺少课程 ID。" };
  }

  if (!courseName) {
    return { error: "课程名称不能为空。" };
  }

  const weekday = Number.parseInt(weekdayRaw, 10);
  if (!Number.isFinite(weekday) || weekday < 1 || weekday > 7) {
    return { error: "请选择有效的星期。" };
  }

  if (!startTime || !endTime) {
    return { error: "请填写开始时间和结束时间。" };
  }

  if (startTime >= endTime) {
    return { error: "开始时间必须早于结束时间。" };
  }

  const input: TimetableEntryUpdate = {
    course_name: courseName,
    weekday,
    start_time: startTime,
    end_time: endTime,
    location: location || null,
    teacher: teacher || null,
    note: note || null,
    color: color || null,
  };

  try {
    await updateTimetableEntry(id, input);
    revalidatePath("/schedule");
    return { success: "课程已更新。" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { error: message || "更新课程失败，请稍后重试。" };
  }
}

export async function deleteTimetableEntryAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { error: "缺少课程 ID。" };
  }

  try {
    await deleteTimetableEntry(id);
    revalidatePath("/schedule");
    return { success: "课程已删除。" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { error: message || "删除课程失败，请稍后重试。" };
  }
}
