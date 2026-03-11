import { format, isToday, isYesterday } from "date-fns";

/** Short timestamp for message/preview: "2:30 PM", "Yesterday 2:30 PM", or "15 Jan, 2:30 PM". */
export function formatMessageTime(createdAt: string): string {
  const d = new Date(createdAt);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`;
  return format(d, "d MMM, h:mm a");
}
