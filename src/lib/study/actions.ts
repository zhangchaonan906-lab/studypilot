"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createMistakeReview,
  createPlan,
  updateTaskCompletion,
  upsertDailyReflection,
} from "./data";
import {
  parseCreatePlanFormData,
  parseDailyReflectionFormData,
  parseMistakeReviewFormData,
} from "./forms";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function createPlanAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseCreatePlanFormData(formData);

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  let planId = "";

  try {
    const plan = await createPlan(parsed.data);
    planId = plan.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "创建学习计划失败，请稍后重试。",
    };
  }

  revalidatePath("/dashboard");
  redirect(`/plans/${planId}`);
}

export async function updateTaskCompletionAction(taskId: string, isCompleted: boolean) {
  try {
    await updateTaskCompletion(taskId, isCompleted);
    revalidatePath("/dashboard");
    revalidatePath("/today");

    return { success: isCompleted ? "任务已完成。" : "已取消完成。" };
  } catch {
    return { error: "任务状态更新失败，请稍后重试。" };
  }
}

export async function createMistakeReviewAction(formData: FormData) {
  const parsed = parseMistakeReviewFormData(formData);

  if (!parsed.ok) {
    redirect(`/review?error=${encodeURIComponent(parsed.error)}`);
  }

  await createMistakeReview(parsed.data);
  revalidatePath("/review");
  revalidatePath("/dashboard");
  redirect("/review?created=1");
}

export async function saveDailyReflectionAction(formData: FormData) {
  const parsed = parseDailyReflectionFormData(formData);

  if (!parsed.ok) {
    redirect(`/today?error=${encodeURIComponent(parsed.error)}`);
  }

  await upsertDailyReflection(parsed.data);
  revalidatePath("/today");
  revalidatePath("/dashboard");
  redirect("/today?saved=1");
}
