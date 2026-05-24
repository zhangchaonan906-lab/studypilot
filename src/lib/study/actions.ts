"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createMistakeReview,
  createPlan,
  createTask,
  deletePlan,
  deleteTask,
  updateTask,
  updateTaskCompletion,
  upsertDailyReflection,
} from "./data";
import { PLAN_DELETE_FORBIDDEN_ERROR } from "./plan-deletion";
import {
  TASK_CREATE_ERROR,
  TASK_DELETE_ERROR,
  TASK_NOT_FOUND_ERROR,
  TASK_UPDATE_ERROR,
} from "./task-management";
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
  } catch {
    return {
      error: "创建学习计划失败，请稍后重试。",
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

export async function updateTaskAction(
  taskId: string,
  planId: string,
  fields: {
    content?: string;
    estimated_minutes?: number;
    priority?: "must" | "should" | "optional";
  },
) {
  try {
    await updateTask(taskId, fields);
    revalidatePath(`/plans/${planId}`);
    revalidatePath("/dashboard");
    revalidatePath("/today");

    return { success: "任务已更新。" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === TASK_UPDATE_ERROR || message === TASK_NOT_FOUND_ERROR) {
      return { error: message };
    }

    return { error: "任务更新失败，请稍后重试。" };
  }
}

export async function createTaskAction(
  planDayId: string,
  planId: string,
  fields: {
    content: string;
    estimated_minutes?: number;
    priority: "must" | "should" | "optional";
  },
) {
  try {
    await createTask(planDayId, fields);
    revalidatePath(`/plans/${planId}`);
    revalidatePath("/dashboard");
    revalidatePath("/today");

    return { success: "任务已创建。" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === TASK_CREATE_ERROR) {
      return { error: message };
    }

    return { error: "任务创建失败，请稍后重试。" };
  }
}

export async function deleteTaskAction(taskId: string, planId: string) {
  try {
    await deleteTask(taskId);
    revalidatePath(`/plans/${planId}`);
    revalidatePath("/dashboard");
    revalidatePath("/today");

    return { success: "任务已删除。" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === TASK_DELETE_ERROR || message === TASK_NOT_FOUND_ERROR) {
      return { error: message };
    }

    return { error: "任务删除失败，请稍后重试。" };
  }
}

export async function deletePlanAction(
  planId: string,
  redirectAfterDelete = false
): Promise<ActionState> {
  try {
    await deletePlan(planId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    return {
      error:
        message === PLAN_DELETE_FORBIDDEN_ERROR
          ? PLAN_DELETE_FORBIDDEN_ERROR
          : "删除失败，请稍后重试。",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/today");
  revalidatePath("/review");
  revalidatePath("/weekly");
  revalidatePath(`/plans/${planId}`);

  if (redirectAfterDelete) {
    redirect("/dashboard");
  }

  return { success: "学习计划已删除。" };
}

export async function createMistakeReviewAction(formData: FormData) {
  const parsed = parseMistakeReviewFormData(formData);

  if (!parsed.ok) {
    redirect(`/review?error=${encodeURIComponent(parsed.error)}`);
  }

  try {
    await createMistakeReview(parsed.data);
  } catch {
    redirect(`/review?error=${encodeURIComponent("错题保存失败，请稍后重试。")}`);
  }

  revalidatePath("/review");
  revalidatePath("/dashboard");
  redirect("/review?created=1");
}

export async function saveDailyReflectionAction(formData: FormData) {
  const parsed = parseDailyReflectionFormData(formData);

  if (!parsed.ok) {
    redirect(`/today?error=${encodeURIComponent(parsed.error)}`);
  }

  try {
    await upsertDailyReflection(parsed.data);
  } catch {
    redirect(`/today?error=${encodeURIComponent("复盘保存失败，请稍后重试。")}`);
  }

  revalidatePath("/today");
  revalidatePath("/dashboard");
  redirect("/today?saved=1");
}
