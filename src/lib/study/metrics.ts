type CompletionLike = {
  is_completed: boolean;
};

export function calculateCompletionRate(tasks: CompletionLike[]) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.is_completed).length;

  return {
    completed,
    total,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getDaysUntilDeadline(deadline: string, today: string) {
  const deadlineDate = parseDateOnly(deadline);
  const todayDate = parseDateOnly(today);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.ceil((deadlineDate.getTime() - todayDate.getTime()) / millisecondsPerDay);

  return Math.max(diff, 0);
}

export function getCurrentWeekRange(today: string) {
  const currentDate = parseDateOnly(today);
  const dayOfWeek = currentDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startDate = addDays(currentDate, mondayOffset);
  const endDate = addDays(startDate, 6);

  return {
    startDate: formatDateOnly(startDate),
    endDate: formatDateOnly(endDate),
  };
}

export function getPlanWeekIndex(planStartDate: string, weekStartDate: string) {
  const planStartWeek = getCurrentWeekRange(planStartDate).startDate;
  const startDate = parseDateOnly(planStartWeek);
  const currentWeekStart = parseDateOnly(weekStartDate);
  const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff = Math.floor(
    (currentWeekStart.getTime() - startDate.getTime()) / millisecondsPerWeek
  );

  return Math.max(diff + 1, 1);
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
