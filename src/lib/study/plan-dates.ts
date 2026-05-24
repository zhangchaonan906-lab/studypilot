export const DEFAULT_PLAN_DAYS = 7;
export const PUBLIC_BETA_MAX_PLAN_DAYS = 30;

export type GeneratePlanFormPayload = {
  title: string;
  goal: string;
  currentLevel: string;
  startDate: string;
  totalDays: number;
  deadline: string;
  dailyMinutes: number;
  restDaysPerWeek: number;
  preference: string;
};

export function getDefaultStartDate(currentDate = new Date()) {
  return formatDateInput(currentDate);
}

export function calculateDeadlineDate(startDate: string, totalDays: number) {
  const parsedStartDate = parseValidDateInput(startDate);

  if (!parsedStartDate || !isValidPlanDays(totalDays)) {
    return null;
  }

  return formatDateInput(addDays(parsedStartDate, totalDays - 1));
}

export function isValidDateInput(value: string) {
  return parseValidDateInput(value) !== null;
}

export function parsePlanDays(value: unknown) {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? Number(value)
        : Number.NaN;

  return isValidPlanDays(numberValue) ? numberValue : null;
}

export function buildGeneratePlanPayloadFromFormData(
  formData: FormData,
  currentDate = new Date()
):
  | { ok: true; data: GeneratePlanFormPayload }
  | { ok: false; error: string } {
  const startDate = formData.has("start_date")
    ? textValue(formData, "start_date")
    : getDefaultStartDate(currentDate);

  if (!isValidDateInput(startDate)) {
    return { ok: false, error: "请选择有效的起始日期。" };
  }

  const totalDays = parsePlanDays(textValue(formData, "total_days"));

  if (totalDays === null) {
    return { ok: false, error: "计划天数必须在 1 到 30 天之间。" };
  }

  const deadline = calculateDeadlineDate(startDate, totalDays);

  if (!deadline) {
    return { ok: false, error: "计划天数必须在 1 到 30 天之间。" };
  }

  return {
    ok: true,
    data: {
      title: textValue(formData, "title"),
      goal: textValue(formData, "goal"),
      currentLevel: textValue(formData, "current_level"),
      startDate,
      totalDays,
      deadline,
      dailyMinutes: Number(textValue(formData, "daily_minutes") || 0),
      restDaysPerWeek: Number(textValue(formData, "rest_days_per_week") || 1),
      preference: textValue(formData, "preference"),
    },
  };
}

function isValidPlanDays(value: number) {
  return (
    Number.isInteger(value) &&
    value >= 1 &&
    value <= PUBLIC_BETA_MAX_PLAN_DAYS
  );
}

function parseValidDateInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
