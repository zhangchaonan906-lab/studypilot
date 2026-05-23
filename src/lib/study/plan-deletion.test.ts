import { describe, expect, it } from "vitest";
import {
  PLAN_DELETE_ERROR,
  PLAN_DELETE_FORBIDDEN_ERROR,
  deletePlanForUser,
} from "./plan-deletion";

type StoredPlan = {
  id: string;
  user_id: string;
};

function createPlanDeleteClient(
  plans: StoredPlan[],
  deleteError: { message: string } | null = null
) {
  const filters: Array<{ column: string; value: string }> = [];
  const calls: Array<{ table: string; action: string; columns?: string }> = [];

  const query = {
    eq(column: string, value: string) {
      filters.push({ column, value });
      return query;
    },
    select(columns: string) {
      calls.push({ table: "plans", action: "select", columns });
      return {
        async maybeSingle() {
          if (deleteError) {
            return { data: null, error: deleteError };
          }

          const planId = filters.find((filter) => filter.column === "id")?.value;
          const userId = filters.find((filter) => filter.column === "user_id")?.value;
          const planIndex = plans.findIndex(
            (plan) => plan.id === planId && plan.user_id === userId
          );

          if (planIndex === -1) {
            return { data: null, error: null };
          }

          const [deletedPlan] = plans.splice(planIndex, 1);
          return { data: { id: deletedPlan.id }, error: null };
        },
      };
    },
  };

  return {
    filters,
    calls,
    from(table: "plans") {
      calls.push({ table, action: "from" });

      return {
        delete() {
          calls.push({ table, action: "delete" });
          return query;
        },
      };
    },
  };
}

describe("plan deletion", () => {
  it("deletes a plan that belongs to the current user", async () => {
    const plans = [
      { id: "plan-1", user_id: "user-1" },
      { id: "plan-2", user_id: "user-2" },
    ];
    const client = createPlanDeleteClient(plans);

    await expect(deletePlanForUser(client, "user-1", "plan-1")).resolves.toEqual({
      id: "plan-1",
    });

    expect(plans).toEqual([{ id: "plan-2", user_id: "user-2" }]);
    expect(client.filters).toContainEqual({ column: "id", value: "plan-1" });
    expect(client.filters).toContainEqual({ column: "user_id", value: "user-1" });
  });

  it("does not delete a plan that belongs to another user", async () => {
    const plans = [{ id: "plan-1", user_id: "other-user" }];
    const client = createPlanDeleteClient(plans);

    await expect(deletePlanForUser(client, "user-1", "plan-1")).rejects.toThrow(
      PLAN_DELETE_FORBIDDEN_ERROR
    );
    expect(plans).toEqual([{ id: "plan-1", user_id: "other-user" }]);
  });

  it("returns a Chinese error when the plan does not exist", async () => {
    const client = createPlanDeleteClient([]);

    await expect(deletePlanForUser(client, "user-1", "missing-plan")).rejects.toThrow(
      PLAN_DELETE_FORBIDDEN_ERROR
    );
  });

  it("returns a Chinese error when Supabase delete fails", async () => {
    const client = createPlanDeleteClient([], { message: "network error" });

    await expect(deletePlanForUser(client, "user-1", "plan-1")).rejects.toThrow(
      PLAN_DELETE_ERROR
    );
  });
});
