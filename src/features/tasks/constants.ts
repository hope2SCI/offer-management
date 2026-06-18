export const TASK_TYPES = [
  "DEADLINE",
  "WRITTEN_TEST",
  "INTERVIEW",
  "FOLLOW_UP",
  "RESUME_UPDATE",
  "CUSTOM"
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  DEADLINE: "投递截止",
  WRITTEN_TEST: "笔试",
  INTERVIEW: "面试",
  FOLLOW_UP: "Follow-up",
  RESUME_UPDATE: "简历修改",
  CUSTOM: "自定义事项"
};

export function isTaskType(value: string): value is TaskType {
  return TASK_TYPES.includes(value as TaskType);
}
