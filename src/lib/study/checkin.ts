import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CheckinStats } from "./types";

const ALREADY_CHECKED_IN = "今天已经打过卡了。";
const NOT_CHECKED_IN = "今天还没有打卡，无法取消。";

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

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getMonthlyCheckins(
  year: number,
  month: number
): Promise<string[]> {
  const { supabase, userId } = await getAuthenticatedContext();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("checkin_date")
    .eq("user_id", userId)
    .gte("checkin_date", startDate)
    .lte("checkin_date", endDate)
    .order("checkin_date", { ascending: true });

  throwIfError(error, "读取打卡记录失败");
  return ((data ?? []) as Array<{ checkin_date: string }>).map((d) => d.checkin_date);
}

export async function checkInToday(): Promise<void> {
  const { supabase, userId } = await getAuthenticatedContext();
  const today = getLocalDateString();

  const { count, error: countError } = await supabase
    .from("daily_checkins")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("checkin_date", today);

  throwIfError(countError, "查询打卡状态失败");

  if (count && count > 0) {
    throw new Error(ALREADY_CHECKED_IN);
  }

  const { error } = await supabase.from("daily_checkins").insert({
    user_id: userId,
    checkin_date: today,
  });

  throwIfError(error, "打卡失败");
}

export async function cancelTodayCheckin(): Promise<void> {
  const { supabase, userId } = await getAuthenticatedContext();
  const today = getLocalDateString();

  const { error, count } = await supabase
    .from("daily_checkins")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("checkin_date", today);

  throwIfError(error, "取消打卡失败");

  if (count === 0) {
    throw new Error(NOT_CHECKED_IN);
  }
}

export async function getCheckinStats(): Promise<CheckinStats> {
  const { supabase, userId } = await getAuthenticatedContext();
  const today = getLocalDateString();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();
  const monthEnd = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: monthCheckins, error: monthError } = await supabase
    .from("daily_checkins")
    .select("checkin_date")
    .eq("user_id", userId)
    .gte("checkin_date", monthStart)
    .lte("checkin_date", monthEnd)
    .order("checkin_date", { ascending: false });

  throwIfError(monthError, "读取本月打卡记录失败");

  const dates = ((monthCheckins ?? []) as Array<{ checkin_date: string }>).map(
    (d) => d.checkin_date
  );

  const todayCheckedIn = dates.includes(today);
  const monthTotal = dates.length;

  let streak = 0;
  if (todayCheckedIn) {
    const checkDate = new Date(today);
    for (let i = 0; ; i++) {
      const d = getLocalDateString(checkDate);
      if (dates.includes(d)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    for (let i = 0; ; i++) {
      const d = getLocalDateString(yesterday);
      if (dates.includes(d)) {
        streak++;
        yesterday.setDate(yesterday.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { monthTotal, streak, todayCheckedIn };
}
