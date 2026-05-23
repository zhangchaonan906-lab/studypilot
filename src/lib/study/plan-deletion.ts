export const PLAN_DELETE_FORBIDDEN_ERROR = "计划不存在或无权删除。";
export const PLAN_DELETE_ERROR = "删除失败，请稍后重试。";

type SupabaseErrorLike = {
  message: string;
};

type DeletedPlanRow = {
  id: string;
};

type PlanDeleteQuery = {
  eq(column: string, value: string): PlanDeleteQuery;
  select(columns: string): {
    maybeSingle(): PromiseLike<{
      data: DeletedPlanRow | null;
      error: SupabaseErrorLike | null;
    }>;
  };
};

export type PlanDeleteClient = {
  from(table: "plans"): {
    delete(): PlanDeleteQuery;
  };
};

export async function deletePlanForUser(
  supabase: PlanDeleteClient,
  userId: string,
  planId: string
) {
  const { data, error } = await supabase
    .from("plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(PLAN_DELETE_ERROR);
  }

  if (!data) {
    throw new Error(PLAN_DELETE_FORBIDDEN_ERROR);
  }

  return data;
}
