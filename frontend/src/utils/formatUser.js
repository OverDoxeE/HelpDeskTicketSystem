export function formatUserBrief(user, fallbackId) {
  if (!user) {
    if (fallbackId == null) return "Unassigned";
    return `User #${fallbackId}`;
  }
  if (user.email) return user.email;
  if (user.username) return user.username;
  return `User #${user.id ?? fallbackId}`;
}
