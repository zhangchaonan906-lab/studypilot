import { getTaskCompletionPatch } from "./forms";

export const TASK_UPDATE_ERROR = "任务状态更新失败，请稍后重试。";
export const TASK_NOT_FOUND_ERROR = "任务不存在或不属于当前用户。";

type TaskCompletionPatch = {
  is_completed: boolean;
  completed_at: string | null;
};

type TaskCompletionRow = TaskCompletionPatch & {
  id: string;
};

type SupabaseErrorLike = {
  message: string;
};

type TaskCompletionUpdateQuery = {
  eq(column: string, value: string): TaskCompletionUpdateQuery;
  select(columns: string): {
    maybeSingle(): PromiseLike<{
      data: TaskCompletionRow | null;
      error: SupabaseErrorLike | null;
    }>;
  };
};

export type TaskCompletionUpdateClient = {
  from(table: "tasks"): {
    update(patch: TaskCompletionPatch): TaskCompletionUpdateQuery;
  };
};

export async function updateTaskCompletionForUser(
  supabase: TaskCompletionUpdateClient,
  userId: string,
  taskId: string,
  isCompleted: boolean,
  now = new Date()
) {
  const { data, error } = await supabase
    .from("tasks")
    .update(getTaskCompletionPatch(isCompleted, now))
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("id, is_completed, completed_at")
    .maybeSingle();

  if (error) {
    throw new Error(`${TASK_UPDATE_ERROR}：${error.message}`);
  }

  if (!data) {
    throw new Error(TASK_NOT_FOUND_ERROR);
  }

  return data;
}
