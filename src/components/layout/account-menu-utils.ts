export function getAvatarInitial(username: string) {
  const trimmed = username.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}
