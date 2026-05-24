import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TimetableEntry, TimetableEntryInsert, TimetableEntryUpdate } from "./types";

const COURSE_NAME_EMPTY_ERROR = "课程名称不能为空。";
const WEEKDAY_RANGE_ERROR = "星期几必须是 1-7 之间的数字。";
const TIME_ORDER_ERROR = "开始时间必须早于结束时间。";
const ENTRY_NOT_FOUND_ERROR = "课程不存在或无权修改。";

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

function throwIfError(error: { message: string } | null, fallback: string) {
  if (error) {
    throw new Error(`${fallback}：${error.message}`);
  }
}

function validateTimetableInput(input: TimetableEntryInsert | TimetableEntryUpdate) {
  if ("course_name" in input && input.course_name !== undefined) {
    if (input.course_name.trim().length === 0) {
      throw new Error(COURSE_NAME_EMPTY_ERROR);
    }
  }

  if ("weekday" in input && input.weekday !== undefined) {
    if (!Number.isInteger(input.weekday) || input.weekday < 1 || input.weekday > 7) {
      throw new Error(WEEKDAY_RANGE_ERROR);
    }
  }

  if (
    "start_time" in input && input.start_time !== undefined &&
    "end_time" in input && input.end_time !== undefined
  ) {
    if (input.start_time >= input.end_time) {
      throw new Error(TIME_ORDER_ERROR);
    }
  }
}

export async function getTimetableEntries(): Promise<TimetableEntry[]> {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("timetable_entries")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: true });

  throwIfError(error, "读取课程表失败");
  return (data ?? []) as TimetableEntry[];
}

export async function createTimetableEntry(
  input: TimetableEntryInsert
): Promise<TimetableEntry> {
  validateTimetableInput(input);

  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("timetable_entries")
    .insert({
      user_id: userId,
      course_name: input.course_name.trim(),
      weekday: input.weekday,
      start_time: input.start_time,
      end_time: input.end_time,
      location: input.location?.trim() || null,
      teacher: input.teacher?.trim() || null,
      note: input.note?.trim() || null,
      color: input.color?.trim() || null,
    })
    .select("*")
    .single();

  throwIfError(error, "创建课程失败");
  return data as TimetableEntry;
}

export async function updateTimetableEntry(
  id: string,
  input: TimetableEntryUpdate
): Promise<TimetableEntry> {
  validateTimetableInput(input);

  const { supabase, userId } = await getAuthenticatedContext();

  const updateData: Record<string, unknown> = {};
  if (input.course_name !== undefined) updateData.course_name = input.course_name.trim();
  if (input.weekday !== undefined) updateData.weekday = input.weekday;
  if (input.start_time !== undefined) updateData.start_time = input.start_time;
  if (input.end_time !== undefined) updateData.end_time = input.end_time;
  if (input.location !== undefined) updateData.location = input.location?.trim() || null;
  if (input.teacher !== undefined) updateData.teacher = input.teacher?.trim() || null;
  if (input.note !== undefined) updateData.note = input.note?.trim() || null;
  if (input.color !== undefined) updateData.color = input.color?.trim() || null;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("timetable_entries")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  throwIfError(error, "更新课程失败");

  if (!data) {
    throw new Error(ENTRY_NOT_FOUND_ERROR);
  }

  return data as TimetableEntry;
}

export async function deleteTimetableEntry(id: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedContext();
  const { error, count } = await supabase
    .from("timetable_entries")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  throwIfError(error, "删除课程失败");

  if (count === 0) {
    throw new Error(ENTRY_NOT_FOUND_ERROR);
  }
}
