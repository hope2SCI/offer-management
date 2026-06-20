export type TaskViewScope = "all" | "today";

type DatedTask = {
  dueAt: Date | string;
};

function dayStart(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function dateKey(value: Date | string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export const dateInputValue = dateKey;

export function monthInputValue(value: Date | string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function monthFromParam(value: string | undefined, fallback = new Date()) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return fallback;

  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12) return fallback;

  return new Date(year, month - 1, 1);
}

export function getListTasks<T extends DatedTask>(
  tasks: T[],
  scope: TaskViewScope,
  today = new Date()
) {
  const start = dayStart(today);
  const end = dayStart(addDays(start, scope === "today" ? 1 : 8));

  return tasks.filter((task) => {
    const dueAt = new Date(task.dueAt);
    return dueAt >= start && dueAt < end;
  });
}

export function getMonthCalendarDays<T extends DatedTask>(
  tasks: T[],
  monthDate = new Date(),
  today = new Date()
) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  const last = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const end = addDays(last, 6 - last.getDay());
  const dayCount = Math.round(
    (end.getTime() - start.getTime()) / 1000 / 60 / 60 / 24
  ) + 1;

  return Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(start, index);
    const key = dateKey(date);

    return {
      date,
      key,
      inMonth: date.getMonth() === monthDate.getMonth(),
      isToday: key === dateKey(today),
      tasks: tasks.filter((task) => dateKey(task.dueAt) === key)
    };
  });
}

export function getSevenDayTaskGroups<T extends DatedTask>(
  tasks: T[],
  today = new Date()
) {
  const start = dayStart(today);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const key = dateKey(date);

    return {
      date,
      key,
      isToday: index === 0,
      tasks: tasks.filter((task) => dateKey(task.dueAt) === key)
    };
  });
}
