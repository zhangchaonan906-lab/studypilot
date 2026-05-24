export type StudyTimeEstimateInput = {
  goal: string;
  currentLevel: string;
  planDays: number;
  restDaysPerWeek: number;
  preference: string;
};

export type StudyTimeEstimateResult = {
  dailyMinutes: number;
  intensity: "轻松" | "标准" | "冲刺";
  reason: string;
};

export function estimateDailyStudyMinutes(
  input: StudyTimeEstimateInput,
): StudyTimeEstimateResult {
  let minutes = 60;
  const reasons: string[] = [];

  const level = input.currentLevel;
  if (level.includes("基础薄弱")) {
    minutes = 90;
    reasons.push("基础薄弱，需要较多时间打基础");
  } else if (level.includes("能跟上")) {
    minutes = 75;
    reasons.push("当前能跟上课程，建议常规学习时间");
  } else if (level.includes("冲刺")) {
    minutes = 60;
    reasons.push("需要冲刺高分，精练为主");
  } else {
    minutes = 60;
    reasons.push("按较熟练水平估算基础时长");
  }

  const goal = input.goal;
  const highIntensityPattern = /期末|考试|冲刺|考研|算法|数据结构/;
  const lightPattern = /入门|了解|预习/;
  const academicPattern = /高数|线代|概率论|英语|四六级/;

  if (highIntensityPattern.test(goal)) {
    minutes += 30;
    reasons.push("目标含高强度关键词，增加 30 分钟");
  }

  if (lightPattern.test(goal) && !highIntensityPattern.test(goal)) {
    minutes -= 15;
    reasons.push("目标较轻量，减少 15 分钟");
  }

  if (academicPattern.test(goal)) {
    minutes += 15;
    reasons.push("目标含学术课程关键词，增加 15 分钟");
  }

  if (input.planDays <= 7) {
    minutes += 30;
    reasons.push("计划天数较短，需增加每日强度");
  } else if (input.planDays <= 14) {
    minutes += 15;
    reasons.push("计划天数中等，适当增加每日学习量");
  } else if (input.planDays >= 30) {
    minutes -= 15;
    reasons.push("计划天数充足，可适当降低每日强度");
  }

  if (input.restDaysPerWeek >= 3) {
    minutes += 30;
    reasons.push("每周休息较多，学习日需适当加量");
  } else if (input.restDaysPerWeek >= 2) {
    minutes += 15;
    reasons.push("每周休息 2 天，学习日适当加量");
  }

  minutes = Math.max(30, Math.min(180, minutes));
  minutes = Math.round(minutes / 15) * 15;

  let intensity: "轻松" | "标准" | "冲刺";
  if (minutes <= 60) {
    intensity = "轻松";
  } else if (minutes <= 120) {
    intensity = "标准";
  } else {
    intensity = "冲刺";
  }

  return {
    dailyMinutes: minutes,
    intensity,
    reason: reasons.join("；"),
  };
}
