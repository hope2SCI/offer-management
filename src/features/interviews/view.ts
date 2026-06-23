export function dateTimeLocalValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function interviewExcerpt(text: string | null | undefined) {
  const normalized = text?.replace(/\s+/g, " ").trim();
  if (!normalized) return "未填写问题记录";
  return normalized.length > 80 ? `${normalized.slice(0, 80)}...` : normalized;
}
