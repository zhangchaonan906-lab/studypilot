"use server";

import { revalidatePath } from "next/cache";
import { cancelTodayCheckin, checkInToday } from "./checkin";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function checkInTodayAction(): Promise<ActionState> {
  try {
    await checkInToday();
    revalidatePath("/checkin");
    return { success: "打卡成功！🐾" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { error: message || "打卡失败，请稍后重试。" };
  }
}

export async function cancelTodayCheckinAction(): Promise<ActionState> {
  try {
    await cancelTodayCheckin();
    revalidatePath("/checkin");
    return { success: "已取消今日打卡。" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { error: message || "取消打卡失败，请稍后重试。" };
  }
}
